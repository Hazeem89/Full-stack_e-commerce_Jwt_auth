const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// 1. Load the JWT secrets from the environment
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// 2. Check if the JWT secrets are set correctly
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not set in environment variables!');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
  

// Serve static files (uploaded images)
app.use('/public', express.static(path.join(__dirname, 'public')));


// Import routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

// Use routes
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/admin', adminRoutes);
app.use('/users', usersRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'FreakyFashion API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});