
  document.addEventListener('DOMContentLoaded', () => {

    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const form = document.getElementById('loginForm');
    const btn = document.getElementById('loginBtn');
    const errorEl = document.getElementById('error');
    const loader = document.getElementById('loader');
    const btnText = document.getElementById('btnText');

    let isLoading = false;

    // Toggle password
    const toggle = document.getElementById('togglePassword');

    toggle.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggle.textContent = isHidden ? '🙈' : '👁';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isLoading) return;

        const usuario = usuarioInput.value;
        const password = passwordInput.value;

        errorEl.classList.add('hidden');
        limpiarError();

        // ✅ Validación ANTES del loading
        if (!usuario || !password) {
        errorEl.textContent = 'Completa todos los campos';
        errorEl.classList.remove('hidden');
        marcarError();
        return;
        }

        isLoading = true;

        // Loading state
        btn.disabled = true;
        loader.classList.remove('hidden');
        btnText.textContent = 'Ingresando...';

        try {
        const res = await fetch('http://localhost/api/auth/login.php', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, password })
        });

        let data;
        try {
            data = await res.json();
        } catch {
            data = {};
        }

        if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');

        localStorage.setItem('token', data.token);

        window.location.href = '/frontend/dashboard.html';

        } catch (err) {
        marcarError();
        errorEl.textContent = err.message || 'Error al iniciar sesión';
        errorEl.classList.remove('hidden');

        } finally {
        isLoading = false;
        btn.disabled = false;
        loader.classList.add('hidden');
        btnText.textContent = 'Iniciar sesión';
        }
    });

    function marcarError() {
        usuarioInput.classList.add('border-red-500');
        passwordInput.classList.add('border-red-500');
    }

    function limpiarError() {
        usuarioInput.classList.remove('border-red-500');
        passwordInput.classList.remove('border-red-500');
    }

    usuarioInput.addEventListener('input', limpiarError);
    passwordInput.addEventListener('input', limpiarError);
});