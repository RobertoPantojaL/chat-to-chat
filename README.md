# Chat App en Tiempo Real

![Vista previa de la aplicación](./chat.gif)

Chat App es una aplicación de mensajería en tiempo real que permite a los usuarios comunicarse en diferentes salas de chat. Cuenta con autenticación de usuarios, envío de mensajes de texto e imágenes, y un diseño responsive con modo oscuro.

## 🚀 Demo

[Ver Demo en Vivo](#)

## 🛠 Tecnologías Utilizadas

- Frontend: React.js
- Backend: Node.js con Express.js
- Base de datos: MySQL
- Comunicación en tiempo real: Socket.io
- Estilos: CSS personalizado

## ⚙️ Requisitos Previos

- Node.js (v14 o superior)
- MySQL

## 📦 Instalación y Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/RobertoPantojaL/chat-to-chat.git
   cd chat-app
   ```

2. Instala las dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Instala las dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configura la base de datos:
   - Crea una base de datos MySQL llamada `chat_app`
   - Ejecuta el script SQL proporcionado en `database.sql`

5. Configura las variables de entorno:
   - Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:
     ```
     DB_HOST=localhost
     DB_USER=tu_usuario_mysql
     DB_PASSWORD=tu_contraseña_mysql
     DB_NAME=chat_app
     ```

## 🚀 Cómo ejecutar el proyecto

1. Inicia el servidor backend:
   ```bash
   cd backend
   npm start
   ```

2. En otra terminal, inicia el frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Abre tu navegador y visita `http://localhost:5173` o el proporcionado por **vite**

## 📁 Estructura del Proyecto

```
chat-app/
├── backend/
│   ├── uploads/
│   ├── server.js
│   └── database.sql
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── vite.config.js
├── database.sql
└── README.md
```

## 🌟 Características Principales

- Autenticación de usuarios (registro e inicio de sesión)
- Múltiples salas de chat
- Envío de mensajes de texto en tiempo real
- Carga y envío de imágenes
- Modo oscuro/claro
- Persistencia de sesión

## 👥 Usuarios de Prueba

Puedes utilizar los siguientes usuarios de prueba o crear los tuyos propios:

1. Usuario: john_doe
   Contraseña: password123

2. Usuario: jane_smith
   Contraseña: securepass456

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o realiza un pull request para sugerir cambios o mejoras.

## 📄 Licencia

[MIT](https://choosealicense.com/licenses/mit/)

---

Desarrollado con ❤️ por [Tadeo Roberto Pantoja López](https://github.com/RobertoPantojaL)