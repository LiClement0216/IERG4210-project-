const path = require('path');
const express = require('express');
const db = require('./db');
const fs = require('fs');
const fsp = fs.promises;
const multer = require('multer');
const app = express();
const sharp = require('sharp');
app.use(express.json());
const staticsDir = path.join(__dirname, '..', '..', 'frontend', 'statics');
const frontRoot  = path.join(__dirname, '..', '..', 'frontend');
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

app.use('/html', express.static(path.join(staticsDir, 'html')));
app.use('/css',  express.static(path.join(staticsDir, 'css')));
app.use('/img',  express.static(path.join(staticsDir, 'img')));
app.use('/src',  express.static(path.join(frontRoot, 'src')));
const htmlDir = path.join(staticsDir, 'html');


app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self' https://cdnjs.cloudflare.com data:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  next();
});

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




function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const categorySchema = Joi.object({
  name: Joi.string()
           .trim()
           .min(1)
           .max(50)
           .custom((value, helpers) => escapeHtml(value), 'escape HTML')
           .required(),
  description: Joi.string()
           .trim()
           .allow('')
           .max(200)
           .custom((value, helpers) => escapeHtml(value), 'escape HTML')
});


const productSchema = Joi.object({
  catid: Joi.number().integer().min(1).required(),
  name: Joi.string().trim().min(1).max(50)
           .custom((v) => escapeHtml(v), 'escape HTML')
           .required(),
  description: Joi.string().trim().allow('').max(600)
           .custom((v) => escapeHtml(v), 'escape HTML'),
  price: Joi.number().min(0).required()
});




app.put('/categories/:catid', (req, res) => {
  const catid = Number(req.params.catid);
  if (!Number.isInteger(catid) || catid <= 0) {
    return res.status(400).send('Invalid category id');
  }
  const data = {
    name: req.body.name,
    description: req.body.description
  };

  const { error, value } = categorySchema.validate(data);
  if (error) {
    return res.status(400).send('Invalid category data');
  }

  const { name, description } = value;

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
  const pid = Number(req.params.pid);
  if (!Number.isInteger(pid) || pid <= 0) {
    return res.status(400).send('Invalid product id');
  }

  const data = {
    catid: Number(req.body.catid),
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price)
  };

  const { error, value } = productSchema.validate(data);
  if (error) {
    return res.status(400).send('Invalid product data');
  }

  const { catid, name, description, price } = value;

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
  const data = {
    name: req.body.name,
    description: req.body.description
  };
  const { error, value } = categorySchema.validate(data);
  if (error) {
    return res.status(400).send('Invalid category data');
  }

  const { name, description } = value;

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
    cb(null, Date.now() + '.jpg');
  }
});

const uploadTemp = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/products', uploadTemp.single('image'), async (req, res) => {
  const data = {
    catid: Number(req.body.catid),
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price)
  };

  const { error, value } = productSchema.validate(data);
  if (error) {
    return res.status(400).send('Invalid product data');
  }
  const { catid, name, description, price } = value;

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

      const originalPath = req.file.path;
      const img1Path     = path.join(pidDir, '1.jpg');
      const thumbPath    = path.join(pidDir, 'thumb.jpg');

      await sharp(originalPath)
        .jpeg({ quality: 85 })
        .toFile(img1Path);

      await sharp(originalPath)
        .resize(150, 200, { fit: 'cover', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);

      await fsp.unlink(originalPath);
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
      /\.(png|jpe?g|gif|webp)$/i.test(name)&&name !== 'thumb.jpg'
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