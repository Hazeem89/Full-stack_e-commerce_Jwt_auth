import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/public/Home.jsx';
import Product from './pages/public/Product';
import SearchResults from './pages/public/SearchResults';
import Category from './pages/public/Category.jsx';
import Nyheter from './pages/public/Nyheter.jsx';

import AdminProducts from './pages/admin/AdminProducts';
import NewProduct from './pages/admin/NewProduct';
import AdminCategories from './pages/admin/AdminCategories';
import NewCategory from './pages/admin/NewCategory.jsx';

function App() {
  return (
    <Routes>
      {/* Public layout routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/products/:name" element={<Product />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/categories/:name" element={<Category />} />
        <Route path="/recent" element={<Nyheter />} />
      </Route>
      {/* Admin layout routes */}
      <Route path="/admin/" element={<AdminLayout />}>
        <Route path="/admin/products/" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<NewProduct />} />
        <Route path="/admin/categories/" element={<AdminCategories />} />
        <Route path="/admin/categories/new" element={<NewCategory />} />
      </Route>
    </Routes>
  );
}

export default App;

