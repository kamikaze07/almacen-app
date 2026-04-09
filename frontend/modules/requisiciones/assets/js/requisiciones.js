let productList = [];
let signaturePadEntrega;
let requisicionActual = null;

document.addEventListener('DOMContentLoaded', () => {

    const today = new Date();
    const localDate = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

document.getElementById('fecha').value = localDate;

  cargarRequisiciones();

  const modal = document.getElementById("modal-requisicion");

  document.getElementById("nueva-requisicion-btn").onclick = () => {
    modal.classList.add("open");

    setTimeout(() => {
      resizeCanvas(document.getElementById('firma-entrega'));
    }, 100);
  };

  document.getElementById("close-modal").onclick =
  document.getElementById("close-modal-btn").onclick = () => {
    modal.classList.remove("open");
  };

  // FIRMA
  const canvas = document.getElementById('firma-entrega');
  resizeCanvas(canvas);
  signaturePadEntrega = new SignaturePad(canvas);

  document.getElementById('clear-signature-entrega').onclick = () => {
    signaturePadEntrega.clear();
  };

  document.getElementById('producto').addEventListener('input', autoCompleteProduct);
  document.getElementById('fecha').addEventListener('change', cargarRequisiciones);

  // Cerrar modal detalle al fondo
  document.getElementById('modal-detalle').addEventListener('click', (e) => {
    if (e.target.id === 'modal-detalle') cerrarDetalle();
  });

  document.getElementById('modal-formato').addEventListener('click', (e) => {
    if (e.target.id === 'modal-formato') cerrarFormato();
  });

  // GUARDAR
  document.getElementById('guardar-requisicion-btn').onclick = async (e) => {
    e.preventDefault();

    const solicita = document.getElementById('solicita').value.trim();

    if (!solicita) return alert("Solicita requerido");
    if (!productList.length) return alert("Agrega productos");

    const res = await fetch('/public/requisiciones.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicita,
        productos: productList,
        firma: signaturePadEntrega.toDataURL()
      })
    });

    const result = await res.json();

    if (result.success) {
      alert("Guardado");

      productList = [];
      renderProducts();
      signaturePadEntrega.clear();

      modal.classList.remove("open");
      cargarRequisiciones();
    }
  };

});


// ============================
// 🔎 AUTOCOMPLETE
// ============================
async function autoCompleteProduct() {
  const input = document.getElementById('producto').value;
  const box = document.getElementById('product-suggestions');

  if (input.length < 2) return box.classList.add('hidden');

  const res = await fetch(`/public/search-products.php?search=${input}`);
  const data = await res.json();

  box.innerHTML = '';
  box.classList.remove('hidden');

  data.data.forEach(p => {
    const div = document.createElement('div');
    div.textContent = p.name;
    div.className = "p-2 hover:bg-gray-700 cursor-pointer";
    div.onclick = () => selectProduct(p.id, p.name);
    box.appendChild(div);
  });
}


// ============================
// ➕ PRODUCTOS
// ============================
window.selectProduct = function(id, name) {
  const existing = productList.find(p => p.id === id);
  if (existing) existing.quantity++;
  else productList.push({ id, name, quantity: 1 });

  renderProducts();

  document.getElementById('producto').value = '';
  document.getElementById('product-suggestions').classList.add('hidden');
};


// ============================
// 📦 RENDER PRODUCTOS
// ============================
function renderProducts() {
  const body = document.getElementById("product-table-body");

  body.innerHTML = productList.map((p, i) => `
    <tr>
      <td>${p.name}</td>
      <td>
        <button type="button" onclick="decreaseQty(${i})">➖</button>
        ${p.quantity}
        <button type="button" onclick="increaseQty(${i})">➕</button>
      </td>
      <td>
        <button type="button" onclick="removeProduct(${i})">❌</button>
      </td>
    </tr>
  `).join("");
}

window.increaseQty = i => {
  productList[i].quantity++;
  renderProducts();
};

window.decreaseQty = i => {
  if (productList[i].quantity > 1) productList[i].quantity--;
  else productList.splice(i, 1);
  renderProducts();
};

window.removeProduct = i => {
  productList.splice(i, 1);
  renderProducts();
};


// ============================
// 📥 LISTADO
// ============================
async function cargarRequisiciones() {
  const fecha = document.getElementById('fecha').value;

  const res = await fetch(`/public/requisiciones.php?fecha=${fecha}`);
  const result = await res.json();

  renderTabla(result.data);
}


