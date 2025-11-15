import {
    showConfirmDialog
} from './utils.js';

//======================Vars==========================
export let currentUser;

//======================Funcs==========================

export async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                currentUser = result.username;
                updateUIForLoggedInUser();
                return true;
            }
        }
        
        window.location.href = '/login.html';
        return false;
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}

export async function logout() {
    try {
        const confirmed = await showConfirmDialog("Are you sure you want to logout?");
        if (!confirmed) return;
        
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed');
    }
}

export function updateUIForLoggedInUser() {
    const header = document.querySelector('h1');
    if (header && !document.querySelector('.user-info')) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span class="username">👤 ${currentUser}</span>
            <button id="logout-btn" class="btn-logout">🚪 Logout</button>
        `;
        header.parentNode.insertBefore(userInfo, header.nextSibling);
    }
}

