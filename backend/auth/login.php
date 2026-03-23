<?php
// 🔥 AGREGA ESTO ARRIBA DE TODO
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',        // 👈 ESTE ES EL FIX REAL
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// Buscar usuario
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

$storedPassword = $user['password'];
$isValid = false;

// 🔍 Detectar tipo de password
if (strlen($storedPassword) === 32) {
    // 🔴 MD5 antiguo
    if (md5($password) === $storedPassword) {
        $isValid = true;

        // 🔥 Rehash automático a bcrypt
        $newHash = password_hash($password, PASSWORD_DEFAULT);

        $update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $update->execute([$newHash, $user['id']]);
    }
} else {
    // 🟢 bcrypt moderno
    if (password_verify($password, $storedPassword)) {
        $isValid = true;
    }
}

if (!$isValid) {
    http_response_code(401);
    echo json_encode(['error' => 'Contraseña incorrecta']);
    exit;
}

// 🛡️ Guardar sesión
$_SESSION['user'] = [
    'id' => $user['id'],
    'username' => $user['username'],
    'role' => $user['role'],
    'num_emp' => $user['num_emp']
];

echo json_encode([
    'message' => 'Login correcto',
    'user' => $_SESSION['user']
]);