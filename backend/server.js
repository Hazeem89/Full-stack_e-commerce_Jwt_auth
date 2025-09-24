const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Import routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/admin', adminRoutes);

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