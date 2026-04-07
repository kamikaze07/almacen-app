console.log("inventory.js cargado 🔥");

let currentPage = 1;
const limit = 10;
let currentSearch = "";
let editingId = null;
let currentProducts = [];
const modal = document.getElementById("productModal");
const configModal = document.getElementById("configModal");

document.addEventListener("DOMContentLoaded", () => {
    loadInventory();
});

// ==========================
// 📦 LOAD INVENTORY
// ==========================
async function loadInventory(page = 1) {

    currentPage = page;

    try {
        const res = await fetch(
            `/public/products.php?page=${page}&limit=${limit}&search=${encodeURIComponent(currentSearch)}`
        );

        const result = await res.json();

        
        // 🔥 NORMALIZAR LOS DATOS AQUÍ
        currentProducts = result.data.map(p => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            description: p.description,
            stock: Number(p.stock),
            min_stock: p.min_stock !== null ? Number(p.min_stock) : null,
            max_stock: p.max_stock !== null ? Number(p.max_stock) : null,
            type: p.type,
            unit: p.unit
        }));

        // 🔥 USAR LOS DATOS YA LIMPIOS
        const products = currentProducts.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: Number(p.stock),
            min_stock: p.min_stock !== null ? Number(p.min_stock) : null,
            max_stock: p.max_stock !== null ? Number(p.max_stock) : null,
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

// ==========================
// 📄 PAGINACIÓN
// ==========================
function renderPagination({ page, totalPages }) {
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) end = Math.min(totalPages, maxVisible);
    if (page >= totalPages - 2) start = Math.max(1, totalPages - maxVisible + 1);

    if (page > 1) {
        const prev = document.createElement("button");
        prev.textContent = "«";
        prev.className = "px-3 py-1 bg-gray-700 rounded hover:bg-gray-600";
        prev.onclick = () => loadInventory(page - 1);
        container.appendChild(prev);
    }

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

    if (page < totalPages) {
        const next = document.createElement("button");
        next.textContent = "»";
        next.className = "px-3 py-1 bg-gray-700 rounded hover:bg-gray-600";
        next.onclick = () => loadInventory(page + 1);
        container.appendChild(next);
    }
}

// ==========================
// 🧠 MAP TYPE
// ==========================
function mapType(type) {
    switch (type) {
        case "ALMACENABLE": return "material";
        case "CONSUMIBLE": return "consumible";
        case "SERVICIO": return "herramienta";
        default: return "material";
    }
}

