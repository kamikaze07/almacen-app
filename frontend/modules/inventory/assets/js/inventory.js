console.log("inventory.js cargado 🔥");

let currentPage = 1;
const limit = 10;
let currentSearch = "";
let editingId = null;
let currentProducts = [];
const modal = document.getElementById("productModal");
const configModal = document.getElementById("configModal");

let currentSort = {
    field: "sku",
    direction: "asc"
};

document.addEventListener("DOMContentLoaded", () => {

    loadInventory();

    // 🔥 BOTÓN NUEVO PRODUCTO
    document.getElementById("btnCreate").addEventListener("click", () => {
        editingId = null;

        const form = document.getElementById("productForm");
        form.reset();

        openModal();
    });

    // 🔥 BOTONES MODAL
    document.getElementById("closeModal").addEventListener("click", closeModal);
    document.getElementById("cancelBtn").addEventListener("click", closeModal);

});

// ==========================
// 📦 LOAD INVENTORY
// ==========================
async function loadInventory(page = 1) {

    currentPage = page;

    try {

        const res = await fetch(
            `/public/products.php?page=${page}&limit=${limit}&search=${encodeURIComponent(currentSearch)}&sort=${currentSort.field}&direction=${currentSort.direction}`
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
            type_id: p.type_id, // 🔥 ESTE ES CLAVE
            unit: p.unit,
            unit_id: p.unit_id // 🔥 necesario
        }));

        // 🔥 USAR LOS DATOS YA LIMPIOS
        const products = currentProducts.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: Number(p.stock),
            min_stock: p.min_stock !== null ? Number(p.min_stock) : null,
            max_stock: p.max_stock !== null ? Number(p.max_stock) : null,
            type: p.type,
            unit: p.unit,
            description: p.description || ""
        }));

        renderTable(products);
        renderPagination(result.pagination);

        updateSortIcons();

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
// ==========================
// 🧾 RENDER TABLE (ACTUALIZADO)
// ==========================
function renderTable(products) {
    const table = document.getElementById("inventoryTable");
    table.innerHTML = "";

    products.forEach(p => {

        const tr = document.createElement("tr");

        tr.className = `
            border-b border-gray-800 
            even:bg-gray-900 
            odd:bg-gray-950 
            hover:bg-gray-800 
            transition-all duration-200 
            hover:-translate-y-1 
            hover:shadow-lg
        `;

        tr.innerHTML = `
            <td class="p-3 font-medium"
                ondblclick="enableEdit(this, ${p.id}, 'name')">
                ${p.name}
            </td>

            <td class="p-3 text-gray-400"
                ondblclick="enableEdit(this, ${p.id}, 'sku')">
                ${p.sku}
            </td>

            <td class="p-3"
                ondblclick="enableEdit(this, ${p.id}, 'type')">
                ${renderType(p.type)}
            </td>

            <td class="p-3 text-gray-300"
                ondblclick="enableEdit(this, ${p.id}, 'unit')">
                ${p.unit}
            </td>

            <td class="p-3"
                ondblclick="enableEdit(this, ${p.id}, 'stock')">
                ${renderStock(p.stock, p.min_stock, p.max_stock)}
            </td>

            <td class="p-3 text-gray-400 truncate max-w-xs"
                ondblclick="enableEdit(this, ${p.id}, 'description')">
                ${p.description || "-"}
            </td>
        `;

        const actionsTd = document.createElement("td");
        actionsTd.className = "p-3 text-right space-x-2";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "bg-blue-600 px-3 py-1 text-xs rounded";
        editBtn.onclick = () => editProduct(p.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "bg-red-600 px-3 py-1 text-xs rounded";
        deleteBtn.onclick = () => deleteProduct(p.id);

        actionsTd.append(editBtn, deleteBtn);
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
        product_type_id: parseInt(form.type.value),
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
        product_type_id: parseInt(form.type.value),
        unit_id: parseInt(form.unit.value),

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

    const t = type?.toUpperCase().trim();

    if (t === "ALMACENABLE") color = "bg-blue-600";
    if (t === "SERVICIO") color = "bg-purple-600";
    if (t === "CONSUMIBLE") color = "bg-orange-500";

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
    form.type.value = product.type_id;
    form.unit.value = product.unit_id

    openModal();
}

window.sortBy = function(field) {

    if (currentSort.field === field) {
        // 🔁 invertir dirección
        currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
        currentSort.field = field;
        currentSort.direction = "asc";
    }

    loadInventory(1);
}

function getSortIcon(field) {
    if (currentSort.field !== field) return "";

    return currentSort.direction === "asc" ? " ▲" : " ▼";
}

function updateSortIcons() {

    const fields = ["name", "sku", "type", "unit", "stock"];

    fields.forEach(f => {
        const el = document.getElementById(`sort-${f}`);
        if (!el) return;

        el.textContent = getSortIcon(f);
    });
}

let editingCell = null;

window.enableEdit = function(td, id, field) {

    if (editingCell) return;

    editingCell = td;

    const product = currentProducts.find(p => p.id == id);
    let input;

    // ==========================
    // INPUTS
    // ==========================
    if (["name", "sku"].includes(field)) {
        input = document.createElement("input");
        input.type = "text";
        input.value = product[field] || "";
    }

    if (field === "stock") {
        input = document.createElement("input");
        input.type = "number";
        input.value = product.stock;
    }

    if (field === "description") {
        input = document.createElement("textarea");
        input.value = product.description || "";
    }

    // ==========================
    // SELECT TYPE
    // ==========================
    if (field === "type") {
        input = document.createElement("select");

        input.innerHTML = `
            <option value="1">ALMACENABLE</option>
            <option value="2">CONSUMIBLE</option>
            <option value="3">SERVICIO</option>
        `;

        input.value = product.type_id;
    }

    // ==========================
    // SELECT UNIT
    // ==========================
    if (field === "unit") {
        input = document.createElement("select");

        input.innerHTML = `
            <option value="1">PZA</option>
            <option value="2">L</option>
            <option value="3">M</option>
            <option value="4">KG</option>
            <option value="5">PAR</option>
            <option value="6">KIT</option>
            <option value="7">CUB</option>
            <option value="8">CJ</option>
        `;

        input.value = product.unit_id;
    }

    input.className = "w-full bg-gray-800 text-white p-1 rounded";

    td.innerHTML = "";
    td.appendChild(input);
    input.focus();

    // ==========================
    // 💾 SAVE
    // ==========================
    const save = async () => {

        let value = input.value;

        const data = {
            id: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description,
            stock: product.stock,
            product_type_id: product.type_id,
            unit_id: product.unit_id,
            min_stock: product.min_stock,
            max_stock: product.max_stock
        };

        if (field === "name") data.name = value;
        if (field === "sku") data.sku = value;
        if (field === "stock") data.stock = parseInt(value);
        if (field === "description") data.description = value;
        if (field === "type") data.product_type_id = parseInt(value);
        if (field === "unit") data.unit_id = parseInt(value);

        await fetch("/public/products.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        editingCell = null;
        loadInventory(currentPage);
    };

    // ==========================
    // ❌ CANCEL
    // ==========================
    const cancel = () => {
        editingCell = null;
        loadInventory(currentPage);
    };

    input.addEventListener("blur", save);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
    });
};