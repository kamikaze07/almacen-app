<?php

// ==========================
// CONFIGURACIÓN
// ==========================

// SICRET (remoto)
$sicretHost = '192.168.1.209';
$sicretDB   = 'sicrePR'; // AJUSTA ESTO
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
    // OBTENER USUARIOS SICRET
    // ==========================
    $stmt = $sicretPDO->query("SELECT * FROM usuarios");

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Usuarios encontrados: " . count($users) . "\n";

    // ==========================
    // INSERT
    // ==========================
    $insert = $almacenPDO->prepare("
        INSERT INTO users (username, email, password, num_emp, role)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($users as $user) {

        // MAPEO DE ROL
        $priv = strtoupper(trim($user['priv']));

        $role = in_array($priv, ['SUPER USUARIO'])
            ? 'SUPER_USUARIO'
            : 'ALMACEN';

        $insert->execute([
            $user['nombre_usu'],
            $user['correo'] ?: null,
            $user['contrasena'],
            $user['num_emp'],
            $role
        ]);

        echo "Migrado: " . $user['nombre_usu'] . "\n";
    }

    echo "✅ Migración completada\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}