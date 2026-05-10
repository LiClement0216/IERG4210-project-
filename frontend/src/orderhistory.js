let csrfToken = null;

async function initCsrf() {
  const res = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
}

async function loadData() {
  try {
    const [ordersRes, authRes] = await Promise.all([
      fetch('/member/orders/data', { credentials: 'include' }),
      fetch('/auth/status', { credentials: 'include' })
    ]);

    if (!ordersRes.ok) {
      throw new Error('Failed to load orders');
    }

    const orders = await ordersRes.json();
    const authData = await authRes.json();

    const usernameElem = document.querySelector('.username');
    if (usernameElem && authData.loggedIn) {
      usernameElem.textContent = `${authData.username}`;
    }

    const tbody = document.querySelector('#orders-history-body');
    tbody.innerHTML = '';

    for (const order of orders) {
      const tr = document.createElement('tr');

      const itemsText = order.items
        .map(i => `${i.product_name} x${i.quantity} @ ${i.price}`)
        .join(',<br>');

      tr.innerHTML = `
        <td>${order.total}</td>
        <td>${order.currency}</td>
        <td>${order.payment_status}</td>
        <td>${itemsText}</td>
        <td>${order.created_at || ''}</td>
        <td>${order.paid_at || ''}</td>
      `;

      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error('loadOrders error:', err);
    alert('Failed to load orders');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initCsrf();
  loadData();
});