const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool   = require('../db');
const { Issuer } = require('openid-client');

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

const callbackOIDC = async (req, res) => {
    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) return res.status(400).json({ error: 'Code and redirectUri required' });

    let conn;
    try {
        const issuer = await Issuer.discover(process.env.AUTH0_ISSUER_URL)
        const client = new issuer.Client({
            client_id: process.env.AUTH0_CLIENT_ID,        
            client_secret: process.env.AUTH0_CLIENT_SECRET, 
            redirect_uris: [process.env.EXPO_PUBLIC_REDIRECT_URI],     
            response_types: ['code'],
        });

        const tokenSet = await client.callback(redirectUri, { code });
        const claims = tokenSet.claims();
        const email = claims.email;
        const name = claims.name || 'SSO User';

        conn = await pool.getConnection();
        let users = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = users[0];

        // If user doesn't exist, create them
        if (!user) {
            const result = await conn.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, 'sso_placeholder'] 
            );
            user = { id: Number(result.insertId), name, email };
        }

        // Issue standard local JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'OIDC failed', details: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    registerLocal,
    loginLocal,
    callbackOIDC
};

// Auth Controller END