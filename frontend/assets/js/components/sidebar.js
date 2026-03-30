export function renderSidebar(active = "") {

    const linkClass = (name) =>
        `block px-3 py-2 rounded transition ${
            active === name
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`;

    return `
    <aside class="w-64 bg-gray-950 h-screen p-4 flex flex-col justify-between border-r border-gray-800">

        <div>
            <!-- LOGO -->
            <div class="flex items-center gap-3 mb-8">
                <img src="/assets/logo.png" class="w-10 h-10">
                <span class="font-semibold">Almacén</span>
            </div>

            <!-- MENU -->
            <nav class="space-y-2">

                <a href="/index.html" class="${linkClass('dashboard')}">
                    🏠 Dashboard
                </a>

                <a href="/modules/inventory/index.html" class="${linkClass('inventory')}">
                    📦 Inventario
                </a>

                <a href="/modules/requisiciones/index.html" class="${linkClass('requisiciones')}">
                    📋 Requisiciones
                </a>

                <a href="/modules/entradas/index.html" class="${linkClass('entradas')}">
                    ⬆ Entradas
                </a>

                <a href="/modules/salidas/index.html" class="${linkClass('salidas')}">
                    ⬇ Salidas
                </a>

                <a href="#" class="${linkClass('reportes')}">
                    📊 Reportes
                </a>

            </nav>
        </div>

        <!-- LOGOUT -->
        <button id="logoutBtn" class="text-red-400 text-left">
            Cerrar sesión
        </button>

    </aside>
    `;
}