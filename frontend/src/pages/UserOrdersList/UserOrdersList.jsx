import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "./UserOrdersList.css";

const UserOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/orders`,
          {
            withCredentials: true,
          }
        );
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <p className="loading-text">Loading orders...</p>;

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "user-orders-page-status-label pending";
      case "processing":
        return "user-orders-page-status-label processing";
      case "shipped":
        return "user-orders-page-status-label shipped";
      case "delivered":
        return "user-orders-page-status-label delivered";
      case "cancelled":
        return "user-orders-page-status-label cancelled";
      case "out for delivery":
        return "user-orders-page-status-label out-for-delivery";
      default:
        return "";
    }
  };

  return (
    <>
      <Navbar />
      <div className="orders-header">
        <h2>Your Orders</h2>
        <button
          className="home-button"
          onClick={() => navigate("/productList")}
        >
          Go to Home
        </button>
      </div>

      <div className="orders-container">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <p>
                    <strong>Order Placed:</strong> {formatDate(order.createdAt)}
                  </p>
                  <p>
                    <strong>Total:</strong> ${order.totalPrice}
                  </p>
                  <p>
                    <strong>Payment:</strong> {order.paymentMethod} (
                    {order.paymentStatus})
                  </p>
                </div>
                <p className="order-id">Order # {order._id}</p>
              </div>

              <div className="order-status">
                <span className={getStatusClass(order.orderStatus)}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-products">
                {order.products.map((item) => (
                  <div key={item.product._id} className="product-details">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${
                        item.product.image
                      }`}
                      alt={item.product.name}
                      className="product-image"
                    />
                  </div>
                ))}
              </div>

              <div className="order-actions">
                <button
                  className="view-order-button"
                  onClick={() => navigate(`/viewModifyOrder/${order._id}`)}
                >
                  View/Modify
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-orders">No orders found.</p>
        )}
      </div>
    </>
  );
};

export default UserOrdersList;
