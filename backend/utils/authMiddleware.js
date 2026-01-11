const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN } = process.env;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Invalid Authorization format' });
    }

    const token = parts[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Middleware to check if user has specific role
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

// Middleware to handle refresh token and update access token
const refreshTokenMiddleware = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }

    try {
        // Find user with this refresh token
        const user = db.prepare('SELECT * FROM users WHERE refresh_token = ?').get(refreshToken);
        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        // Verify refresh token
         jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                // Token expired or invalid
                // Invalidate refresh token in database
                db.prepare('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?')
                  .run(refreshToken);

                // Clear the refresh token cookie
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: false, // Set to true in production with HTTPS
                });

                return res.status(401).json({ error: 'Session expired. Please login again' });
            }

            // Token is valid, proceed to generate new access token
            const newAccessToken = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Add new access token to the response
            res.locals.newAccessToken = newAccessToken;
            next(); // Proceed to the next middleware or route handler
        });
    } catch (err) {
        return res.status(500).json({ error: 'An error occurred while refreshing the token' });
    }
};

module.exports = { verifyToken, requireRole, refreshTokenMiddleware };
