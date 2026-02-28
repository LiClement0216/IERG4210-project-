export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function loadCart() {
  const s = localStorage.getItem('cart');
  return s ? JSON.parse(s) : [];
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

export function addToCartHandler(pid) {
  const cart = loadCart();
  const existing = cart.find(item => item.pid === pid);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ pid, quantity: 1 });
  }
  saveCart(cart);
  alert('Added to cart!');
}

export function renderCart(products) {
  const cart = loadCart();
  const cartContainer = document.querySelector('.cartwrapper');
  if (!cartContainer) return;

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.pid === item.pid);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const subtotalElement = document.querySelector('.subtotal');
  if (subtotalElement) {
    subtotalElement.innerHTML = `subtotal = $${subtotal}`;
  }

  cartContainer.innerHTML = cart.map(item => {
    const product = products.find(p => p.pid === item.pid);
    if (!product) return '';

    const imgSrc = `/img/products/${product.pid}/thumb.jpg`;

    return `
      <div class="cartitem">
        <a href="/html/products.html?catid=${product.catid}&pid=${product.pid}">
          <img class="cartitemthumbnail" src="${imgSrc}" alt="${product.name} thumbnail">
        </a>
        <div>
          <div>
            <a class="cartitemname"
               href="/html/products.html?catid=${product.catid}&pid=${product.pid}">
              ${product.name}
            </a>
          </div>
          <p class="cartitemdescription">${product.description || ''}</p>
          <div>
            <p class="productprice">$${product.price}</p>
          </div>
          <div class="quantitycontrol">
            <button class="quantityincrement"
                    onclick="updateQuantity(${item.pid}, ${item.quantity + 1})">+</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantitydecrement"
                    onclick="updateQuantity(${item.pid}, ${item.quantity - 1})">-</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function removeFromCart(pid) {
  let cart = loadCart();
  cart = cart.filter(item => item.pid !== pid);
  saveCart(cart);
  alert('Removed from cart!');
}

export function updateQuantity(pid, quantity) {
  const cart = loadCart();
  const item = cart.find(item => item.pid === pid);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(pid);
        } else {
            saveCart(cart);
        }
    }
}