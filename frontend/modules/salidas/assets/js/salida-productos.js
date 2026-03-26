//modules/salidas/assets/js/salida-productos.js

  // Agregar productos a la tabla cuando se selecciona un producto
  let productList = []; // Array para mantener los productos seleccionados


// Inicializar los lienzos de firma
let signaturePadEntrega;
let signaturePadRecibe;

document.addEventListener('DOMContentLoaded', () => {

  console.log("JS cargado y funcionando.");


  // Inicializar las áreas de firma usando SignaturePad
  const canvasEntrega = document.getElementById('firma-entrega');
  const canvasRecibe = document.getElementById('firma-recibe');

  signaturePadEntrega = new SignaturePad(canvasEntrega, {
    backgroundColor: 'rgba(255, 255, 255, 0)', // Fondo transparente
    penColor: 'rgb(0, 0, 0)', // Color del trazo
  });

  signaturePadRecibe = new SignaturePad(canvasRecibe, {
    backgroundColor: 'rgba(255, 255, 255, 0)', // Fondo transparente
    penColor: 'rgb(0, 0, 0)', // Color del trazo
  });

  // Limpiar las firmas
  document.getElementById('clear-signature-entrega').addEventListener('click', () => {
    signaturePadEntrega.clear();
  });

  document.getElementById('clear-signature-recibe').addEventListener('click', () => {
    signaturePadRecibe.clear();
  });

  // Abrir Modal al hacer clic en "Nueva Salida"
  document.getElementById("nueva-salida-btn").addEventListener("click", () => {
    console.log("Botón 'Nueva Salida' clickeado");
    openModal();
  });

  // Cerrar Modal al hacer clic en la "X"
  document.getElementById("close-modal").addEventListener("click", () => {
    console.log("Cerrando el modal con la X");
    closeModal();
  });

  // Cerrar Modal desde el botón de cancelar dentro del formulario
  document.getElementById("close-modal-btn").addEventListener("click", () => {
    console.log("Cerrando el modal desde 'Cancelar'");
    closeModal();
  });

  // Cerrar el modal si haces clic fuera del modal
  const modal = document.getElementById("modal-salida");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      console.log("Cerrando el modal desde el fondo");
      closeModal();
    }
  });

  // Asociar la función al evento input en el campo de producto
  document.getElementById('producto').addEventListener('input', autoCompleteProduct);
});

// Función de autocompletado de producto
window.autoCompleteProduct = function() {
  const input = document.getElementById('producto').value;
  const suggestions = document.getElementById('product-suggestions');
  
  if (input.length > 2) {
    // Aquí iría una llamada a la API o lista de productos para autocompletar
    // Simulamos algunas sugerencias
    const sampleProducts = ['Tornillos', 'Martillos', 'Piezas de plástico'];
    const filtered = sampleProducts.filter(product => product.toLowerCase().includes(input.toLowerCase()));

    // Limpiar sugerencias
    suggestions.innerHTML = '';
    suggestions.classList.remove('hidden');

    filtered.forEach(product => {
      const div = document.createElement('div');
      div.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-2');
      div.textContent = product;
      div.addEventListener('click', () => selectProduct(product));
      suggestions.appendChild(div);
    });
  } else {
    suggestions.classList.add('hidden');
  }
};

  // Función para seleccionar un producto
  window.selectProduct = function(product) {
    const quantity = 1; // Valor por defecto para cantidad
    const destination = 'Departamento de Ventas'; // Valor por defecto para destino

    // Agregar a la tabla
    productList.push({ product, quantity, destination });

    updateProductTable(); // Actualiza la tabla con los nuevos productos
    document.getElementById('producto').value = ''; // Limpiar el campo
    document.getElementById('product-suggestions').classList.add('hidden'); // Ocultar sugerencias
  };

// Función para actualizar la tabla de productos
window.updateProductTable = function() {
  const tableBody = document.getElementById('product-table-body');
  tableBody.innerHTML = ''; // Limpiar la tabla

  productList.forEach((item, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="p-3">${item.product}</td>
      <td class="p-3">
        <input type="number" value="${item.quantity}" class="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg" onchange="updateQuantity(${index}, this.value)" />
      </td>
      <td class="p-3">
        <input type="text" value="${item.destination}" class="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg" onchange="updateDestination(${index}, this.value)" />
      </td>
      <td class="p-3 text-right">
        <button onclick="removeProduct(${index})" class="text-red-500 hover:text-red-700">Eliminar</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
};

  // Función para actualizar la cantidad de un producto
  window.updateQuantity = function(index, quantity) {
    productList[index].quantity = quantity;
  };

// Función para actualizar el destino de un producto
window.updateDestination = function(index, destination) {
  productList[index].destination = destination;
};

// Función para abrir el modal
function openModal() {
  const modal = document.getElementById("modal-salida");
  modal.classList.add("open");  // Mostrar el modal
}

// Función para cerrar el modal
function closeModal() {
  const modal = document.getElementById("modal-salida");
  modal.classList.remove("open");  // Ocultar el modal
}