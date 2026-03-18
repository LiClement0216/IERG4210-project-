const path = require('path');
const express = require('express');
const db = require('./db');
const fs = require('fs');
const fsp = fs.promises;
const multer = require('multer');
const app = express();
const sharp = require('sharp');
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
const session = require('express-session');
const crypto  = require('crypto');
const bcrypt = require('bcrypt');

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

app.use(express.json());
const staticsDir = path.join(__dirname, '..', '..', 'frontend', 'statics');
const frontRoot  = path.join(__dirname, '..', '..', 'frontend');
app.use('/html', express.static(path.join(staticsDir, 'html')));
app.use('/css',  express.static(path.join(staticsDir, 'css')));
app.use('/img',  express.static(path.join(staticsDir, 'img')));
app.use('/src',  express.static(path.join(frontRoot, 'src')));
const htmlDir = path.join(staticsDir, 'html');


app.use(session({
  name: 'dnd_auth_session',
  secret: 'hardcodedSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 3 * 24 * 60 * 60 * 1000,
    secure: false
  }
}));

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.username) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.status(401).send('Unauthorized. please login');
    }
    return res.redirect('/login.html');
  }
  
  if (req.session.isAdmin !== 1) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.status(403).send('Forbidden. Admins only');
    }
    return res.redirect('/');
  }
  next();
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  next();
});

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

function verifyCsrf(req, res) {
  const tokenFromRequest = req.headers['x-csrf-token'] || req.body.csrfToken;
  if (!tokenFromRequest || tokenFromRequest !== req.session.csrfToken) {
    res.status(403).send('Invalid CSRF token');
    return false;
  }
  return true;
}

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

app.get('/login.html', (req, res) => {           
  res.sendFile(path.join(htmlDir, 'login.html'));
});

app.get('/register.html', (req, res) => {           
  res.sendFile(path.join(htmlDir, 'register.html'));
});

app.get('/changePassword.html', (req, res) => {           
  res.sendFile(path.join(htmlDir, 'changePassword.html'));
});
/*
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
*/




app.get('/categoriesCRUD', requireAdmin,(req, res) => {
  res.sendFile(path.join(htmlDir, 'admin', 'categoriesCRUD.html'));
});
app.get('/productsCRUD', requireAdmin, (req, res) => {
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




app.put('/categories/:catid', requireAdmin,(req, res) => {
  if (!verifyCsrf(req, res)) return;
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


app.put('/products/:pid', requireAdmin,upload.single('image'),(req, res) => {
  if (!verifyCsrf(req, res)) return;
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






app.delete('/categories/:catid', requireAdmin, (req, res) => {
  if (!verifyCsrf(req, res)) return;
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
app.delete('/products/:pid', requireAdmin, async(req, res) => {
  if (!verifyCsrf(req, res)) return;
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





app.post('/categories', requireAdmin, (req, res) => {
  if (!verifyCsrf(req, res)) return;
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

app.post('/products', requireAdmin, uploadTemp.single('image'), async (req, res) => {
  if (!verifyCsrf(req, res)) return;
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





const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .custom((value) => escapeHtml(value), 'escape HTML')
    .required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

app.post('/register', (req, res) => {
  if (!verifyCsrf(req, res)) return;
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).send('Invalid input: ' + error.details[0].message);
  }
  const { username, password, confirmPassword } = value;
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(username);
    if (existingUser) {
      return res.status(400).send('Username already taken');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(username, hashedPassword);
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('DB error');
  }
});


app.post('/login', (req, res) => {
  if (!verifyCsrf(req, res)) return;
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(username); 
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }
    req.session.regenerate(err => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).send('Session error');
      }
      req.session.userId = user.userid;
      req.session.username = user.email;
      req.session.isAdmin = user.isAdmin === 1 ? 1 : 0;

      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).send('Session error');
        }        
        res.status(200).json({ 
          message: 'Login successful', 
          isAdmin: req.session.isAdmin
        });
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('DB error');
  }
});

app.get('/auth/status', (req, res) => {
  if (req.session && req.session.username) {
    res.json({ loggedIn: true, username: req.session.username, isAdmin: req.session.isAdmin });
  } else {
    res.json({ loggedIn: false, username: 'Guest', isAdmin: 0 });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).send('Logout error');
    } else {
      res.clearCookie('dnd_auth_session');
      res.json({ message: 'Logged out successfully' });
    }
  });
});


const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

app.put('/change-password',(req,res)=>{
  if(!verifyCsrf(req,res)) return;

  if(!req.session || !req.session.username){
    return res.status(401).send('Unauthorized. Please login.');
  }

  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).send('Invalid input: ' + error.details[0].message);
  }

  const { currentPassword, newPassword } = value;

  try{
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.session.username);

    if(!user || !bcrypt.compareSync(currentPassword, user.password)){
      return res.status(400).send('Current password is incorrect');
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedNewPassword, req.session.username);
    
    req.session.destroy(err => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).send('Password updated, but failed to log out.');
      }
      res.clearCookie('dnd_auth_session');
      res.status(200).send('Password successfully changed');
    });
  }catch (err) {
    console.error('Change password error:', err);
    res.status(500).send('Database error');
  }
})






const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});