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

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

echo json_encode($_SESSION['user']);