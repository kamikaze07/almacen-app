<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {

    // =========================
    // 🟢 POST - Crear requisición
    // =========================
    if ($method === 'POST') {

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['solicita']) || empty($data['productos'])) {
            echo json_encode(["success" => false, "error" => "Datos incompletos"]);
            exit;
        }

        $folio = "REQ-" . date("Ymd-His");

        // 🖊️ Guardar firma en archivo
        $firma = str_replace('data:image/png;base64,', '', $data['firma']);
        $firma = str_replace(' ', '+', $firma);
        $firmaData = base64_decode($firma);

        $nombreArchivo = 'firma_' . time() . '.png';
        $ruta = __DIR__ . '/firmas/' . $nombreArchivo;

        file_put_contents($ruta, $firmaData);

        $firmaPath = 'firmas/' . $nombreArchivo;

        // HEADER
        $stmt = $pdo->prepare("
            INSERT INTO requisiciones (folio, solicita_nombre, firma_solicita)
            VALUES (:folio, :solicita, :firma)
        ");

        $stmt->execute([
            ':folio' => $folio,
            ':solicita' => $data['solicita'],
            ':firma' => $firmaPath
        ]);

        $requisicion_id = $pdo->lastInsertId();

        // DETALLE
        $stmtDetalle = $pdo->prepare("
            INSERT INTO requisicion_productos (requisicion_id, producto_id, cantidad)
            VALUES (:req, :prod, :cant)
        ");

        foreach ($data['productos'] as $p) {
            $stmtDetalle->execute([
                ':req' => $requisicion_id,
                ':prod' => $p['id'],
                ':cant' => $p['quantity']
            ]);
        }

        echo json_encode(["success" => true, "folio" => $folio]);
        exit;
    }

    // =========================
    // 🟢 GET - SOLO HEADER
    // =========================
    if ($method === 'GET') {

        $fecha = $_GET['fecha'] ?? null;

        $stmt = $pdo->prepare("
            SELECT id, folio, created_at, solicita_nombre
            FROM requisiciones
            WHERE DATE(created_at) = :fecha
            ORDER BY created_at DESC
        ");

        $stmt->execute([':fecha' => $fecha]);

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $data
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método no permitido"]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}