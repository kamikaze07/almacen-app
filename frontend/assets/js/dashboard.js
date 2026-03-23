window.addEventListener("authSuccess", () => {
  loadDashboard();
  renderUser();
});

function renderUser() {
  const el = document.getElementById("userName");

  if (window.currentUser && el) {
    el.textContent = window.currentUser.username || "Usuario";
  }
}

async function loadDashboard() {
  try {

    // 🔁 MOCK (luego conectamos backend)
    const data = {
      stock_total: 1250,
      entradas_hoy: 45,
      salidas_hoy: 30,
      alertas: 3,
      actividad: [
        { tipo: "entrada", mensaje: "+ Tornillos agregados", fecha: "hace 2 min" },
        { tipo: "salida", mensaje: "- Martillos retirados", fecha: "hace 5 min" },
        { tipo: "alerta", mensaje: "⚠ Bajo stock en clavos", fecha: "hace 10 min" }
      ]
    };

    document.getElementById("stockTotal").textContent = data.stock_total;
    document.getElementById("entradasHoy").textContent = data.entradas_hoy;
    document.getElementById("salidasHoy").textContent = data.salidas_hoy;
    document.getElementById("alertas").textContent = data.alertas;

    renderActividad(data.actividad);

  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
}

function renderActividad(items) {
  const container = document.getElementById("actividad");
  container.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");

    let color = "text-gray-300";
    let icon = "•";

    if (item.tipo === "entrada") {
      color = "text-green-400";
      icon = "⬆";
    }

    if (item.tipo === "salida") {
      color = "text-red-400";
      icon = "⬇";
    }

    if (item.tipo === "alerta") {
      color = "text-red-500";
      icon = "⚠";
    }

    li.className = "flex justify-between items-center";

    li.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="${color}">${icon}</span>
        <span class="${color}">${item.mensaje}</span>
      </div>
      <span class="text-gray-500 text-xs">${item.fecha}</span>
    `;

    container.appendChild(li);
  });
}