<?php
// Configuración de la base de datos
$host = 'localhost';  // O la IP de tu servidor MySQL
$dbname = 'cards_against_humanity';
$username = 'root';  // Cambia esto por el nombre de usuario de tu base de datos
$password = '';      // Cambia esto por la contraseña de tu base de datos

// Conectar a la base de datos
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar si el nombre de usuario fue enviado
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'])) {
        $user = $_POST['username'];

        // Verificar si el usuario ya existe
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->bindParam(':username', $user);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            // El usuario ya existe
            echo "El nombre de usuario ya está registrado. Por favor, elige otro.";
        } else {
            // Insertar nuevo usuario
            $stmt = $pdo->prepare("INSERT INTO users (username) VALUES (:username)");
            $stmt->bindParam(':username', $user);
            $stmt->execute();

            // Redirigir a la página del juego
            header("Location: game.html");
            exit();
        }
    }
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>
