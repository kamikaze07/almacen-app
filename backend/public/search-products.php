<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

if ($method === 'GET') {

    try {
        // 🧠 Filtro de búsqueda
        $where = "";
        $params = [];

        if ($search !== '') {
            $where = "WHERE name LIKE :search OR sku LIKE :search";
            $params[':search'] = "%$search%";
        }

        // Consulta de productos
        $stmt = $pdo->prepare("
            SELECT 
                id,
                sku,
                name
            FROM products
            $where
            LIMIT 10
        ");

        // Asignar los parámetros de búsqueda
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $products
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }
}
?>