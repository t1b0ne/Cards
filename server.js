// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./procesos/db/db.js"); // Conexión a la base de datos
const app = express();
const server = http.createServer(app); // Crear servidor HTTP con Express
const io = new Server(server); // Conectar Socket.IO al servidor HTTP

const MAX_PLAYERS = 10;
let players = []; // Lista de jugadores
let gameState = {
  blackCard: "",
  whiteCards: {},
  czar: "",
  round: 0,
  gameStarted: false, // Si el juego ha comenzado o no
};

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static("public")); // Carpeta de archivos estáticos

// Ruta básica para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.send("¡Hola Mundo! El servidor está funcionando.");
});

// Funciones para manejar las cartas (modifica según tu lógica)
async function getBlackCards() {
  const result = await pool.query("SELECT id, text FROM black_cards");
  return result.rows;
}

async function getWhiteCards() {
  const result = await pool.query("SELECT id, text FROM white_cards");
  return result.rows;
}

// Lógica para iniciar el juego y la ronda
async function startGame() {
  gameState.gameStarted = true;
  // Lógica para iniciar una nueva ronda o cualquier inicialización del juego
  io.emit("gameStarted", { gameState });
}

// Conexión de Socket.IO
io.on("connection", (socket) => {
  console.log("Un jugador se ha conectado.");

  // Registro de jugadores
  socket.on("registerPlayer", async (username) => {
    if (players.length < MAX_PLAYERS) {
      // Registrar jugador
      players.push({ username, socketId: socket.id });
      console.log(`Jugador ${username} registrado.`);
      io.emit("updatePlayers", players); // Emitir lista de jugadores
    } else {
      socket.emit("error", "El juego está lleno.");
    }
  });

  // Evento para iniciar el juego
  socket.on("startGame", () => {
    const user = players.find((p) => p.socketId === socket.id);
    if (user && user.username === "Yugo" && !gameState.gameStarted) {
      startGame(); // Iniciar el juego
    } else {
      socket.emit("error", "No tienes permiso para iniciar el juego.");
    }
  });

  // Manejo de desconexión de jugador
  socket.on("disconnect", () => {
    players = players.filter((player) => player.socketId !== socket.id);
    io.emit("updatePlayers", players); // Actualizar lista de jugadores
  });
});

// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
