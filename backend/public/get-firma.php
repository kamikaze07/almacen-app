<?php

$file = $_GET['file'] ?? '';

$path = __DIR__ . '/firmas/' . basename($file);

if (!file_exists($path)) {
    http_response_code(404);
    echo "Archivo no encontrado";
    exit;
}

header('Content-Type: image/png');
readfile($path);