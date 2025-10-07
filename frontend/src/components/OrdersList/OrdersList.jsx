import React from "react";
import "./OrdersList.css";

function OrdersList({ orders, updateOrderStatus }) {
  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const handleStatusChange = async (orderId, newStatus, userEmail) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/users/orders/admin/mailStatus/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId, newStatus, email: userEmail }),
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Error updating status or sending email:", error);
    }
  };

  console.log(orders);

  return (
    <div className="orders-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Shipping Address</th>
            <th>Total Price</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Cancellation Requested</th>
            <th>Order Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.name || "Unknown"}</td>
              <td>
                {order.products &&
                  order.products.product &&
                  order.products.product.map((item) => (
                    <div key={item._id}>
                      {item.name} - ${item.price.toFixed(2)},
                    </div>
                  ))}
              </td>
              <td>
                {order.shippingAddress.fullName} <br />
                {order.shippingAddress.phone} <br />
                {order.shippingAddress.street}, {order.shippingAddress.city}{" "}
                <br />
                {order.shippingAddress.state} - {order.shippingAddress.zip},{" "}
                {order.shippingAddress.country}
              </td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.paymentStatus}</td>
              <td>{order.cancellationRequested ? "Yes" : "No"}</td>
              <td>{order.orderStatus}</td>
              <td>
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    handleStatusChange(
                      order._id,
                      e.target.value,
                      order.user.email
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersList;
