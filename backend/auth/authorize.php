<?php

function requireRole($roles = []) {
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
        exit;
    }

    if (!empty($roles) && !in_array($_SESSION['user']['role'], $roles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Sin permisos']);
        exit;
    }
}