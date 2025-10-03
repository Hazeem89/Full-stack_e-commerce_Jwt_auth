import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ProductCardGrid.module.css'; 

const ProductCardGrid = () => {
    const { user, isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    // Function to check if product is published in last 7 days
    const isRecent = (publicationDate) => {
        if (!publicationDate) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const pubDate = new Date(publicationDate);
        return pubDate >= sevenDaysAgo;
    };

    // Listen for screen resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load favorites
    useEffect(() => {
        loadFavorites();
    }, [user, isAuthenticated]);

    const loadFavorites = async () => {
        try {
            if (isAuthenticated && user?.id) {
                // Get from backend
                const response = await fetch(`http://localhost:8000/users/favorites/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data.map(p => p.id));
                }
            } else {
                // Get from localStorage
                const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                setFavorites(localFavorites);
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
        }
    };

    // Fetch products
    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:8000/products')
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`HTTP error! Status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                setProducts(data);
                setIsLoading(false);
                document.title = 'Freaky Fashion';
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setError(error.message);
                setIsLoading(false);
            });
    }, []);

    const toggleFavorite = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        const isFavorite = favorites.includes(productId);

        try {
            if (isAuthenticated && user?.id) {
                // Handle for logged-in users
                if (isFavorite) {
                    // Remove from favorites
                    const response = await fetch(`http://localhost:8000/users/favorites/${user.id}/${productId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        setFavorites(prev => prev.filter(id => id !== productId));
                    }
                } else {
                    // Add to favorites
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
                // Handle for anonymous users - store in localStorage
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

    if (isLoading) {
        return (
            <div className={styles.loading} >
                <span>Laddar... </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error} style={{ minHeight: "100vh", textAlign: "center" }}>
                Ett fel uppstod: {error}
            </div>
        );
    }
    
    const displayedProducts = isMobile ? products.slice(0, 8) : products;

    return (
        <section className={styles.products}>
            {displayedProducts.length > 0 ? (
                displayedProducts.map((product) => {
                    const isFavorite = favorites.includes(product.id);
                    
                    return (
                        <div className={styles.product} key={product.id || product.Name}>
                            <Link to={`/products/${product.Name}`} state={{ productId: product.id }}>
                                <img src={product.ImageUrl} alt={product.Name} />
                                {isRecent(product.PublicationDate) && <span className={styles.badge}>Nyhet</span>}
                            </Link>
                            <span className={styles.price}>{product.Price} SEK</span>
                            <span className={styles.name}>{product.Name}</span>
                            <span className={styles.brand}>{product.Brand}</span>
                            <span 
                                className={styles.heartIcon} 
                                onClick={(e) => toggleFavorite(e, product.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {isFavorite ? (
                                    <BsHeartFill style={{ color: 'tomato' }} />
                                ) : (
                                    <BsHeart />
                                )}
                            </span>
                        </div>
                    );
                })
            ) : (
                <div className={styles.noResults}>
                    <h2>Hittade inga produkter! </h2>
                </div>
            )}
        </section>
    );
};

export default ProductCardGrid;