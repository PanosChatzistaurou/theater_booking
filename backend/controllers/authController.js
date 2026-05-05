const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const bcrypt = require('bcrypt');

const registerLocal = async (req, res) => {
  
  const { name, email, password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await conn.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: "Email already exists or DB error" });
  } finally {
    if (conn) conn.release();
  }
};

const loginLocal = async (req, res) => {
  
  const { email, password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const users = await conn.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } finally {
    if (conn) conn.release();
  }
};

const loginOIDC = async (req, res) => {
  const { idToken } = req.body;

  try {
    
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const externalId = payload['sub']; 

    let conn = await pool.getConnection();
    
    
    let users = await conn.query("SELECT * FROM users WHERE external_id = ?", [externalId]);
    let user = users[0];

    if (!user) {
      await conn.query(
        "INSERT INTO users (name, email, external_id) VALUES (?, ?, ?)",
        [payload.name, payload.email, externalId]
      );
      const newUsers = await conn.query("SELECT * FROM users WHERE external_id = ?", [externalId]);
      user = newUsers[0];
    }
    conn.release();

    
    const localToken = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ token: localToken, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google Token' });
  }
};

module.exports = { 
    loginOIDC, 
    registerLocal, 
    loginLocal 
};