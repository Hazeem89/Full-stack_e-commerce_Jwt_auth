const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(username, 'admin');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password with bcrypt (salt + pepper)
    const match = await bcrypt.compare(password + PEPPER, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
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

// Refresh access token (same as users route)
router.post('/refresh', refreshTokenMiddleware, (req, res) => {
    // New access token is available in res.locals.newAccessToken
    res.json({ accessToken: res.locals.newAccessToken });
});

// Logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    db.prepare('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?')
      .run(refreshToken);
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
});

// Initial admin setup (only works when no admin exists)
router.post('/setup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if any admin already exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
    if (existingAdmin) {
      return res.status(403).json({ error: 'Admin setup already completed. Use /admin/register instead.' });
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password with salt + pepper
    const hashed = await bcrypt.hash(password + PEPPER, BCRYPT_ROUNDS);

    // Create first admin user
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, hashed, 'admin');

    res.status(201).json({
      message: 'Initial admin account created successfully',
      user: {
        id: info.lastInsertRowid,
        username,
        role: 'admin'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new admin (requires existing admin authentication)
router.post('/register', verifyToken, requireRole('admin'), async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password with salt + pepper
    const hashed = await bcrypt.hash(password + PEPPER, BCRYPT_ROUNDS);

    // Create new admin user
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, hashed, 'admin');

    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: info.lastInsertRowid,
        username,
        role: 'admin'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
router.post('/upload-image', verifyToken, requireRole('admin'), upload.single('image'), (req, res) => {
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
router.post('/products', verifyToken, requireRole('admin'), (req, res) => {
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
router.delete('/products/:id', verifyToken, requireRole('admin'), (req, res) => {
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
router.post('/categories', verifyToken, requireRole('admin'), (req, res) => {
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

// Delete category
router.delete('/categories/:id', verifyToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  try {
    // Check if category exists
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    // Delete from DB
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;