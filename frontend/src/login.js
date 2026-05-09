let csrfToken = null;

async function initCsrf() {
  const res = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async () => {
  await initCsrf();
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const csrfTokenInput = document.querySelector('input[name="csrfToken"]');
  csrfTokenInput.value = csrfToken;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, csrfToken })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('Login failed: ' + (data.error || data.message || 'Unknown error'));
      return;
    }

    window.location.href = '/otp.html';
  } catch (err) {
    console.error(err);
    alert('Something went wrong during login.');
  }
});