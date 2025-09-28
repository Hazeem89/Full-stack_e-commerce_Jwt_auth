import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BsHeart } from "react-icons/bs";
import styles from './SimilarProduct.module.css';

const SimilarProduct = ({ Name, id }) => {
    const [products, setProducts] = useState([]);
      
    useEffect(() => {
        fetch('http://localhost:8000/products')  
        .then(resp => resp.json())
        .then(products => {
            setProducts(products)
        })
        .catch(error => {
            console.error("Error fetching similar products:", error);
        });
    }, []); // Removed products from dependency array to prevent infinite loop

    // Only filter if any word in productName exists
    const filteredProducts = products.length > 0 && Name 
    ? products
        .filter(product => {
            if (product.id === id) return false;

            const stopWords = ["the", "and", "or", "of", "in", "on", "for", "a", "an", "with", "to"];
            const nameWords = Name
                .toLowerCase()
                .split(/\s+/)
                .filter(word => !stopWords.includes(word)); // Remove stop words

            const productName = product.Name.toLowerCase();

            return nameWords.some(word => productName.includes(word));
        })
        .slice(0, 3)
    : [];


    return (
        <>  
           {filteredProducts.length > 0 && 
                (<h3 className={styles.title}>Liknande produkter</h3>) 
            }
            <section className={styles.products}> 
                {filteredProducts.length > 0 && (
                    filteredProducts.map((product) => (
                        <div className={styles.product} key={product.id || product.Name}>
                            <Link to={`/products/${product.Name}`} state={{ productId: product.id }} className={styles.productImg}>
                                <img src={product.ImageUrl} alt={product.Name}/>
                                <span className={styles.heartIcon}><BsHeart/></span>
                            </Link>
                            <span className={styles.price}>{product.Price} SEK</span>
                            <span className={styles.name}>{product.Name}</span>
                            <span className={styles.brand}>{product.Brand}</span>
                        </div>
                    ))
                )}
            </section>
        </>
    );
}

export default SimilarProduct;