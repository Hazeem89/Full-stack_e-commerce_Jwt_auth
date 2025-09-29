const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use env var in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));


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