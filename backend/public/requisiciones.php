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

        // guardar firma
        $firma = str_replace('data:image/png;base64,', '', $data['firma']);
        $firma = str_replace(' ', '+', $firma);
        $firmaData = base64_decode($firma);

        $nombreArchivo = 'firma_' . time() . '.png';
        $ruta = __DIR__ . '/firmas/' . $nombreArchivo;

        file_put_contents($ruta, $firmaData);

        $firmaPath = 'firmas/' . $nombreArchivo;

        // header
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

        // detalle
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
    // 📄 LISTADO
    // =========================
    $fecha = $_GET['fecha'] ?? null;

    $where = "";
    $params = [];

    if ($fecha) {
        $where = "WHERE DATE(created_at) = :fecha";
        $params[':fecha'] = $fecha;
    }

    $stmt = $pdo->prepare("
        SELECT 
            id,
            folio,
            solicita_nombre,
            estatus,
            created_at
        FROM requisiciones
        $where
        ORDER BY created_at DESC
    ");

$stmt->execute($params);

echo json_encode([
    "success" => true,
    "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
exit;

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método no permitido"]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}