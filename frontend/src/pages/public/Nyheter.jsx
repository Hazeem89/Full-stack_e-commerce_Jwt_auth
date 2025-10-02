import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BsHeart } from 'react-icons/bs';
import styles from '../../components/ProductCardGrid/ProductCardGrid.module.css';

function Nyheter() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    // Listen for screen resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch recent products
    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:8000/products/recent')
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`HTTP error! Status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                setProducts(data);
                setIsLoading(false);
                document.title = 'Nyheter | Freaky Fashion';
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setError(error.message);
                setIsLoading(false);
            });
    }, []);

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
        <>
            {displayedProducts.length > 0 ? (
                <h3 style={{ margin: '0', paddingTop: '10px' }}>Nyheter</h3>
            ) : (
                <div className={styles.noResults}>
                    <h2>Inga nya produkter de senaste 7 dagarna! 😓</h2>
                </div>
            )}

            <section className={styles.products}>
                {displayedProducts.length > 0 &&
                    displayedProducts.map((product) => (
                        <div className={styles.product} key={product.id || product.Name}>
                            <Link to={`/products/${product.Name}`} state={{ productId: product.id }}>
                                <img src={product.ImageUrl} alt={product.Name} />
                            </Link>
                            <span className={styles.price}>{product.Price} SEK</span>
                            <span className={styles.name}>{product.Name}</span>
                            <span className={styles.brand}>{product.Brand}</span>
                            <span className={styles.heartIcon}><span><BsHeart /></span></span>
                        </div>
                    ))}
            </section>
        </>
    );
}

export default Nyheter;
