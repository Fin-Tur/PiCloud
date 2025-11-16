import {
    showPasswordPrompt,
    showConfirmDialog
} from './utils.js';

//======================================Vars======================================
export const state = {
    files: [],
    filteredFiles: [],
    dirs: [],
    filteredDirs: [],
    currentDir: "/cloud",
    currentDirEntity: []
};
//======================================File-funcs======================================

export async function listFiles() {
    try{
        const response = await fetch('/api/files/list', {
            credentials: 'include'
        });
        if (response.ok) {
            state.files = await response.json();
            state.filteredFiles = state.files;
        } else {
            console.error('Error fetching files:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching files:', error);
    }
    await listDirs();
}

export async function moveFileToDir(fileId, dirId){
                
            try {
                const moveResponse = await fetch(`/api/dirs/move/${fileId}/${dirId}`, {
                    method: 'POST',
                    credentials: 'include'
                });
                        
                if (!moveResponse.ok) {
                    console.error(`Failed to move file ${fileId} to directory`);
                }
            } catch (moveError) {
                console.error(`Error moving file ${fileId}:`, moveError);
            }
            
}

export async function uploadFile() {
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
            console.log(state.currentDirEntity.at(-1));
            if(state.currentDirEntity.length != 0){
                const activeDirId = state.currentDirEntity[state.currentDirEntity.length - 1].id;
                
                for(const file of uploadedFiles) {
                    await moveFileToDir(file.id, activeDirId);
                }
            }
            
            alert('Files uploaded successfully!');
            await listFiles();
            return true;
        }else{
            alert('Error uploading files:'  + response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('Error uploading files: ' + error.message);
        return false;
    }
}

export async function downloadFile(file) {
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
            URL.revokeObjectURL(url);
        }else{
            alert('Error downloading file: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file: ' + error.message);
    }
}

export async function fileEnDecryption(fileId) {
    try{
        let password;
        try {
            password = await showPasswordPrompt("Enter the password for encryption/decryption:");
        } catch (error) {
            return;
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

export async function fileDeCompression(fileId){
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

export async function deleteFile(fileId) {
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

//======================================Dir-funcs======================================

export async function onDirClick(dir){
    try{
        let password = "unprotected";
        if(dir.protected){
            console.log("Prot");
            password = await showPasswordPrompt("Enter password to unlock protected Dir");
        }

        state.currentDirEntity.push(dir);
        const response = await fetch(`/api/dirs/getFiles/${dir.id}`, {
            method: 'POST',
            body : password,
            headers: { 'Content-Type': 'text/plain' },
            credentials: 'include'
        });
        if(response.ok){
            const dirFiles = await response.json();
            state.currentDir += "/"+dir.name;
            state.files = dirFiles;
            state.filteredFiles = dirFiles;
            document.getElementById("path").innerHTML=state.currentDir;
        }else{
            console.error('Error fetching dir files:', response.statusText);
            alert('Error loading directory files');
        }
    }catch (error) {
        console.error('Error fetching dir files:', error);
        alert('Error loading directory files: ' + error.message);
    }
}

export async function listDirs(){
    try{
        const response = await fetch('api/dirs/list', {
            credentials: 'include'
        });
        if(response.ok){
            state.dirs = await response.json();
            state.filteredDirs = state.dirs;
        }else{
            console.error('Error fetching dirs:', response.statusText);
        }
    }catch (error) {
        console.error('Error fetching files:', error);
    }
}


export async function createDirectory(dirName, password) {
    try {
        const formData = new FormData();
        formData.append('dirName', dirName);
        if (password) {
            formData.append('password', password);
        }else{
            formData.append('password', 'unprotected');
        }
        
        const response = await fetch('/api/dirs/create', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Directory "${dirName}" created successfully!`);
            await listFiles();
            return true;
        } else {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            alert('Error creating directory: ' + errorText);
            return false;
        }
    } catch (error) {
        console.error('Error creating directory:', error);
        alert('Error creating directory: ' + error.message);
        return false;
    }
}

export async function deleteDir(id){
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
    let pathParts = state.currentDir.split('/');
    let dirName = pathParts.at(-1);
        
    if(dirName === 'cloud'){
        return null;
    }

    return dirName;
}

export async function loadCurrentDirectory() {
    try {
        const dir = getCurrentDir();
        if(dir == null) {
            await listFiles();
            return;
        }
        const response = await fetch(`/api/dirs/getFilesByName/${dir}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            state.files = data.files || [];
            state.filteredFiles = state.files;
        }
    } catch (error) {
        console.error('Error loading directory:', error);
    }
}