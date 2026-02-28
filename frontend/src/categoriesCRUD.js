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
          <input type="text" name="name" value="${c.name}" class="name">
        </td>
        <td>
          <input type="text" name="description" value="${c.description}" class="description">
        </td>
        <td> 
          <button class="save-btn" onclick="saveCategoriesHandler(${c.catid})">Save</button>
          <button class="delete-btn" onclick="deleteCategoriesHandler(${c.catid})">Delete</button>
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
        <input type="text" class="name" value="" placeholder="Category name">
      </td>

      <td>
        <input type="text" class="description" value="" placeholder="Category description">
      </td>

      <td>
        <button onclick="createCategoriesHandler('new')" class="create-btn">Create</button>
      </td>
    </tr>
  `;

  tbody.innerHTML = existingRowsHtml + newRowHtml;
}








async function saveCategoriesHandler(catid) {
  const confirmSave = confirm('Are you sure you want to save changes?');
  if (!confirmSave) {
    return;
  }
  const tr = document.querySelector(`tr[data-catid="${catid}"]`);
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;

  try {
    const res = await fetch(`/categories/${catid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
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

function createCategoriesHandler(catid){
  const confirmCreate = confirm('Are you sure you want to create this category?');
  if (!confirmCreate) {
    return;
  }
  const tr = document.querySelector(`tr[data-catid="${catid}"]`);
  
  const name = tr.querySelector('.name').value;
  const description = tr.querySelector('.description').value;

  fetch('/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description })
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