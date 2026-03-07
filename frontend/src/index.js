import { addToCartHandler, renderCart, removeFromCart, updateQuantity } from './shoppingCart.js';

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
  categoryNameElements.map((el, index) => {
    if (rows[index]) {
      el.textContent = rows[index].name;
      return el;
    }
  });
}