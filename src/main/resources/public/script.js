//======================================Imports==================================
import {
    currentUser,

    checkAuthentication,
    logout,
    updateUIForLoggedInUser
} from './auth.js';


import {
    showCreateDirPrompt,
    showActionDropDown
} from './utils.js';


import {
    getFileType,
    getFileIcon,
    formatFileSize,
    formatDate
} from './helper.js';


import {
    state,
    onDirClick,
    listFiles,
    uploadFile,
    downloadFile,
    fileEnDecryption,
    fileDeCompression,
    deleteFile,
    createDirectory,
    deleteDir,
    loadCurrentDirectory
} from './api.js';

//======================================Display Funcs==================================

function displayDirs(){
    const fileList = document.getElementById('fileList');
    
    if(state.filteredDirs.length === 0){
        const noDirsFoundItem = document.createElement('div');
        noDirsFoundItem.className = 'file-item';
        noDirsFoundItem.textContent = "🔍 No directorys found";
        fileList.appendChild(noDirsFoundItem);
        return;
    }

    state.filteredDirs.forEach(dir => {
        const dirItem = document.createElement('div');
        dirItem.className = 'file-item dir-item';
        dirItem.style.cursor = 'pointer';
        
        dirItem.addEventListener('click', async function(){
            await onDirClick(dir);
            displayFiles();
        } );
        
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
                listFiles();
                displayFiles();
                displayDirs();
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
    
    if(state.filteredFiles.length === 0){
        const noFilesFoundItem = document.createElement('div');
        noFilesFoundItem.className = 'file-item';
        noFilesFoundItem.textContent = "🔍 No files found";
        fileList.appendChild(noFilesFoundItem);
        return;
    }

    state.filteredFiles.forEach(file => {
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

        const moveItem = document.createElement('div');
        moveItem.className = 'dropdown-item';
        moveItem.textContent = '↪ Move File';

        encryptItem.addEventListener('click', () => {
            fileEnDecryption(file.id);
            dropdownDiv.classList.add('hidden');
            listFiles();
            displayFiles();
            displayDirs();
        });

        compressItem.addEventListener('click', () => {
            fileDeCompression(file.id);
            dropdownDiv.classList.add('hidden');
            listFiles();
            displayFiles();
            displayDirs();
        });

        moveItem.addEventListener('click', () => {
            
        });

        dropdownDiv.appendChild(encryptItem);
        dropdownDiv.appendChild(compressItem);
        dropdownDiv.appendChild(moveItem);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', function(){
            deleteFile(file.id)
            listFiles();
            displayFiles();
            displayDirs();
        });
        
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

//=====================FILE PREVIEW FUNCTIONS=========================

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

        const previewIcon = document.createElement('div');
        previewIcon.className = 'preview-icon ' + getFileType(file.type);
        previewIcon.textContent = getFileIcon(file.type);

        const previewInfo = document.createElement('div');
        previewInfo.className = 'preview-info';

        const previewName = document.createElement('div');
        previewName.className = 'preview-name';
        previewName.textContent = file.name;

        const previewMeta = document.createElement('div');
        previewMeta.className = 'preview-meta';
        
        const sizeElement = document.createElement('span');
        sizeElement.className = 'preview-size';
        sizeElement.textContent = formatFileSize(file.size);
        const typeElement = document.createElement('span');
        typeElement.className = 'preview-type';
        typeElement.textContent = file.type || 'Unknown';

        const previewRemove = document.createElement('button');
        previewRemove.className = 'preview-remove';
        previewRemove.onclick = () => removeFileFromPreview(index);
        previewRemove.textContent = '✕ Delete';


        previewMeta.appendChild(sizeElement);
        previewMeta.appendChild(typeElement);

        previewInfo.appendChild(previewName);
        previewInfo.appendChild(previewMeta);

        previewItem.appendChild(previewIcon);
        previewItem.appendChild(previewInfo);
        previewItem.appendChild(previewRemove);
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

window.removeFileFromPreview = removeFileFromPreview;
window.clearSelectedFiles = clearSelectedFiles;

//======================================Filter-Funcs==================================

function filterFiles(name){
    const searchLower = name.trim().toLowerCase();
    if(searchLower === ''){
        state.filteredFiles = state.files;
        state.filteredDirs = state.dirs;
        displayFiles();
        displayDirs();
        return;
    }
    state.filteredFiles = state.files.filter(file => file.name.toLowerCase().includes(searchLower));
    state.filteredDirs = state.dirs.filter(dir => dir.name.toLowerCase().includes(searchLower));
    displayFiles();
    displayDirs();
}

async function pathReduceLevel() {
    state.currentDirEntity.pop();
    if (state.currentDir === '/cloud') {
        return;
    }

    const pathParts = state.currentDir.split('/').filter(part => part !== '');
    pathParts.pop();
    state.currentDir = '/' + pathParts.join('/');
    
    updatePathDisplay();
    await loadCurrentDirectory();
    displayFiles();
    displayDirs();
}

function updatePathDisplay() {
    const pathElement = document.getElementById('path');
    
    if (state.currentDir === '/cloud') {
        pathElement.textContent = '/cloud';
    } else {
        pathElement.textContent = `${state.currentDir}`;
    }
    
    if (state.currentDir === '/cloud') {
        pathElement.style.cursor = 'default';
    } else {
        pathElement.style.cursor = 'pointer';
    }
}

//===================================EVENT-LISTENERS====================================
document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const success = await uploadFile();
    if(success) {
        await listFiles();
        displayFiles();
        displayDirs();
        clearSelectedFiles();
    }
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
        const success = await createDirectory(dirName, password);
        if(success) {
            displayFiles();
            displayDirs();
        }
    } catch (error) {
        console.log('Directory creation cancelled');
    }
});

document.getElementById("path").addEventListener('click', function() {
    pathReduceLevel();
})


//==============================INITIALIZATION==============================

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated) {
        updateUIForLoggedInUser(currentUser);
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        updatePathDisplay();
        await listFiles();
        displayFiles();
        displayDirs();
    }
});