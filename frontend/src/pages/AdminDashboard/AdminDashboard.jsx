import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import ProductForm from "../../components/ProductForm/ProductForm";
import ProductList from "../../components/ProductList/ProductList";
import OrdersList from "../../components/OrdersList/OrdersList";
import { ToastContainer, toast } from "react-toastify";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [cancellationFilter, setCancellationFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const productsPerPage = 5;

  useEffect(() => {
    if (activePage === "products") {
      fetchProducts();
    } else if (activePage === "orders") {
      fetchOrders();
    }
  }, [activePage, currentPage, statusFilter, cancellationFilter]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  useEffect(() => {
    filterProducts();
  }, [productSearchQuery, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/getproducts?page=${currentPage}&limit=${productsPerPage}`
      );
      setProducts(data.products);
      setFilteredProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const query = `${import.meta.env.VITE_API_BASE_URL}/api/users/admin/allOrders`;
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (cancellationFilter) params.cancellationRequested = cancellationFilter;
      const { data } = await axios.get(query, { params });
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const filterOrders = () => {
    if (!searchQuery) {
      setFilteredOrders(orders);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = orders.filter((order) =>
      order._id.toLowerCase().includes(lowerQuery) ||
      (order.user?.name && order.user.name.toLowerCase().includes(lowerQuery)) ||
      (Array.isArray(order.products) && order.products.some((item) => item.product.name.toLowerCase().includes(lowerQuery)))
    );
    setFilteredOrders(filtered);
  };

  const filterProducts = () => {
    if (!productSearchQuery) {
      setFilteredProducts(products);
      return;
    }
    const lowerQuery = productSearchQuery.toLowerCase();
    const filtered = products.filter((product) =>
      product._id.toLowerCase().includes(lowerQuery) ||
      product.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/orders/${orderId}`,
        { status: newStatus }
      );
      toast.success("Order status updated successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="admin-dashboard">
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        {activePage === "products" ? (
          <>
            <h1 className="title">Manage Products</h1>
            <input
              type="text"
              placeholder="Search by Product ID or Name"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="search-bar-admin-dashboard"
            />
            <button className="add-product-btn" onClick={() => setShowForm(true)}>
              + Add Product
            </button>
            <ProductList
              products={filteredProducts}
              fetchProducts={fetchProducts}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </>
        ) : (
          <>
            <h1 className="title">Manage Orders</h1>
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar-admin-dashboard"
            />
            <div className="filters-container">
              <label>Filter by Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <label>Cancellation Requested:</label>
              <select value={cancellationFilter} onChange={(e) => setCancellationFilter(e.target.value)}>
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <OrdersList orders={filteredOrders} updateOrderStatus={updateOrderStatus} fetchOrders={fetchOrders} />
          </>
        )}

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="close-btn" onClick={() => setShowForm(false)}>
                ✖
              </button>
              <ProductForm fetchProducts={fetchProducts} onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;