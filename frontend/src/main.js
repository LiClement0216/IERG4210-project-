document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const catid = params.get('catid');
  if (!catid) return;

  loadData(catid);
});

async function loadData(catid) {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('/productsR'),
      fetch('/categoriesR')
    ]);

    const products = await productsRes.json();
    const categories = await categoriesRes.json();

    renderCategories(categories);
    renderContent(products, categories, catid);
  } catch (err) {
    console.error(err);
  }
}

function renderCategories(rows) {
  console.log('categories rows:', rows);
  const lbody = document.querySelector('.categorieslist');

  const existingRowsHtml = rows.map(c => `
    <li>
      <a href="/html/main.html?catid=${c.catid}">
        <div>${c.name}</div>
      </a>
    </li>
  `).join('');

  lbody.innerHTML = existingRowsHtml;
}

function renderContent(products, categories, catid) {
  console.log('products:', products);
  console.log('categories:', categories);

  const category = categories.find(c => String(c.catid) === String(catid));
  const filtered = products.filter(p => String(p.catid) === String(catid));

  const desc = document.querySelector('.categorydescription');
  const productList = document.querySelector('.productlist');

  if (category) {
    let html = `<h1>${category.name}</h1>`;
    html += `<p>${category.description}</p>`;

    desc.innerHTML = html;

    document.querySelectorAll('li')[2].innerHTML = `<a href="/main.html?catid=${category.catid}" class="categorylink">${category.name}</a>`;
  }

  productList.innerHTML = filtered.map(p => `
    <div class="productitem">
        <a href="/products.html?catid=${p.catid}&pid=${p.pid}">
            <img src="/img/products/${p.pid}/1.jpg" alt="${p.name}">
        </a>
        <div>
        <div class="productname">
          <a href="/cakes/cake${p.pid}.html">${p.name}</a>
        </div>
        <div>
          <p class="productprice">$${p.price}</p>
          <button class="addToCart">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No products in this category yet.</p>';
}