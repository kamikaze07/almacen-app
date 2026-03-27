let productList = [];
let signaturePadEntrega;

document.addEventListener('DOMContentLoaded', () => {

  const modal = document.getElementById("modal-requisicion");

  document.getElementById("nueva-requisicion-btn").onclick = () => {
    modal.classList.add("open");
  };

  document.getElementById("close-modal").onclick =
  document.getElementById("close-modal-btn").onclick = () => {
    modal.classList.remove("open");
  };

  // Firma
  const canvas = document.getElementById('firma-entrega');

  signaturePadEntrega = new SignaturePad(canvas);

  document.getElementById('clear-signature-entrega').onclick = () => {
    signaturePadEntrega.clear();
  };

  // Guardar
  document.getElementById('guardar-requisicion-btn').onclick = async (e) => {
    e.preventDefault();

    const data = {
      solicita: document.getElementById('entrega').value,
      productos: productList,
      firma: signaturePadEntrega.toDataURL()
    };

    console.log("Requisición:", data);

    modal.classList.remove("open");
  };

});


// AUTOCOMPLETE
window.autoCompleteProduct = async function() {
  const input = document.getElementById('producto').value;
  const suggestions = document.getElementById('product-suggestions');

  if (input.length > 2) {
    const res = await fetch(`/public/search-products.php?search=${input}`);
    const data = await res.json();

    suggestions.innerHTML = '';
    suggestions.classList.remove('hidden');

    data.data.forEach(p => {
      const div = document.createElement('div');
      div.textContent = p.name;
      div.className = "p-2 hover:bg-gray-700 cursor-pointer";

      div.onclick = () => selectProduct(p.id, p.name);
      suggestions.appendChild(div);
    });
  } else {
    suggestions.classList.add('hidden');
  }
};

window.selectProduct = function(id, name) {
  productList.push({ id, name, quantity: 1 });
  renderProducts();
};

function renderProducts() {
  const body = document.getElementById("product-table-body");

  body.innerHTML = productList.map((p,i)=>`
    <tr>
      <td>${p.name}</td>
      <td>
        <input type="number" value="${p.quantity}"
          onchange="productList[${i}].quantity=this.value">
      </td>
      <td>
        <button onclick="removeProduct(${i})">❌</button>
      </td>
    </tr>
  `).join("");
}

window.removeProduct = function(i){
  productList.splice(i,1);
  renderProducts();
};