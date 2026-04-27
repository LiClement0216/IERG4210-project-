let csrfToken = null;

async function initCsrf() {
  const res  = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken  = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async() => {
  await initCsrf();
});

function isSafeText(value) {
  const v = value.trim();
  if (v.length < 1 || v.length > 50) return false;
  if (/[<>]/.test(v)) return false;
  return true;
}
function isEmail(value) {
  const v = value.trim();
  if (v.length < 3 || v.length > 50) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  return emailRegex.test(v);
}

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const passError = document.getElementById('password-error');
const userError = document.getElementById('username-error');
usernameInput.addEventListener('blur', () => {
    if (!isEmail(usernameInput.value) && usernameInput.value !== '') {
        userError.style.display = 'block';
    } else {
        userError.style.display = 'none';
    }
});
confirmInput.addEventListener('blur', () => {
    if (passwordInput.value !== confirmInput.value && confirmInput.value !== '') {
        passError.style.display = 'block';
    } else {
        passError.style.display = 'none';
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await initCsrf();
  const username = usernameInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;
  if (password !== confirmPassword) {
    passError.style.display = 'block';
    return;
  }
  if (!isEmail(usernameInput.value)) { 
    userError.style.display = 'block';
    return;
  }
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ username, password, confirmPassword })
  }).then(res => {
    if (res.ok) {
      alert('Registration successful! Please log in.');
      window.location.href = '/login.html';
    } else {
      res.text().then(data => {
        alert('Registration failed: ' + data);
      });
    } 
  }).catch(err => {
    console.error(err);
    alert('An error occurred during registration.');
  });
});