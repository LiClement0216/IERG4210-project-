/*document.addEventListener('DOMContentLoaded', () => {
  fetch('/productsR')
    .then(res => res.json())
    .then(rows => {
      const tbody = document.getElementById('product-table-body');
      tbody.innerHTML = rows.map(p => `
        <tr>
          <td>${p.pid}</td>
          <td>${p.categoryName}</td>
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>${p.price}</td>
          <td>
            <button>Edit</button>
            <button>Delete</button>
          </td>
        </tr>
      `).join('');
    })
    .catch(console.error);
});

 */




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

    renderProducts(products, categories);
  } catch (err) {
    console.error(err);
  }
}

function renderProducts(rows, categories) {
  const tbody = document.getElementById('product-table-body');

  tbody.innerHTML = rows.map(p => {
    const categoryOptions = categories.map(c => `
      <option value="${c.catid}" ${c.catid === p.catid ? 'selected' : ''}>
        ${c.name}
      </option>
    `).join('');

    return `
      <tr data-pid="${p.pid}">
        <td>
          ${p.pid}
        </td>

        <td>
          <select name="catid" class="category">
            ${categoryOptions}
          </select>
        </td>

        <td>
          <input type="text" name="name" value="${p.name}" class="name">
        </td>

        <td>
          <textarea name="description" rows="2" class="description">${p.description}</textarea>
        </td>

        <td>
          <input type="number" name="price" step="0.01" min="0" value="${p.price}" class="price">
        </td>

        <td>
          <input type="file" name="image" accept="image/png,image/jpeg,image/gif,image/webp" class="files">
        </td>

        <td>
          <button class="save-btn" onclick="saveProductHandler(${p.pid})">Save</button>
          <button class="delete-btn">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function saveProductHandler(pid) {
  const tr = document.querySelector(`tr[data-pid="${pid}"]`);
  const catid = tr.querySelector('.category').value;
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;
  const price = parseFloat(tr.querySelector('.price').value);
  const imageInput = tr.querySelector('.files');
  const imageFile = imageInput.files[0];
  try {
    const res = await fetch(`/products/${pid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catid, name, description, price })
    });

    if (!res.ok) {
      alert('Update failed');
      return;
    }
    loadData();
  } catch (err) {
    console.error(err);
    alert('Network error');
  }
}