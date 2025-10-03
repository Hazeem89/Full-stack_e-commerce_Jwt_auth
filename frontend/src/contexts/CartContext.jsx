import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
                const response = await fetch(`http://localhost:8000/users/cart/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const transformed = data.map(item => ({
                        product: item,
                        quantity: item.quantity || 1,
                        ImageUrl: item.ImageUrl || '', // Ensure ImageUrl is included
                    }));
                    
                    setCartItems(transformed);
                } else {
                    setError('Failed to load cart from server.');
                }
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
                const response = await fetch('http://localhost:8000/users/cart/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, cartItems: cartItemsForSync })
                });
                if (response.ok) {
                    localStorage.removeItem('cart');
                    loadCart(); // Reload to get synced cart
                } else {
                    setError('Failed to sync anonymous cart.');
                }
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
                const response = await fetch('http://localhost:8000/users/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },    
                    body: JSON.stringify({ userId: user.id, productId: product.id, quantity })
                });
                if (response.ok) {
                    setCartItems(prev => [...prev, newItem]);
                } else {
                    setError('Failed to add product to cart.');
                }
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
                const response = await fetch(`http://localhost:8000/users/cart/${user.id}/${productId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setCartItems(prev => prev.filter(item => item.product.id !== productId));
                } else {
                    setError('Failed to remove product from cart.');
                }
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
                const response = await fetch('http://localhost:8000/users/cart', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, productId, quantity })  
                });
                if (response.ok) {
                    setCartItems(prev => prev.map(item =>   
                        item.product.id === productId ? { ...item, quantity } : item
                    ));
                } else {
                    setError('Failed to update cart quantity.');
                }
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
