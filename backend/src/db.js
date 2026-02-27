const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'db', 'app.db');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('journal_mode = WAL');

module.exports = db;