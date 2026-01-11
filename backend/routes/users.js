const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, requireRole, refreshTokenMiddleware  } = require('../utils/authMiddleware');

const PEPPER = process.env.PEPPER_SECRET;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

// Register new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if username already exists (email is treated as username)
        const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash password with salt + pepper
        const hashed = await bcrypt.hash(password + PEPPER, BCRYPT_ROUNDS);

        // Insert new user using username instead of email
        const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        const info = stmt.run(email, hashed, 'user');

        // Return the created user (excluding password)
        const newUser = db.prepare('SELECT id, username AS email, role FROM users WHERE id = ?')
                          .get(info.lastInsertRowid);

        res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password with bcrypt (salt + pepper)
        const match = await bcrypt.compare(password + PEPPER, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if role is "user"
        if (user.role !== 'user') {
            return res.status(403).json({ error: 'Access denied: role not permitted' });
        }

        // Generate access token (short-lived)
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Generate refresh token (long-lived)
        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Store refresh token in database
        db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?')
          .run(refreshToken, user.id);

        // Set refresh token as httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false, // Set to true in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return access token and user info
        res.json({
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Refresh access token
router.post('/refresh', refreshTokenMiddleware, (req, res) => {
    // New access token is available in res.locals.newAccessToken
    res.json({ accessToken: res.locals.newAccessToken });
});

// Logout
router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        // Invalidate refresh token in database
        db.prepare('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?')
          .run(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});


// GET user's profile information
router.get('/me',verifyToken, requireRole('user'), (req, res) => {
    const  userId = req.user.id;

    try {
        // Fetch user information by userId
        const user = db.prepare('SELECT id, username AS email, created_at AS registrationDate, role FROM users WHERE id = ?').get(userId);
        
        // If user not found, return an error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user information (email and role)
        res.json({
            id: user.id,
            email: user.email,  
            registrationDate: user.registrationDate,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET user's favorites
router.get('/favorites/:userId', (req, res) => {
    const { userId } = req.params;
    
    try {
        const favorites = db.prepare(`
            SELECT p.* FROM products p
            INNER JOIN favorites f ON p.id = f.product_id
            WHERE f.user_id = ?
        `).all(userId);
        
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Add to favorites
router.post('/favorites', (req, res) => {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
        return res.status(400).json({ error: 'User ID and Product ID are required' });
    }
    
    try {
        // Check if already in favorites
        const existing = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?')
            .get(userId, productId);
        
        if (existing) {
            return res.status(400).json({ error: 'Product already in favorites' });
        }
        
        // Add to favorites
        const stmt = db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)');
        stmt.run(userId, productId);
        
        res.status(201).json({ message: 'Added to favorites' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove from favorites
router.delete('/favorites/:userId/:productId', (req, res) => {
    const { userId, productId } = req.params;
    
    try {
        const stmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?');
        const result = stmt.run(userId, productId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }
        
        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Sync anonymous favorites to logged-in user
router.post('/favorites/sync', (req, res) => {
    const { userId, productIds } = req.body;

    if (!userId || !Array.isArray(productIds)) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        const insertStmt = db.prepare('INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)');

        const insertMany = db.transaction((ids) => {
            for (const productId of ids) {
                insertStmt.run(userId, productId);
            }
        });

        insertMany(productIds);

        res.json({ message: 'Favorites synced successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET user's cart
router.get('/cart/:userId', (req, res) => {
    const { userId } = req.params;

    try {
        const cartItems = db.prepare(`
            SELECT c.quantity, p.* FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `).all(userId);

        res.json(cartItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Add to cart or update quantity
router.post('/cart', (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity == null) {
        return res.status(400).json({ error: 'User ID, Product ID, and quantity are required' });
    }

    try {
        // Check if item already in cart
        const existing = db.prepare('SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?')
            .get(userId, productId);

        if (existing) {
            // Update quantity
            const newQuantity = existing.quantity + quantity;
            const updateStmt = db.prepare('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?');
            updateStmt.run(newQuantity, userId, productId);
        } else {
            // Insert new item
            const insertStmt = db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)');
            insertStmt.run(userId, productId, quantity);
        }

        res.status(201).json({ message: 'Cart updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Update cart quantity
router.put('/cart', (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity == null) {
        return res.status(400).json({ error: 'User ID, Product ID, and quantity are required' });
    }

    try {
        const updateStmt = db.prepare('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?');
        const result = updateStmt.run(quantity, userId, productId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({ message: 'Quantity updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove from cart
router.delete('/cart/:userId/:productId', (req, res) => {
    const { userId, productId } = req.params;

    try {
        const deleteStmt = db.prepare('DELETE FROM cart WHERE user_id = ? AND product_id = ?');
        const result = deleteStmt.run(userId, productId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({ message: 'Removed from cart' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Sync anonymous cart to logged-in user
router.post('/cart/sync', (req, res) => {
    const { userId, cartItems } = req.body;

    if (!userId || !Array.isArray(cartItems)) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        const selectStmt = db.prepare('SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?');
        const updateStmt = db.prepare('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?');
        const insertStmt = db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)');

        const syncMany = db.transaction((items) => {
            for (const item of items) {
                const existing = selectStmt.get(userId, item.productId);
                if (existing) {
                    updateStmt.run(existing.quantity + item.quantity, userId, item.productId);
                } else {
                    insertStmt.run(userId, item.productId, item.quantity);
                }
            }
        });

        syncMany(cartItems);

        res.json({ message: 'Cart synced successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
