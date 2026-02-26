const path = require('path');
const express = require('express');

const app = express();

const staticDir = path.join(__dirname, '..', '..', 'frontend', 'statics');
app.use(express.static(staticDir));

const htmlDir = path.join(staticDir, 'html');
app.get('/', (req, res) => {
  res.sendFile(path.join(htmlDir, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});