const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    // Initialize Lucide icons on every page
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

function setupNavbar() {
    const navLinksContainer = document.getElementById('nav-links');
    if (!navLinksContainer) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    let html = `<li><a href="hostels.html" class="nav-link">Find Hostels</a></li>`;

    if (token) {
        html += `
            <li><a href="${getDashboardUrl(user.role)}" class="nav-link">Dashboard</a></li>
            <li><button onclick="logout()" class="btn btn-outline">Logout</button></li>
        `;
    } else {
        html += `
            <li><a href="login.html" class="nav-link">Login</a></li>
            <li><a href="register.html" class="btn btn-primary">Join Now</a></li>
        `;
    }

    navLinksContainer.innerHTML = html;
    
    // Refresh icons since we injected HTML
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function getDashboardUrl(role) {
    if (role === 'admin') return 'admin.html';
    if (role === 'owner') return 'owner-dashboard.html';
    return 'student-dashboard.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
