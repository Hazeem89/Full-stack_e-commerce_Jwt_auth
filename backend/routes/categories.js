const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});


// GET category name by ID
router.get('/name/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(categoryId);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching category name:', error);
    res.status(500).json({ error: 'Failed to fetch category name' });
  }
});

// GET products by category
router.get('/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = db.prepare(`
      SELECT p.* 
      FROM products p 
      JOIN product_categories pc ON p.id = pc.product_id 
      WHERE pc.category_id = ?
      ORDER BY p.name
    `).all(categoryId);

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});



module.exports = router;