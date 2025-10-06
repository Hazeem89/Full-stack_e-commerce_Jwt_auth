import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';
import { BsBoxArrowRight, BsBagHeart, BsArchive } from "react-icons/bs";

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <FaUser size={25} color="gray" />
      </Link>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px'
        }}
      >
        <FaUser size={25} color="#007bff" />
        <span style={{ fontSize: '12px', color: '#007bff' }}>▼</span>
      </button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            minWidth: '200px',
            zIndex: 1000
          }}
        >
          <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Inloggad som:</div>
            <div style={{ fontWeight: '600', marginTop: '4px' }}>{user?.username}</div>
          </div>
          
          <Link
            to="/favorites"
            onClick={() => setShowDropdown(false)}
            style={{
              display: 'block',
              padding: '12px',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #eee'
            }}
            onMouseEnter={(e) => e.target.style.borderBottom = '2px solid #15b8f8'}  
            onMouseLeave={(e) => e.target.style.borderBottom = 'transparent'}
          >
           <BsBagHeart/>  &nbsp;Mina Favoriter
          </Link>
          <Link
            to="/basket"
            onClick={() => setShowDropdown(false)}
            style={{
              display: 'block',
              padding: '12px',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #eee',
              zIndex: 100
            }}
            onMouseEnter={(e) => e.target.style.borderBottom = '2px solid #15b8f8'}  
            onMouseLeave={(e) => e.target.style.borderBottom = 'transparent'}
          >
            <BsArchive/> &nbsp;Mina Köp
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#dc3545',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.borderBottom = '2px solid #15b8f8'}  
            onMouseLeave={(e) => e.target.style.borderBottom = 'transparent'}
          >
           <BsBoxArrowRight /> Logga ut
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;