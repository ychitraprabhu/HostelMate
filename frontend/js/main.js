// API Base URL
const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

const setAuthData = (data) => {
    localStorage.setItem('user', JSON.stringify(data));
};

const getAuthUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
};

const getToken = () => {
    const user = getAuthUser();
    return user ? user.token : null;
};

const authHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const updateNavbar = () => {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;

    const user = getAuthUser();
    
    if (user) {
        let linksHTML = `
            <li><a href="/hostels.html">Hostels</a></li>
            <li><a href="/profile.html">Profile</a></li>
        `;
        if (user.role === 'admin') {
            linksHTML += `<li><a href="/admin.html">Admin</a></li>`;
        }
        linksHTML += `<li><a href="#" onclick="logout()" class="btn btn-secondary">Logout</a></li>`;
        authLinks.innerHTML = linksHTML;
    } else {
        authLinks.innerHTML = `
            <li><a href="/hostels.html">Hostels</a></li>
            <li><a href="/login.html">Login</a></li>
            <li><a href="/register.html" class="btn btn-primary">Register</a></li>
        `;
    }
};

const showError = (msg, elementId = 'errorMsg') => {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
    } else {
        alert(msg);
    }
};

const showSuccess = (msg, elementId = 'successMsg') => {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
    } else {
        alert(msg);
    }
};

const fetchAPI = async (endpoint, options = {}) => {
    const headers = {
        ...authHeader(),
        ...options.headers
    };

    // Only set Content-Type to JSON if body is NOT FormData
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

const renderStars = (rating) => {
    rating = Math.round(Number(rating));
    let stars = '';
    for(let i=1; i<=5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return `<span class="stars">${stars}</span>`;
};

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);

            try {
                const data = await fetchAPI('/auth/register', {
                    method: 'POST',
                    body: formData
                });

                setAuthData(data);
                window.location.href = '/profile.html';
            } catch (error) {
                showError(error.message);
            }
        });
    }
});
