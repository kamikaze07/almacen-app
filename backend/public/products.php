<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';



$method = $_SERVER['REQUEST_METHOD'];
$all = isset($_GET['all']) ? true : false;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

$offset = ($page - 1) * $limit;

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        INSERT INTO products 
        (sku, name, description, product_type_id, unit_id, stock, is_active)
        VALUES (:sku, :name, :description, :type, :unit, :stock, 1)
    ");

    $stmt->execute([
        ':sku' => $data['sku'],
        ':name' => $data['name'],
        ':description' => $data['description'],
        ':type' => $data['product_type_id'],
        ':unit' => $data['unit_id'],
        ':stock' => $data['stock']
    ]);

    echo json_encode(["success" => true]);
    exit;
}

if ($method === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        UPDATE products 
        SET 
            sku = :sku,
            name = :name,
            description = :description,
            product_type_id = :type,
            unit_id = :unit,
            stock = :stock
        WHERE id = :id
    ");

    $stmt->execute([
        ':id' => $data['id'],
        ':sku' => $data['sku'],
        ':name' => $data['name'],
        ':description' => $data['description'],
        ':type' => $data['product_type_id'],
        ':unit' => $data['unit_id'],
        ':stock' => $data['stock']
    ]);

    echo json_encode(["success" => true]);
    exit;
}

if ($method === 'DELETE') {

    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(["error" => "ID requerido"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(["success" => true]);
    exit;
}

// ==========================
// 📄 CATÁLOGO COMPLETO (PDF)
// ==========================
if ($method === 'GET' && $all) {

    try {

        $stmt = $pdo->query("
            SELECT 
                p.sku,
                p.name,
                p.description
            FROM products p
            WHERE p.is_active = 1
            ORDER BY p.name ASC
        ");

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

    exit;
}


try {

    // =========================
    // 🔍 BÚSQUEDA RÁPIDA (para entradas)
    // =========================
    if ($search !== '' && !isset($_GET['page'])) {

        $stmt = $pdo->prepare("
            SELECT id, name, sku
            FROM products
            WHERE name LIKE :search OR sku LIKE :search
            LIMIT 10
        ");

        $stmt->execute([
            ':search' => "%$search%"
        ]);

        echo json_encode([
            "success" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        exit;
    }

    // 🧠 Filtro dinámico
    $where = "";
    $params = [];

    if ($search !== '') {
        $where = "WHERE p.name LIKE :search OR p.sku LIKE :search";
        $params[':search'] = "%$search%";
    }

    // 🔢 TOTAL
    $totalStmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM products p
        $where
    ");
    $totalStmt->execute($params);
    $total = $totalStmt->fetch()['total'];

    // 📦 DATA
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.sku,
            p.name,
            p.description,
            p.stock,
            u.abbreviation AS unit,
            pt.name AS type
        FROM products p
        JOIN units u ON p.unit_id = u.id
        JOIN product_types pt ON p.product_type_id = pt.id
        $where
        ORDER BY p.id DESC
        LIMIT :limit OFFSET :offset
    ");

    // bind search
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $products = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $products,
        "pagination" => [
            "total" => (int)$total,
            "page" => $page,
            "limit" => $limit,
            "totalPages" => ceil($total / $limit)
        ]
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}