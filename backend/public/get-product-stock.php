<?php
// Conexión a la base de datos
include('../config/database.php');

header('Content-Type: application/json');

// Obtener el id del producto desde el parámetro GET
$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($productId > 0) {
    // Consulta para obtener el stock del producto
    $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        echo json_encode([
            "success" => true,
            "stock" => $product['stock']
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "Producto no encontrado"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "ID del producto inválido"]);
}
?>