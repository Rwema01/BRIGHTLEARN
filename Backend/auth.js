// Backend authentication integration for BrightLearn
// Uses SQLite for demonstration (can be adapted for MySQL/PostgreSQL)

const express = require('express');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const dbPath = path.join(__dirname, 'data', 'brightlearn_auth.sql');
const DB_FILE = path.join(__dirname, 'data', 'brightlearn_auth.db');

// Initialize SQLite DB
const db = new sqlite3.Database(DB_FILE);

// Create users table if not exists
const fs = require('fs');
const schema = fs.readFileSync(dbPath, 'utf8');
db.exec(schema);

app.use(express.json());

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
    [full_name, email, password_hash],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Email already registered.' });
        }
        return res.status(500).json({ error: 'Database error.' });
      }
      res.status(201).json({ id: this.lastID, full_name, email });
    }
  );
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // For demo: return user info (never send password hash)
    res.json({ id: user.id, full_name: user.full_name, email: user.email });
  });
});

// Profile endpoint
app.get('/api/profile/:id', (req, res) => {
  db.get(
    'SELECT full_name, email, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json(user);
    }
  );
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
