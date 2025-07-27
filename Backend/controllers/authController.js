// Placeholder for authentication controller
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, initDB } = require('../db/lowdb');
const { v4: uuidv4 } = require('uuid');

const SECRET = process.env.JWT_SECRET || 'supersecret';

// Multilingual error messages (default: English)
const messages = {
  en: {
    userExists: 'User already exists',
    userNotFound: 'User not found',
    invalidPassword: 'Invalid password',
    signupSuccess: 'Signup successful',
    loginSuccess: 'Login successful',
    missingFields: 'Missing required fields',
    serverError: 'Server error',
    unauthorized: 'Unauthorized',
  }
};

function getMsg(key, lang = 'en') {
  return messages[lang]?.[key] || messages['en'][key];
}

exports.signup = async (req, res) => {
  const { name, email, password, role, schoolEmail } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: getMsg('missingFields') });
  }
  try {
    await initDB();
    const userExists = db.data.users.find(u => u.email === email);
    if (userExists) {
      return res.status(409).json({ message: getMsg('userExists') });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashed,
      role,
      status: 'active',
      ...(role === 'teacher' ? { schoolEmail } : {})
    };
    db.data.users.push(newUser);
    await db.write();
    res.status(201).json({ userId: newUser.id, message: getMsg('signupSuccess') });
  } catch (err) {
    res.status(500).json({ message: getMsg('serverError') });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: getMsg('missingFields') });
  }
  try {
    await initDB();
    const user = db.data.users.find(u => u.email === email && u.status === 'active');
    if (!user) {
      return res.status(404).json({ message: getMsg('userNotFound') });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: getMsg('invalidPassword') });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, userId: user.id, message: getMsg('loginSuccess') });
  } catch (err) {
    res.status(500).json({ message: getMsg('serverError') });
  }
};
