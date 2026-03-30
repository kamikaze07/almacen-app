let tipoEntrada = "independiente";

document.addEventListener('DOMContentLoaded', () => {

  const modal = document.getElementById("modal-entrada");

  document.getElementById("nueva-entrada-btn").onclick = () => {
    modal.classList.remove("hidden");
  };

  document.getElementById("close-modal").onclick = () => {
    modal.classList.add("hidden");
  };

  // Tipo entrada
  document.querySelectorAll('input[name="tipoEntrada"]').forEach(r => {
    r.addEventListener('change', (e) => {
      tipoEntrada = e.target.value;
      renderBloque();
    });
  });

  renderBloque();
});


function renderBloque() {

  const container = document.getElementById("bloque-dinamico");

  if (tipoEntrada === "independiente") {

    container.innerHTML = `
      <input placeholder="Buscar producto..."
        class="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg" />
      <table class="w-full mt-4">
        <tbody></tbody>
      </table>
    `;
  }

  if (tipoEntrada === "requisicion") {

    container.innerHTML = `
      <div class="text-sm text-gray-400">
        Aquí se cargarán las requisiciones
      </div>
    `;
  }
}