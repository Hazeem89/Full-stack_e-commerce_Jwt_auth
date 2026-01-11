import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Link } from "react-router";
import Login from '../components/Login';
import api from '../services/api';


function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if admin token exists in localStorage
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        // Set the authorization header
        api.defaults.headers.Authorization = `Bearer ${adminToken}`;
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
      localStorage.removeItem('adminToken');
      delete api.defaults.headers.Authorization;
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear local state even if API call fails
      localStorage.removeItem('adminToken');
      delete api.defaults.headers.Authorization;
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="AdminHeader">
        Administration
        <button onClick={handleLogout} style={{ float: 'right', marginTop: '10px' }}>Logout</button>
      </div>

      <div style={{ display: 'flex' }}>
        <div className="AdminSide">
          <Link to="/admin/products">Produkter</Link>
          <Link to="/admin/categories">Kategorier</Link>
          <hr style={{ margin: '10px 0', borderColor: '#ddd' }} />
          <Link to="/admin/register">Skapa Admin</Link>
        </div>
        <main style={{ padding: '1rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default AdminLayout;
