<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Cargar .env
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Variables
$host = $_ENV['DB_HOST'];
$db   = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $pdo->exec("SET time_zone = '-06:00'");
} catch (PDOException $e) {
    http_response_code(500);

    error_log("DB ERROR: " . $e->getMessage());

    die(json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos'
    ]));
}
