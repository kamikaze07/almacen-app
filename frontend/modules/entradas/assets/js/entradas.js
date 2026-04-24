let tipoEntrada = "independiente";
let productosSeleccionados = [];
let selectedRequisicionId = null;
let signaturePadEntrega;
let signaturePadRecibe;

document.addEventListener('DOMContentLoaded', () => {

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("filtro-fecha").value = hoy;

    const canvasEntrega = document.getElementById('firma-entrega');
    const canvasRecibe = document.getElementById('firma-recibe');

    signaturePadEntrega = new SignaturePad(canvasEntrega);
    signaturePadRecibe = new SignaturePad(canvasRecibe);

  const modal = document.getElementById("modal-entrada");

  // abrir modal
  document.getElementById("nueva-entrada-btn").onclick = () => {
    modal.classList.remove("hidden");
  };

  // cerrar modal
  document.getElementById("close-modal").onclick = () => {
    modal.classList.add("hidden");
  };

  // tipo entrada
  document.querySelectorAll('input[name="tipoEntrada"]').forEach(r => {
    r.addEventListener('change', (e) => {
      tipoEntrada = e.target.value;
      productosSeleccionados = [];
      selectedRequisicionId = null;
      renderBloque();
    });
  });

  cargarEntradas();
  renderBloque();
});


// ===============================
// 📄 LISTAR ENTRADAS
// ===============================
window.cargarEntradas = async function() {

  const fecha = document.getElementById("filtro-fecha")?.value;

  let url = '/public/entradas.php';

  if (fecha) {
    url += `?fecha=${fecha}`;
  }

  const res = await fetch(url);
  const json = await res.json();

  const tbody = document.getElementById("tabla-entradas");
  tbody.innerHTML = "";

  json.data.forEach(e => {

    tbody.innerHTML += `
      <tr class="border-b border-gray-800">
        <td class="p-3">${e.folio}</td>
        <td class="p-3">${formatearFecha(e.fecha)}</td>
        <td class="p-3">${e.tipo_entrada}</td>
        <td class="p-3">${e.estado}</td>
        <td class="p-3 text-right space-x-2">
          <button onclick="verEntrada(${e.id})" class="text-green-400">👁</button>
          <button onclick="imprimirEntrada(${e.id})" class="text-blue-400">🖨</button>
        </td>
      </tr>
    `;
  });
}


// ===============================
// 🧱 BLOQUE DINÁMICO
// ===============================
function renderBloque() {

  const container = document.getElementById("bloque-dinamico");

  // ===============================
  // 📦 ENTRADA DIRECTA
  // ===============================
  if (tipoEntrada === "independiente") {

    container.innerHTML = `
        <div class="relative">
        <input id="buscar-producto"
            placeholder="Buscar producto..."
            class="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg" />

        <div id="sugerencias"
            class="absolute w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 hidden z-50 max-h-48 overflow-y-auto">
        </div>
        </div>

      <table class="w-full mt-4 text-sm">
        <thead>
          <tr class="text-gray-400">
            <th class="text-left">Producto</th>
            <th>Cantidad</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tabla-productos"></tbody>
      </table>
    `;
    const input = document.getElementById("buscar-producto");
    const sugerencias = document.getElementById("sugerencias");

    let timeout = null;

    input.addEventListener("input", () => {

    clearTimeout(timeout);

    const texto = input.value.trim();

    if (texto.length < 2) {
        sugerencias.classList.add("hidden");
        return;
    }

    timeout = setTimeout(async () => {

        const res = await fetch(`/public/products.php?search=${texto}`);
        const json = await res.json();

        sugerencias.innerHTML = "";

        if (!json.data.length) {
        sugerencias.classList.add("hidden");
        return;
        }

        json.data.forEach(p => {
        sugerencias.innerHTML += `
            <div class="p-2 hover:bg-gray-700 cursor-pointer"
                onclick='agregarProducto(${p.id}, ${JSON.stringify(p.name)})'>
            ${p.name} (${p.sku})
            </div>
        `;
        });

        sugerencias.classList.remove("hidden");

    }, 300);
    });

    document.getElementById("buscar-producto").addEventListener("keypress", async (e) => {

      if (e.key === "Enter") {

        const nombre = e.target.value;

        // 🔥 aquí deberías tener endpoint de productos
        const res = await fetch(`/public/products.php?search=${nombre}`);
        const json = await res.json();

        if (json.data.length > 0) {

          const p = json.data[0];

          productosSeleccionados.push({
            producto_id: p.id,
            name: p.name,
            cantidad: 1
          });

          renderTablaProductos();
          e.target.value = "";
        }
      }
    });
  }

  // ===============================
  // 📄 ENTRADA CON REQUISICIÓN
  // ===============================
  if (tipoEntrada === "requisicion") {

    container.innerHTML = `
      <select id="select-requisicion"
        class="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg">
        <option value="">Selecciona requisición</option>
      </select>

      <table class="w-full mt-4 text-sm">
        <thead>
          <tr class="text-gray-400">
            <th class="text-left">Producto</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody id="tabla-productos"></tbody>
      </table>
    `;

    cargarRequisiciones();
  }
}


