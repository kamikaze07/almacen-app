console.log("inventory.js cargado 🔥");
let currentPage = 1;
const limit = 10;
let currentSearch = "";
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadInventory();
});

let currentProducts = [];

async function loadInventory(page = 1) {
    try {
        const res = await fetch(
            `/public/products.php?page=${page}&limit=${limit}&search=${encodeURIComponent(currentSearch)}`
        );

        const result = await res.json();

        currentProducts = result.data; // 🔥 GUARDAMOS

        const products = result.data.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            type: mapType(p.type),
            unit: p.unit,
            description: p.description || ""
        }));

        renderTable(products);
        renderPagination(result.pagination);

    } catch (error) {
        console.error("Error cargando inventario:", error);
    }
}

function renderPagination({ page, totalPages }) {
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    // Ajustar rango si estás al inicio o final
    if (page <= 3) {
        end = Math.min(totalPages, maxVisible);
    }

    if (page >= totalPages - 2) {
        start = Math.max(1, totalPages - maxVisible + 1);
    }

    // ⬅️ Anterior
    if (page > 1) {
        const prev = document.createElement("button");
        prev.textContent = "«";
        prev.className = "px-3 py-1 bg-gray-700 rounded hover:bg-gray-600";
        prev.onclick = () => loadInventory(page - 1);
        container.appendChild(prev);
    }

    // 🔢 Números
    for (let i = start; i <= end; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        btn.className = `
            px-3 py-1 rounded
            ${i === page ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}
        `;

        btn.onclick = () => loadInventory(i);

        container.appendChild(btn);
    }

    // ➡️ Siguiente
    if (page < totalPages) {
        const next = document.createElement("button");
        next.textContent = "»";
        next.className = "px-3 py-1 bg-gray-700 rounded hover:bg-gray-600";
        next.onclick = () => loadInventory(page + 1);
        container.appendChild(next);
    }
}

function mapType(type) {
    switch (type) {
        case "ALMACENABLE":
            return "material";
        case "CONSUMIBLE":
            return "consumible";
        case "SERVICIO":
            return "herramienta"; // puedes cambiar esto después
        default:
            return "material";
    }
}

function renderTable(products) {
    const table = document.getElementById("inventoryTable");
    table.innerHTML = "";

    products.forEach(p => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-800 hover:bg-gray-800";

        // 🧱 columnas normales
        tr.innerHTML = `
            <td class="p-3 font-medium">${p.name}</td>
            <td class="p-3 text-gray-400">${p.sku}</td>
            <td class="p-3">${renderType(p.type)}</td>
            <td class="p-3 text-gray-300">${p.unit}</td>
            <td class="p-3">${renderStock(p.stock)}</td>
            <td class="p-3 text-gray-400 truncate max-w-xs">
                ${p.description || "-"}
            </td>
        `;

        // 🔥 acciones (JS real)
        const actionsTd = document.createElement("td");
        actionsTd.className = "p-3 text-right space-x-2";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = `
            bg-blue-600 text-white
            px-3 py-1 rounded-md text-xs
            hover:bg-blue-500 transition
        `;
        editBtn.addEventListener("click", () => editProduct(p.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = `
            bg-red-600 text-white
            px-3 py-1 rounded-md text-xs
            hover:bg-red-500 transition
        `;
        deleteBtn.addEventListener("click", () => deleteProduct(p.id));

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);

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

let debounceTimer;

document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        currentSearch = e.target.value;
        loadInventory(1); // siempre vuelve a página 1
    }, 300); // debounce 🔥
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

document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
        id: editingId,
        sku: form.sku.value,
        name: form.name.value,
        description: form.description.value,
        stock: parseInt(form.stock.value),
        product_type_id: 1,
        unit_id: 1
    };

    try {

        if (editingId) {
            // ✏️ UPDATE
            await fetch("/public/products.php", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
        } else {
            // ➕ CREATE
            await fetch("/public/products.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
        }

        loadInventory(currentPage);

        form.reset();
        editingId = null;
        closeModal();

    } catch (err) {
        console.error("Error guardando:", err);
    }
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

async function deleteProduct(id) {
    if (!confirm("¿Eliminar producto?")) return;

    try {
        await fetch(`/public/products.php?id=${id}`, {
            method: "DELETE"
        });

        loadInventory(currentPage);

    } catch (err) {
        console.error("Error eliminando:", err);
    }
}

function editProduct(id) {
    const product = currentProducts.find(p => p.id == id);

    if (!product) return;

    editingId = id;

    const form = document.getElementById("productForm");

    form.sku.value = product.sku;
    form.name.value = product.name;
    form.description.value = product.description || "";
    form.stock.value = product.stock;

    openModal();
}