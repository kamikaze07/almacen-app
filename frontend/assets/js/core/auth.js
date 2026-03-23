export async function checkAuth() {
  try {
    const response = await fetch("/auth/me.php", {
      credentials: "include"
    });

    if (!response.ok) throw new Error("No autenticado");

    const user = await response.json();

    window.currentUser = user;

    window.dispatchEvent(new Event("authSuccess"));

    return user;

  } catch (error) {
    redirectToLogin();
  }
}

export function setupLogout(buttonId = "logoutBtn") {
  document.getElementById(buttonId)?.addEventListener("click", logout);
}

async function logout() {
  try {
    await fetch("/auth/logout.php", {
      method: "POST",
      credentials: "include"
    });

    window.currentUser = null;
    redirectToLogin();

  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
}

function redirectToLogin() {
  window.location.href = "/auth/login.html";
}