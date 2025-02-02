import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import axios from "axios"
import EmojiPicker from "emoji-picker-react"

const socket = io("http://localhost:3000")

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState("general")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [showNewRoomForm, setShowNewRoomForm] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setIsLoggedIn(true)
      setUserId(user.userId)
      setUsername(user.username)
      socket.emit("join room", currentRoom)
      fetchMessages(currentRoom)
    }

    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg])
    })

    fetchRooms()

    return () => {
      socket.off("chat message")
    }
  }, [currentRoom])

  useEffect(() => {
    document.body.className = isDarkMode ? "dark-mode" : ""
  }, [isDarkMode])

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`http://localhost:3000/messages/${roomId}`)
      setMessages(response.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rooms")
      setRooms(response.data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:3000/register", { username, password })
      console.log(response.data)
      alert("Registro exitoso. Por favor, inicia sesión.")
    } catch (error) {
      console.error("Error en el registro:", error)
      alert("Error en el registro. Por favor, intenta de nuevo.")
    }
  }

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/login", { username, password })
      setIsLoggedIn(true)
      setUserId(response.data.userId)
      localStorage.setItem("chatUser", JSON.stringify({ userId: response.data.userId, username }))
      socket.emit("join room", currentRoom)
      fetchMessages(currentRoom)
    } catch (error) {
      console.error("Error en el login:", error)
      alert("Credenciales inválidas. Por favor, intenta de nuevo.")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserId(null)
    setUsername("")
    localStorage.removeItem("chatUser")
    socket.emit("leave room", currentRoom)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message) {
      const messageData = {
        userId,
        username,
        content: message,
        roomId: currentRoom,
        type: "text",
      }
      socket.emit("chat message", messageData)
      setMessage("")
    }
  }

  const handleRoomChange = (room) => {
    socket.emit("leave room", currentRoom)
    setCurrentRoom(room)
    socket.emit("join room", room)
    fetchMessages(room)
  }

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append("image", file)

      try {
        const response = await axios.post("http://localhost:3000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        const imageUrl = `http://localhost:3000/uploads/${response.data.filename}`
        const messageData = {
          userId,
          username,
          content: imageUrl,
          roomId: currentRoom,
          type: "image",
        }
        socket.emit("chat message", messageData)
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (newRoomName.trim()) {
      try {
        const response = await axios.post("http://localhost:3000/rooms", { name: newRoomName })
        setRooms([...rooms, response.data])
        setNewRoomName("")
        setShowNewRoomForm(false)
      } catch (error) {
        console.error("Error creating room:", error)
      }
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="auth-form">
        <img className="logo" src="/logo.png" alt="Logo" />
        <hr />
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleRegister} className="register">
          Registrarse
        </button>
        <button onClick={handleLogin} className="login">
          Iniciar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="rooms">
        <h2>Salas</h2>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              onClick={() => handleRoomChange(room.name)}
              className={currentRoom === room.name ? "active" : ""}
            >
              {room.name}
            </li>
          ))}
        </ul>
        {showNewRoomForm ? (
          <form onSubmit={handleCreateRoom} className="new-room-form">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nombre de la nueva sala"
            />
            <button className="submit-room-button" type="submit">Crear</button>
            <button className="cancel-room-button" type="button" onClick={() => setShowNewRoomForm(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button className="add-room-button" onClick={() => setShowNewRoomForm(true)} >
            Agregar Sala
          </button>
        )}
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>
      <div className="chat-area">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.user_id === userId ? "self" : "other"}`}>
              <strong>{msg.username}:</strong>
              {msg.type === "image" ? <img src={msg.content || "/placeholder.svg"} alt="uploaded" /> : msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button type="button" className="emoji-picker-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😊
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <button type="button" className="file-label" onClick={() => fileInputRef.current.click()}>
            📎
          </button>
          <button type="button" className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button type="submit">Enviar</button>
        </form>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

