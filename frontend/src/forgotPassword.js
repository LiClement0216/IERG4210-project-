let csrfToken = null;

async function initCsrf() {
  const res = await fetch('/csrf-token', { credentials: 'same-origin' });
  const data = await res.json();
  csrfToken = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('forgot-form');
  const messageEl = document.getElementById('message');
  const csrfInput = document.querySelector('input[name="csrfToken"]');

  try {
    await initCsrf();
    csrfInput.value = csrfToken;
  } catch (err) {
    messageEl.textContent = 'Failed to load CSRF token.';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();

    try {
      const res = await fetch('/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      messageEl.textContent = data.message || data.error || 'Request completed';
    } catch (err) {
      messageEl.textContent = 'Network error';
    }
  });
});