//======VARIABLES======
let isLoading = false;

//======DOM ELEMENTS======
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

//======UTILITY FUNCTIONS======
function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

function setLoading(loading) {
    isLoading = loading;
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        if (loading) {
            form.classList.add('loading');
            form.querySelectorAll('input, button').forEach(el => el.disabled = true);
        } else {
            form.classList.remove('loading');
            form.querySelectorAll('input, button').forEach(el => el.disabled = false);
        }
    });
}

function switchToRegister() {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    hideMessage();
    clearForms();
}

function switchToLogin() {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
    hideMessage();
    clearForms();
}

function clearForms() {
    document.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.style.borderColor = '';
    });
}

//======API FUNCTIONS======
async function makeRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', //Include cookies for session management
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data: result
        };
    } catch (error) {
        console.error('Request failed:', error);
        return {
            success: false,
            status: 0,
            data: { message: 'Network error. Please check your connection.' }
        };
    }
}

async function login(username, password) {
    setLoading(true);
    hideMessage();
    
    try {
        const result = await makeRequest('/api/auth/login', 'POST', {
            username,
            password
        });
        
        if (result.success) {
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            showMessage(result.data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

async function register(username, password) {
    setLoading(true);
    hideMessage();
    
    try {
        const result = await makeRequest('/api/auth/register', 'POST', {
            username,
            password
        });
        
        if (result.success) {
            showMessage('Registration successful! You can now login.', 'success');
            setTimeout(() => {
                switchToLogin();
            }, 2000);
        } else {
            showMessage(result.data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

async function checkAuthentication() {
    try {
        const result = await makeRequest('/api/auth/check');
        
        if (result.success) {
            // User is already authenticated, redirect to main app
            window.location.href = '/index.html';
        }
    } catch (error) {
        // User is not authenticated, stay on login page
        console.log('User not authenticated');
    }
}

//======FORM VALIDATION======
function validateLoginForm() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username) {
        showMessage('Please enter your username', 'error');
        return false;
    }
    
    if (!password) {
        showMessage('Please enter your password', 'error');
        return false;
    }
    
    return { username, password };
}

function validateRegisterForm() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username) {
        showMessage('Please enter a username', 'error');
        return false;
    }
    
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters long', 'error');
        return false;
    }
    
    if (!password) {
        showMessage('Please enter a password', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    return { username, password };
}

//======EVENT LISTENERS======
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const formData = validateLoginForm();
    if (formData) {
        await login(formData.username, formData.password);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const formData = validateRegisterForm();
    if (formData) {
        await register(formData.username, formData.password);
    }
});

//Real-time password confirmation validation
document.getElementById('confirmPassword').addEventListener('input', (e) => {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = e.target.value;
    
    if (confirmPassword && password !== confirmPassword) {
        e.target.style.borderColor = 'var(--error-color)';
    } else {
        e.target.style.borderColor = '';
    }
});

//Clear error styling on input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        if (input.style.borderColor === 'var(--error-color)') {
            input.style.borderColor = '';
        }
    });
});

//======INITIALIZATION======
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already authenticated
    checkAuthentication();
    
    // Focus on first input
    document.getElementById('loginUsername').focus();
});

//======GLOBAL FUNCTIONS FOR HTML======
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;