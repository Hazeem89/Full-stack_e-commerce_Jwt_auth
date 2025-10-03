import { useEffect, useState } from 'react'
import { useLocation } from 'react-router';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useFav } from '../../contexts/FavContext';
import styles from './ProductDetails.module.css';
import SimilarProduct from '../SimilarProduct/SimilarProduct';

const ProductDetails = () => {
    const location = useLocation();
    const productId = location.state?.productId;
    const { favorites, toggleFavorite } = useFav();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (!productId) {
            console.error("No product ID provided in state.");
            return;
        }

        fetch(`http://localhost:8000/products/${productId}`)
            .then(resp => resp.json())
            .then(product => {
                setProduct(product);
                document.title = product.Name;
                console.log('Title updated:', product.Name);
            })
            .catch(error => {
                console.error("Error fetching product:", error);
            });
    }, [productId]);


    return (
        <>
            {product ? (
                <>
                    <div className={styles.container}>
                        <div className={styles.productCard}>
                            <img src={product.ImageUrl} alt={product.Name}/>
                            <span
                                className={styles.heartIcon}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(product.id);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {favorites.includes(product.id) ? (
                                    <BsHeartFill style={{ color: 'tomato' }} />
                                ) : (
                                    <BsHeart />
                                )}
                            </span>
                        </div>

                        <div className={styles.productInfo}>
                            <span className={styles.name}>{product.Name}</span><br/>
                            <span className={styles.brand}>{product.Brand}</span><br/>
                            <span><br/>{product.Description}</span><br/><br/><br/>
                            <span className={styles.price}>{product.Price} SEK</span>
                            <br/><br/>
                            <button className={styles.button}>Lägg i varukorg</button>
                        </div>
                    </div>

                    {/* Only render SimilarProduct when product exists */}
                    <SimilarProduct Name={product.Name} id={product.id} />
                </>
            ): "Laddar..."}
        </>
    );
}

export default ProductDetails;
