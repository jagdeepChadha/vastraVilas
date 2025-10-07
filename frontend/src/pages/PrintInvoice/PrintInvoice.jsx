import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./PrintInvoice.css";

const PrintInvoice = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/orders/singleOrder/${orderId}`,
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
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        window.print();
      }, 500); 
    }
  }, [order]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const taxRate = 0.1;
  const shippingFee = 1.99;
  const subtotal = order.products.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount + shippingFee;

  return (
    <div className="invoice-container">
      <h1 className="invoice-title">Invoice</h1>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Shipping Address:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}</p>
      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      <p><strong>Payment Status:</strong> {order.paymentStatus}</p>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((item) => (
            <tr key={item.product._id}>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.priceAtPurchase}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="2"><strong>Subtotal</strong></td>
            <td>₹{subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="2"><strong>Tax (10%)</strong></td>
            <td>₹{taxAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="2"><strong>Shipping Fee</strong></td>
            <td>₹{shippingFee.toFixed(2)}</td>
          </tr>
          <tr className="invoice-total">
            <td colSpan="2"><strong>Grand Total</strong></td>
            <td><strong>₹{grandTotal.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PrintInvoice;