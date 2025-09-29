import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Link } from "react-router";
import Login from '../components/Login';
import '../App.css';

function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/check-auth', {
        credentials: 'include',
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
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
        </div>
        <main style={{ padding: '1rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default AdminLayout;
