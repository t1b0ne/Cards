<?php
session_start(); // Iniciar sesión

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'cards_against_humanity';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar si el nombre de usuario fue enviado
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'])) {
        $user = $_POST['username'];

        // Buscar el usuario en la base de datos
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->bindParam(':username', $user);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            // El usuario existe, iniciar sesión
            $_SESSION['username'] = $user;
            header("Location: game.html"); // Redirigir al juego
            exit();
        } else {
            // El usuario no existe
            echo "El nombre de usuario no está registrado. Por favor, regístrate primero.";
        }
    }
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>
