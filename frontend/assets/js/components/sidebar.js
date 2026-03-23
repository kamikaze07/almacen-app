export function renderSidebar() {
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

                <a href="/index.html"
                    class="block px-3 py-2 rounded hover:bg-gray-800">
                    🏠 Dashboard
                </a>

                <a href="/modules/inventory/index.html"
                    class="block px-3 py-2 rounded bg-gray-800">
                    📦 Inventario
                </a>

                <a href="#" class="block px-3 py-2 rounded hover:bg-gray-800">
                    ⬆ Entradas
                </a>

                <a href="#" class="block px-3 py-2 rounded hover:bg-gray-800">
                    ⬇ Salidas
                </a>

                <a href="#" class="block px-3 py-2 rounded hover:bg-gray-800">
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