import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavContext = createContext();

export const useFav = () => useContext(FavContext);

export const FavProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isAuthenticated]);

    const loadFavorites = async () => {
        setIsLoading(true);
        try {
            if (isAuthenticated && user?.id) {
                const response = await fetch(`http://localhost:8000/users/favorites/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data.map(p => p.id));
                }
            } else {
                const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                setFavorites(localFavorites);
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = async (productId) => {
        const isFavorite = favorites.includes(productId);

        try {
            if (isAuthenticated && user?.id) {
                if (isFavorite) {
                    const response = await fetch(`http://localhost:8000/users/favorites/${user.id}/${productId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        setFavorites(prev => prev.filter(id => id !== productId));
                    }
                } else {
                    const response = await fetch('http://localhost:8000/users/favorites', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, productId })
                    });
                    if (response.ok) {
                        setFavorites(prev => [...prev, productId]);
                    }
                }
            } else {
                let localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (isFavorite) {
                    localFavorites = localFavorites.filter(id => id !== productId);
                } else {
                    localFavorites.push(productId);
                }
                localStorage.setItem('favorites', JSON.stringify(localFavorites));
                setFavorites(localFavorites);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            alert('Kunde inte uppdatera favoriter');
        }
    };

    const getFavoritesProducts = async () => {
        try {
            if (isAuthenticated && user?.id) {
                const response = await fetch(`http://localhost:8000/users/favorites/${user.id}`);
                if (response.ok) {
                    return await response.json();
                }
            } else {
                const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (localFavorites.length > 0) {
                    const productPromises = localFavorites.map(id =>
                        fetch(`http://localhost:8000/products/${id}`).then(res => res.json())
                    );
                    const products = await Promise.all(productPromises);
                    return products.filter(p => p && !p.error);
                }
            }
            return [];
        } catch (err) {
            console.error('Error getting favorites products:', err);
            return [];
        }
    };

    return (
        <FavContext.Provider value={{ favorites, toggleFavorite, isLoading, getFavoritesProducts }}>
            {children}
        </FavContext.Provider>
    );
};
