const express = require('express');
const router = express.Router();
const db = require('../db');

// Register new user    
router.post('/register', (req, res) => {
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

        // Insert new user using username instead of email
        const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        const info = stmt.run(email, password, 'user');

        // Return the created user (excluding password)
        const newUser = db.prepare('SELECT id, username AS email, role FROM users WHERE id = ?')
                          .get(info.lastInsertRowid);

        res.status(201).json(newUser);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// User login
router.post('/login', (req, res) => {
    const { username, password } = req.body;    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if role is "user"
        if (user.role !== 'user') {
            return res.status(403).json({ error: 'Access denied: role not permitted' });
        }

        // Return user info excluding password
        const { id, role } = user;
        res.json({ id, username, role });
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
