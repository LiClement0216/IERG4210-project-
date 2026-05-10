let csrfToken = null;

async function initCsrf() {
  const res = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async () => {
  await initCsrf();

  const form = document.getElementById('otp-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const otp = document.getElementById('OTP').value.trim();

    try {
      const res = await fetch('/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ otp, csrfToken })
      });

      const data = await res.json();

      if (!res.ok) {
        alert('OTP verification failed: ' + (data.error || data.message || 'Unknown error'));
        return;
      }

      if (data.isAdmin === 1) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong during OTP verification.');
    }
  });
});