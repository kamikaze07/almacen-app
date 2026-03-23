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

session_destroy();

echo json_encode(['message' => 'Sesión cerrada']);