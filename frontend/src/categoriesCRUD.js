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
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('/productsR'),
      fetch('/categoriesR')
    ]);

    const products = await productsRes.json();
    const categories = await categoriesRes.json();
    const nextCatid =
    categories.length === 0 ? 1 : Math.max(...categories.map(c => c.catid)) + 1;
    renderCategories(categories, nextCatid);
  } catch (err) {
    console.error(err);
  }
}

function renderCategories(rows, nextCatid) {
  const tbody = document.getElementById('categories-table-body');

  const existingRowsHtml = rows.map(c => {
    return`
      <tr data-catid="${c.catid}">
        <td>
          ${c.catid}
        </td>
        <td>
          <input type="text"
            name="name" 
            value="${c.name}"
            required
            minlength="1"
            maxlength="50"
            pattern="[A-Za-z0-9 ,.'\-]{1,50}"
            class="name">
        </td>
        <td>
          <input type="text"
            name="description"
            value="${c.description}"
            maxlength="200"
            pattern="[A-Za-z0-9 ,.'\-]{0,200}"
            class="description">
        </td>
        <td> 
          <button class="save-btn" data-catid="${c.catid}">Save</button>
          <button class="delete-btn" data-catid="${c.catid}">Delete</button>
        </td>
      </tr>
    `
  }).join('');

  const newRowHtml = `
    <tr data-catid="new">

      <td>
        ${nextCatid}
      </td>
      
      <td>
        <input type="text"
        class="name"
        value=""
        required
        minlength="1"
        maxlength="50"
        pattern="[A-Za-z0-9 ,.'\-]{1,50}"
        placeholder="Category name">
      </td>

      <td>
        <input type="text"
        class="description"
        value=""
        maxlength="200"
        pattern="[A-Za-z0-9 ,.'\-]{0,200}"
        placeholder="Category description">
      </td>

      <td>
        <button data-catid="new" class="create-btn">Create</button>
      </td>
    </tr>
  `;

  tbody.innerHTML = existingRowsHtml + newRowHtml;


  tbody.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catid = btn.closest('tr').dataset.catid;
      saveCategoriesHandler(Number(catid));
    });
  });

  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catid = btn.closest('tr').dataset.catid;
      deleteCategoriesHandler(Number(catid));
    });
  });

  tbody.querySelectorAll('.create-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      createCategoriesHandler('new');
    });
  });
}








async function saveCategoriesHandler(catid) {
  const confirmSave = confirm('Are you sure you want to save changes?');
  if (!confirmSave) {
    return;
  }
  const tr = document.querySelector(`tr[data-catid="${catid}"]`);
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;
  if (!isSafeText(name, 1, 50)) {
    alert('Invalid category name');
    return;
  }
  if (!isSafeText(description, 0, 200)) {
    alert('Invalid category description');
    return;
  }
  try {
    const res = await fetch(`/categories/${catid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, description, csrfToken })
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

function deleteCategoriesHandler(catid){
  const confirmDelete = confirm('Are you sure you want to delete this category?');
  if (!confirmDelete) {
    return;
  }
  fetch(`/categories/${catid}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ csrfToken })
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

function createCategoriesHandler(catid){
  const confirmCreate = confirm('Are you sure you want to create this category?');
  if (!confirmCreate) {
    return;
  }
  const tr = document.querySelector(`tr[data-catid="${catid}"]`);
  
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;
  
  if (!isSafeText(name, 1, 50)) {
    alert('Invalid category name');
    return;
  }
  if (!isSafeText(description, 0, 200)) {
    alert('Invalid category description');
    return;
  }

  fetch('/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ name, description, csrfToken })
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
