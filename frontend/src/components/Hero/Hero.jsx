import { Link } from "react-router";
import styles from './Hero.module.css';
import { useEffect, useState } from "react";

const Hero = () => {
    const [products, setProducts] = useState([]);
    const [topProduct, setTopProduct] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/products')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                
                // Find product with highest totalSales
                if (data.length > 0) {
                    const productWithHighestSales = data.reduce((highest, current) => {
                        return (current.totalSales > highest.totalSales) ? current : highest;
                    }, data[0]);
                    
                    setTopProduct(productWithHighestSales);
                }
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    return (
        <section className={styles.hero}>
            {topProduct && (
                 
                <>

                <div className={styles.heroCard}>
                    <img src={topProduct.productImage} alt={topProduct.productName} />
                </div>
                <div className={styles.heroText}>
                        <h3>Unveil Your Style: Where Fashion Meets Confidence</h3>
                        <p>Discover the latest trends, timeless classics, and unique pieces that speak to your individuality. Elevate your wardrobe with our curated collections designed to inspire and empower every look.</p>
                </div>
                </> 
                
                
            )}
            
        </section>
    );
}

export default Hero;