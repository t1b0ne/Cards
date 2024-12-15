// client.js
const socket = io();  // Conectar al servidor de WebSocket

// Mostrar el botón de inicio de juego solo para "Yugo"
socket.on("showStartButton", () => {
  const startButton = document.createElement("button");
  startButton.textContent = "Iniciar Juego";
  startButton.onclick = () => {
    socket.emit("startGame"); // Enviar solicitud de inicio de juego al servidor
  };
  document.body.appendChild(startButton); // Agregar el botón al DOM
});

// Recibir el evento cuando el juego comienza
socket.on("gameStarted", (data) => {
  console.log("El juego ha comenzado", data.gameState);
  // Redirigir o actualizar la UI para la fase de juego
  // Por ejemplo, podrías redirigir a otra página o actualizar la interfaz de usuario
  window.location.href = "game.html";  // Redirigir a la página de juego
});

// Mostrar lista de jugadores activos
socket.on("updatePlayers", (players) => {
  const playerListElement = document.getElementById("player-list");
  playerListElement.innerHTML = "";  // Limpiar la lista existente

  players.forEach((player) => {
    const playerElement = document.createElement("li");
    playerElement.textContent = player.username;  // Mostrar el nombre de usuario del jugador
    playerListElement.appendChild(playerElement);
  });
});

// Esta función se ejecuta cuando el servidor emite el evento 'showStartButton'
socket.on("showStartButton", () => {
  // Solo se muestra el botón si el usuario registrado es "Yugo"
  const username = document.getElementById('username') ? document.getElementById('username').value : document.getElementById('login-username').value;
  
  if (username === "Yugo") {
    // Crear el botón de "Iniciar Juego"
    const startButton = document.createElement("button");
    startButton.textContent = "Iniciar Juego";
    startButton.onclick = () => {
      socket.emit("startGame"); // Enviar evento para iniciar el juego al servidor
    };
    document.body.appendChild(startButton); // Agregar el botón al DOM
  }
});

// Recibir evento cuando el juego empieza
socket.on("gameStarted", (data) => {
  console.log("El juego ha comenzado", data.gameState);
  // Redirigir o actualizar la UI para la fase de juego
  window.location.href = "game.html"; // Redirigir a la página del juego
});

