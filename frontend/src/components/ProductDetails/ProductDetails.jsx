import { useEffect, useState } from 'react'
import { useLocation } from 'react-router';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useFav } from '../../contexts/FavContext';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductDetails.module.css';
import SimilarProduct from '../SimilarProduct/SimilarProduct';

const ProductDetails = () => {
    const location = useLocation();
    const productId = location.state?.productId;
    const { favorites, toggleFavorite } = useFav();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

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

    const handleAddToCart = (e) => {
        if (!product) return;
        
        const button = e.currentTarget;
        const productImage = document.querySelector(`.${styles.productCard} img`);
        const cartIcon = document.querySelector('.cartIconTarget');
        
        if (!productImage || !cartIcon) {
            addToCart(product, 1);
            return;
        }

        // Get positions
        const imageRect = productImage.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Create flying image
        const flyingImg = productImage.cloneNode(true);
        flyingImg.style.position = 'fixed';
        flyingImg.style.left = `${imageRect.left}px`;
        flyingImg.style.top = `${imageRect.top}px`;
        flyingImg.style.width = `${imageRect.width}px`;
        flyingImg.style.height = `${imageRect.height}px`;
        flyingImg.style.zIndex = '9999';
        flyingImg.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        flyingImg.style.pointerEvents = 'none';
        flyingImg.style.borderRadius = '10px';
        
        document.body.appendChild(flyingImg);

        // Trigger animation
        setIsAnimating(true);
        requestAnimationFrame(() => {
            flyingImg.style.left = `${cartRect.left}px`;
            flyingImg.style.top = `${cartRect.top}px`;
            flyingImg.style.width = '0px';
            flyingImg.style.height = '0px';
            flyingImg.style.opacity = '0';
        });

        // Cleanup and add to cart
        setTimeout(() => {
            flyingImg.remove();
            addToCart(product, 1);
            setIsAnimating(false);
        }, 800);
    };

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
                            <button
                                className={`${styles.button} ${isAnimating ? styles.buttonAnimating : ''}`}
                                onClick={handleAddToCart}
                                disabled={isAnimating}
                            >
                                {isAnimating ? 'Lägger till...' : 'Lägg i varukorg'}
                            </button>
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