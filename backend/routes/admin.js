const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'));
    }
  }
});

// POST - Upload image
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `/public/images/products/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST - Add new product
router.post('/products', (req, res) => {
  const transaction = db.transaction(() => {
    try {
      const { name, description, brand, sku, price, imageUrl, categories = [] } = req.body;

      // Validate required fields
      if (!name || !price || !imageUrl) {
        throw new Error('Name, price, and image are required');
      }

      // Insert product
      const result = db.prepare(`
        INSERT INTO products (name, description, brand, sku, price, imageUrl, totalSales)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(name, description, brand, sku, parseFloat(price), imageUrl);

      const productId = result.lastInsertRowid;

      // Insert product-category relationships
      if (categories.length > 0) {
        const insertCategory = db.prepare(`
          INSERT INTO product_categories (product_id, category_id)
          VALUES (?, ?)
        `);

        categories.forEach(categoryId => {
          insertCategory.run(productId, parseInt(categoryId));
        });
      }

      res.status(201).json({ 
        message: 'Product added successfully',
        productId 
      });
    } catch (error) {
      throw error;
    }
  });

  try {
    transaction();
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST - Add new category
router.post('/categories', (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    
    res.status(201).json({
      message: 'Category added successfully',
      categoryId: result.lastInsertRowid
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// PUT - Update product
router.put('/products/:id', (req, res) => {
  const transaction = db.transaction(() => {
    try {
      const { id } = req.params;
      const { name, description, brand, sku, price, imageUrl, categories = [] } = req.body;

      // Update product
      const result = db.prepare(`
        UPDATE products 
        SET name = ?, description = ?, brand = ?, sku = ?, price = ?, imageUrl = ?
        WHERE id = ?
      `).run(name, description, brand, sku, parseFloat(price), imageUrl, id);

      if (result.changes === 0) {
        throw new Error('Product not found');
      }

      // Delete existing category relationships
      db.prepare('DELETE FROM product_categories WHERE product_id = ?').run(id);

      // Insert new category relationships
      if (categories.length > 0) {
        const insertCategory = db.prepare(`
          INSERT INTO product_categories (product_id, category_id)
          VALUES (?, ?)
        `);

        categories.forEach(categoryId => {
          insertCategory.run(id, parseInt(categoryId));
        });
      }

      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      throw error;
    }
  });

  try {
    transaction();
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Delete product
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;