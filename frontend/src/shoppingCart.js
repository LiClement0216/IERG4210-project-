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
  pid = Number(pid);
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
    const product = products.find(p => Number(p.pid) === Number(item.pid));
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const subtotalElement = document.querySelector('.subtotal');
  if (subtotalElement) {
    subtotalElement.textContent = `subtotal = $${subtotal}`;
  }

  cartContainer.innerHTML = cart.map(item => {
    const product = products.find(p => Number(p.pid) === Number(item.pid));
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
            </a>
          </div>
          <p class="cartitemdescription"></p>
          <div>
            <p class="productprice">$</p>
          </div>
          <div class="quantitycontrol">
            <button class="quantityincrement"
                    data-pid="${item.pid}">+</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantitydecrement"
                    data-pid="${item.pid}">-</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  cartContainer.querySelectorAll('.quantityincrement').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.dataset.pid);
      const cart = loadCart();
      const item = cart.find(i => Number(i.pid) === pid);
      const newQty = (item ? item.quantity : 0) + 1;
      updateQuantity(pid, newQty);
      renderCart(products);
    });
  });

  cartContainer.querySelectorAll('.quantitydecrement').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.dataset.pid);
      const cart = loadCart();
      const item = cart.find(i => Number(i.pid) === pid);
      const newQty = (item ? item.quantity : 0) - 1;
      updateQuantity(pid, newQty);
      renderCart(products);
    });
  });

  const cartitemnames = cartContainer.querySelectorAll('.cartitemname');
  const cartitemdescriptions = cartContainer.querySelectorAll('.cartitemdescription');
  const cartitemprices = cartContainer.querySelectorAll('.productprice');
  cart.forEach((item, index) => {
    const product = products.find(p => Number(p.pid) === Number(item.pid));
    if (product) {
      if (cartitemnames[index]) cartitemnames[index].textContent = product.name || '';
      if (cartitemdescriptions[index]) cartitemdescriptions[index].textContent = product.description || '';
      if (cartitemprices[index]) cartitemprices[index].textContent = `$${product.price}` || '';
    }
  });
}

export function removeFromCart(pid) {
  pid = Number(pid);
  let cart = loadCart();
  cart = cart.filter(item => item.pid !== pid);
  saveCart(cart);
  alert('Removed from cart!');
}

export function updateQuantity(pid, quantity) {
  pid = Number(pid);
  quantity = Number(quantity);
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