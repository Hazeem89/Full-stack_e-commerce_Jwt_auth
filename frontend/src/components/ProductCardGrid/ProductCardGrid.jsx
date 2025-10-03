import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useFav } from '../../contexts/FavContext';
import styles from './ProductCardGrid.module.css';

const ProductCardGrid = () => {
    const { favorites, toggleFavorite, isLoading: favLoading } = useFav();
    const [products, setProducts] = useState([]);
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

    // Fetch products
    useEffect(() => {
        setError(null);
        fetch('http://localhost:8000/products')
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`HTTP error! Status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                setProducts(data);
                document.title = 'Freaky Fashion';
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setError(error.message);
            });
    }, []);

    if (favLoading) {
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(product.id);
                                }}
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
