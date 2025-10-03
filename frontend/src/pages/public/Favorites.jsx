import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsHeartFill } from 'react-icons/bs';
import { useFav } from '../../contexts/FavContext';
import styles from '../../components/ProductCardGrid/ProductCardGrid.module.css';

const Favorites = () => {
    const { toggleFavorite, getFavoritesProducts, isLoading: favLoading } = useFav();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getFavoritesProducts();
            setFavorites(data);
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (productId) => {
        await toggleFavorite(productId);
        setFavorites(prev => prev.filter(p => p.id !== productId));
    };

    if (favLoading || isLoading) {
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