// ===============================
// 📦 TABLA PRODUCTOS
// ===============================
function renderTablaProductos() {

  const tbody = document.getElementById("tabla-productos");
  tbody.innerHTML = "";

  productosSeleccionados.forEach((p, index) => {

    tbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>
          <input type="number" value="${p.cantidad}" min="1"
            onchange="cambiarCantidad(${index}, this.value)"
            class="w-20 bg-gray-800 border border-gray-700 rounded p-1"/>
        </td>
        <td>
        <button onclick="eliminarProducto(${index})">❌</button>
        </td>
      </tr>
    `;
  });
}

window.cambiarCantidad = (index, val) => {
  productosSeleccionados[index].cantidad = parseInt(val);
};

window.eliminarProducto = (index) => {
  productosSeleccionados.splice(index, 1);
  renderTablaProductos();
};


// ===============================
// 📄 REQUISICIONES
// ===============================
async function cargarRequisiciones() {

  const res = await fetch('/public/requisiciones.php');
  const json = await res.json();

  const select = document.getElementById("select-requisicion");

  json.data.forEach(r => {
    select.innerHTML += `<option value="${r.id}">
        ${r.folio} - ${r.estatus}
        </option>`;
  });

  select.onchange = async (e) => {

    selectedRequisicionId = e.target.value;

    const res = await fetch(`/public/requisicion-detalle.php?id=${selectedRequisicionId}`);
    const json = await res.json();

    productosSeleccionados = json.data.map(p => ({
      producto_id: p.producto_id,
      name: p.name,
      cantidad: p.cantidad
    }));

    renderTablaProductos();
  };
}


// ===============================
// 💾 GUARDAR
// ===============================
document.getElementById("guardar-entrada").onclick = async () => {

  const entrega = document.getElementById("entrega").value;

  if (productosSeleccionados.length === 0) {
    return alert("Agrega productos");
  }

    const firmaEntrega = signaturePadEntrega.toDataURL();
    const firmaRecibe = signaturePadRecibe.toDataURL();

    const data = {
    tipo_entrada: tipoEntrada === "requisicion" ? "REQUISICION" : "DIRECTA",
    requisicion_id: selectedRequisicionId,
    entrega_nombre: entrega,
    recibe_nombre: "Almacén",
    productos: productosSeleccionados,
    firma_entrega: firmaEntrega,
    firma_recibe: firmaRecibe
    };

  const res = await fetch('/public/entradas.php', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();

  if (json.success) {
    alert("Entrada creada");
    location.reload();
  } else {
    alert(json.error);
  }
};


// ===============================
// 🖨️ IMPRIMIR
// ===============================
window.imprimirEntrada = async function(id) {

  const res = await fetch(`/public/entradas.php?id=${id}`);
  const { data } = await res.json();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logo = await loadImage('/assets/logo.png');

  // ================= HEADER (IDÉNTICO A REQUISICIONES 🔥)

  doc.autoTable({
    startY: 10,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 30 }
    },

    body: [

      [
        { content: '', rowSpan: 5 },
        { content: 'FLETES Y MATERIALES FORSIS, S.A. DE C.V.', colSpan: 4,
          styles: { halign: 'center', textColor: [200,0,0], fontStyle: 'bold' }
        }
      ],

      [
        { content: 'Entrada de Material', colSpan: 4, styles: { halign: 'center' } }
      ],

      [
        'FECHA',
        new Date(data.fecha).toLocaleDateString(),
        'PAG.',
        '1 de 1'
      ],

      [
        'REVISIÓN',
        '0',
        'CÓDIGO',
        'FMF-FOR-ALM-001'
      ],

      [
        'Entrega:',
        data.entrega_nombre,
        'Recibe:',
        data.recibe_nombre
      ]
    ],

    didDrawCell: function (dataCell) {

      if (dataCell.row.index === 0 && dataCell.column.index === 0) {

        const cell = dataCell.cell;
        const size = Math.min(cell.width, cell.height) - 4;

        doc.addImage(
          logo,
          'PNG',
          cell.x + (cell.width - size) / 2,
          cell.y + (cell.height - size) / 2,
          size,
          size
        );
      }
    }
  });

  // ================= FOLIO

  doc.setFontSize(10);
  doc.text(`Folio: ${data.folio}`, 10, doc.lastAutoTable.finalY + 10);

  // ================= TABLA PRODUCTOS

  const rows = data.productos.map(p => [
    p.name,
    p.cantidad
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Producto', 'Cantidad']],
    body: rows
  });

  // ================= CONTROL DE SALTO (CLAVE 🔥)

  let y = doc.lastAutoTable.finalY + 30;

  if (y > 250) {
    doc.addPage();
    y = 30;
  }

  // ================= FIRMAS

  let firmaEntrega = null;
  let firmaRecibe = null;

  try {
    const fileEntrega = data.firma_entrega?.split('/').pop();
    if (fileEntrega) {
      firmaEntrega = await loadImage(`/public/get-firma.php?file=${fileEntrega}`);
    }
  } catch (e) {
    console.warn("Error firma entrega");
  }

  try {
    const fileRecibe = data.firma_recibe?.split('/').pop();
    if (fileRecibe) {
      firmaRecibe = await loadImage(`/public/get-firma.php?file=${fileRecibe}`);
    }
  } catch (e) {
    console.warn("Error firma recibe");
  }

  // ================= RENDER FIRMAS

  if (firmaEntrega) {
    doc.addImage(firmaEntrega, 'PNG', 20, y, 60, 20);
  }
  doc.text('Entrega', 35, y + 25);

  if (firmaRecibe) {
    doc.addImage(firmaRecibe, 'PNG', 120, y, 60, 20);
  }
  doc.text('Recibe', 135, y + 25);

  // ================= EXPORTAR
  const blobUrl = doc.output('bloburl');

  const win = window.open(blobUrl);

  win.onload = () => {
    win.print();
  };
};


// ===============================
// 🧠 UTILS
// ===============================
function formatearFecha(f) {
  return new Date(f).toLocaleString();
}

window.agregarProducto = (id, name) => {

  productosSeleccionados.push({
    producto_id: id,
    name: name,
    cantidad: 1
  });

  renderTablaProductos();

  document.getElementById("buscar-producto").value = "";
  document.getElementById("sugerencias").classList.add("hidden");
};

document.addEventListener("click", (e) => {
  if (!e.target.closest("#buscar-producto")) {
    const sug = document.getElementById("sugerencias");
    if (sug) sug.classList.add("hidden");
  }
});

window.verEntrada = async (id) => {

  const res = await fetch(`/public/entradas.php?id=${id}`);
  const { data } = await res.json();

  let html = `
    <p><strong>Folio:</strong> ${data.folio}</p>
    <p><strong>Fecha:</strong> ${data.fecha}</p>
    <p><strong>Entrega:</strong> ${data.entrega_nombre}</p>
    <p><strong>Recibe:</strong> ${data.recibe_nombre}</p>

    <table class="w-full mt-4 border border-gray-700">
      <tr class="bg-gray-800">
        <th class="p-2">Producto</th>
        <th class="p-2">Cantidad</th>
      </tr>
  `;

  data.productos.forEach(p => {
    html += `
      <tr>
        <td class="p-2">${p.name}</td>
        <td class="p-2">${p.cantidad}</td>
      </tr>
    `;
  });

  html += "</table>";

  const fileEntrega = data.firma_entrega?.split('/').pop();
  const fileRecibe = data.firma_recibe?.split('/').pop();

  html += `
    <div class="flex justify-between mt-6">
      <div class="text-center">
        ${fileEntrega ? `<img src="/public/get-firma.php?file=${fileEntrega}" class="h-20 mx-auto"/>` : ''}
        <p class="text-sm mt-2">Entrega</p>
      </div>
      <div class="text-center">
        ${fileRecibe ? `<img src="/public/get-firma.php?file=${fileRecibe}" class="h-20 mx-auto"/>` : ''}
        <p class="text-sm mt-2">Recibe</p>
      </div>
    </div>
  `;

  document.getElementById("contenido-preview").innerHTML = html;
  document.getElementById("modal-preview").classList.remove("hidden");
};

window.cerrarPreview = () => {
  document.getElementById("modal-preview").classList.add("hidden");
};

// ============================
// 🧠 HELPER IMÁGENES (OBLIGATORIO 🔥)
// ============================
async function loadImage(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}