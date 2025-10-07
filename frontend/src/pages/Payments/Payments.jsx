import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Payments.css";
import Navbar from "../../components/Navbar/Navbar";

const Payments = () => {
  const location = useLocation();
  const selectedAddress = location.state?.selectedAddress;
  const totalPrice = location.state?.totalPrice;

  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/payments/stripe-key`
        );
        setStripePromise(loadStripe(data.publishableKey));
      } catch (error) {
        console.error("Error loading Stripe key:", error);
      }
    };
    fetchStripeKey();
  }, []);

  return (
    <>
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <PaymentForm selectedAddress={selectedAddress}  totalPrice={totalPrice}/>
        </Elements>
      )}
    </>
  );
};

const PaymentForm = ({ selectedAddress,totalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      let paymentStatus = "Pending";

      if (paymentMethod !== "Cash on Delivery") {
        if (!stripe || !elements) return;

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/payments/create-payment-intent`,
          {
            amount: Math.round(totalPrice * 100),
          }
        );

        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: { card: elements.getElement(CardElement) },
        });

        if (result.error) {
          console.error("Payment Error:", result.error.message);
          setLoading(false);
          return;
        }

        if (result.paymentIntent.status === "succeeded") {
          paymentStatus = "Paid";
        } else {
          console.error("Payment failed");
          setLoading(false);
          return;
        }
      }

      await placeOrder(paymentStatus);
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
    }
  };


  const placeOrder = async (paymentStatus) => {
    if (!selectedAddress) {
      console.error("No address selected. Cannot place order.");
      alert("Please select a shipping address before proceeding.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/orders`,
        {
          address: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zip: selectedAddress.zip,
            country: selectedAddress.country,
          },
          paymentMethod,
          paymentStatus,
        }
      );

      alert("Order placed successfully!");
      navigate("/order-confirmation", {
        state: { order: response.data.order },
      });
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      alert(`Order failed: ${error.response?.data?.message || "Server error"}`);
      navigate("/productList");
    }
  };
  

  return (
    <>
    <Navbar/>
    <div className="payment-container">
      <h2 className="payment-title">Payment</h2>

      <div className="payment-method-container">
        <h3 className="payment-subtitle">Select Payment Method</h3>
        {["Credit Card", "Debit Card", "Cash on Delivery"].map((method) => (
          <label className="payment-method-label" key={method}>
            <input
              type="radio"
              value={method}
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
              className="payment-method-radio"
            />
            {method}
          </label>
        ))}
      </div>


      {paymentMethod !== "Cash on Delivery" && (
        <div className="card-element-container">
          <CardElement className="stripe-card-element" />
        </div>
      )}

      <button
        className="payment-button"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm Payment"}
      </button>
    </div>
    </>
  );
};

export default Payments;
