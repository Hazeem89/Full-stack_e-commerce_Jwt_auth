import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
import { useCart } from '../../contexts/CartContext';


const Cart = () => {
    const { cartItems, isLoading, removeFromCart, updateQuantity, error } = useCart();
    const [updating, setUpdating] = useState({});

    const handleQuantityChange = async (productId, newQuantity) => {
        setUpdating(prev => ({ ...prev, [productId]: true }));
        await updateQuantity(productId, newQuantity);
        setUpdating(prev => ({ ...prev, [productId]: false }));
    };

    const handleRemove = async (productId) => {
        await removeFromCart(productId);
    };

    const total = cartItems.reduce((sum, item) => sum + (item.product.Price * item.quantity), 0);

    if (isLoading) {
        return (
            <div className="loadingContainer">
                <span>Laddar kundvagn...</span>
            </div>
        );
    }

    return (
    <div className="cartPage">
        <h2 className="cartTitle">Kundvagn</h2>

        {error && <div className="errorMessage">{error}</div>}

        {cartItems.length === 0 ? (
            <div className="emptyCart">
                <h3>Din kundvagn är tom</h3>
                <p>Lägg till produkter för att komma igång!</p>
                <Link to="/" className="shopLink">
                    Börja shoppa →
                </Link>
            </div>
        ) : (
            <>
                <div className="cartContainer">
                    {cartItems.map((product) => (
                        <div key={product.product.id} className="cartItem">
                            <Link to={`/products/${product.product.id}`} state={{ productId: product.product.id }}>
                                <img
                                    src={product.product.ImageUrl}
                                    alt={product.product.Name}
                                    className="productImage"
                                />
                            </Link>
                            <div className="productInfo">
                                <h4 className="productName">{product.product.Name}</h4>
                                <p className="productBrand">{product.product.Brand}</p>
                                <p className="productPrice">{product.product.Price} SEK</p>
                            </div>
                            <div className="quantityControls">
                                <button
                                    onClick={() => handleQuantityChange(product.product.id, product.quantity - 1)}
                                    disabled={updating[product.product.id] || product.quantity <= 1}
                                    className="quantityButton"
                                >
                                    -
                                </button>
                                <span className="quantityDisplay">{product.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(product.product.id, product.quantity + 1)}
                                    disabled={updating[product.product.id]}
                                    className="quantityButton"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => handleRemove(product.product.id)}
                                className="removeButton"
                                title={`Ta bort ${product.product.Name} från kundvagnen`}
                            >
                                &nbsp;&nbsp;&#x1F5D1;&nbsp;&nbsp;
                            </button>
                        </div>
                    ))}
                </div>
                <div className="totalContainer">
                    <h3 className="totalAmount">Total: {total} SEK</h3>
                    <button className="checkoutButton">Fortsätt till kassan</button>
                    <button>
                        <Link to="/" className="continueShoppingLink">
                        Fortsätt handla ←
                        </Link>
                    </button>
                    <button>
                        <Link to="/login" className="loginLink">
                        Logga in →
                        </Link>
                    </button>
                </div>
            </>
        )}
    </div>
);
};

export default Cart;
