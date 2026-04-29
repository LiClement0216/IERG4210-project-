let csrfToken = null;

async function initCsrf() {
  const res  = await fetch('/csrf-token', { credentials: 'include' });
  const data = await res.json();
  csrfToken  = data.csrfToken;
}

document.addEventListener('DOMContentLoaded', async() => {
  await initCsrf();
  loadData();
});

async function loadData() {
  try {
    const res = await fetch('/member/orders/data', { credentials: 'include' });
    if (!res.ok) {
      throw new Error('Failed to load orders');
    }

    const orders = await res.json();
    const tbody = document.querySelector('#orders-history-body');
    tbody.innerHTML = '';

    for (const order of orders) {
      const tr = document.createElement('tr');

      const items = JSON.parse(order.items_json || '[]');
      const itemsText = items
        .map(i => `PID ${i.pid} x${i.quantity} @ ${i.price}`)
        .join(', ');

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

document.addEventListener('DOMContentLoaded', loadData);