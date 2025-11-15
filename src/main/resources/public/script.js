
import {
    currentUser,
    checkAuthentication,
    logout,
    updateUIForLoggedInUser
} from './auth.js';

import {
    showPasswordPrompt,
    showCreateDirPrompt,
    showActionDropDown
} from './utils.js';

//======VARIABLES======
let files = [];
let filteredFiles = [];
let dirs = [];
let currentDir = "/cloud";
let currentDirEntity = [];



//======FUNCTIONS======

async function listFiles() {
    try{
        const response = await fetch('/api/files/list', {
            credentials: 'include'
        });
        if (response.ok) {
            files = await response.json();
            filteredFiles = files;
        } else {
            console.error('Error fetching files:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching files:', error);
    }
    displayFiles();
    listDirs();
    
}

async function listDirs(){
    try{
        const response = await fetch('api/dirs/list', {
            credentials: 'include'
        });
        if(response.ok){
            dirs = await response.json();
        }else{
            console.error('Error fetching dirs:', response.statusText);
        }
    }catch (error) {
        console.error('Error fetching files:', error);
    }
    displayDirs();
}

function filterFiles(name){
    searchLower = name.trim().toLowerCase();
    if(searchLower === ''){
        filteredFiles = files;
        displayFiles();
        return;
    }
    filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchLower));
    displayFiles();
}

async function onDirClick(dir){
    try{
        currentDirEntity.push(dir);
        const response = await fetch(`/api/dirs/getFiles/${dir.id}`, {
            credentials: 'include'
        });
        if(response.ok){
            const dirFiles = await response.json();
            currentDir += "/"+dir.name;
            filteredFiles = dirFiles;
            displayFiles();
            document.getElementById("path").innerHTML=currentDir;
        }else{
            console.error('Error fetching dir files:', response.statusText);
            alert('Error loading directory files');
        }
    }catch (error) {
        console.error('Error fetching dir files:', error);
        alert('Error loading directory files: ' + error.message);
    }
}

function displayDirs(){
    const fileList = document.getElementById('fileList');
    
    if(dirs.length === 0){
        return;
    }

    dirs.forEach(dir => {
        const dirItem = document.createElement('div');
        dirItem.className = 'file-item dir-item';
        dirItem.style.cursor = 'pointer';
        
        dirItem.addEventListener('click', () => onDirClick(dir));
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'file-icon';
        iconDiv.style.background = 'linear-gradient(135deg, var(--accent-color), var(--accent-color-light))';
        iconDiv.textContent = '📁';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'file-content';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'file-name';
        nameDiv.textContent = dir.name;

        const ownerDiv = document.createElement('div');
        ownerDiv.className = 'file-owner-name';
        ownerDiv.textContent = "Owner: " + dir.ownerUsername;
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'file-meta';
        
        const fileCountSpan = document.createElement('span');
        fileCountSpan.className = 'file-size';
        fileCountSpan.textContent = `${dir.files ? dir.files.length : 0} files`;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'file-type';
        typeSpan.textContent = 'Directory';
        
        metaDiv.appendChild(fileCountSpan);
        metaDiv.appendChild(typeSpan);
        
        contentDiv.appendChild(nameDiv);
        contentDiv.appendChild(ownerDiv);
        contentDiv.appendChild(metaDiv);
        
        //Actions div
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'file-actions';
        
        if(dir.ownerUsername == currentUser){
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-small btn-delete';
            deleteBtn.textContent = '🗑️ Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteDir(dir.id);
            });
            actionsDiv.appendChild(deleteBtn);
        }
        
        dirItem.appendChild(iconDiv);
        dirItem.appendChild(contentDiv);
        dirItem.appendChild(actionsDiv);
        
        fileList.appendChild(dirItem);
    });
}

function displayFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    if(filteredFiles.length === 0){
        const noFilesFoundItem = document.createElement('div');
        noFilesFoundItem.className = 'file-item';
        noFilesFoundItem.textContent = "🔍 No files found";
        fileList.appendChild(noFilesFoundItem);
        return;
    }

    filteredFiles.forEach(file => {
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

        const ownerDiv = document.createElement('div');
        ownerDiv.className = 'file-owner-name';
        ownerDiv.textContent = "Owner: " + file.ownerUsername;
        
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
        contentDiv.appendChild(ownerDiv);
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

        //Dropdown Container:
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'dropdown-menu hidden'; 

        //Dropdown Items:
        const encryptItem = document.createElement('div');
        encryptItem.className = 'dropdown-item';
        encryptItem.textContent = file.encrypted ? '🔒 Decrypt' : '🔒 Encrypt';

        const compressItem = document.createElement('div');
        compressItem.className = 'dropdown-item';
        compressItem.textContent = file.compressed ? '📦 Decompress' : '📦 Compress';

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

        dropdownDiv.appendChild(encryptItem);
        dropdownDiv.appendChild(compressItem);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', () => deleteFile(file.id));
        
        actionsDiv.appendChild(downloadBtn);

        if(file.ownerUsername == currentUser){
            actionsDiv.appendChild(actionsBtn);
            actionsDiv.appendChild(deleteBtn);
        }

        actionsDiv.style.position = 'relative';
        actionsDiv.appendChild(dropdownDiv);
        
        fileItem.appendChild(iconDiv);
        fileItem.appendChild(contentDiv);
        fileItem.appendChild(actionsDiv);
        
        fileList.appendChild(fileItem);
    });
}
/*
function showActionDropDown(dropdownDiv){
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
    
    dropdownDiv.classList.toggle('hidden');
}
*/
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
            const uploadedFiles = await response.json(); 
            
            // Move files to current directory if not in root
            console.log(currentDirEntity.at(-1));
            if(currentDirEntity.length != 0){
                const activeDirId = currentDirEntity[currentDirEntity.length - 1].id;
                
                for(const file of uploadedFiles) {
                    try {
                        const moveResponse = await fetch(`/api/dirs/move/${file.id}/${activeDirId}`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                        
                        if (!moveResponse.ok) {
                            console.error(`Failed to move file ${file.name} to directory`);
                        }
                    } catch (moveError) {
                        console.error(`Error moving file ${file.name}:`, moveError);
                    }
                }
            }
            
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

        const response = await fetch(`/api/files/download/${file.id}` , { 
            method: 'POST', 
            body: JSON.stringify({ password }), 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
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
        
        const response = await fetch(`/api/files/encryption/${fileId}`, { 
            method: 'POST', 
            body: JSON.stringify({ password }), 
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include'
        });
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
        const response = await fetch(`api/files/compression/${fileId}`, {
            method : 'GET',
            credentials: 'include'
        });
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
        
        const conf = await fetch(`/api/files/delete/${fileId}`, { 
            method: 'DELETE', 
            credentials: 'include'
        });
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

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
});

document.getElementById('searchInput').addEventListener('input', function(event){
    filterFiles(event.target.value);
});

document.getElementById('createDirBtn').addEventListener('click', async function() {
    try {
        const { dirName, password } = await showCreateDirPrompt();
        await createDirectory(dirName, password);
    } catch (error) {
        console.log('Directory creation cancelled');
    }
});

document.getElementById("path").addEventListener('click', function() {
    pathReduceLevel();
})

//======DIR FUNCTIONS======

async function createDirectory(dirName, password) {
    try {
        const formData = new FormData();
        formData.append('dirName', dirName);
        //if (password) {
          //  formData.append('password', password);
        //}
        
        const response = await fetch('/api/dirs/create', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Directory "${dirName}" created successfully!`);
            listFiles(); 
        } else {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            alert('Error creating directory: ' + errorText);
        }
    } catch (error) {
        console.error('Error creating directory:', error);
        alert('Error creating directory: ' + error.message);
    }
}

async function deleteDir(id){
    try{
        const response = await fetch(`/api/dirs/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if(response.ok){
            alert('Directory deleted sucessfully!');
            listFiles();
        }else{
            console.error('Error deleting directory!');
        }
    }catch (error){
        console.error('Error deleting dir: ', error);
    }
}

function getCurrentDir(){
    let pathParts = currentDir.split('/');
    let dirName = pathParts.at(-1);
        
    if(dirName === 'cloud'){
        return null;
    }

    return dirName;
}

function pathReduceLevel() {
    currentDirEntity.pop();
    if (currentDir === '/cloud') {
        return;
    }

    const pathParts = currentDir.split('/').filter(part => part !== '');
    pathParts.pop();
    currentDir = '/' + pathParts.join('/');
    
    updatePathDisplay();
    
    loadCurrentDirectory();
}

function updatePathDisplay() {
    const pathElement = document.getElementById('path');
    
    if (currentDir === '/cloud') {
        pathElement.textContent = '/cloud';
    } else {
        pathElement.textContent = `${currentDir}`;
    }
    
    if (currentDir === '/cloud') {
        pathElement.style.cursor = 'default';
    } else {
        pathElement.style.cursor = 'pointer';
    }
}

async function loadCurrentDirectory() {
    try {
        const dir = getCurrentDir();
        if(dir == null) {
            listFiles();
            return;
        }
        const response = await fetch(`/api/dirs/getFilesByName/${dirName}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            files = data.files || [];
            filteredFiles = files;
            displayFiles();
        }
    } catch (error) {
        console.error('Error loading directory:', error);
    }
}



//======INITIALIZATION======
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated) {
        updateUIForLoggedInUser(currentUser);
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        updatePathDisplay();
        listFiles();
    }
});