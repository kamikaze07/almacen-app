📦 Almacén App

Sistema ERP ligero para gestión de inventarios, entradas, salidas y requisiciones.

⸻

🚀 Descripción

Almacén App es una plataforma diseñada para optimizar el control de inventarios en tiempo real, permitiendo:
• Registro de entradas de productos
• Control de salidas con firmas digitales
• Gestión de requisiciones
• Visualización de inventario actualizado

⸻

🧰 Stack Tecnológico

💻 Frontend
• HTML5
• TailwindCSS
• JavaScript (Vanilla)

⚙️ Backend
• PHP (API REST)

🗄️ Base de Datos
• MySQL

🐳 Infraestructura
• Docker
• Docker Compose

⸻

🧩 Arquitectura

graph TD
A[Usuario] --> B[Frontend]
B --> C[API PHP]
C --> D[MySQL]

⸻

📂 Estructura del Proyecto

alamacen-app/
│
├── modules/
│ ├── inventario/
│ ├── entradas/
│ ├── salidas/
│ ├── requisiciones/
│
├── config/
│ ├── database.php
│
├── docker/
│
├── assets/
│
└── index.php

⸻

🔐 Funcionalidades Clave

📥 Entradas
• Registro manual o por requisición
• Control de productos recibidos

📤 Salidas
• Registro rápido tipo “anotación manual”
• Firma digital (entrega y recibe)
• Generación de reportes diarios

📋 Requisiciones
• Flujo de solicitud → aprobación → entrada

📊 Inventario
• Consulta en tiempo real
• Búsqueda avanzada

⸻

🧪 Instalación

1. Clonar repositorio

git clone https://github.com/tu-repo/almacen-app.git
cd almacen-app

2. Levantar con Docker

docker-compose up -d

3. Configurar base de datos

Editar:

config/database.php

⸻

🌐 Endpoints API (Ejemplo)

Entradas

GET /modules/entradas/
POST /modules/entradas/

Salidas

GET /modules/salidas/
POST /modules/salidas/

⸻

🔄 Flujo de Trabajo (Git)

graph LR
A[feature/*] --> B[develop]
B --> C[main]
C --> D[production]

⸻

🧹 Convenciones

Branches
• main → estable
• develop → integración
• production → despliegue
• feature/\* → nuevas funcionalidades

⸻

✍️ Autor

Cesar Soto

⸻

📌 Notas

Proyecto en evolución constante 🚧
