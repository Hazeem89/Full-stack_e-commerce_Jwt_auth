# Freaky-Fashion

## Table of Contents

- [Screenshots](#screenshots)
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
  - [Clone the Repository](#1-clone-the-repository)
  - [Backend Setup](#2-backend-setup)
  - [Frontend Setup](#3-frontend-setup)
- [Database Setup](#database-setup)
  - [Automatic Database Initialization](#automatic-database-initialization)
  - [Creating an Admin User](#creating-an-admin-user)
  - [Database Schema](#database-schema)
- [Folder Structure Overview](#folder-structure-overview)
- [Admin Access](#admin-access)
  - [Accessing the Admin Panel](#accessing-the-admin-panel)
  - [Admin Features](#admin-features)
  - [Admin Routes](#admin-routes)
- [API Documentation](#api-documentation)
  - [Products Endpoints](#products-endpoints)
  - [Categories Endpoints](#categories-endpoints)
  - [Admin Endpoints](#admin-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Response Formats](#response-formats)
  - [CORS Configuration](#cors-configuration)

## Screenshots

### Homepage
![Homepage](screenshots/homepage.png)
*Main landing page with featured products and hero section*

### Product Listing
![Product Listing](screenshots/product-listing.png)
*Browse products with category filtering*

### Product Details
![Product Details](screenshots/product-details.png)
*Detailed product view with add to cart and favorites*

### Search Results
![Search Results](screenshots/search-results.png)
*Search functionality displaying matching products*

### Shopping Cart
![Shopping Cart](screenshots/cart.png)
*Shopping cart with quantity management*

### Favorites
![Favorites](screenshots/favorites.png)
*User favorites list for quick access to saved products*

### User Login
![Login](screenshots/login.png)
*User authentication page*

### User Registration
![Register](screenshots/register.png)
*New user registration form*

### Admin Dashboard - Products
![Admin Products](screenshots/admin-products.png)
*Admin interface for managing products*

### Admin Dashboard - Categories
![Admin Categories](screenshots/admin-categories.png)
*Admin interface for managing product categories*

### Admin Dashboard - Add Product
![Add Product](screenshots/admin-add-product.png)
*Form for adding new products with image upload*

## Project Overview

Freaky-Fashion is a full-stack e-commerce web application built with a modern tech stack. The application allows users to browse fashion products, manage their shopping cart, add items to favorites, and perform user authentication. It also includes an admin panel for managing products and categories, enabling administrators to add, edit, and delete products and categories.

Key features include:
- User registration and login
- Product browsing with categories
- Shopping cart functionality
- Favorites list
- Admin dashboard for product and category management (requires admin authentication)
- Image upload for products
- Responsive design using Bootstrap
- Session-based authentication for both users and admins

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web framework for building RESTful APIs
- **SQLite**: Lightweight database using better-sqlite3
- **CORS**: Cross-Origin Resource Sharing for API access
- **express-session**: Session management for user authentication
- **multer**: Middleware for handling file uploads (product images)
- **dotenv**: Environment variable management

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Bootstrap**: CSS framework for responsive design
- **React Router DOM**: Routing library for single-page applications
- **React Icons**: Icon library for UI elements

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: Version 18.x or higher recommended
- **npm**: Comes with Node.js (version 9.x or higher)
- **Git**: For version control

To check your current versions:
```bash
node --version
npm --version
```

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
SESSION_SECRET=your-secret-key-here
SERVER_URL=http://localhost:8000
PORT=8000
```

**Environment Variables Explained:**
- `SESSION_SECRET`: Secret key for session management (use a strong, random string in production)
- `SERVER_URL`: Backend server URL (used for image upload paths)
- `PORT`: Port number for the backend server (default: 8000)

**Security Note:** Never commit your `.env` file to version control. It should be listed in `.gitignore`.

## Getting Started

Follow these steps to set up and run the application locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Freaky-Fashion
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (see Environment Setup section above)

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will be running on `http://localhost:8000`.

**Available Backend Scripts:**
- `npm start` - Run the server in production mode
- `npm run dev` - Run the server with nodemon (auto-restart on changes)

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:3000`.

**Available Frontend Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Important:** Ensure the backend is running before starting the frontend, as the frontend makes API calls to the backend.

## Database Setup

The application uses SQLite as its database, which will be automatically initialized when you first run the backend server.

### Automatic Database Initialization

When you start the backend for the first time, the following tables are automatically created:

- **users** - User accounts with authentication
- **products** - Product catalog
- **categories** - Product categories
- **product_categories** - Many-to-many relationship between products and categories
- **favorites** - User favorite products
- **cart** - Shopping cart items

The database file is created at: `backend/db/fashion.db`

### Creating an Admin User

The application does NOT create a default admin user. You must manually create one by inserting a record into the database.

**Option 1: Using SQLite CLI**

1. Install SQLite (if not already installed):
   - Windows: Download from https://www.sqlite.org/download.html
   - Mac: `brew install sqlite`
   - Linux: `sudo apt-get install sqlite3`

2. Open the database:
   ```bash
   cd backend/db
   sqlite3 fashion.db
   ```

3. Insert an admin user:
   ```sql
   INSERT INTO users (username, password, role)
   VALUES ('admin', 'admin123', 'admin');
   ```

4. Exit SQLite:
   ```sql
   .exit
   ```

**Option 2: Using a Database Browser**

1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `backend/db/fashion.db`
3. Go to "Browse Data" tab → "users" table
4. Click "New Record" and add:
   - username: `admin`
   - password: `admin123`
   - role: `admin`
5. Click "Write Changes"

**Security Warning:**
- Passwords are currently stored in **plain text** (not hashed) - this is a security vulnerability
- Change the default admin password immediately after first login
- In production, implement proper password hashing (bcrypt recommended)

### Database Schema

**users table:**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
username TEXT UNIQUE NOT NULL
password TEXT NOT NULL
role TEXT DEFAULT 'user'
```

**products table:**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL
description TEXT
brand TEXT
sku TEXT
price REAL NOT NULL
imageUrl TEXT
totalSales INTEGER DEFAULT 0
publicationDate TEXT
```

**categories table:**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT UNIQUE NOT NULL
```

Other tables: `product_categories`, `favorites`, `cart` (see backend/db.js for full schema)

## Folder Structure Overview

```
Freaky-Fashion/
├── screenshots/                      # Application screenshots for documentation
│   ├── homepage.png
│   ├── product-listing.png
│   ├── product-details.png
│   ├── search-results.png
│   ├── cart.png
│   ├── favorites.png
│   ├── login.png
│   ├── register.png
│   ├── admin-products.png
│   ├── admin-categories.png
│   └── admin-add-product.png
├── backend/                          # Backend application
│   ├── db/                           # Database files
│   │   └── fashion.db                # SQLite database
│   ├── logs/                         # Log files
│   ├── public/                       # Static files
│   │   └── images/
│   │       └── products/             # Uploaded product images
│   ├── routes/                       # API route handlers
│   │   ├── admin.js                  # Admin-related routes
│   │   ├── categories.js             # Category management routes
│   │   ├── products.js               # Product management routes
│   │   └── users.js                  # User authentication routes
│   ├── utils/                        # Utility functions
│   ├── db.js                         # Database initialization
│   ├── package.json                  # Backend dependencies and scripts
│   ├── package-lock.json             # Backend lockfile
│   └── server.js                     # Main server file
├── frontend/                         # Frontend application
│   ├── public/
│   │   └── assets/                   # Static assets (logo, icons)
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── CategoriesTable/      # Admin categories table
│   │   │   ├── FilterSidebar/        # Product filtering sidebar
│   │   │   ├── FooterNav/            # Footer navigation
│   │   │   ├── Header/               # Main header
│   │   │   ├── Hero/                 # Hero section
│   │   │   ├── IconsBar/             # Icon navigation bar
│   │   │   ├── NewProductForm/       # Product creation form
│   │   │   ├── ProductCardGrid/      # Product grid display
│   │   │   ├── ProductDetails/       # Product detail view
│   │   │   ├── ProductsTable/        # Admin products table
│   │   │   ├── SimilarProduct/       # Similar products component
│   │   │   ├── Spots/                # Featured spots
│   │   │   ├── TopNav/               # Top navigation
│   │   │   ├── Login.jsx             # Login component
│   │   │   └── UserMenu.jsx          # User menu dropdown
│   │   ├── contexts/                 # React contexts for state management
│   │   │   ├── AuthContext.jsx       # Authentication context
│   │   │   ├── CartContext.jsx       # Shopping cart context
│   │   │   └── FavContext.jsx        # Favorites context
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── layouts/                  # Layout components
│   │   │   ├── AdminLayout.jsx       # Admin page layout
│   │   │   └── PublicLayout.jsx      # Public page layout
│   │   ├── pages/                    # Page components
│   │   │   ├── admin/                # Admin pages
│   │   │   │   ├── AdminCategories.jsx
│   │   │   │   ├── AdminProducts.jsx
│   │   │   │   ├── NewCategory.jsx
│   │   │   │   └── NewProduct.jsx
│   │   │   └── public/               # Public pages
│   │   │       ├── Cart.jsx
│   │   │       ├── Category.jsx
│   │   │       ├── Favorites.jsx
│   │   │       ├── Home.jsx
│   │   │       ├── Login.jsx
│   │   │       ├── Nyheter.jsx
│   │   │       ├── Product.jsx
│   │   │       ├── Register.jsx
│   │   │       └── SearchResults.jsx
│   │   ├── utils/                    # Utility functions
│   │   ├── App.css                   # Main app styles
│   │   ├── App.jsx                   # Main app component
│   │   ├── index.css                 # Global styles
│   │   └── main.jsx                  # App entry point
│   ├── .gitignore                    # Git ignore file
│   ├── eslint.config.js              # ESLint configuration
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── package-lock.json             # Frontend lockfile
│   ├── README.md                     # Frontend README (Vite template)
│   └── vite.config.js                # Vite configuration
├── .gitignore                        # Root git ignore
└── README.md                         # This file
```

## Admin Access

The admin panel allows you to manage products and categories through a web interface.

### Accessing the Admin Panel

1. **Create an admin user** (see Database Setup section above)

2. **Navigate to the admin login page:**
   - Open your browser and go to: `http://localhost:3000/admin`
   - Or click on the user icon in the header and select "Admin Login"

3. **Login with admin credentials:**
   - Default username: `admin`
   - Default password: `admin123`
   - (Use the credentials you created in the database)

### Admin Features

Once logged in, you can:

**Product Management:**
- View all products in a table format
- Add new products with details (name, description, brand, SKU, price, image)
- Upload product images (JPEG, JPG, PNG, WebP - max 10MB)
- Assign products to multiple categories
- Delete products
- Track product publication dates and total sales

**Category Management:**
- View all categories
- Create new categories
- Delete categories (will remove product-category associations)

**Image Upload:**
- Supported formats: JPEG, JPG, PNG, WebP
- Maximum file size: 10MB
- Images are stored in: `backend/public/images/products/`
- Images are automatically renamed with timestamp for uniqueness

### Admin Routes

The following admin endpoints are available:

- `POST /admin/login` - Admin authentication
- `GET /admin/check-auth` - Verify admin session
- `POST /admin/logout` - Logout admin
- `POST /admin/products` - Create new product (requires auth)
- `DELETE /admin/products/:id` - Delete product (requires auth)
- `POST /admin/categories` - Create new category (requires auth)
- `DELETE /admin/categories/:id` - Delete category (requires auth)
- `POST /admin/upload-image` - Upload product image (requires auth)

All admin routes (except login) require authentication via session management.

## API Documentation

The backend provides a RESTful API for managing products, categories, users, favorites, and shopping cart.

**Base URL:** `http://localhost:8000`

### Products Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/recent` | Get products from last 7 days | No |
| GET | `/products/:id` | Get product by ID | No |
| GET | `/products/:id/:name` | Get product by ID and name | No |

### Categories Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | No |
| GET | `/categories/:categoryId` | Get products by category | No |
| GET | `/categories/name/:categoryId` | Get category name by ID | No |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/admin/login` | Admin login | No |
| GET | `/admin/check-auth` | Check admin auth status | Yes |
| POST | `/admin/logout` | Admin logout | Yes |
| POST | `/admin/upload-image` | Upload product image | Yes |
| POST | `/admin/products` | Create new product | Yes |
| DELETE | `/admin/products/:id` | Delete product | Yes |
| POST | `/admin/categories` | Create new category | Yes |
| DELETE | `/admin/categories/:id` | Delete category | Yes |

**Admin Login Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Create Product Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "brand": "Brand Name",
  "sku": "SKU123",
  "price": 299.99,
  "imageUrl": "/public/images/products/image.jpg",
  "categoryIds": [1, 2, 3]
}
```

**Create Category Body:**
```json
{
  "name": "Category Name"
}
```

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | No |
| POST | `/users/login` | User login | No |
| GET | `/users/favorites/:userId` | Get user favorites | No |
| POST | `/users/favorites` | Add to favorites | No |
| DELETE | `/users/favorites/:userId/:productId` | Remove from favorites | No |
| POST | `/users/favorites/sync` | Sync anonymous favorites | No |
| GET | `/users/cart/:userId` | Get user cart | No |
| POST | `/users/cart` | Add to cart | No |
| PUT | `/users/cart` | Update cart quantity | No |
| DELETE | `/users/cart/:userId/:productId` | Remove from cart | No |
| POST | `/users/cart/sync` | Sync anonymous cart | No |

**Register/Login Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Add to Favorites Body:**
```json
{
  "userId": 1,
  "productId": 5
}
```

**Add to Cart Body:**
```json
{
  "userId": 1,
  "productId": 5,
  "quantity": 2
}
```

**Update Cart Body:**
```json
{
  "userId": 1,
  "productId": 5,
  "quantity": 3
}
```

### Response Formats

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### CORS Configuration

CORS is enabled for the frontend origin: `http://localhost:3000`

Credentials are supported for session management.
