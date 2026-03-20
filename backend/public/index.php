<?php

try {
    $pdo = new PDO(
        "mysql:host=mariadb;dbname=almacen;charset=utf8mb4",
        "root",
        "root"
    );

    echo json_encode([
        "message" => "Conexión a DB exitosa 🔥"
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}