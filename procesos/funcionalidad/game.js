const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./procesos/db/db.js"); // Corregir la ruta a la base de datos
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const MAX_PLAYERS = 10;
let players = []; // Lista temporal para manejar jugadores conectados
let gameState = {
  blackCard: "",
  whiteCards: {},
  czar: "",
  round: 0,
  gameStarted: false, // Indicador para saber si el juego ya empezó
};

// Obtener cartas negras desde la base de datos
async function getBlackCards() {
  const result = await pool.query("SELECT id, text FROM black_cards");
  return result.rows;
}

// Obtener cartas blancas desde la base de datos
async function getWhiteCards() {
  const result = await pool.query("SELECT id, text FROM white_cards");
  return result.rows;
}

// Iniciar nueva ronda
async function startNewRound() {
  gameState.round++;

  // Seleccionar una carta negra aleatoria
  const blackCards = await getBlackCards();
  const randomBlackCard = blackCards[Math.floor(Math.random() * blackCards.length)];
  gameState.blackCard = randomBlackCard.text;

  // Asignar el czar
  gameState.czar = players[gameState.round % players.length].username;
  gameState.whiteCards = {};

  io.emit("newRound", gameState);
}

// Iniciar el juego
async function startGame() {
  gameState.gameStarted = true;
  await startNewRound(); // Iniciar la primera ronda
  io.emit("gameStarted", { gameState });
}

// Manejo de jugadores y eventos
io.on("connection", (socket) => {
  console.log("Un jugador se ha conectado.");

  // Registro de jugadores
  socket.on("registerPlayer", async (username) => {
    if (players.length < MAX_PLAYERS) {
      try {
        // Registrar jugador en la base de datos
        const result = await pool.query(
          "INSERT INTO users (username, socket_id) VALUES ($1, $2) RETURNING *",
          [username, socket.id]
        );
        const newPlayer = result.rows[0];

        // Agregar a la lista temporal de jugadores
        players.push(newPlayer);

        // Enviar confirmación
        socket.emit("registered", { username: newPlayer.username, players });
        io.emit("updatePlayers", players);  // Emitir lista de jugadores activos

        // Iniciar el juego si alcanzamos el máximo de jugadores
        if (players.length === MAX_PLAYERS && !gameState.gameStarted) {
          if (newPlayer.username === "Yugo") {
            socket.emit("showStartButton"); // Solo "Yugo" puede ver el botón para iniciar
          }
        }
      } catch (error) {
        console.error("Error registrando jugador:", error.message);
        socket.emit("error", "Error al registrar jugador.");
      }
    } else {
      socket.emit("error", "El juego está lleno.");
    }
  });

  // Evento para que Yugo inicie el juego
  socket.on("startGame", () => {
    const user = players.find((player) => player.socket_id === socket.id);
    if (user && user.username === "Yugo" && !gameState.gameStarted) {
      startGame(); // Inicia la partida
    } else {
      socket.emit("error", "No tienes permiso para iniciar el juego.");
    }
  });

  // Enviar carta blanca
  socket.on("playCard", async (cardId) => {
    if (!gameState.whiteCards[socket.id]) {
      gameState.whiteCards[socket.id] = cardId;

      // Almacenar la jugada en la base de datos
      const user = players.find((p) => p.socket_id === socket.id);
      if (user) {
        await pool.query(
          "INSERT INTO played_cards (game_id, user_id, white_card_id) VALUES ($1, $2, $3)",
          [1, user.id, cardId]
        );

        // Verificar si todos los jugadores han jugado sus cartas
        if (Object.keys(gameState.whiteCards).length === players.length - 1) {
          io.emit("allCardsPlayed", gameState.whiteCards);
        }
      }
    }
  });

  // Manejo de desconexión
  socket.on("disconnect", async () => {
    // Eliminar al jugador desconectado
    players = players.filter((player) => player.socket_id !== socket.id);
    io.emit("updatePlayers", players);  // Emitir lista actualizada de jugadores

    // Eliminar el jugador de la base de datos si es necesario
    await pool.query("DELETE FROM users WHERE socket_id = $1", [socket.id]);
  });
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
