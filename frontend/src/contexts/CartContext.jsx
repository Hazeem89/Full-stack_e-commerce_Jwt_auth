import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            syncAnonymousCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id]);

    const loadCart = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (isAuthenticated && user?.id) {
                const response = await api.get(`/users/cart/${user.id}`);
                const data = response.data;
                const transformed = data.map(item => ({
                    product: item,
                    quantity: item.quantity || 1,
                    ImageUrl: item.ImageUrl || '', // Ensure ImageUrl is included
                }));

                setCartItems(transformed);
            } else {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                setCartItems(localCart);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Error loading cart.');
        } finally {
            setIsLoading(false);
        }
    };

    const syncAnonymousCart = async () => {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (localCart.length > 0 && user?.id) {
            try {
                const cartItemsForSync = localCart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }));
                await api.post('/users/cart/sync', {
                    userId: user.id,
                    cartItems: cartItemsForSync
                });
                localStorage.removeItem('cart');
                loadCart(); // Reload to get synced cart
            } catch (err) {
                console.error('Error syncing cart:', err);
                setError('Error syncing anonymous cart.');
            }
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (!product || !product.id || quantity <= 0) {
            setError('Invalid product or quantity.');
            return;
        }
        setError(null);
        const existingItem = cartItems.find(item => item.product.id === product.id);
        if (existingItem) {
            updateQuantity(product.id, existingItem.quantity + quantity);
            return;
        }
        const newItem = { product, quantity };
        try {
            if (isAuthenticated && user?.id) {
                await api.post('/users/cart', {
                    userId: user.id,
                    productId: product.id,
                    quantity
                });
                setCartItems(prev => [...prev, newItem]);
            } else {
                const updatedCart = [...cartItems, newItem];
                setCartItems(updatedCart);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError('Error adding product to cart.');
        }
    };

    const removeFromCart = async (productId) => {
        setError(null);
        try {
            if (isAuthenticated && user?.id) {
                await api.delete(`/users/cart/${user.id}/${productId}`);
                setCartItems(prev => prev.filter(item => item.product.id !== productId));
            } else {
                const updatedCart = cartItems.filter(item => item.product.id !== productId);
                setCartItems(updatedCart);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError('Error removing product from cart.');
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        if (!productId || typeof quantity !== 'number' || quantity < 0) {
            setError('Invalid product ID or quantity.');
            return;
        }
        setError(null);
        try {
            if (isAuthenticated && user?.id) {
                await api.put('/users/cart', {
                    userId: user.id,
                    productId,
                    quantity
                });
                setCartItems(prev => prev.map(item =>
                    item.product.id === productId ? { ...item, quantity } : item
                ));
            } else {
                const updatedCart = cartItems.map(item =>
                    item.product.id === productId ? { ...item, quantity } : item
                );
                setCartItems(updatedCart);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
            }
        } catch (err) {
            console.error('Error updating cart quantity:', err);
            setError('Error updating cart quantity.');
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, isLoading, error, addToCart, removeFromCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
