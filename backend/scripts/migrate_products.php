<?php

// ==========================
// CONFIGURACIÓN
// ==========================

// SICRET (remoto)
$sicretHost = '192.168.1.209';
$sicretDB   = 'sicre2PR';
$sicretUser = 'kofuz01';
$sicretPass = 'Xcape15948';

// NUEVA DB (Docker)
$almacenHost = 'mariadb';
$almacenDB   = 'almacen';
$almacenUser = 'root';
$almacenPass = 'root';

try {

    // ==========================
    // CONEXIÓN SICRET
    // ==========================
    $sicretPDO = new PDO(
        "mysql:host=$sicretHost;dbname=$sicretDB;charset=utf8",
        $sicretUser,
        $sicretPass
    );

    // ==========================
    // CONEXIÓN ALMACEN
    // ==========================
    $almacenPDO = new PDO(
        "mysql:host=$almacenHost;dbname=$almacenDB;charset=utf8",
        $almacenUser,
        $almacenPass
    );

    echo "Conexiones OK\n";

    // ==========================
    // CARGAR CATÁLOGOS
    // ==========================

    // Units
    $units = [];
    $stmt = $almacenPDO->query("SELECT id, name FROM units");
    foreach ($stmt as $row) {
        $units[$row['name']] = $row['id'];
    }

    // Product Types
    $productTypes = [];
    $stmt = $almacenPDO->query("SELECT id, name FROM product_types");
    foreach ($stmt as $row) {
        $productTypes[$row['name']] = $row['id'];
    }

    echo "Catálogos cargados\n";

    // ==========================
    // OBTENER PRODUCTOS SICRET
    // ==========================
    $stmt = $sicretPDO->query("SELECT * FROM alm_productos");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Productos encontrados: " . count($products) . "\n";

    // ==========================
    // INSERT
    // ==========================
    $insert = $almacenPDO->prepare("
        INSERT INTO products 
        (sku, name, description, product_type_id, unit_id, stock, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $count = 0;

    foreach ($products as $prod) {

        // ==========================
        // TRANSFORMACIONES
        // ==========================

        // SKU
        $sku = trim($prod['refInterna']);
        if (!$sku) {
            echo "⚠️ SKU vacío, saltando\n";
            continue;
        }

        // NAME
        $name = trim($prod['descInterna']);

        // DESCRIPTION
        $description = trim($prod['descProv']);

        // TIPO PRODUCTO
        $tipo = strtoupper(trim($prod['tipoProd']));
        if (!isset($productTypes[$tipo])) {
            echo "⚠️ Tipo desconocido: $tipo\n";
            continue;
        }
        $productTypeId = $productTypes[$tipo];

        // UNIDAD
        $unidad = strtoupper(trim($prod['unidadMed']));

        if (in_array($unidad, ['PZ', 'PIEZA'])) {
            $unidad = 'PIEZA';
        }

        if (!isset($units[$unidad])) {
            echo "⚠️ Unidad desconocida: $unidad\n";
            continue;
        }
        $unitId = $units[$unidad];

        // STOCK
        $stock = (int)$prod['disponibles'];

        // ESTATUS
        $isActive = ($prod['estatus'] === 'Activo') ? 1 : 0;

        // ==========================
        // INSERTAR
        // ==========================
        try {

            $insert->execute([
                $sku,
                $name,
                $description,
                $productTypeId,
                $unitId,
                $stock,
                $isActive
            ]);

            $count++;
            echo "Migrado: $sku\n";

        } catch (PDOException $e) {
            echo "❌ Error SKU $sku: " . $e->getMessage() . "\n";
        }
    }

    echo "✅ Migración completada: $count productos\n";

} catch (PDOException $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n";
}