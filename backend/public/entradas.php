<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {

    // ============================
    // 📥 CREAR ENTRADA
    // ============================
    if ($method === 'POST') {

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) throw new Exception("Datos inválidos");

        $tipo_entrada = $data['tipo_entrada'];
        $requisicion_id = $data['requisicion_id'] ?? null;
        $entrega = $data['entrega_nombre'];
        $recibe = $data['recibe_nombre'];
        $observaciones = $data['observaciones'] ?? null;
        $productos = $data['productos'];

        $firma_entrega_base64 = $data['firma_entrega'];
        $firma_recibe_base64 = $data['firma_recibe'];

        if (empty($productos)) {
            throw new Exception("Debe incluir productos");
        }

        $pdo->beginTransaction();

        // 🔢 folio
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM entradas");
        $count = $stmt->fetch()['total'] + 1;
        $folio = "FMF-FOR-ALM-001-" . str_pad($count, 6, "0", STR_PAD_LEFT);

        // 🧾 insertar entrada
        $stmt = $pdo->prepare("
            INSERT INTO entradas 
            (folio, tipo_entrada, requisicion_id, entrega_nombre, recibe_nombre, observaciones)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$folio, $tipo_entrada, $requisicion_id, $entrega, $recibe, $observaciones]);

        $entrada_id = $pdo->lastInsertId();

        // ============================
        // ✍️ GUARDAR FIRMAS (CLAVE 🔥)
        // ============================

        $firma_entrega_path = 'firmas/' . $entrada_id . '_entrega.png';
        $firma_recibe_path = 'firmas/' . $entrada_id . '_recibe.png';

        file_put_contents(
            __DIR__ . '/../firmas/' . $entrada_id . '_entrega.png',
            base64_decode(explode(',', $firma_entrega_base64)[1])
        );

        file_put_contents(
            __DIR__ . '/../firmas/' . $entrada_id . '_recibe.png',
            base64_decode(explode(',', $firma_recibe_base64)[1])
        );

        // ============================
        // 📦 detalle + stock
        // ============================
        foreach ($productos as $p) {

            $pid = $p['producto_id'];
            $cantidad = $p['cantidad'];

            if ($cantidad <= 0) throw new Exception("Cantidad inválida");

            // validar producto
            $check = $pdo->prepare("SELECT id FROM products WHERE id = ?");
            $check->execute([$pid]);
            if (!$check->fetch()) {
                throw new Exception("Producto no existe: $pid");
            }

            // insertar detalle
            $stmt = $pdo->prepare("
                INSERT INTO entrada_productos (entrada_id, producto_id, cantidad)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$entrada_id, $pid, $cantidad]);

            // actualizar stock
            $stmt = $pdo->prepare("
                UPDATE products SET stock = stock + ? WHERE id = ?
            ");
            $stmt->execute([$cantidad, $pid]);
        }

        // ============================
        // 🔗 ACTUALIZAR REQUISICIÓN
        // ============================
        if ($requisicion_id) {

            $stmt = $pdo->prepare("
                SELECT producto_id, cantidad 
                FROM requisicion_productos
                WHERE requisicion_id = ?
            ");
            $stmt->execute([$requisicion_id]);
            $req = $stmt->fetchAll();

            $stmt = $pdo->prepare("
                SELECT ep.producto_id, SUM(ep.cantidad) total
                FROM entrada_productos ep
                JOIN entradas e ON ep.entrada_id = e.id
                WHERE e.requisicion_id = ?
                GROUP BY ep.producto_id
            ");
            $stmt->execute([$requisicion_id]);
            $surtido = $stmt->fetchAll();

            $map = [];
            foreach ($surtido as $s) {
                $map[$s['producto_id']] = $s['total'];
            }

            $completa = true;

            foreach ($req as $r) {
                $pid = $r['producto_id'];
                $reqCant = $r['cantidad'];
                $surtCant = $map[$pid] ?? 0;

                if ($surtCant < $reqCant) {
                    $completa = false;
                }
            }

            $estatus = $completa ? 'atendida' : 'atendida parcialmente';

            $stmt = $pdo->prepare("
                UPDATE requisiciones SET estatus = ? WHERE id = ?
            ");
            $stmt->execute([$estatus, $requisicion_id]);
        }

        // ============================
        // 💾 GUARDAR RUTAS DE FIRMA
        // ============================
        $stmt = $pdo->prepare("
            UPDATE entradas 
            SET firma_entrega = ?, firma_recibe = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $firma_entrega_path,
            $firma_recibe_path,
            $entrada_id
        ]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "folio" => $folio
        ]);
        exit;
    }

    // ============================
    // 📄 LISTADO
    // ============================
    if ($method === 'GET' && !isset($_GET['id'])) {

        $stmt = $pdo->query("
            SELECT 
                e.id,
                e.folio,
                e.fecha,
                e.tipo_entrada,
                e.firma_entrega,
                e.firma_recibe,
                COALESCE(r.estatus, 'N/A') AS estado
            FROM entradas e
            LEFT JOIN requisiciones r ON e.requisicion_id = r.id
            ORDER BY e.id DESC
        ");

        echo json_encode([
            "success" => true,
            "data" => $stmt->fetchAll()
        ]);
        exit;
    }

    // ============================
    // 🔍 DETALLE
    // ============================
    if ($method === 'GET' && isset($_GET['id'])) {

        $id = $_GET['id'];

        $stmt = $pdo->prepare("SELECT * FROM entradas WHERE id = ?");
        $stmt->execute([$id]);
        $entrada = $stmt->fetch();

        if (!$entrada) {
            throw new Exception("Entrada no encontrada");
        }

        $stmt = $pdo->prepare("
            SELECT p.name, ep.cantidad
            FROM entrada_productos ep
            JOIN products p ON ep.producto_id = p.id
            WHERE ep.entrada_id = ?
        ");
        $stmt->execute([$id]);

        $entrada['productos'] = $stmt->fetchAll();

        echo json_encode([
            "success" => true,
            "data" => $entrada
        ]);
        exit;
    }

} catch (Exception $e) {

    if ($pdo->inTransaction()) $pdo->rollBack();

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}