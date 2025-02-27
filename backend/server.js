const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})
const cors = require("cors")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Configuración de multer para el manejo de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// Configuración de la base de datos
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "chat_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Rutas de autenticación (registro y login) permanecen iguales...
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password]
      );
      res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  });
  
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      if (rows.length > 0) {
        res.json({ message: 'Login exitoso', userId: rows[0].id });
      } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error en el login', error: error.message });
    }
  });


// Agregar esta nueva ruta para crear salas
app.post("/rooms", async (req, res) => {
    const { name } = req.body
    try {
      const [result] = await pool.query("INSERT INTO rooms (name) VALUES (?)", [name])
      res.status(201).json({ id: result.insertId, name })
    } catch (error) {
      res.status(500).json({ message: "Error al crear la sala", error: error.message })
    }
  })
  
  // Modificar la ruta existente para obtener salas
  app.get("/rooms", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM rooms")
      res.json(rows)
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las salas", error: error.message })
    }
  })
  
  // Ruta para obtener el histórico de mensajes
  app.get("/messages/:roomId", async (req, res) => {
    const { roomId } = req.params
    try {
      const [rows] = await pool.query(
        "SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.id WHERE m.room_id = ? ORDER BY m.created_at ASC LIMIT 50",
        [roomId],
      )
      res.json(rows)
    } catch (error) {
      res.status(500).json({ message: "Error al obtener mensajes", error: error.message })
    }
  })
  
  // Manejo de conexiones de socket
  io.on("connection", (socket) => {
    console.log("Un usuario se ha conectado")
  
    socket.on("join room", (roomId) => {
      socket.join(roomId)
      console.log(`Usuario unido a la sala ${roomId}`)
    })
  
    socket.on("leave room", (roomId) => {
      socket.leave(roomId)
      console.log(`Usuario ha dejado la sala ${roomId}`)
    })
  
    socket.on("chat message", async (msg) => {
      try {
        const { userId, username, content, roomId, type } = msg
        const [result] = await pool.query("INSERT INTO messages (user_id, room_id, content, type) VALUES (?, ?, ?, ?)", [
          userId,
          roomId,
          content,
          type,
        ])
        const newMessage = {
          id: result.insertId,
          user_id: userId,
          username,
          room_id: roomId,
          content,
          type,
          created_at: new Date(),
        }
        io.to(roomId).emit("chat message", newMessage)
      } catch (error) {
        console.error("Error al guardar el mensaje:", error)
      }
    })
  
    socket.on("disconnect", () => {
      console.log("Un usuario se ha desconectado")
    })
  })
  
  // Nueva ruta para subir imágenes
  app.post("/upload", upload.single("image"), (req, res) => {
    if (req.file) {
      res.json({ filename: req.file.filename })
    } else {
      res.status(400).send("No se subió ningún archivo")
    }
  })
  
  const PORT = process.env.PORT || 3000
  http.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  })