export function showConfirmDialog(message = "Are you sure?") {
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

export function showPasswordPrompt(message = "Enter password:") {
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

export function showCreateDirPrompt() {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('createDirModal');
    const nameInput = document.getElementById('dirNameInput');
    const passwordInput = document.getElementById('dirPasswordInput');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    
    //Show modal
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    nameInput.focus();
    
    //Event Handlers
    const handleConfirm = () => {
      const dirName = nameInput.value.trim();
      const password = passwordInput.value.trim();
      
      if (dirName) {
        cleanup();
        resolve({ dirName, password });
      } else {
        nameInput.style.borderColor = 'var(--error-color)';
        nameInput.focus();
      }
    };
    
    const handleCancel = () => {
      cleanup();
      reject(new Error('User cancelled'));
    };
    
    const cleanup = () => {
      modal.style.display = 'none';
      modal.classList.add('hidden');
      nameInput.value = '';
      passwordInput.value = '';
      nameInput.style.borderColor = '';
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      nameInput.removeEventListener('keypress', handleKeypress);
      backdrop.removeEventListener('click', handleCancel);
    };
    
    const handleKeypress = (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') handleCancel();
    };
    
    const backdrop = modal.querySelector('.modal-backdrop');
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    nameInput.addEventListener('keypress', handleKeypress);
    backdrop.addEventListener('click', handleCancel);
  });
}

export function showActionDropDown(dropdownDiv){
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
    
    dropdownDiv.classList.toggle('hidden');
}