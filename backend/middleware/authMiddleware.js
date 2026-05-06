const jwt = require('jsonwebtoken');

// Auth Middleware BEGIN

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token      = authHeader && authHeader.split(' ')[1];


    if (!token || token === 'null') {
        return res.status(401).json({ error: 'Access denied: no token provided' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(403).json({ error: 'Access denied: invalid token' });
    }
};

// Auth Middleware END