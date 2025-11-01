// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'SportClub')));

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { staff: [], players: [] };
  }
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* Staff */
app.get('/api/staff', (req, res) => {
  res.json(readDB().staff);
});
app.get('/api/staff/:id', (req, res) => {
  const db = readDB();
  const item = db.staff.find(s => String(s.id) === String(req.params.id));
  if (item) res.json(item); else res.status(404).json({ error: 'Not found' });
});
app.put('/api/staff/:id', (req, res) => {
  const db = readDB();
  const idx = db.staff.findIndex(s => String(s.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.staff[idx] = { ...db.staff[idx], ...req.body };
  writeDB(db);
  res.json(db.staff[idx]);
});
app.post('/api/staff', (req, res) => {
  const db = readDB();
  const id = db.staff.length ? Math.max(...db.staff.map(s => s.id)) + 1 : 1;
  const item = { id, ...req.body };
  db.staff.push(item);
  writeDB(db);
  res.json(item);
});

/* Players */
app.get('/api/players', (req, res) => {
  res.json(readDB().players);
});
app.get('/api/players/:id', (req, res) => {
  const db = readDB();
  const item = db.players.find(s => String(s.id) === String(req.params.id));
  if (item) res.json(item); else res.status(404).json({ error: 'Not found' });
});
app.put('/api/players/:id', (req, res) => {
  const db = readDB();
  const idx = db.players.findIndex(s => String(s.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.players[idx] = { ...db.players[idx], ...req.body };
  writeDB(db);
  res.json(db.players[idx]);
});
app.post('/api/players', (req, res) => {
  const db = readDB();
  const id = db.players.length ? Math.max(...db.players.map(s => s.id)) + 1 : 1;
  const item = { id, ...req.body };
  db.players.push(item);
  writeDB(db);
  res.json(item);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
