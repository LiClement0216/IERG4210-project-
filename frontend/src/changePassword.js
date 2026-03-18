let csrfToken = null;

async function initCsrf() {
  const res  = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken  = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async() => {
  await initCsrf();
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmNewPasswordInput = document.getElementById('confirm-new-password');
  const passError = document.getElementById('password-error');
  const form = document.getElementById('change-password-form');

  confirmNewPasswordInput.addEventListener('blur', () => {
      if (newPasswordInput.value !== confirmNewPasswordInput.value && newPasswordInput.value !== '') {
          passError.style.display = 'block';
      } else {
          passError.style.display = 'none';
      }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;
    if (newPassword !== confirmNewPassword) {
      passError.style.display = 'block';
      return;
    }

    fetch('/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
    }).then(res => {
      if (res.ok) {
        alert('Password successfully changed! You will now be logged out.');
        window.location.href = '/login.html';
      } else {
        res.text().then(data => {
          alert('Failed to change password: ' + data);
        });
      } 
    }).catch(err => {
      console.error(err);
      alert('An error occurred.');
    });
  });
});

