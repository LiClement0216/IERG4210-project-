let csrfToken = null;

async function initCsrf() {
  const res  = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken  = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async() => {
  await initCsrf();
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const csrfTokenInput = document.querySelector('input[name="csrfToken"]');
  csrfTokenInput.value = csrfToken;
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ username, password, csrfToken })
  }).then(async res => {
    if (res.ok) {
      const data = await res.json(); 
      alert('Login successful!');
      if(data.isAdmin === 1){
        window.location.href = '/admin';
      }
      else {window.location.href = '/';}
    } else {
        const errorText = await res.text(); 
        alert('Login failed: ' + errorText);
    }
  }).catch(err => {
    console.error(err);
  });
});
