import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./YourReviews.css";
import Navbar from "../../components/Navbar/Navbar";

function YourReviews() {
  const { authenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
      return;
    }

    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/reviews/getUserReviews`,
          { withCredentials: true }
        );
        setReviews(data.reviews);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [authenticated, navigate]);

  const handleDeleteReview = async () => {
    if (!selectedReviewId) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/reviews/deleteReview/${selectedReviewId}`,
        { withCredentials: true }
      );

      // Update UI by removing the deleted review
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== selectedReviewId)
      );
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (loading) return <p>Loading reviews...</p>;

  return (
    <>
    <Navbar/>
    <div className="reviews-container">
      <h2>Your Reviews</h2>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="review-card">
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${review.product.image}`}
              alt={review.product.name}
              className="review-product-image"
            />
            <div className="review-details">
              <h3>{review.product.name}</h3>
              <p><strong>Brand:</strong> {review.product.brand}</p>
              <p><strong>Price:</strong> ${review.product.price}</p>
              <p><strong>Rating:</strong> {review.rating.toFixed(1)} ⭐</p>
              <p><strong>Comment:</strong> {review.comment}</p>
              <p><strong>Reviewed on:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>

              {/* Buttons */}
              <div className="review-actions">
                <button
                  className="delete-review-btn"
                  onClick={() => {
                    setSelectedReviewId(review._id);
                    setShowConfirmModal(true);
                  }}
                >
                  Delete Review
                </button>
                <button
                  className="view-product-btn"
                  onClick={() => navigate(`/product/${review.product._id}`)}
                >
                  View Product
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Confirmation Modal for Deletion */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this review?</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteReview} className="confirm-button">
                Yes, Delete
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default YourReviews;
