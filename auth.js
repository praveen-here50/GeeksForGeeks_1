// UI Toggles
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');

showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// Custom Alert Modal Logic
const alertModal = document.getElementById('alert-modal');
const alertTitle = document.getElementById('alert-title');
const alertDesc = document.getElementById('alert-desc');
const alertIcon = document.getElementById('alert-icon');
const alertOk = document.getElementById('alert-ok');

function showAlert(title, message, isError = false) {
    alertTitle.textContent = title;
    alertDesc.textContent = message;
    
    if (isError) {
        alertIcon.innerHTML = "<i class='bx bx-error-circle'></i>";
        alertIcon.style.color = "#ff5f56";
    } else {
        alertIcon.innerHTML = "<i class='bx bx-check-circle'></i>";
        alertIcon.style.color = "var(--primary)";
    }
    
    alertModal.classList.add('active');
}

alertOk.addEventListener('click', () => alertModal.classList.remove('active'));

// Registration Submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const department = document.getElementById('reg-dept').value;
    const year = document.getElementById('reg-year').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, department, year, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showAlert('Registration Failed', data.error || 'An error occurred', true);
            return;
        }

        localStorage.setItem('gfg_token', data.token);
        localStorage.setItem('gfg_user', JSON.stringify(data.user));
        
        showAlert('Welcome!', 'Registration successful. Redirecting to your dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        showAlert('Error', 'Could not connect to the server.', true);
    }
});

// Login Submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showAlert('Login Failed', data.error || 'Invalid credentials', true);
            return;
        }

        localStorage.setItem('gfg_token', data.token);
        localStorage.setItem('gfg_user', JSON.stringify(data.user));
        
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error(error);
        showAlert('Error', 'Could not connect to the server.', true);
    }
});

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('gfg_token');
    if (token) {
        window.location.href = 'dashboard.html';
    }
});
