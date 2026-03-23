document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
});

async function checkAuth() {
  try {
    const response = await fetch("/auth/me.php", {
      credentials: "include"
    });

    if (!response.ok) throw new Error("No autenticado");

    const user = await response.json();

    // 🔥 GUARDAR GLOBAL
    window.currentUser = user;

    console.log("Usuario global:", window.currentUser);

    document.body.classList.remove("hidden");

    window.dispatchEvent(new Event("authSuccess"));

  } catch (error) {
    window.location.href = "/auth/login.html";
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);

async function logout() {
  try {
    await fetch("/auth/logout.php", {
      method: "POST",
      credentials: "include"
    });

    // limpiar estado
    window.currentUser = null;

    // redirect
    window.location.href = "/auth/login.html";

  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
}