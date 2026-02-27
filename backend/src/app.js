const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());
const staticsDir = path.join(__dirname, '..', '..', 'frontend', 'statics');
const frontRoot  = path.join(__dirname, '..', '..', 'frontend');

app.use('/html', express.static(path.join(staticsDir, 'html')));
app.use('/css',  express.static(path.join(staticsDir, 'css')));
app.use('/img',  express.static(path.join(staticsDir, 'img')));
app.use('/src',  express.static(path.join(frontRoot, 'src')));
const htmlDir = path.join(staticsDir, 'html');



app.get('/', (req, res) => {
  res.sendFile(path.join(htmlDir, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(htmlDir, 'index.html'));
});

app.get('/cakes/:filename', (req, res) => {
  const filename = req.params.filename;             
  res.sendFile(path.join(htmlDir, 'cakes', filename));
});

app.get('/categories/:filename', (req, res) => {
  const filename = req.params.filename;             
  res.sendFile(path.join(htmlDir, 'categories', filename));
});

app.get('/macarons/:filename', (req, res) => {
  const filename = req.params.filename;             
  res.sendFile(path.join(htmlDir, 'macarons', filename));
});





app.get('/categoriesCRUD', (req, res) => {
  res.redirect('/html/admin/categoriesCRUD.html');
});
app.get('/productsCRUD', (req, res) => {
  res.sendFile(path.join(htmlDir, 'admin', 'productsCRUD.html'));
});







app.get('/categoriesR', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM categories').all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

app.get('/productsR', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT p.pid,
             p.catid,
             p.name,
             p.description,
             p.price,
             c.name AS categoryName
      FROM products p
      JOIN categories c ON p.catid = c.catid
    `).all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});






app.get('/categoriesU', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM categories').all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});
app.put('/products/:pid', (req, res) => {
  const pid = req.params.pid;
  const { catid, name, description, price } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE products
      SET catid = @catid,
          name = @name,
          description = @description,
          price = @price
      WHERE pid = @pid
    `);

    const info = stmt.run({ pid, catid, name, description, price });

    if (info.changes === 0) {
      return res.status(404).send('Product not found');
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});












const PORT = 80;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});