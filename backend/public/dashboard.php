<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';

try {

    // ============================
    // 📅 HOY
    // ============================
    $today = date('Y-m-d');

    // ============================
    // 📦 STOCK TOTAL
    // ============================
    $stmt = $pdo->query("
        SELECT SUM(stock) as total FROM products
    ");
    $stock_total = (int)$stmt->fetch()['total'];

    // ============================
    // 📥 ENTRADAS HOY
    // ============================
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM entradas 
        WHERE DATE(fecha) = ?
    ");
    $stmt->execute([$today]);
    $entradas_hoy = (int)$stmt->fetch()['total'];

    // ============================
    // 📤 SALIDAS HOY
    // ============================
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM salidas 
        WHERE DATE(fecha) = ?
    ");
    $stmt->execute([$today]);
    $salidas_hoy = (int)$stmt->fetch()['total'];

    // ============================
    // ⚠️ ALERTAS (stock bajo)
    // ============================
    $stmt = $pdo->query("
        SELECT COUNT(*) as total 
        FROM products 
        WHERE min_stock IS NOT NULL AND stock <= min_stock
    ");
    $alertas = (int)$stmt->fetch()['total'];

    // ============================
    // 📈 MOVIMIENTOS (últimos 7 días)
    // ============================
    $stmt = $pdo->query("
        SELECT 
            DATE(fecha) as dia,
            COUNT(*) as total
        FROM entradas
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY dia
    ");
    $entradas = $stmt->fetchAll();

    $stmt = $pdo->query("
        SELECT 
            DATE(fecha) as dia,
            COUNT(*) as total
        FROM salidas
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY dia
    ");
    $salidas = $stmt->fetchAll();

    // formatear para chart
    $labels = [];
    $dataEntradas = [];
    $dataSalidas = [];

    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $labels[] = date('D', strtotime($date));

        $e = 0;
        foreach ($entradas as $row) {
            if ($row['dia'] === $date) $e = (int)$row['total'];
        }

        $s = 0;
        foreach ($salidas as $row) {
            if ($row['dia'] === $date) $s = (int)$row['total'];
        }

        $dataEntradas[] = $e;
        $dataSalidas[] = $s;
    }

    // ============================
    // 📊 TOP PRODUCTOS (salidas)
    // ============================
    $stmt = $pdo->query("
        SELECT p.name, SUM(sp.cantidad) as total
        FROM salida_productos sp
        JOIN products p ON p.id = sp.producto_id
        GROUP BY sp.producto_id
        ORDER BY total DESC
        LIMIT 5
    ");
    $top_productos = $stmt->fetchAll();

    // ============================
    // ⚠️ PRODUCTOS CRÍTICOS
    // ============================
    $stmt = $pdo->query("
        SELECT name, stock 
        FROM products
        WHERE min_stock IS NOT NULL AND stock <= min_stock
        ORDER BY stock ASC
        LIMIT 5
    ");
    $productos_criticos = $stmt->fetchAll();

    // ============================
    // 📋 REQUISICIONES RECIENTES
    // ============================
    $stmt = $pdo->query("
        SELECT folio, estatus AS estado 
        FROM requisiciones
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $requisiciones = $stmt->fetchAll();

    // ============================
    // 📜 ACTIVIDAD RECIENTE
    // ============================
    $actividad = [];

    // últimas entradas
    $stmt = $pdo->query("
        SELECT folio, fecha 
        FROM entradas 
        ORDER BY id DESC 
        LIMIT 3
    ");

    foreach ($stmt->fetchAll() as $e) {
        $actividad[] = [
            "tipo" => "entrada",
            "mensaje" => "Entrada registrada: " . $e['folio'],
            "fecha" => $e['fecha']
        ];
    }

    // últimas salidas
    $stmt = $pdo->query("
        SELECT folio, fecha 
        FROM salidas 
        ORDER BY id DESC 
        LIMIT 3
    ");

    foreach ($stmt->fetchAll() as $s) {
        $actividad[] = [
            "tipo" => "salida",
            "mensaje" => "Salida registrada: " . $s['folio'],
            "fecha" => $s['fecha']
        ];
    }

    // ============================
    // 📦 RESPUESTA FINAL
    // ============================
    echo json_encode([
        "success" => true,

        "stock_total" => $stock_total,
        "entradas_hoy" => $entradas_hoy,
        "salidas_hoy" => $salidas_hoy,
        "alertas" => $alertas,

        "movimientos" => [
            "labels" => $labels,
            "entradas" => $dataEntradas,
            "salidas" => $dataSalidas
        ],

        "top_productos" => $top_productos,
        "productos_criticos" => $productos_criticos,
        "requisiciones" => $requisiciones,
        "actividad" => $actividad

    ]);
} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
