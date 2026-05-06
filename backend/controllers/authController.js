const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool   = require('../db');

// Auth Controller BEGIN

const registerLocal = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        const existing = await conn.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await conn.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err.message });
    } finally {
        if (conn) conn.release();
    }
};

const loginLocal = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        const users = await conn.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    registerLocal,
    loginLocal
};

// Auth Controller END