
//======VARIABLES======
let files = [];


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
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'file-actions';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-small btn-download';
        downloadBtn.textContent = '📥 Download';
        downloadBtn.addEventListener('click', () => downloadFile(file.id));
        
        const infoBtn = document.createElement('button');
        infoBtn.className = 'btn-small btn-info';
        infoBtn.textContent = 'ℹ️ Info';
        infoBtn.addEventListener('click', () => showFileInfo(file.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', () => deleteFile(file.id));
        
        actionsDiv.appendChild(downloadBtn);
        actionsDiv.appendChild(infoBtn);
        actionsDiv.appendChild(deleteBtn);
        
        fileItem.appendChild(iconDiv);
        fileItem.appendChild(contentDiv);
        fileItem.appendChild(actionsDiv);
        
        fileList.appendChild(fileItem);
    });
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

async function downloadFile(fileId) {
    try{
        const response = await fetch(`/api/files/download/${fileId}`);
        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `file_${fileId}`;
            
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

function showFileInfo(fileId) {
    console.log('Show info for file:', fileId);
    // TODO: Implement file info modal
}

async function deleteFile(fileId) {
    try{
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



//======INITIALIZATION======
listFiles();