// ============================
// 📊 TABLA
// ============================
function renderTabla(data) {
  const tbody = document.getElementById("tabla-requisiciones");

  tbody.innerHTML = data.map(r => `
    <tr class="border-b border-gray-800 hover:bg-gray-800">
      <td class="p-3">${r.folio}</td>
      <td class="p-3">${new Date(r.created_at).toLocaleDateString()}</td>
      <td class="p-3">${r.solicita_nombre || '-'}</td>

      <td class="p-3">
        ${getStatusBadge(r.estatus)}
      </td>

      <td class="p-3 text-right flex justify-end gap-3">
        <button onclick="verDetalle(${r.id})">👁️</button>
        <button onclick="verFormato(${r.id})">🖨️</button>
      </td>
    </tr>
  `).join("");
}
function getStatusBadge(status) {

  switch (status) {
    case 'pendiente':
      return '<span class="bg-yellow-500 text-black px-2 py-1 rounded text-xs">Pendiente</span>';

    case 'atendida':
      return '<span class="bg-green-600 text-white px-2 py-1 rounded text-xs">Atendida</span>';

    case 'cancelada':
      return '<span class="bg-red-600 text-white px-2 py-1 rounded text-xs">Cancelada</span>';

    case 'atendida parcialmente':
      return '<span class="bg-blue-600 text-white px-2 py-1 rounded text-xs">Parcial</span>';

    default:
      return '<span class="bg-gray-500 text-white px-2 py-1 rounded text-xs">N/A</span>';
  }
}


// ============================
// 👁️ DETALLE SIMPLE
// ============================
window.verDetalle = async function(id) {

  const res = await fetch(`/public/requisicion-detalle.php?id=${id}`);
  const result = await res.json();

  const html = result.data.map(p => `
    <div class="flex justify-between border-b border-gray-700 py-2">
      <span>${p.name}</span>
      <span>${p.cantidad}</span>
    </div>
  `).join("");

  document.getElementById('detalle-simple').innerHTML = html;
  document.getElementById('modal-detalle').classList.remove('hidden');
};

window.cerrarDetalle = function() {
  document.getElementById('modal-detalle').classList.add('hidden');
};


// ============================
// 🖨️ FORMATO
// ============================
window.verFormato = async function(id) {

  const res = await fetch(`/public/requisicion-detalle.php?id=${id}`);
  const result = await res.json();

  const data = result.data;
  if (!data.length) return;

  requisicionActual = data;

  document.getElementById('detalle-header').innerHTML = `
    <p><b>Folio:</b> ${data[0].folio}</p>
    <p><b>Solicita:</b> ${data[0].solicita_nombre}</p>
  `;

  document.getElementById('detalle-productos').innerHTML =
    data.map(p => `
      <tr>
        <td class="border p-2">${p.name}</td>
        <td class="border p-2 text-center">${p.cantidad}</td>
      </tr>
    `).join("");

  const file = data[0].firma_solicita.split('/').pop();
document.getElementById('firma-img').src = `/public/get-firma.php?file=${file}`;

  document.getElementById('modal-formato').classList.remove('hidden');
};

window.cerrarFormato = function() {
  document.getElementById('modal-formato').classList.add('hidden');
};


// ============================
// 📄 PDF
// ============================
window.imprimirRequisicion = async function () {

  if (!requisicionActual || !requisicionActual.length) {
    return alert("No hay datos para imprimir");
  }

  const data = requisicionActual;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logo = await loadImage('/assets/logo.png');

  // HEADER
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
        { content: 'FLETES Y MATERIALES FORSIS, S.A. DE C.V.', colSpan: 4, styles: { halign: 'center', textColor: [200,0,0], fontStyle: 'bold' } }
      ],
      [
        { content: 'Requisición de Material', colSpan: 4, styles: { halign: 'center' } }
      ],
      ['FECHA', new Date(data[0].created_at).toLocaleDateString(), 'PAG.', '1 de 1'],
      ['REVISIÓN', '0', 'CÓDIGO', 'FMF-FOR-ALM-003'],
      ['Solicita:', data[0].solicita_nombre, '', '']
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

  // FOLIO
  doc.setFontSize(10);
  doc.text(`Folio: ${data[0].folio}`, 10, doc.lastAutoTable.finalY + 10);

  // PRODUCTOS
  const rows = data.map(p => [p.name, p.cantidad]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Producto', 'Cantidad']],
    body: rows
  });

  let y = doc.lastAutoTable.finalY + 30;

  // FIRMA
  if (data[0].firma_solicita) {
    const file = data[0].firma_solicita.split('/').pop();
    const firma = await loadImage(`/public/get-firma.php?file=${file}`);

    doc.addImage(firma, 'PNG', 20, y, 60, 20);
    doc.text('Solicita', 35, y + 25);
  }

  doc.save(`requisicion_${data[0].folio}.pdf`);
};

// ============================
// 🧠 HELPERS
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

function resizeCanvas(canvas) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;

  canvas.getContext("2d").scale(ratio, ratio);
}

window.cerrarFormato = function() {
  document.getElementById('modal-formato').classList.add('hidden');
};