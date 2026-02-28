document.addEventListener('DOMContentLoaded', () => {
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
    renderCategories(categories);
  } catch (err) {
    console.error(err);
  }
}

function renderCategories(rows) {
    console.log('categories rows:', rows);
  const lbody = document.querySelector('.categorieslist');

  const existingRowsHtml = rows.map(c => {
    return`
      <li><a href="/main.html?catid=${c.catid}"><div>${c.name}</div></a></li>
    `
  }).join('');

  lbody.innerHTML = existingRowsHtml;
}