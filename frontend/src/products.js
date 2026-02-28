document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const catid = params.get('catid');
  const pid   = params.get('pid');
  if (!catid || !pid) return;

  loadData(catid, pid);
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

async function renderContent(products, categories, catid, pid) {
  const category = categories.find(c => String(c.catid) === String(catid));
  const product  = products.find(p => String(p.pid) === String(pid));

  const descContainer = document.querySelector('.descriptioncontainer');
  const sliderColumn  = document.querySelector('.slidercolumn');
  const breadcrumbLis = document.querySelector('nav ol').querySelectorAll('li');

  if (category) {
    document.querySelectorAll('li')[2].innerHTML = `<a href="/html/main.html?catid=${category.catid}" class="categorylink">${category.name}</a>`;
  }

  if (!product || !category || category.catid !== product.catid) {
    document.querySelector('main').innerHTML =
      '<p>Product and category do not match.</p>';
    return;
  }

  document.querySelectorAll('li')[4].innerHTML = `<a href="/html/products.html?catid=${category.catid}&pid=${product.pid}" class="categorylink">${product.name}</a>`;

  

  descContainer.innerHTML = `
    <h2>${product.name}</h2>
    <p>${product.description || ''}</p>
    <p class="productprice">$${product.price}</p>
    <button class="addToCart">Add to Cart</button>
  `;

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