// ==========================
// 🧾 RENDER TABLE
// ==========================
function renderTable(products) {
    const table = document.getElementById("inventoryTable");
    table.innerHTML = "";

    products.forEach(p => {

        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-800 hover:bg-gray-800";

        tr.innerHTML = `
            <td class="p-3 font-medium">
                ${p.name}
                ${p.min_stock !== null ? '<span class="ml-1 text-xs text-gray-500">⚙️</span>' : ''}
            </td>
            <td class="p-3 text-gray-400">${p.sku}</td>
            <td class="p-3">${renderType(p.type)}</td>
            <td class="p-3 text-gray-300">${p.unit}</td>
            <td class="p-3">${renderStock(p.stock, p.min_stock, p.max_stock)}</td>
            <td class="p-3 text-gray-400 truncate max-w-xs">
                ${p.description || "-"}
            </td>
        `;

        const actionsTd = document.createElement("td");
        actionsTd.className = "p-3 text-right space-x-2";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "bg-blue-600 px-3 py-1 text-xs rounded hover:bg-blue-500";
        editBtn.onclick = () => editProduct(p.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "bg-red-600 px-3 py-1 text-xs rounded hover:bg-red-500";
        deleteBtn.onclick = () => deleteProduct(p.id);

        const configBtn = document.createElement("button");
        configBtn.innerHTML = "⚙️";
        configBtn.className = "text-gray-400 hover:text-white";
        configBtn.onclick = () => openConfigModal(p.id);

        actionsTd.append(editBtn, deleteBtn, configBtn);
        tr.appendChild(actionsTd);

        table.appendChild(tr);
    });
}

// ==========================
// 🎨 STOCK INTELIGENTE
// ==========================
function renderStock(stock, min, max) {

    stock = Number(stock);
    min = (min !== null && !isNaN(min)) ? Number(min) : 0;
    max = (max !== null && !isNaN(max)) ? Number(max) : min + 10;

    // 🔥 evitar bugs si max < min
    if (max <= min) {
        max = min + 1;
    }

    const mid = min + Math.floor((max - min) / 2);

    let color;

    if (stock <= min) {
        color = "bg-red-600";
    } else if (stock <= mid) {
        color = "bg-yellow-500";
    } else {
        color = "bg-green-600";
    }

    return `
        <span class="${color} px-2 py-1 rounded text-xs">
            ${stock}
        </span>
    `;
}

// ==========================
// ⚙️ CONFIG MODAL
// ==========================


function openConfigModal(id) {
    const product = currentProducts.find(p => p.id == id);

    const form = document.getElementById("configForm");

    form.id.value = id;
    form.min_stock.value = product.min_stock ?? "";
    form.max_stock.value = product.max_stock ?? "";

    configModal.classList.remove("hidden");
    configModal.classList.add("flex");
}

function closeConfigModal() {
    configModal.classList.add("hidden");
    configModal.classList.remove("flex");
}

document.getElementById("configForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const form = e.target;

    const min = form.min_stock.value;
    const max = form.max_stock.value;

    if (min === "" && max === "") {
        alert("Debes ingresar al menos un valor");
        return;
    }

    if (min !== "" && max !== "" && parseInt(min) > parseInt(max)) {
        alert("El mínimo no puede ser mayor que el máximo");
        return;
    }

    const product = currentProducts.find(p => p.id == form.id.value);

    const data = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        stock: product.stock,
        product_type_id: 1,
        unit_id: 1,
        min_stock: min === "" ? null : parseInt(min),
        max_stock: max === "" ? null : parseInt(max)
    };

    await fetch("/public/products.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    closeConfigModal();
    loadInventory(currentPage);
});

configModal.addEventListener("click", (e) => {
    if (e.target === configModal) {
        closeConfigModal();
    }
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// ==========================
// 🔍 SEARCH
// ==========================
let debounceTimer;

document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        currentSearch = e.target.value;
        loadInventory(1);
    }, 300);
});

// ==========================
// ➕ MODAL PRODUCTO
// ==========================


function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// ==========================
// 💾 SAVE PRODUCT
// ==========================
document.getElementById("productForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const form = e.target;

    const product = currentProducts.find(p => p.id == editingId);

    const data = {
        id: editingId,
        sku: form.sku.value,
        name: form.name.value,
        description: form.description.value,
        stock: parseInt(form.stock.value),
        product_type_id: 1,
        unit_id: 1,

        min_stock: editingId ? product?.min_stock ?? null : null,
        max_stock: editingId ? product?.max_stock ?? null : null
    };

    await fetch("/public/products.php", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    loadInventory(currentPage);

    form.reset();
    editingId = null;
    closeModal();
});

// ==========================
// 🧠 TYPE BADGE
// ==========================
function renderType(type) {
    let color = "bg-gray-600";

    if (type === "material") color = "bg-blue-600";
    if (type === "herramienta") color = "bg-purple-600";
    if (type === "consumible") color = "bg-orange-500";

    return `<span class="${color} px-2 py-1 rounded text-xs">${type}</span>`;
}

// ==========================
// ❌ DELETE
// ==========================
async function deleteProduct(id) {
    if (!confirm("¿Eliminar producto?")) return;

    await fetch(`/public/products.php?id=${id}`, { method: "DELETE" });
    loadInventory(currentPage);
}

// ==========================
// ✏️ EDIT
// ==========================
function editProduct(id) {
    const product = currentProducts.find(p => p.id == id);

    editingId = id;

    const form = document.getElementById("productForm");

    form.sku.value = product.sku;
    form.name.value = product.name;
    form.description.value = product.description || "";
    form.stock.value = product.stock;

    openModal();
}