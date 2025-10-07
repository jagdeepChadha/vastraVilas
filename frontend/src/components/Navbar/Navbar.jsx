import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AuthContext } from "../../contexts/AuthContext";
import { CartContext } from "../../contexts/CartContext";
import Cart from "../Cart/Cart";

function Navbar({ activePage, setActivePage}) {
  const { authenticated, isAdmin, loading, setAuthenticated, user } =
    useContext(AuthContext);
  const { cartItems = [] } = useContext(CartContext);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);

  if (loading) return <p>Loading...</p>;

  const handleSearch = () => {
    navigate(`/productList`,{state:{search}});
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setAuthenticated(false);
        window.location.href = "/login";
      } else {
        console.error("Logout Failed");
      }
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const navigate = useNavigate();

  const handleUserInfoClick = async () => {
    navigate("/orders");
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-logo">
          <img onClick={() => navigate("/login")} src="/samarkan.png" alt="logo" />
        </div>

        {authenticated && (
          <>
            {!isAdmin ? (
              <div className="search">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="search-bar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="search-button" onClick={handleSearch}>
                  <img src="/search.png" alt="search" />
                </button>
              </div>
            ) : (
              <div className="admin-controls">
                <button
                  className={`admin-button ${
                    activePage === "products" ? "active" : ""
                  }`}
                  onClick={() => setActivePage("products")}
                >
                  Manage Products
                </button>
                <button
                  className={`admin-button ${
                    activePage === "orders" ? "active" : ""
                  }`}
                  onClick={() => setActivePage("orders")}
                >
                  Manage Orders
                </button>
              </div>
            )}
          </>
        )}

        <div className="manage-user">
          {authenticated && (
            <>
              {authenticated && !isAdmin && (
                <>
                  <button
                    className="cart-btn"
                    onClick={() => setShowCart(true)}
                  >
                    {cartItems.length > 0 && (
                      <span className="cart-count">{cartItems.length}</span>
                    )}
                    <img src="/shopping-cart.png" alt="cart" />
                  </button>
                  <button
                    className="cart-btn"
                    onClick={() => navigate("/yourReviews")}
                  >
                    <img src="/reviews.jpg" alt="reviews" />
                  </button>
                  <button className="cart-btn" onClick={handleUserInfoClick}>
                    <img src="/tracking.png" alt="user" />
                  </button>
                </>
              )}
              <button
                className="log-out"
                onClick={() => setShowLogoutModal(true)}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>

      {showCart && <Cart onClose={() => setShowCart(false)} />}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button onClick={handleLogout} className="confirm-button">
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="cancel-button"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
