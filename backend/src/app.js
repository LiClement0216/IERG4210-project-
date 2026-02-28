const path = require('path');
const express = require('express');
const db = require('./db');
const fs = require('fs');
const fsp = fs.promises;
const multer = require('multer');
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

app.get('/main.html', (req, res) => {
  res.sendFile(path.join(htmlDir, 'main.html'));
});

app.get('/products.html', (req, res) => {           
  res.sendFile(path.join(htmlDir, 'products.html'));
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
  res.sendFile(path.join(htmlDir, 'admin', 'categoriesCRUD.html'));
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












app.put('/categories/:catid', (req, res) => {
  const catid = req.params.catid;
  const { name, description } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE categories
      SET name = @name,
          description = @description
      WHERE catid = @catid
    `);

    const info = stmt.run({ catid, name, description });

    if (info.changes === 0) {
      return res.status(404).send('Category not found');
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});


const imgBaseDir = path.join(staticsDir, 'img');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pid = req.params.pid;
    const dir = path.join(imgBaseDir, 'products', pid);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const pid = req.params.pid;
    const dir = path.join(imgBaseDir, 'products', pid);

    const files = fs.readdirSync(dir).filter(name =>
      /\.(png|jpe?g|gif|webp)$/i.test(name)
    );
    const nextIndex = files.length + 1;
    cb(null, `${nextIndex}.jpg`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});


app.put('/products/:pid', upload.single('image'),(req, res) => {
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






app.delete('/categories/:catid', (req, res) => {
  const catid = req.params.catid;
  try {
    const stmt = db.prepare('DELETE FROM categories WHERE catid = ?');
    const info = stmt.run(catid);
    if (info.changes === 0) {
      return res.status(404).send('Category not found');
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});
app.delete('/products/:pid', async(req, res) => {
  const pid = req.params.pid;
  try {
    const stmt = db.prepare('DELETE FROM products WHERE pid = ?');
    const info = stmt.run(pid);
    if (info.changes === 0) {
      return res.status(404).send('Product not found');
    }
    const dir = path.join(imgBaseDir, 'products', String(pid));
    //console.log('Deleting folder:', dir);
    try {
      await fsp.rm(dir, { recursive: true, force: true });
    } catch (err) {
      console.error('Failed to delete image folder:', err);
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});





app.post('/categories', (req, res) => {
  const { name, description } = req.body; 
  try {
    const stmt = db.prepare(`
      INSERT INTO categories (name, description)
      VALUES (@name, @description)
    `);

    const info = stmt.run({name, description});

    if (info.changes === 0) {
      return res.status(400).send('Failed to create category');
    }

    res.status(201).send('Category created');
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});


const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(imgBaseDir, 'temp');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '.jpg'); // temp name
  }
});

const uploadTemp = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/products', uploadTemp.single('image'), async (req, res) => {
  const { catid, name, description, price } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO products (catid, name, description, price)
      VALUES (@catid, @name, @description, @price)
    `);
    const info = stmt.run({ catid, name, description, price });

    if (info.changes === 0) {
      return res.status(400).send('Failed to create product');
    }

    const newPid = info.lastInsertRowid;

    if (req.file) {
      const pidDir = path.join(imgBaseDir, 'products', String(newPid));
      if (!fs.existsSync(pidDir)) {
        fs.mkdirSync(pidDir, { recursive: true });
      }

      const existing = fs.readdirSync(pidDir).filter(name =>
        /\.(png|jpe?g|gif|webp)$/i.test(name)
      );
      const nextIndex = existing.length + 1;
      const destPath = path.join(pidDir, `${nextIndex}.jpg`);

      await fsp.rename(req.file.path, destPath);
    }

    res.status(201).send('Product created');
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).send('DB error');
  }
});




app.get('/products/:pid/images', (req, res) => {
  const pid = String(req.params.pid);
  const dir = path.join(imgBaseDir, 'products', pid);

  try {
    if (!fs.existsSync(dir)) {
      return res.json([]);
    }

    let files = fs.readdirSync(dir);
    files = files.filter(name =>
      /\.(png|jpe?g|gif|webp)$/i.test(name)
    );

    files.sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });

    res.json(files);
  } catch (err) {
    console.error('GET /products/:pid/images error:', err);
    res.status(500).send('Image listing error');
  }
});




















const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});