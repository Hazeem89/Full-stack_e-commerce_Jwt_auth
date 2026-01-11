import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import styles from  './NewProductForm/NewProductForm.module.css';


function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const navigate = useNavigate();

  // Check if initial setup is needed
  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Try to login with dummy credentials to check if setup is needed
        // If we get a specific error about setup, we'll show setup form
        await api.post('/admin/login', { username: '__check__', password: '__check__' });
      } catch (err) {
        // If error mentions setup or we can't find any admin, show setup
        if (err.response?.status === 401) {
          // Normal - admin exists but wrong credentials
          setIsSetupMode(false);
        }
      } finally {
        setCheckingSetup(false);
      }
    };
    checkSetup();
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // Create initial admin
      await api.post('/admin/setup', { username, password });

      // Auto-login after setup
      const response = await api.post('/admin/login', { username, password });
      const data = response.data;

      localStorage.setItem('adminToken', data.accessToken);
      api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;

      onLogin();
      navigate("/admin/products");
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Setup failed';
      if (errorMessage.includes('already completed')) {
        // Admin already exists, switch to login mode
        setIsSetupMode(false);
        setError('Setup already completed. Please login.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Login with JWT
      const response = await api.post('/admin/login', { username, password });
      const data = response.data;

      localStorage.setItem('adminToken', data.accessToken);
      api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;

      onLogin();
      navigate("/admin/products");
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
    }
  };

  if (checkingSetup) {
    return (
      <div style={{ backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ backgroundColor: '#cce6e7', width: '300px', padding: '20px', border: '10px solid #ee9f2881', borderRadius: '8px' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form
        onSubmit={isSetupMode ? handleSetup : handleLogin}
        style={{ backgroundColor: '#cce6e7', width: '350px', padding: '20px', border: '10px solid #ee9f2881', borderRadius: '8px' }}
      >
        <h2>{isSetupMode ? 'Initial Admin Setup' : 'Admin Login'}</h2>
        {isSetupMode && (
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
            No admin account found. Create the first admin account to get started.
          </p>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: '10px' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            autoComplete="username"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isSetupMode ? 6 : undefined}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            autoComplete={isSetupMode ? "new-password" : "current-password"}
          />
        </div>

        {isSetupMode && (
          <div style={{ marginBottom: '10px' }}>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              autoComplete="new-password"
            />
          </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
          {isSetupMode ? 'Create Admin Account' : 'Login'}
        </button>

        {!isSetupMode && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setIsSetupMode(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Need to setup initial admin?
            </button>
          </div>
        )}

        {isSetupMode && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsSetupMode(false);
                setError('');
                setConfirmPassword('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
