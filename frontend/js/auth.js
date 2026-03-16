const BASE_API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    try {
        errorDiv.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Verifying...';

        const res = await fetch(`${BASE_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        redirectUser(data.user.role);
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorDiv = document.getElementById('registerError');
    const btn = document.getElementById('registerBtn');

    try {
        errorDiv.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Creating...';

        const res = await fetch(`${BASE_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        // Backend now returns token on register too for auto-login
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        redirectUser(data.user.role);
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
}

function redirectUser(role) {
    if (role === 'admin') window.location.href = 'admin.html';
    else if (role === 'owner') window.location.href = 'owner-dashboard.html';
    else window.location.href = 'student-dashboard.html';
}
