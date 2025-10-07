# Freaky-Fashion

## Project Overview

Freaky-Fashion is a full-stack e-commerce web application built with a modern tech stack. The application allows users to browse fashion products, manage their shopping cart, add items to favorites, and perform user authentication. It also includes an admin panel for managing products and categories, enabling administrators to add, edit, and delete products and categories.

Key features include:
- User registration and login
- Product browsing with categories
- Shopping cart functionality
- Favorites list
- Admin dashboard for product and category management
- Image upload for products
- Responsive design using Bootstrap

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

## How to Run the Client

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The client will be running on `http://localhost:3000`.

## How to Run the Server

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The server will be running on `http://localhost:8000`.

Note: Ensure the backend is running before starting the frontend, as the frontend makes API calls to the backend.

## Folder Structure Overview

```
Freaky-Fashion/
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
