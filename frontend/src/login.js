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

