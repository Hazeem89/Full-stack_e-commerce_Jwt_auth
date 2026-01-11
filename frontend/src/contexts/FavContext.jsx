import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

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
                const response = await api.get(`/users/favorites/${user.id}`);
                const data = response.data;
                setFavorites(data.map(p => p.id));
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
                    await api.delete(`/users/favorites/${user.id}/${productId}`);
                    setFavorites(prev => prev.filter(id => id !== productId));
                } else {
                    await api.post('/users/favorites', {
                        userId: user.id,
                        productId
                    });
                    setFavorites(prev => [...prev, productId]);
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
                const response = await api.get(`/users/favorites/${user.id}`);
                return response.data;
            } else {
                const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (localFavorites.length > 0) {
                    const productPromises = localFavorites.map(id =>
                        api.get(`/products/${id}`).then(res => res.data)
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
