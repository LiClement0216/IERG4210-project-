import { addToCartHandler, renderCart, removeFromCart, updateQuantity } from './shoppingCart.js';

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

    const products   = await productsRes.json();
    const categories = await categoriesRes.json();
    
    renderCart(products);

    window.addToCartHandler = (pid) => {
      addToCartHandler(pid);
      renderCart(products);
    };

    window.updateQuantity = (pid, qty) => {
      updateQuantity(pid, qty);
      renderCart(products);
    };

    window.removeFromCart = (pid) => {
      removeFromCart(pid);
      renderCart(products);
    };

    renderCategories(categories);
    renderContent(products, categories, catid);
  } catch (err) {
    console.error(err);
  }
}

function renderCategories(rows) {
  const lbody = document.querySelector('.categorieslist');

  const html = rows.map(c => `
    <li>
      <a href="/html/main.html?catid=${c.catid}">
        <div>${c.name}</div>
      </a>
    </li>
  `).join('');

  lbody.innerHTML = html;
}

function renderContent(products, categories, catid) {
  const category = categories.find(c => String(c.catid) === String(catid));
  const filtered = products.filter(p => String(p.catid) === String(catid));

  const desc        = document.querySelector('.categorydescription');
  const productList = document.querySelector('.productlist');

  if (category) {
    let html = `<h1>${category.name}</h1>`;
    if (category.description) {
      html += `<p>${category.description}</p>`;
    }
    desc.innerHTML = html;

    const breadcrumbLis = document.querySelector('nav ol').querySelectorAll('li');
    if (breadcrumbLis[2]) {
      breadcrumbLis[2].innerHTML =
        `<a href="/html/main.html?catid=${category.catid}" class="categorylink">${category.name}</a>`;
    }
  }

  productList.innerHTML = filtered.map(p => `
    <div class="productitem">
      <a href="/html/products.html?catid=${p.catid}&pid=${p.pid}">
        <img src="/img/products/${p.pid}/thumb.jpg" alt="${p.name}">
      </a>
      <div>
        <div class="productname">
          <a href="/html/products.html?catid=${p.catid}&pid=${p.pid}">${p.name}</a>
        </div>
        <div>
          <p class="productprice">$${p.price}</p>
          <button class="addToCart" onclick="addToCartHandler(${p.pid})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No products in this category yet.</p>';
}
