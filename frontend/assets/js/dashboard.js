import { checkAuth, setupLogout } from "./core/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  document.body.classList.remove("hidden");
});

setupLogout();


window.addEventListener("authSuccess", () => {
  renderUser();
  loadDashboard();
});

function renderUser() {
  const el = document.getElementById("userName");

  if (window.currentUser && el) {
    el.textContent = window.currentUser.username || "Usuario";
  }
}

async function loadDashboard() {
  try {

    const res = await fetch("/public/dashboard.php");
    const json = await res.json();

    if (!json.success) throw new Error(json.error);

    const data = json;

    document.getElementById("stockTotal").textContent = data.stock_total;
    document.getElementById("entradasHoy").textContent = data.entradas_hoy;
    document.getElementById("salidasHoy").textContent = data.salidas_hoy;
    document.getElementById("alertas").textContent = data.alertas;
    renderCharts(data);
    renderCriticos(data.productos_criticos);
    renderRequisiciones(data.requisiciones);

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

function renderCharts(data) {

  // 📈 Movimientos
  const ctx1 = document.getElementById("movimientosChart");

  new Chart(ctx1, {
    type: "line",
    data: {
      labels: data.movimientos.labels,
      datasets: [
        {
          label: "Entradas",
          data: data.movimientos.entradas,
          borderWidth: 2
        },
        {
          label: "Salidas",
          data: data.movimientos.salidas,
          borderWidth: 2
        }
      ]
    }
  });

  // 📊 Top productos
  const ctx2 = document.getElementById("topProductosChart");

  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: data.top_productos.map(p => p.nombre),
      datasets: [{
        label: "Movimientos",
        data: data.top_productos.map(p => p.cantidad),
        borderWidth: 1
      }]
    }
  });
}

function renderCriticos(items) {
  const el = document.getElementById("productosCriticos");
  el.innerHTML = "";

  items.forEach(p => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="flex justify-between">
        <span class="text-red-400">${p.nombre}</span>
        <span class="text-xs text-gray-400">Stock: ${p.stock}</span>
      </div>
    `;

    el.appendChild(li);
  });
}

function renderRequisiciones(items) {
  const el = document.getElementById("requisiciones");
  el.innerHTML = "";

  items.forEach(r => {
    const color = r.estado === "atendida"
      ? "text-green-400"
      : "text-yellow-400";

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="flex justify-between">
        <span>${r.folio}</span>
        <span class="${color}">${r.estado}</span>
      </div>
    `;

    el.appendChild(li);
  });
}