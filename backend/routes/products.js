const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all products
router.get('/', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products').all();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get product by name (keeping for backward compatibility)
router.get('/:name', (req, res) => {
    const { name } = req.params;
    
    try {
        const product = db.prepare('SELECT * FROM products WHERE name = ?').get(name);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;