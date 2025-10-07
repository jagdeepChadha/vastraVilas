import React, { useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Orderconfirmation.css";
import { AuthContext } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar/Navbar";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const { user } = useContext(AuthContext);

  const invoiceRef = useRef();

  const openInvoiceWindow = () => {
    const invoiceUrl = `/printInvoice?id=${order._id}`;
    window.open(invoiceUrl, "_blank", "width=800,height=600");
  };

  if (!order) {
    return (
      <div className="order-error">
        <h1>No order details found.</h1>
        <button onClick={() => navigate("/productList")}>Go to Shop</button>
      </div>
    );
  }

  const taxRate = 0.1;
  const shippingFee = 1.99;
  const subtotal = order.products.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount + shippingFee;

  return (
    <>
      <Navbar />
      <div className="order-confirmation">
        <h1 className="order-confirmation-title">✅ You Order Has been Placed Succesfully</h1>
        <h2>Here is your invoice:</h2>
        <div className="invoice" ref={invoiceRef}>
          <h2>Invoice</h2>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Customer:</strong> {user?.name || "N/A"}</p>
          <p><strong>Address:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zip}, {order.shippingAddress.country}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((product, index) => (
                <tr key={index}>
                  <td>{product.product.name}</td>
                  <td>{product.quantity}</td>
                  <td>${product.priceAtPurchase}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2"><strong>Subtotal</strong></td>
                <td>${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="2"><strong>Tax (10%)</strong></td>
                <td>${taxAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="2"><strong>Shipping Fee</strong></td>
                <td>${shippingFee.toFixed(2)}</td>
              </tr>
              <tr className="total">
                <td colSpan="2"><strong>Grand Total</strong></td>
                <td><strong>${grandTotal.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button onClick={openInvoiceWindow} className="print-button">Print Invoice</button>
        <button onClick={() => navigate("/productList")}>Go to Home</button>
      </div>
    </>
  );
};

export default OrderConfirmation;
