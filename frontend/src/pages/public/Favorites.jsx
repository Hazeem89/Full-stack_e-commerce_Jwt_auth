import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsHeartFill } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../components/ProductCardGrid/ProductCardGrid.module.css';

const Favorites = () => {
    const { user, isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, [user, isAuthenticated]);

    const loadFavorites = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (isAuthenticated && user?.id) {
                // Fetch from backend for logged-in users
                const response = await fetch(`http://localhost:8000/users/favorites/${user.id}`);
                if (!response.ok) throw new Error('Failed to load favorites');
                const data = await response.json();
                setFavorites(data);
            } else {
                // Get from localStorage for anonymous users
                const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                
                if (localFavorites.length > 0) {
                    // Fetch product details for each favorite
                    const productPromises = localFavorites.map(id =>
                        fetch(`http://localhost:8000/products/${id}`).then(res => res.json())
                    );
                    const products = await Promise.all(productPromises);
                    setFavorites(products.filter(p => p && !p.error));
                } else {
                    setFavorites([]);
                }
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (productId) => {
        try {
            if (isAuthenticated && user?.id) {
                // Remove from backend
                const response = await fetch(`http://localhost:8000/users/favorites/${user.id}/${productId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to remove favorite');
            } else {
                // Remove from localStorage
                const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const updated = localFavorites.filter(id => id !== productId);
                localStorage.setItem('favorites', JSON.stringify(updated));
            }
            
            // Update UI
            setFavorites(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error('Error removing favorite:', err);
            alert('Kunde inte ta bort favorit');
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <span>Laddar favoriter...</span>
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

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Mina Favoriter</h2>
            
            {favorites.length === 0 ? (
                <div className={styles.noResults}>
                    <div>
                        <h3>Du har inga favoriter än</h3>
                        <p>Klicka på hjärtat på produkter för att spara dem här!</p>
                        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
                            Börja shoppa →
                        </Link>
                    </div>
                </div>
            ) : (
                <section className={styles.products}>
                    {favorites.map((product) => (
                        <div className={styles.product} key={product.id}>
                            <Link to={`/products/${product.Name}`} state={{ productId: product.id }}>
                                <img src={product.ImageUrl} alt={product.Name} />
                            </Link>
                            <span className={styles.price}>{product.Price} SEK</span>
                            <span className={styles.name}>{product.Name}</span>
                            <span className={styles.brand}>{product.Brand}</span>
                            <span 
                                className={styles.heartIcon} 
                                onClick={() => removeFavorite(product.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <BsHeartFill style={{ color: 'tomato' }} />
                            </span>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};

export default Favorites;