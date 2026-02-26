const path = require('path');
const express = require('express');

const app = express();

const staticsDir = path.join(__dirname, '..', '..', 'frontend', 'statics');
app.use(express.static(staticsDir));

const htmlDir = path.join(staticsDir, 'html');
app.get('/', (req, res) => {
  res.sendFile(path.join(htmlDir, 'index.html'));
});

app.get('/cakes/cake:idx', (req, res) => {
  const idx = req.params.idx;             
  const file = `cake${idx}.html`;
  res.sendFile(path.join(htmlDir, 'cakes', file));
});

app.get('/categories/category:idx', (req, res) => {
  const idx = req.params.idx;             
  const file = `category${idx}.html`;
  res.sendFile(path.join(htmlDir, 'categories', file));
});

app.get('/macarons/macaron:idx', (req, res) => {
  const idx = req.params.idx;             
  const file = `macaron${idx}.html`;
  res.sendFile(path.join(htmlDir, 'macarons', file));
});




const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});