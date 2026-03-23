export function checkSession() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/frontend/auth/login.html";
        return;
    }
}