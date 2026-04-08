# 📦 Almacén App

<p align="center">
  <b>Sistema ERP de Inventario</b><br>
  Control de entradas, salidas y requisiciones en tiempo real
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/backend-PHP-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/frontend-TailwindCSS-38B2AC?style=for-the-badge" />
  <img src="https://img.shields.io/badge/database-MySQL-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=for-the-badge" />
</p>

---

## 🚀 Overview

**Almacén App** es un sistema diseñado para llevar el control del inventario de forma rápida, intuitiva y centralizada.

- ✔ Registro ágil de movimientos
- ✔ Firma digital en salidas
- ✔ Flujo basado en requisiciones

---

## 🧰 Tech Stack

### 🎨 Frontend

- HTML5
- TailwindCSS
- JavaScript (Vanilla)

### ⚙️ Backend

- PHP (API modular)
- Composer

### 🗄️ Base de Datos

- MySQL

### 🐳 Infraestructura

- Docker
- Docker Compose
- Nginx

---

## 🧩 Arquitectura

```mermaid
graph TD
    User --> Frontend
    Frontend --> API
    API --> DB
```

---

## 📂 Estructura del Proyecto

```bash
almacen-app/
│
├── backend/
│   ├── auth/
│   ├── config/
│   ├── firmas/
│   ├── public/
│   ├── scripts/
│   └── vendor/
│
├── frontend/
│   ├── assets/
│   ├── auth/
│   ├── modules/
│   │   ├── entradas/
│   │   ├── inventory/
│   │   ├── requisiciones/
│   │   └── salidas/
│   └── index.html
│
├── docker/
│   ├── nginx/
│   └── php/
│
├── docker-compose.yaml
├── docker-compose.override.yaml
└── README.md
```

---

## 🔥 Funcionalidades

### 📥 Entradas

- Registro manual o por requisición
- Control de productos recibidos

### 📤 Salidas

- Registro rápido tipo flujo manual
- Firma digital (entrega y recibe)

### 📋 Requisiciones

- Flujo: solicitud → aprobación → entrada

### 📊 Inventario

- Consulta en tiempo real
- Búsqueda optimizada

---

## ⚡ Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/tu-repo/almacen-app.git
cd almacen-app
```

### 2. Levantar entorno

```bash
docker-compose up -d
```

### 3. Acceso

- Frontend: http://localhost
- Backend: http://localhost/backend/public

---

## 🌐 API (Ejemplo)

### Productos

```
GET /backend/public/products.php
```

### Entradas

```
POST /backend/public/entradas.php
```

### Salidas

```
POST /backend/public/salidas.php
```

---

## 🔄 Git Flow

```mermaid
graph LR
    feature --> develop
    develop --> main
    main --> production
```

---

## 📏 Convenciones

| Rama       | Uso                    |
| ---------- | ---------------------- |
| main       | Estable                |
| develop    | Integración            |
| production | Deploy                 |
| feature/\* | Nuevas funcionalidades |

---

## 👨‍💻 Autor

**Cesar Soto**

---

## 🚧 Estado

Proyecto en evolución activa.

---

<p align="center">
  ⚡ Rápido como papel. Potente como un ERP.
</p>
