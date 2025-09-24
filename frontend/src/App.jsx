import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/public/Home.jsx';
//import Product from './pages/public/Product';
//import SearchResults from './pages/public/SearchResults';

import AdminProducts from './pages/admin/AdminProducts';
import NewProduct from './pages/admin/NewProduct';
import AdminCategories from './pages/admin/AdminCategories';

function App() {
  return (
    <Routes>
      {/* Public layout routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
      </Route>
      {/* Admin layout routes */}
      <Route path="/admin/" element={<AdminLayout />}>
        <Route path="/admin/products/" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<NewProduct />} />
        <Route path="/admin/categories/" element={<AdminCategories />} />
      </Route>
    </Routes>
  );
}

export default App;

