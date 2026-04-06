//modules/salidas/assets/js/salida-productos.js

  // Agregar productos a la tabla cuando se selecciona un producto
  let productList = []; // Array para mantener los productos seleccionados


// Inicializar los lienzos de firma
let signaturePadEntrega;
let signaturePadRecibe;

document.addEventListener('DOMContentLoaded', () => {
    console.log("JS cargado y funcionando.");

    // Establecer la fecha actual al cargar la página
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${year}-${month}-${day}`; // Formato yyyy-mm-dd

    // Establecer la fecha actual en el input de fecha
    const fechaInput = document.getElementById('fecha');
    fechaInput.value = formattedDate;

    // Llamar a la función para obtener las salidas del día actual
    fetchSalidas(formattedDate);

    // Escuchar el cambio de fecha en el calendario
    fechaInput.addEventListener('change', (event) => {
        fetchSalidas(event.target.value);  // Obtener las salidas de la fecha seleccionada
    });

    // Referencia al botón "Guardar"
    const saveButton = document.getElementById('guardar-salida-btn');
    
    // Verificar que el botón "Guardar" está presente en el DOM
    if (!saveButton) {
        console.error("Botón 'Guardar' no encontrado en el DOM.");
        return;
    }

    // Inicializar las áreas de firma usando SignaturePad
    const canvasEntrega = document.getElementById('firma-entrega');
    const canvasRecibe = document.getElementById('firma-recibe');

    if (canvasEntrega && canvasRecibe) {
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
            checkFormValidity(); // Verificar la validez del formulario después de limpiar la firma
        });

        document.getElementById('clear-signature-recibe').addEventListener('click', () => {
            signaturePadRecibe.clear();
            checkFormValidity(); // Verificar la validez del formulario antes de limpiar la firma
        });


        // Validar el formulario cuando los campos cambian
        document.getElementById('entrega').addEventListener('input', checkFormValidity);
        document.getElementById('recibe').addEventListener('input', checkFormValidity);

        // Verificar la validez del formulario cada vez que se termine un trazo de firma (SignaturePad v4+)
        signaturePadEntrega.addEventListener("endStroke", () => {
            console.log("Trazo de entrega finalizado"); // Esto te ayudará a confirmar en consola que sí funciona
            checkFormValidity();
        });

        signaturePadRecibe.addEventListener("endStroke", () => {
            console.log("Trazo de recibe finalizado");
            checkFormValidity();
        });

    } else {
        console.error("Los elementos de firma no se encuentran en el DOM.");
    }

    // Agregar listeners solo una vez para el formulario
    document.getElementById('nueva-salida-btn').addEventListener("click", () => {
        openModal();
    });

    document.getElementById("close-modal").addEventListener("click", () => {
        closeModal();
    });

    document.getElementById("close-modal-btn").addEventListener("click", () => {
        closeModal();
    });

    // Llamar a la función para establecer el estado inicial del botón al cargar la página
    checkFormValidity();

    // Evento para el botón "Guardar"
    document.getElementById('guardar-salida-btn').addEventListener('click', async (event) => {
        event.preventDefault();  // Prevenir el envío del formulario (evita que se recargue la página)

        // Validar que el formulario es válido
        const saveButton = document.getElementById('guardar-salida-btn');
        if (saveButton.disabled) {
            console.log("Formulario inválido, no se puede guardar.");
            return;  // Si el formulario no es válido, no se guarda
        }

        // Llamar a la función para guardar la salida
        await guardarSalida();
    });

    document.getElementById('generate-pdf').addEventListener('click', async () => {

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const salidas = window.salidasData || [];

      if (salidas.length === 0) {
          alert("No hay salidas para generar PDF");
          return;
      }

      // 🔹 FUNCION PARA CARGAR IMAGEN COMO BASE64
      async function loadImage(url) {
          const res = await fetch(url);
          const blob = await res.blob();

          return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
          });
      }

      // 🔹 LOGO
      const logo = await loadImage('/assets/logo.png'); // ajusta si cambia ruta

      doc.setTextColor(0);

      // 🔹 TABLA
      const rows = salidas.map(s => [
          s.fecha,
          s.producto_nombre,
          s.producto_sku,
          s.cantidad,
          s.unidad_destino,
          s.entrega_nombre,
          s.recibe_nombre,
          '', // firma entrega (placeholder)
          ''  // firma recibe (placeholder)
      ]);

      // 🔲 HEADER TIPO FORMATO
      const logoBase64 = await loadImage('/assets/logo.png');
      

      // Título empresa
      doc.setFontSize(12);
      doc.setTextColor(200, 0, 0);
      doc.text('FLETES Y MATERIALES FORSIS, S.A. DE C.V.', 105, 15, { align: 'center' });

      // Nombre documento
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Salida de Productos', 105, 22, { align: 'center' });

      // Línea horizontal
      doc.line(10, 25, 200, 25);

      // 🧾 TABLA HEADER
      doc.autoTable({
          startY: 10,
          theme: 'grid',
          headStyles: {
            fontSize: 7,
          },
          styles: {
              fontSize: 7,
              cellPadding: 0.5,
              valign: 'middle'
          },

          columnStyles: {
              0: { cellWidth: 35 }, // logo
              1: { cellWidth: 40 },
              2: { cellWidth: 45 },
              3: { cellWidth: 30 },
              4: { cellWidth: 40 }
          },

          body: [

              // 🔴 EMPRESA
              [
                  { content: '', rowSpan: 5 },
                  { content: 'FLETES Y MATERIALES FORSIS, S.A. DE C.V.', colSpan: 4, styles: { halign: 'center', textColor: [200,0,0], fontStyle: 'bold' } }
              ],

              // 🔵 SUBTITULO
              [
                  { content: 'Salida de Productos', colSpan: 4, styles: { halign: 'center' } }
              ],

              // 📅 FILA 1
              [
                  
                  'FECHA',
                  '11/11/18',
                  'PAG.',
                  '1 de 1'
              ],

              // 🔁 FILA 2
              [
                  
                  'REVISIÓN',
                  '0',
                  'CÓDIGO',
                  'FMF-FOR-ALM-ALM-002'
              ],

              // 🧾 FILA 3
              [
                  
                  'Fecha de elaboración',
                  new Date().toLocaleDateString(),
                  'Elaboró:',
                  'Juan Jose Castillo Hernandez'
              ]
          ],

          didDrawCell: function (data) {

              // 🖼 LOGO
              if (data.column.index === 0 && data.row.index === 0) {
                const cellWidth = data.cell.width;
                const cellHeight = data.cell.height;

                // tamaño del logo
                const imgWidth = 32;
                const imgHeight = 32;

                // centrar dentro de la celda completa
                const x = data.cell.x + (cellWidth - imgWidth) / 2;
                const y = data.cell.y + (cellHeight - imgHeight) / 2;

                doc.addImage(
                    logoBase64,
                    'PNG',
                    x,
                    y,
                    imgWidth,
                    imgHeight
                );
              }
          },
        didParseCell: function (data) {

            // 🔥 LOGO (solo esta grande)
            if (data.row.index === 0 && data.column.index === 0) {
                data.cell.styles.minCellHeight = 40;
            }
        }
      });

      doc.autoTable({
          startY: doc.lastAutoTable.finalY + 2,
          head: [['Fecha', 'Producto', 'SKU', 'Cantidad', 'Destino', 'Entrega', 'Recibe', 'Firma Entrega', 'Firma Recibe']],
          body: rows,
          tableWidth: 'full',
          margin: { left: 8, right: 8 },
          headStyles: {
            fontSize: 8,
            halign: 'center'
          },
          styles: {
            fontSize: 6.5,
            cellPadding: 0.7, 
            overflow: 'hidden',
            cellWidth: 'wrap'
          },
          columnStyles: {
              0: { cellWidth: 18 }, // Fecha
              1: { cellWidth: 38 }, // Producto
              2: { cellWidth: 28 }, // SKU
              3: { cellWidth: 12 }, // Cantidad
              4: { cellWidth: 28 }, // Destino
              5: { cellWidth: 18 }, // Entrega
              6: { cellWidth: 18 }, // Recibe
              7: { cellWidth: 20 }, // Firma Entrega
              8: { cellWidth: 20 }  // Firma Recibe
          },
              didDrawCell: async function (data) {

            if (data.section === 'body') {


                const salida = salidas[data.row.index];

                const imgWidth = data.cell.width - 6;
                const imgHeight = imgWidth * 0.35; // proporción firma

                const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                const y = data.cell.y + (data.cell.height - imgHeight) / 2;



                // FIRMA ENTREGA
                if (data.column.index === 7) {
                    const img = await loadImage(`/public/get-firma.php?file=${salida.firma_entrega.split('/').pop()}`);

                    doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
                   
                }

                // FIRMA RECIBE
                if (data.column.index === 8) {
                    const img = await loadImage(`/public/get-firma.php?file=${salida.firma_recibe.split('/').pop()}`);

                    doc.addImage(img, 'PNG',
                        data.cell.x + 2,
                        data.cell.y + 2,
                        20,
                        10
                    );
                }
            }
        },
        didParseCell: function (data) {

            // 🔥 SOLO columnas de firma (7 y 8)
            if (data.section === 'body' && (data.column.index === 7 || data.column.index === 8)) {
                data.cell.styles.minCellHeight = 12;
            }
        }
      });

      let y = doc.lastAutoTable.finalY + 10;

      // 🔹 FIRMAS
      for (const salida of salidas) {

          const firmaEntrega = await loadImage(`/public/get-firma.php?file=${salida.firma_entrega.split('/').pop()}`);
          const firmaRecibe = await loadImage(`/public/get-firma.php?file=${salida.firma_recibe.split('/').pop()}`);

          doc.setFontSize(10);

          y += 30;

          // salto de página si se pasa
          if (y > 260) {
              doc.addPage();
              y = 20;
          }
      }

      doc.save(`salidas_${new Date().toISOString().slice(0,10)}.pdf`);
    });

    const searchInput = document.getElementById('search-salidas');

    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {

            const search = e.target.value.trim();

            // 🔥 SI ESTÁ VACÍO → REGRESA A LA FECHA
            if (search === '') {
                const fecha = document.getElementById('fecha').value;
                fetchSalidas(fecha);
                return;
            }

            try {
                const response = await fetch(`/public/salidas.php?search=${search}`);
                const data = await response.json();

                window.salidasData = data;

                if (data.length > 0) {
                    displaySalidas(data);
                } else {
                    displayNoSalidas();
                }

            } catch (error) {
                console.error('Error en búsqueda:', error);
            }
        });
    }
});

// Función de autocompletado de producto
window.autoCompleteProduct = async function() {
  const input = document.getElementById('producto').value;
  const suggestions = document.getElementById('product-suggestions');

  if (input.length > 2) {
    // Hacer una solicitud GET al backend para obtener productos reales
    const response = await fetch(`/public/search-products.php?search=${input}`);
    const productos = await response.json();

    // Limpiar sugerencias anteriores
    suggestions.innerHTML = '';
    suggestions.classList.remove('hidden');

    // Mostrar las sugerencias de productos
    productos.data.forEach(producto => {
      const div = document.createElement('div');
      div.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-2');
      div.textContent = producto.name;  // Mostrar el nombre del producto
      div.addEventListener('click', () => selectProduct(producto.id, producto.name));
      suggestions.appendChild(div);
    });
  } else {
    suggestions.classList.add('hidden');
  }
};

  // Función para seleccionar un producto
window.selectProduct = function(productId, productName) {
    const quantity = 1; // Valor por defecto para cantidad
    const destination = 'Departamento de Ventas'; // Valor por defecto para destino

    // Agregar el producto a la lista
    productList.push({ id: productId, product: productName, quantity, destination });

    // Actualizar la tabla de productos
    updateProductTable();

    // Limpiar el campo de búsqueda y ocultar las sugerencias
    document.getElementById('producto').value = '';
    document.getElementById('product-suggestions').classList.add('hidden');
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
                <input type="number" value="${item.quantity}" class="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg product-quantity" onchange="updateQuantity(${index}, this.value)" />
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

    // Reagregar el evento de validación de cantidad a los inputs de cantidad
    document.querySelectorAll('.product-quantity').forEach((input, index) => {
        input.addEventListener('input', () => validateProductQuantity(index, input));
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

async function guardarSalida() {
    console.log("Guardando salida...");  // Verifica que esta función se está llamando

    // Capturar las firmas en formato base64
    const firmaEntrega = signaturePadEntrega.toDataURL(); // Firma de quien entrega
    const firmaRecibe = signaturePadRecibe.toDataURL(); // Firma de quien recibe

    // Obtener los productos seleccionados de la tabla
    const productos = productList.map(producto => ({
        producto_id: producto.id, 
        cantidad: producto.quantity,
        unidad_destino: producto.destination
    }));

    // Crear el objeto con los datos que vamos a enviar
    const data = {
        entrega_nombre: document.getElementById('entrega').value,
        recibe_nombre: document.getElementById('recibe').value,
        productos: productos,
        firma_entrega: firmaEntrega,
        firma_recibe: firmaRecibe
    };

    // Enviar los datos al backend usando fetch
    const response = await fetch('/public/salidas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        console.log('Salida registrada correctamente');
        // Cerrar el modal o limpiar los campos
        closeModal();
    } else {
        console.error('Error al guardar la salida');
    }
}

window.removeProduct = function(index) {
    // Eliminar el producto de la lista por su índice
    productList.splice(index, 1);

    // Actualizar la tabla para reflejar el cambio
    updateProductTable();
};

// Función para habilitar/deshabilitar el botón "Guardar"
function checkFormValidity() {
  console.log("Validando formulario...");  // Verifica que esta función se está llamando
    const isFormValid = document.getElementById('entrega').value &&
                         document.getElementById('recibe').value &&
                         !signaturePadEntrega.isEmpty() && 
                         !signaturePadRecibe.isEmpty();

    const saveButton = document.getElementById('guardar-salida-btn');
    
    // Habilitar o deshabilitar el botón según la validez del formulario
    if (saveButton) {
        saveButton.disabled = !isFormValid;
    }
}

// Validar la cantidad de producto
async function validateProductQuantity(index, quantityInput) {
  const product = productList[index];
  const quantity = parseInt(quantityInput.value, 10);

  // Consultar el stock disponible en la base de datos
  const response = await fetch(`/public/get-product-stock.php?id=${product.id}`);
  const data = await response.json();

  if (data.success) {
    const availableStock = data.stock;  // Suponiendo que el stock está en el campo 'stock'

    if (quantity > availableStock) {
      // Marcar el campo en rojo
      quantityInput.classList.add('border-red-500');

      // Mostrar el alert
      alert(`No puedes dar más de ${availableStock} unidades. Solo hay ${availableStock} disponibles.`);

      // Actualizar la cantidad automáticamente al stock disponible
      quantityInput.value = availableStock;
    } else {
      // Si la cantidad es válida, quitar el color rojo
      quantityInput.classList.remove('border-red-500');
    }
  }
}

// Llamar a la función cuando el usuario cambia la cantidad
document.querySelectorAll('.product-quantity').forEach((input, index) => {
    input.addEventListener('input', () => validateProductQuantity(index, input));
});

// Función para obtener las salidas del día y mostrar en la tabla
async function fetchSalidas(fechaSeleccionada) {
    try {
        const response = await fetch(`/public/salidas.php?fecha=${fechaSeleccionada}`); // Enviar la fecha seleccionada como parámetro
        const salidas = await response.json();

        // Verificar si hay salidas
        window.salidasData = salidas || [];

        if (window.salidasData.length > 0) {
            displaySalidas(window.salidasData);
        } else {
            displayNoSalidas();
        }
    } catch (error) {
        console.error('Error al obtener las salidas:', error);
        displayNoSalidas();  // Mostrar mensaje de error si ocurre algún problema
    }
}

// Función para mostrar las salidas en la tabla
function displaySalidas(salidas) {
    const tableBody = document.getElementById('tabla-salidas');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de mostrar las nuevas salidas

    salidas.forEach(salida => {
        const row = document.createElement('tr');

        const productos = `${salida.producto_nombre} (${salida.producto_sku})`;
        const cantidad = salida.cantidad;

        row.innerHTML = `
            <td class="p-3">${salida.folio}</td>
            <td class="p-3">${salida.fecha}</td>
            <td class="p-3">${productos}</td>
            <td class="p-3">${cantidad}</td>
            <td class="p-3">${salida.unidad_destino}</td>
            <td class="p-3">${salida.entrega_nombre}</td>
            <td class="p-3">${salida.recibe_nombre}</td>
            <td class="p-3 text-right">
                <button onclick="verDetalles(${salida.id})" class="text-blue-500">Ver</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para mostrar el mensaje de "Sin salidas"
function displayNoSalidas() {
    const tableBody = document.getElementById('tabla-salidas');
    tableBody.innerHTML = '<tr><td colspan="8" class="p-3 text-center">No hay salidas para el día seleccionado.</td></tr>';
}

// Función para ver los detalles de una salida (opcional)
window.verDetalles = function(salidaId) {
    console.log('Ver detalles de salida con ID:', salidaId);
    // Aquí podrías abrir un modal o una página para mostrar más información
}