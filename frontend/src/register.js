let csrfToken = null;

async function initCsrf() {
  const res  = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken  = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async() => {
  await initCsrf();
  loadData();
});

async function loadData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('/productsR'),
      fetch('/categoriesR')
    ]);

    const products = await productsRes.json();
    const categories = await categoriesRes.json();
    const nextCatid =
    categories.length === 0 ? 1 : Math.max(...categories.map(c => c.catid)) + 1;
    renderCategories(categories, nextCatid);
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  const csrfTokenInput = document.querySelector('input[name="csrfToken"]');
  csrfTokenInput.value = csrfToken;
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ username, password, csrfToken, confirmPassword })
  }).then(res => {
    if (res.ok) {
      alert('Registration successful! Please log in.');
      window.location.href = '/login.html';
    } else {
      res.json().then(data => {
        alert('Registration failed: ' + data.message);
      });
    } 
  }).catch(err => {
    console.error(err);
    alert('An error occurred during registration.');
  });
});