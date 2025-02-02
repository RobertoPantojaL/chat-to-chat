-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS chat_app;

-- Usar la base de datos
USE chat_app;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de salas
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'image') DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Insertar salas predeterminadas
INSERT INTO rooms (name) VALUES 
  ('general'),
  ('random'),
  ('tech')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insertar usuarios de prueba
-- Nota: Las contraseñas están hasheadas con bcrypt. En este ejemplo, ambas contraseñas son "password123"
INSERT INTO users (username, password) VALUES 
  ('john_doe', '$2b$10$9X7EZDvjFVNj8aE9HFj2aOxmZGZNFkVbpNZuQgIbrHxzX6.N7XWXK'),
  ('jane_smith', '$2b$10$9X7EZDvjFVNj8aE9HFj2aOxmZGZNFkVbpNZuQgIbrHxzX6.N7XWXK')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- Insertar algunos mensajes de prueba
INSERT INTO messages (user_id, room_id, content, type) VALUES
  (1, 1, '¡Hola a todos! Bienvenidos al chat.', 'text'),
  (2, 1, 'Hola John, ¿cómo estás?', 'text'),
  (1, 2, '¿Alguien ha visto alguna película interesante últimamente?', 'text'),
  (2, 3, 'Acabo de aprender sobre WebSockets, ¡son geniales para aplicaciones en tiempo real!', 'text');

