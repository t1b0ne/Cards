const socket = io(); // Conexión al servidor Socket.IO

// Función para registrar al jugador
const username = prompt("Introduce tu nombre de usuario");
socket.emit("registerPlayer", username);

// Actualizar lista de jugadores
socket.on("updatePlayers", (players) => {
  const playersList = document.getElementById("players");
  playersList.innerHTML = ""; // Limpiar antes de actualizar
  players.forEach(player => {
    const li = document.createElement("li");
    li.textContent = player.username;
    playersList.appendChild(li);
  });
});

// Evento para el inicio del juego (solo visible para "Yugo")
socket.on("showStartButton", () => {
  const startButton = document.createElement("button");
  startButton.textContent = "Iniciar Juego";
  startButton.onclick = () => {
    socket.emit("startGame");
  };
  document.body.appendChild(startButton); // Agregar botón de inicio
});

// Evento cuando el juego comienza
socket.on("gameStarted", (data) => {
  console.log("Juego iniciado", data.gameState);
  // Actualiza la interfaz para la fase de juego
});
