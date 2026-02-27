const path = require('path');
const express = require('express');

const app = express();

const staticsDir = path.join(__dirname, '..', '..', 'frontend', 'statics');
app.use(express.static(staticsDir));

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




const PORT = 80;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});