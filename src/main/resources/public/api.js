import {
    showPasswordPrompt,
    showConfirmDialog
} from './utils.js';

export let files = [];
export let filteredFiles = [];
export let dirs = [];
export let currentDir = "/cloud";
export let currentDirEntity = [];

export async function onDirClick(dir){
    try{
        currentDirEntity.push(dir);
        const response = await fetch(`/api/dirs/getFiles/${dir.id}`, {
            credentials: 'include'
        });
        if(response.ok){
            const dirFiles = await response.json();
            currentDir += "/"+dir.name;
            filteredFiles = dirFiles;
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

export async function listFiles() {
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
    listDirs();
    
}

export async function listDirs(){
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
            //clearSelectedFiles(); 
        }else{
            alert('Error uploading files:'  + response.statusText);
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('Error uploading files: ' + error.message);
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
            URL.revokeObjectURL(url);  // Memory cleanup
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

export async function createDirectory(dirName, password) {
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
    let pathParts = currentDir.split('/');
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
        }
    } catch (error) {
        console.error('Error loading directory:', error);
    }
}