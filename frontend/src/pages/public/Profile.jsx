import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Loading = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <span>Laddar...</span>
    </div>
);

const Error = ({ message }) => (
    <div style={{ minHeight: "100vh", textAlign: "center" }}>
        Ett fel uppstod: {message}
    </div>
);

const UserProfile = ({ userData }) => (
    <div style={{ maxWidth: '400px', margin: '0 auto', fontSize: '16px' }}>
        <p><strong>Namn:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Registreringsdatum:</strong> {new Date(userData.registrationDate).toLocaleDateString()}</p>
    </div>
);

const Profile = () => {
    const { isAuthenticated, token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // Only redirect when the user is not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const loadUserData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
        } catch (err) {
            console.error('Error loading user data:', err);
            // Handle expired refresh token (or other errors)
            if (err.response && err.response.status === 401) {
                // Refresh token expired or invalid, so log out
                await api.post('/users/logout');  // Call your logout route here
                setIsAuthenticated(false);  // Update your context to reflect logged-out state
                navigate('/login');  // Redirect to login page
            } else {
                setError(err.response?.data?.error || err.message);
            }
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Load data when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadUserData();
        }
    }, [isAuthenticated, loadUserData]);

    // If user is not authenticated, no need to render profile
    if (!isAuthenticated) {
        return <Error message="Du måste vara inloggad för att visa din profil." />;
    }

    // Loading and Error states
    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <Error message={error} />;
    }

    // Profile render
    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Mina Uppgifter</h2>
            {userData ? <UserProfile userData={userData} /> : <div>Inga användardata tillgängliga.</div>}
        </div>
    );
};

export default Profile;
