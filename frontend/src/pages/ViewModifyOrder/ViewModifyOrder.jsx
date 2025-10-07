import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "./ViewModifyOrder.css";

const ViewModifyOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellationRequested, setCancellationRequested] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/users/orders/singleOrder/${id}`,
          { withCredentials: true }
        );
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const requestCancellation = async () => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/users/orders/requestCancellation/${id}`,
        {},
        { withCredentials: true }
      );
      setCancellationRequested(true);
      alert("Cancellation request submitted successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request cancellation.");
    }
  };

  if (loading) return <p className="order-mod-page-loading">Loading...</p>;
  if (error) return <p className="order-mod-page-error">{error}</p>;

  const taxRate = 0.1;
  const shippingFee = 1.99;
  const subtotal = order.products.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount + shippingFee;

  const openInvoiceWindow = () => {
    const invoiceUrl = `/printInvoice?id=${order._id}`;
    window.open(invoiceUrl, "_blank", "width=800,height=600");
  };

  return (
    <>
      <Navbar />
      <div className="order-mod-page-container">
        <h2 className="order-mod-page-title">Order Details</h2>

        <div className="order-mod-page-info">
          <div className="order-mod-page-section">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
              {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="order-mod-page-section">
            <h3>Payment Method</h3>
            <p>{order.paymentMethod}</p>
          </div>

          <div className="order-mod-page-section order-mod-page-summary">
            <h3 className="order-mod-page-order-summary-title">
              Order Summary
            </h3>
            <p>
              <strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}
            </p>
            <p>
              <strong>Tax (10%):</strong> ₹{taxAmount.toFixed(2)}
            </p>
            <p>
              <strong>Shipping Fee:</strong> ₹{shippingFee.toFixed(2)}
            </p>
            <p className="order-mod-page-grand-total">
              <strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="order-mod-page-status">
          <h3>Status:</h3>
          <span
            className={`order-mod-page-status-label ${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {order.orderStatus}
          </span>
        </div>

        <h3>Products:</h3>
        <ul className="order-mod-page-product-list">
          {order.products.map((item) => (
            <li key={item.product._id} className="order-mod-page-product-item">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/${
                  item.product.image
                }`}
                alt={item.product.name}
                className="order-mod-page-product-image"
              />
              <p className="order-mod-page-product-name">{item.product.name}</p>
              <div className="order-mod-page-product-details">
                <p>
                  <strong>Size:</strong> {item.selectedSize}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Price:</strong> ₹{item.priceAtPurchase}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {order.orderStatus !== "Cancelled" &&
        !order.cancellationRequested &&
        !cancellationRequested ? (
          <button
            className="order-mod-page-cancel-button"
            onClick={requestCancellation}
          >
            Request Cancellation
          </button>
        ) : (
          <p className="order-mod-page-cancelled-message">
            Cancellation Requested
          </p>
        )}

        <button
          className="order-mod-page-invoice-button"
          onClick={openInvoiceWindow}
        >
          Print Invoice
        </button>

        <button
          className="order-mod-page-home-button"
          onClick={() => navigate("/productList")}
        >
          Go to Home
        </button>
      </div>
    </>
  );
};

export default ViewModifyOrder;
