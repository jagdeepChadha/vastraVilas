import { useContext } from "react";
import { CartContext } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart({ onClose }) {
  const { cartItems, removeFromCart, updateCartQuantity } =
    useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart" onClick={(e) => e.stopPropagation()}>
        <button className="close-cart" onClick={onClose}>
          ✖
        </button>
        <h2>Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <p className="empty-cart-summary">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/${item.product.image}`}
                    alt={item.product.name}
                  />
                  <div className="cart-item-details">
                    <p>{item.product.name}</p>
                    <p>Size: {item.size}</p>
                    <p>Price: ${item.product.price}</p>

                    {/* Quantity Selector */}
                    <div className="quantity-selector">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.product._id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.product._id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.product._id, item.size)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Total: ${totalPrice.toFixed(2)}</h3>
              <button className="checkout-button" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
