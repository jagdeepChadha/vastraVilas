import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Ordersummary.css";

const OrderSummary = () => {
  const { cartItems, fetchCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAddress = location.state?.selectedAddress;
  const [subtotal, setSubtotal] = useState(0);
  const taxRate = 0.1;
  const shippingFee = 1.99;

  useEffect(() => {
    fetchCart();
  }, []);


  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setSubtotal(total);
  }, [cartItems]);

  const taxAmount = subtotal * taxRate;
  const totalPrice = subtotal + taxAmount + shippingFee;

  return (
    <>
      <Navbar />
      <div className="order-summary-container">
        <div className="summary-cart-items">
          <h2>Your Cart</h2>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item._id} className="summary-cart-item">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/${item.product.image}`}
                  alt={item.product.name}
                />
                <div className="summary-cart-item-details">
                  <p>
                    <strong>{item.product.name}</strong>
                  </p>
                  <p>Size: {item.size}</p>
                  <p>Price: ${item.product.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <button
                  className="remove-button"
                  onClick={() => removeFromCart(item.product._id, item.size)}
                >
                  X
                </button>
              </div>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>

        <div className="order-total">
          <h2>Order Summary</h2>
          <p>
            Subtotal: <strong>${subtotal.toFixed(2)}</strong>
          </p>
          <p>
            Tax (10%): <strong>${taxAmount.toFixed(2)}</strong>
          </p>
          <p>
            Shipping Fee: <strong>${shippingFee.toFixed(2)}</strong>
          </p>
          <h3>
            Total: <strong>${totalPrice.toFixed(2)}</strong>
          </h3>
          <button
            className="proceed-payment-button"
            onClick={() =>
              navigate("/payments", { state: { selectedAddress , totalPrice} })
            }
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
