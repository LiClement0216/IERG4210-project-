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
    
    const waitForAuth = setInterval(() => {
      if (window.currentAppUser !== undefined) {
        clearInterval(waitForAuth);
        renderCart(products);
      }
    }, 50);

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
    console.log('categories rows:', rows);
  const lbody = document.querySelector('.categorieslist');

  const existingRowsHtml = rows.map(c => {
    return`
      <li><a href="/main.html?catid=${c.catid}"><div class="category-name"></div></a></li>
    `
  }).join('');

  lbody.innerHTML = existingRowsHtml;

  const categoryNameElements = lbody.querySelectorAll('.category-name');
  Array.from(categoryNameElements).map((el, index) => {
    if (rows[index]) {
      el.textContent = rows[index].name;
      return el;
    }
  });
}

function renderContent(products, categories, catid) {
  const category = categories.find(c => String(c.catid) === String(catid));
  const filtered = products.filter(p => String(p.catid) === String(catid));
 
  const desc = document.querySelector('.categorydescription');
  const productList = document.querySelector('.productlist');

  if (category && desc) {
    desc.innerHTML = 
      `<h1 class="category-title"></h1>
      <p class="category-des"></p>`;

    const categoryTitle = desc.querySelector('.category-title');
    const categoryDesc = desc.querySelector('.category-des');
    if (categoryTitle) {
      categoryTitle.textContent = category.name;
    }
    if (categoryDesc) {
      categoryDesc.textContent = category.description || '';
    }


    if(category){
      const breadcrumbs = document.querySelector('nav ol').querySelectorAll('li');
      if (breadcrumbs[2]) {
        breadcrumbs[2].innerHTML = `<a href="/html/main.html?catid=${category.catid}" class="categorylink"><span class="category-name"></span></a>`;
        const span = breadcrumbs[2].querySelector('.category-name');
        if (span) {
          span.textContent = category.name;
        }
      }
    }
  }

  productList.innerHTML = filtered.map(p => `
    <div class="productitem">
      <a href="/html/products.html?catid=${p.catid}&pid=${p.pid}">
        <img src="/img/products/${p.pid}/thumb.jpg" alt="${p.name}">
      </a>
      <div>
        <div class="productname">
          <a href="/html/products.html?catid=${p.catid}&pid=${p.pid}"></a>
        </div>
        <div class="productpricewrapper">
          <p class="productprice">$</p>
          <button class="addToCart" data-pid="${p.pid}">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('') || '<p>No products in this category yet.</p>';

  productList.querySelectorAll('.addToCart').forEach(btn => {
    const pid = Number(btn.getAttribute('data-pid'));
    btn.addEventListener('click', () => {
      addToCartHandler(pid);
      renderCart(products);
    });
  });

  const productNameElements = productList.querySelectorAll('.productname a');
  const productPriceElements = productList.querySelectorAll('.productprice');
  Array.from(productNameElements).map((el, index) => {
    if (filtered[index]) {
      el.textContent = filtered[index].name;
      return el;
    }});
  Array.from(productPriceElements).map((el, index) => {
    if (filtered[index]) {
      el.textContent = `$${filtered[index].price.toFixed(2)}`;
      return el;
    }
  });
}
