import { Link } from "react-router";
import styles from './Spots.module.css';
import { useEffect, useState } from "react";

const Spots = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/products')
            .then(response => response.json())
            
            .then(data => {
                setProducts(data);
                if (data.length > 0) {
                    // Get top 4 products by totalSales
                    const topProducts = [...data]
                        .sort((a, b) => b.totalSales - a.totalSales)
                        .slice(0, 4);
                    
                    // Take only products ranked 2-4 (index 1-3)
                    const productsToShow = topProducts.slice(1, 4);
                    
                    setFilteredProducts(productsToShow);
                }
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    return (
        <section className={styles.Spots}>
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                    <div className={styles.Spot} key={product.id || product.Name}>
                        <Link to={`/products/${product.Name}`} state={{ productId: product.id }} className={styles.productImg}>
                            <img src={product.ImageUrl} alt={product.Name}/>
                            <div className={styles.spotText}>Lorem ipsum dolor</div>
                        </Link>
                    </div>
                ))
            ) : (
                <p>Loading Spots products...</p>
            )}
        </section>
    );
}

export default Spots;