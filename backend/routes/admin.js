const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');

const requireAuth = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// POST - Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND role = ?').get(username, password, 'admin');
  if (user) {
    req.session.admin = true;
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GET - Check authentication
router.get('/check-auth', (req, res) => {
  if (req.session && req.session.admin) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// POST - Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
router.post('/upload-image', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const ImageUrl = `${process.env.SERVER_URL || 'http://localhost:8000'}/public/images/products/${req.file.filename}`;

    res.json({ ImageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Add new product
router.post('/products', requireAuth, (req, res) => {
    console.log('Received data:', req.body); 
    const { Name, Description, ImageUrl, Brand, SKU, Price, PublicationDate, Categories } = req.body;
    console.log('Extracted imageUrl:', ImageUrl);
    try {
        // Insert the product
        const stmt = db.prepare(`
            INSERT INTO products (Name, Description, ImageUrl, Brand, SKU, Price, PublicationDate, totalSales) 
            VALUES (?, ?, ?, ?, ?, ?, ?, '0')
        `);
        
        const info = stmt.run(Name, Description, ImageUrl, Brand, SKU, Price, PublicationDate);
        const productId = info.lastInsertRowid;

        //  Insert into product_categories
        if (Array.isArray(Categories) && Categories.length > 0) {
            const insertCategoryStmt = db.prepare(`
                INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)
            `);

            const insertMany = db.transaction((categories) => {
                for (const categoryId of categories) {
                    insertCategoryStmt.run(productId, categoryId);
                }
            });

            insertMany(Categories);
        }
        
        res.status(201).json({
            id: info.lastInsertRowid,
            message: 'Product added successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
router.delete('/products/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    // First, get the product to retrieve ImageUrl
    const product = db.prepare('SELECT ImageUrl FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Delete from DB
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
    // If ImageUrl exists, delete the file
    if (product.ImageUrl) {
      // Extract filename from ImageUrl
      const urlParts = product.ImageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = path.join(__dirname, '..', 'public', 'images', 'products', filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
          // Maybe log but don't fail the response
        }
      });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new category 
router.post('/categories', requireAuth, (req, res) => {
  try {
    const { Name } = req.body;
    if (!Name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Convert to lowercase to enforce case-insensitive uniqueness
    const nameLower = Name.toLowerCase();

    // Check if category already exists (case-insensitive)
    const existing = db.prepare('SELECT * FROM categories WHERE LOWER(name) = ?').get(nameLower);
    if (existing) {
      return res.status(409).json({ error: '⛔ Category name already exists' });
    }

    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const info = stmt.run(Name);
    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newCategory);

  } catch (error) {
    console.error('Error creating category:', error);

    // Fallback if we somehow hit a unique constraint anyway
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: '⛔ Category name already exists' });
    }

    res.status(500).json({ error: 'Failed to create category' });
  }
});


module.exports = router;