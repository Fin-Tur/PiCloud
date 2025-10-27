
//======VARIABLES======
let files = [];
let currentUser = null;

//======AUTHENTICATION FUNCTIONS======

async function checkAuthentication() {
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
        
        // Not authenticated, redirect to login
        window.location.href = '/login.html';
        return false;
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}

async function logout() {
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

function updateUIForLoggedInUser() {
    // Add logout button to header
    const header = document.querySelector('h1');
    if (header && !document.querySelector('.user-info')) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span class="username">👤 ${currentUser}</span>
            <button class="btn-logout" onclick="logout()">🚪 Logout</button>
        `;
        header.parentNode.insertBefore(userInfo, header.nextSibling);
    }
}

//======MODAL FUNCTIONS======

function showPasswordPrompt(message = "Enter password:") {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('passwordModal');
    const input = document.getElementById('passwordInput');
    const messageEl = document.getElementById('modalMessage');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    
    //Set message and show modal
    messageEl.textContent = message;
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    input.focus();
    
    //Event Handlers
    const handleConfirm = () => {
      const password = input.value.trim();
      if (password) {
        cleanup();
        resolve(password);
      } else {
        input.style.borderColor = 'var(--error-color)';
        input.focus();
      }
    };
    
    const handleCancel = () => {
      cleanup();
      reject(new Error('User cancelled'));
    };
    
    const cleanup = () => {
      modal.style.display = 'none';
      modal.classList.add('hidden');
      input.value = '';
      input.style.borderColor = '';
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keypress', handleKeypress);
      backdrop.removeEventListener('click', handleCancel);
    };
    
    const handleKeypress = (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') handleCancel();
    };
    
    const backdrop = modal.querySelector('.modal-backdrop');
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keypress', handleKeypress);
    backdrop.addEventListener('click', handleCancel);
  });
}

function showConfirmDialog(message = "Are you sure?") {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    
    //Set message and show modal
    messageEl.textContent = message;
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    confirmBtn.focus();
    
    //Event Handlers
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };
    
    const cleanup = () => {
      modal.style.display = 'none';
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      document.removeEventListener('keypress', handleKeypress);
      backdrop.removeEventListener('click', handleCancel);
    };
    
    const handleKeypress = (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') handleCancel();
    };
    
    const backdrop = modal.querySelector('.modal-backdrop');
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    document.addEventListener('keypress', handleKeypress);
    backdrop.addEventListener('click', handleCancel);
  });
}


//======FUNCTIONS======

async function listFiles() {
    try{
        const response = await fetch('/api/files/list');
        if (response.ok) {
            files = await response.json();
        } else {
            console.error('Error fetching files:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching files:', error);
    }
    displayFiles();
    
}

function displayFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const iconDiv = document.createElement('div');
        iconDiv.className = `file-icon ${getFileType(file.type)}`;
        iconDiv.textContent = getFileIcon(file.type);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'file-content';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'file-name';
        nameDiv.textContent = file.name; 
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'file-meta';
        
        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'file-size';
        sizeSpan.textContent = formatFileSize(file.size);
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'file-date';
        dateSpan.textContent = formatDate(file.uploadedAt);
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'file-type';
        typeSpan.textContent = file.type || 'Unknown';
        
        metaDiv.appendChild(sizeSpan);
        metaDiv.appendChild(dateSpan);
        metaDiv.appendChild(typeSpan);
        
        contentDiv.appendChild(nameDiv);
        contentDiv.appendChild(metaDiv);
        
        //Actions div
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'file-actions';
        
        //Download btn
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-small btn-download';
        downloadBtn.textContent = '📥 Download';
        downloadBtn.addEventListener('click', () => downloadFile(file));

        //Actions btn
        const actionsBtn = document.createElement('button');
        actionsBtn.className = 'btn-small btn-actions';
        actionsBtn.textContent += 'ℹ️ Actions ';
        if(file.encrypted) actionsBtn.textContent += '🔒 ';
        if(file.compressed) actionsBtn.textContent += '📦 ';
        actionsBtn.addEventListener('click', (e)=> {
            e.stopPropagation();
            showActionDropDown(dropdownDiv);
        });

        // Dropdown Container:
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'dropdown-menu hidden'; 

        // Dropdown Items:
        const encryptItem = document.createElement('div');
        encryptItem.className = 'dropdown-item';
        encryptItem.textContent = file.encrypted ? '🔒 Decrypt' : '🔒 Encrypt';

        const compressItem = document.createElement('div');
        compressItem.className = 'dropdown-item';
        compressItem.textContent = file.compressed ? '📦 Decompress' : '📦 Compress';

        //Event Listeners for Dropdown Items
        encryptItem.addEventListener('click', () => {
            fileEnDecryption(file.id);
            dropdownDiv.classList.add('hidden');
            listFiles();
        });

        compressItem.addEventListener('click', () => {
            fileDeCompression(file.id);
            dropdownDiv.classList.add('hidden');
            listFiles();
        });

        // Items zum Dropdown hinzufügen
        dropdownDiv.appendChild(encryptItem);
        dropdownDiv.appendChild(compressItem);

        /*const compBtn = document.createElement('button');
        compBtn.className = 'btn-small btn-comp';
        if (file.compressed) {
            compBtn.textContent = '📦 Decompress';
        }else{
            compBtn.textContent = '📦 Compress'; 
        }
        compBtn.addEventListener('click', () => fileDeCompression(file.id));*/
        
        /*const cryptBtn = document.createElement('button');
        cryptBtn.className = 'btn-small btn-crypt';
        if (file.encrypted) {
            cryptBtn.textContent = '🔒 Decrypt';
        }else{
            cryptBtn.textContent = '🔒 Encrypt';
        }
        cryptBtn.addEventListener('click', () => fileEnDecryption(file.id));*/

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', () => deleteFile(file.id));
        
        actionsDiv.appendChild(downloadBtn);
        actionsDiv.appendChild(actionsBtn);
        actionsDiv.appendChild(deleteBtn);
        
        actionsDiv.style.position = 'relative';
        actionsDiv.appendChild(dropdownDiv);
        
        fileItem.appendChild(iconDiv);
        fileItem.appendChild(contentDiv);
        fileItem.appendChild(actionsDiv);
        
        fileList.appendChild(fileItem);
    });
}

function showActionDropDown(dropdownDiv){
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
    
    dropdownDiv.classList.toggle('hidden');
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
   
    if(fileInput.files.length === 0) {
        alert('Please select a file to upload.');
        return;
    }
    
    const formData = new FormData();
    Array.from(fileInput.files).forEach(file => {
        formData.append('files', file);
    });

    try{
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            alert('Files uploaded successfully!');
            listFiles(); 
            clearSelectedFiles(); 
        }else{
            alert('Error uploading files:'  + response.statusText);
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('Error uploading files: ' + error.message);
    }

}

async function downloadFile(file) {
    try{
        var password = "";
        if(file.encrypted){
            try {
                password = await showPasswordPrompt("Enter the password for downloading encrypted file:");
            } catch (error) {
                return; // User cancelled
            }
        }

        const response = await fetch(`/api/files/download/${file.id}` , { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `file_${file.id}`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; 
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);  // Memory cleanup
        }else{
            alert('Error downloading file: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file: ' + error.message);
    }
}

async function fileEnDecryption(fileId) {
    try{
        let password;
        try {
            password = await showPasswordPrompt("Enter the password for encryption/decryption:");
        } catch (error) {
            return; // User cancelled
        }
        
        const response = await fetch(`/api/files/encryption/${fileId}`, { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
        if (response.ok) {
            alert('File en/decrypted successfully!');
        } else {
            alert('Error en/decrypting file: ' + response.statusText);
        }
    }catch(error) {
        console.error('Error en/decrypting file:', error);
        alert('Error en/decrypting file: ' + error.message);
    }
}

async function fileDeCompression(fileId){
    try{
        const response = await fetch(`api/files/compression/${fileId}`, {method : 'GET'});
        if(response.ok){
            alert('File de/compression successful!');
        }else{
            alert('Error de/compressing file: '+response.statusText);
        }
    }catch(error){
        console.error('Error de/compressing file:', error);
        alert('Error de/compressing file: ' + error.message);
    }
}

async function deleteFile(fileId) {
    try{
        const confirmed = await showConfirmDialog("Are you sure you want to delete this file? This action cannot be undone.");
        if (!confirmed) return;
        
        const conf = await fetch(`/api/files/delete/${fileId}`, { method: 'GET' });
        if (conf.ok) {
            alert('File deleted successfully!');
        } else {
            alert('Error deleting file: ' + conf.statusText);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file: ' + error.message);
    }
    listFiles();
}

//======FILE PREVIEW FUNCTIONS======

//TODO : DOM Manipulation
function showFilePreview(files) {
    const previewContainer = document.getElementById('filePreview');
    const previewList = document.getElementById('previewList');
    
    if (files.length === 0) {
        previewContainer.classList.add('hidden');
        return;
    }

    previewContainer.classList.remove('hidden');
    
    previewList.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <div class="preview-icon ${getFileType(file.type)}">
                ${getFileIcon(file.type)}
            </div>
            <div class="preview-info">
                <div class="preview-name">${file.name}</div>
                <div class="preview-meta">
                    <span class="preview-size">${formatFileSize(file.size)}</span>
                    <span class="preview-type">${file.type || 'Unknown'}</span>
                </div>
            </div>
            <button class="preview-remove" onclick="removeFileFromPreview(${index})">
                ✕ Entfernen
            </button>
        `;
        previewList.appendChild(previewItem);
    });
}

function removeFileFromPreview(index) {
    const fileInput = document.getElementById('fileInput');
    const files = Array.from(fileInput.files);
    
    files.splice(index, 1);
    
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    
    showFilePreview(fileInput.files);
}

function clearSelectedFiles() {
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
    
    const previewContainer = document.getElementById('filePreview');
    previewContainer.classList.add('hidden');
}

//======HELPER FUNCTIONS======
function getFileType(mimeType) {
    if (!mimeType) return 'document';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive';
    
    return 'document';
}

function getFileIcon(mimeType) {
    const type = getFileType(mimeType);
    
    switch(type) {
        case 'image': return '🖼️';
        case 'video': return '🎬';
        case 'audio': return '🎵';
        case 'document': return '📄';
        case 'archive': return '📦';
        default: return '📄';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

//======EVENT LISTENERS======
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    uploadFile();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    showFilePreview(event.target.files);
});

// Dropdown schließen bei Klick außerhalb
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
});



//======INITIALIZATION======
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated) {
        listFiles();
    }
});