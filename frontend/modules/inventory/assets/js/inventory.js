document.addEventListener("DOMContentLoaded", () => {
    loadInventory();
});

function loadInventory() {
    const products = [
        {
            id: 1,
            name: "Tornillos",
            sku: "TOR-001",
            stock: 120,
            type: "material",
            unit: "pieza",
            description: "Tornillos de acero"
        },
        {
            id: 2,
            name: "Martillo",
            sku: "MAR-002",
            stock: 15,
            type: "herramienta",
            unit: "pieza",
            description: "Martillo profesional"
        },
        {
            id: 3,
            name: "Aceite",
            sku: "ACE-003",
            stock: 5,
            type: "consumible",
            unit: "litro",
            description: "Aceite industrial"
        }
    ];

    renderTable(products);
}

function renderTable(products) {
    const table = document.getElementById("inventoryTable");
    table.innerHTML = "";

    products.forEach(p => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-800 hover:bg-gray-800";

        tr.innerHTML = `
            <td class="p-3 font-medium">${p.name}</td>

            <td class="p-3 text-gray-400">${p.sku}</td>

            <td class="p-3">${renderType(p.type)}</td>

            <td class="p-3 text-gray-300">${p.unit}</td>

            <td class="p-3">${renderStock(p.stock)}</td>

            <td class="p-3 text-gray-400 truncate max-w-xs">
                ${p.description || "-"}
            </td>

            <td class="p-3 text-right space-x-2">
                <button class="text-blue-400 hover:underline">Editar</button>
                <button class="text-red-400 hover:underline">Eliminar</button>
            </td>
        `;

        table.appendChild(tr);
    });
}

function renderStock(stock) {
    let color = "bg-green-600";

    if (stock < 10) color = "bg-red-600";
    else if (stock < 50) color = "bg-yellow-500";

    return `
        <span class="${color} px-2 py-1 rounded text-xs">
            ${stock}
        </span>
    `;
}
document.getElementById("searchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();

    const rows = document.querySelectorAll("#inventoryTable tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
    });
});

const modal = document.getElementById("productModal");

document.getElementById("btnCreate").addEventListener("click", () => {
    openModal();
});

document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);

function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
        name: form.name.value,
        sku: form.sku.value,
        stock: parseInt(form.stock.value),
        type: form.type.value,
        unit: form.unit.value,
        description: form.description.value
    };

    console.log("Producto:", data);

    // 🔥 aquí luego va fetch al backend

    form.reset();
    closeModal();
});

function renderType(type) {
    let color = "bg-gray-600";

    if (type === "material") color = "bg-blue-600";
    if (type === "herramienta") color = "bg-purple-600";
    if (type === "consumible") color = "bg-orange-500";

    return `
        <span class="${color} px-2 py-1 rounded text-xs capitalize">
            ${type}
        </span>
    `;
}