<?php
// Conexión a la base de datos
// Nota: Usar __DIR__ ayuda a evitar problemas con rutas relativas
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

// Crear una nueva salida de productos
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Ya no recibimos el folio ni la fecha por JS, solo los datos de los inputs y productos
    $entrega_nombre = $data['entrega_nombre'];
    $recibe_nombre = $data['recibe_nombre'];
    $productos = $data['productos'];
    $firma_entrega_base64 = $data['firma_entrega'];
    $firma_recibe_base64 = $data['firma_recibe'];

    // 1. Generar un Folio único en el backend (Ejemplo: SAL-20260326-153000)
    $folio = 'SAL-' . date('Ymd-His');

    // 2. Insertar usando NOW() de SQL para capturar la fecha y hora exacta del servidor
    $sql = "INSERT INTO salidas (folio, fecha, entrega_nombre, recibe_nombre) VALUES (?, NOW(), ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$folio, $entrega_nombre, $recibe_nombre]);

    // Obtener el ID de la salida recién creada
    $salida_id = $pdo->lastInsertId();

    // 3. Crear el directorio de firmas si no existe para evitar errores al guardar
    $directorio_firmas = __DIR__ . '/firmas/';
    if (!file_exists($directorio_firmas)) {
        mkdir($directorio_firmas, 0777, true);
    }

    // Guardar las firmas como archivos de imagen
    $firma_entrega_path = 'firmas/' . $salida_id . '_entrega.png';
    $firma_recibe_path = 'firmas/' . $salida_id . '_recibe.png';

    // Separamos el encabezado de la imagen (data:image/png;base64,) y guardamos el archivo
    file_put_contents(__DIR__ . '/' . $firma_entrega_path, base64_decode(explode(',', $firma_entrega_base64)[1]));
    file_put_contents(__DIR__ . '/' . $firma_recibe_path, base64_decode(explode(',', $firma_recibe_base64)[1]));

    // Insertar los productos relacionados con la salida en la tabla 'salida_productos'
        foreach ($productos as $producto) {
            $producto_id = $producto['producto_id'];
            $cantidad = $producto['cantidad'];
            $unidad_destino = $producto['unidad_destino'];

            // 1. Insertar el detalle de la salida
            $sql_productos = "INSERT INTO salida_productos (salida_id, producto_id, cantidad, unidad_destino) VALUES (?, ?, ?, ?)";
            $stmt_productos = $pdo->prepare($sql_productos);
            $stmt_productos->execute([$salida_id, $producto_id, $cantidad, $unidad_destino]);

            // 2. NUEVO: Restar la cantidad del stock en la tabla de productos
            // Asegúrate de que tu tabla se llame 'products' o cámbialo si se llama diferente
            $sql_restar_stock = "UPDATE products SET stock = stock - ? WHERE id = ?";
            $stmt_stock = $pdo->prepare($sql_restar_stock);
            $stmt_stock->execute([$cantidad, $producto_id]);
        }

    // Actualizar la tabla 'salidas' con las rutas de las firmas
    $sql_firmas = "UPDATE salidas SET firma_entrega = ?, firma_recibe = ? WHERE id = ?";
    $stmt_firmas = $pdo->prepare($sql_firmas);
    $stmt_firmas->execute([$firma_entrega_path, $firma_recibe_path, $salida_id]);

    // Enviar la respuesta de éxito al JavaScript
    echo json_encode(['message' => 'Salida registrada correctamente']);
    exit; // Importante para detener la ejecución aquí
}

// Obtener todas las salidas de productos con los productos relacionados para la fecha seleccionada
if ($_SERVER['REQUEST_METHOD'] == 'GET') {

    $fecha = $_GET['fecha'] ?? date('Y-m-d');

    $sql = "
        SELECT 
            s.id,
            s.folio,
            s.fecha,
            s.entrega_nombre,
            s.recibe_nombre,
            s.firma_entrega,
            s.firma_recibe,

            sp.cantidad,
            sp.unidad_destino,

            p.name AS producto_nombre,
            p.sku AS producto_sku

        FROM salidas s
        JOIN salida_productos sp ON s.id = sp.salida_id
        JOIN products p ON sp.producto_id = p.id

        WHERE DATE(s.fecha) = ?
        ORDER BY s.id DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$fecha]);

    $salidas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($salidas);
    exit;
}

?>