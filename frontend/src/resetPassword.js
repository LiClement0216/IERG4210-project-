let csrfToken = null;

async function initCsrf() {
  const res = await fetch('/csrf-token', { credentials: 'same-origin' });
  const data = await res.json();
  csrfToken = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('reset-form');
  const messageEl = document.getElementById('message');
  const tokenInput = document.getElementById('token');
  const csrfInput = document.querySelector('input[name="csrfToken"]');

  try {
    await initCsrf();
    csrfInput.value = csrfToken;
  } catch (err) {
    messageEl.textContent = 'Failed to load CSRF token.';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get('token');
  if (tokenFromUrl) {
    tokenInput.value = tokenFromUrl;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = document.getElementById('token').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          token,
          newPassword,
          confirmNewPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.error || 'Reset failed';
        return;
      }

      messageEl.textContent = data.message || 'Password reset successful';
      form.reset();
    } catch (err) {
      messageEl.textContent = 'Network error';
    }
  });
});