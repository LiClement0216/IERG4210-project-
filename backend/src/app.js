const path = require('path');
const express = require('express');

const app = express();

const htmlDir = path.join(__dirname, '..', '..', 'frontend', 'statics', 'html');
const staticDir = path.join(__dirname, '..', '..', 'frontend');

app.use(express.static(staticDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(htmlDir, 'index.html'));
});

const PORT = 80;
app.listen(PORT,'0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});