<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID requerido"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
        r.folio,
        r.solicita_nombre,
        r.firma_solicita,
        rp.cantidad,
        p.name,
        p.sku
    FROM requisiciones r
    JOIN requisicion_productos rp ON r.id = rp.requisicion_id
    JOIN products p ON rp.producto_id = p.id
    WHERE r.id = :id
");

$stmt->execute([':id' => $id]);

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => $data
]);