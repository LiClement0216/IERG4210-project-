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
    const nextPid =
    products.length === 0 ? 1 : Math.max(...products.map(p => p.pid)) + 1;
    renderProducts(products, categories, nextPid);
  } catch (err) {
    console.error(err);
  }
}

function renderProducts(rows, categories, nextPid) {
  const tbody = document.getElementById('product-table-body');

  const existingRowsHtml = rows.map(p => {
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
          <select name="catid" class="category">${categoryOptions}</select>
        </td>

        <td>
          <input type="text" 
            name="name" value="${p.name}"
            class="name"
            required
            minlength="1"
            maxlength="50"
            pattern="[A-Za-z0-9 ,.'-]{1,50}">
        </td>

        <td>
          <textarea name="description" 
            rows="2" 
            class="description" 
            maxlength="600"
            pattern="[A-Za-z0-9 ,.'-]{0,600}">${p.description}</textarea>
        </td>

        <td>
          <input type="number"
            name="price"
            step="0.01"
            min="0"
            value="${p.price}"
            class="price"
            required
            min="0"
            step="0.01">
        </td>

        <td>
          <input type="file" name="image" accept="image/png,image/jpeg,image/gif,image/webp" class="files">
        </td>

        <td>
          <button class="save-btn" onclick="saveProductHandler(${p.pid})">Save</button>
          <button class="delete-btn" onclick="deleteProductHandler(${p.pid})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  const categoryOptionsForNew = categories.map(c => `
    <option value="${c.catid}">${c.name}</option>
  `).join('');

  const newRowHtml = `
    <tr data-pid="new">
      <td>${nextPid}</td>

      <td>
        <select class="category">
          <option value="">-- select --</option>
          ${categoryOptionsForNew}
        </select>
      </td>

      <td>
        <input type="text"
        class="name"
        value=""
        required
        minlength="1"
        maxlength="50"
        pattern="[A-Za-z0-9 ,.'-]{1,50}"
        placeholder="Product name">
      </td>

      <td>
        <textarea class="description"
        rows="2"
        value=""
        maxlength="600"
        pattern="[A-Za-z0-9 ,.'-]{0,600}"
        placeholder="Product description"></textarea>
      </td>

      <td>
        <input type="number"
        class="price"
        step="0.01"
        min="0"
        required
        value=""
        placeholder="Price">
      </td>

      <td>
        <input type="file" class="files" accept="image/*">
      </td>

      <td>
        <button onclick="createProductHandler('new')" class="create-btn">Create</button>
      </td>
    </tr>
  `;

  tbody.innerHTML = existingRowsHtml + newRowHtml;
}








async function saveProductHandler(pid) {
  const confirmSave = confirm('Are you sure you want to save changes?');
  if (!confirmSave) {
    return;
  }
  const tr = document.querySelector(`tr[data-pid="${pid}"]`);

  const catid = tr.querySelector('.category').value;
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;
  const price = tr.querySelector('.price').value;
  const imageInput = tr.querySelector('.files');
  const imageFile = imageInput.files[0];


  if (!isSafeText(name, 1, 50)) {
    alert('Name must be 1-50 characters and cannot contain < or >');
    return;
  }
  if(!catid) {
    alert('Category must be selected');
    return;
  }
  if (description && !isSafeText(description, 0, 600)) {
    alert('Description must be 0-600 characters and cannot contain < or >');
    return;
  }
  if (!isSafePrice(price)) {
    alert('Price must be a valid number >= 0');
    return;
  }
  const formData = new FormData();
  formData.append('catid', catid);
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', price);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const res = await fetch(`/products/${pid}`, {
      method: 'PUT',
      body: formData
    });
    loadData();
    if (!res.ok) {
      alert('Update failed');
      return;
    }
  } catch (err) {
    console.error(err);
    alert('Network error');
  }
}

function deleteProductHandler(pid){
  const confirmDelete = confirm('Are you sure you want to delete this product?');
  if (!confirmDelete) {
    return;
  }
  fetch(`/products/${pid}`, {
    method: 'DELETE'
  }).then(res => {
    if (!res.ok) {
      alert('Delete failed');
      return;
    }
    loadData();
  }).catch(err => {
    console.error(err);
    alert('Network error');
  });
}

function createProductHandler(pid){
  const confirmCreate = confirm('Are you sure you want to create this product?');
  if (!confirmCreate) {
    return;
  }
  const tr = document.querySelector(`tr[data-pid="${pid}"]`);
  
  const catid = tr.querySelector('.category').value;
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;
  const price = tr.querySelector('.price').value;
  const imageInput = tr.querySelector('.files');
  const imageFile = imageInput.files[0];
  
  if (!isSafeText(name, 1, 50)) {
    alert('Name must be 1-50 characters and cannot contain < or >');
    return;
  }
  if(!catid) {
    alert('Category must be selected');
    return;
  }
  if (description && !isSafeText(description, 0, 600)) {
    alert('Description must be 0-600 characters and cannot contain < or >');
    return;
  }
  if (!isSafePrice(price)) {
    alert('Price must be a valid number >= 0');
    return;
  }

  const formData = new FormData();
  formData.append('catid', catid);
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', price);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  fetch('/products', {
    method: 'POST',
    body: formData
  }).then(res => {
    loadData();
    if (!res.ok) {
      alert('Create failed');
      return;
    }
  }).catch(err => {
    console.error(err);
    alert('Network error');
  });
}

function isSafeText(value, minLen, maxLen) {
  const v = value.trim();
  if (v.length < minLen || v.length > maxLen) return false;
  if (/[<>]/.test(v)) return false;
  return true;
}

function isSafePrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  return n >= 0 && n <= 9999;
}