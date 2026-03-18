import { addToCartHandler, renderCart, removeFromCart, updateQuantity } from './shoppingCart.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const catid = params.get('catid');
  const pid   = params.get('pid');
  if (!catid || !pid) return;

  loadData(catid, pid);

  const cartIcon = document.querySelector('.shoppingcart i');
  const cartContainer = document.querySelector('.shoppingcart');

  if (cartIcon && cartContainer) {
    cartIcon.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault(); 
        cartContainer.classList.toggle('show-cart');
        
        const authLinks = document.getElementById('auth-links');
        if (authLinks && authLinks.classList.contains('show-menu')) {
            authLinks.classList.remove('show-menu');
        }
      }
    });
  }
});

async function loadData(catid, pid) {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('/productsR'),
      fetch('/categoriesR')
    ]);

    const products   = await productsRes.json();
    const categories = await categoriesRes.json();

    renderCategories(categories);
    renderContent(products, categories, catid, pid);

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

async function renderContent(products, categories, catid, pid) {
  const category = categories.find(c => String(c.catid) === String(catid));
  const product  = products.find(p => String(p.pid) === String(pid));

  const descContainer = document.querySelector('.descriptioncontainer');
  const sliderColumn  = document.querySelector('.slidercolumn');

  if (category) {
    const breadcrumbLis = document.querySelector('nav ol').querySelectorAll('li');
    if (breadcrumbLis[2]) {
      breadcrumbLis[2].innerHTML =
        `<a href="/html/main.html?catid=${category.catid}" class="categorylink">
           <span class="crumb-cat-name"></span>
         </a>`;
      const span = breadcrumbLis[2].querySelector('.crumb-cat-name');
      if (span) span.textContent = category.name;
    }
  }

  if (!product || !category || category.catid !== product.catid) {
    document.querySelector('main').innerHTML =
      '<p>Product and category do not match.</p>';
    return;
  }

  const breadcrumbLis = document.querySelector('nav ol').querySelectorAll('li');
  if (breadcrumbLis[4]) {
    breadcrumbLis[4].innerHTML =
      `<a href="/html/products.html?catid=${category.catid}&pid=${product.pid}" class="categorylink">
         <span class="crumb-prod-name"></span>
       </a>`;
    const span = breadcrumbLis[4].querySelector('.crumb-prod-name');
    if (span) span.textContent = product.name;
  }

  

  descContainer.innerHTML = `
    <h2 class="producttitle"></h2>
    <p class="productdescription"></p>
    <p class="productprice">$</p>
    <button class="addToCart" data-pid="${product.pid}">Add to Cart</button>
  `;
  const productName = descContainer.querySelector('.producttitle');
  const productDescription = descContainer.querySelector('.productdescription');
  const productPrice = descContainer.querySelector('.productprice');
  if (productName) productName.textContent = product.name || '';
  if (productDescription) productDescription.textContent = product.description || '';
  if (productPrice) productPrice.textContent = `$${product.price}` || '';
  document.querySelector('.addToCart').addEventListener('click', () => {
    addToCartHandler(product.pid);
    renderCart(products);
  });


  try {
    const res = await fetch(`/products/${pid}/images`);
    const files = await res.json();

    if (!Array.isArray(files) || files.length === 0) {
      sliderColumn.innerHTML = '<p>No images for this product.</p>';
      return;
    }

    const base = `/img/products/${pid}`;

    const sliderHtml = `
      <div class="imageslider">
        ${files.map((file, index) => `
          <img id="slider${index + 1}" src="${base}/${file}" alt="${product.name} image ${index + 1}">
        `).join('')}
      </div>
      <div class="slidernavigation">
        ${files.map((_, index) => `
          <a href="#slider${index + 1}"></a>
        `).join('')}
      </div>
      <div class="productimagelist">
        ${files.map((file, index) => `
          <div class="productimageitem">
            <a href="#slider${index + 1}">
              <img src="${base}/${file}" alt="${product.name} thumb ${index + 1}">
            </a>
          </div>
        `).join('')}
      </div>
    `;

    sliderColumn.innerHTML = sliderHtml;
  } catch (err) {
    console.error('Failed to load product images', err);
  }
}

window.addToCartHandler = addToCartHandler;