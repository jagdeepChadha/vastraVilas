import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { AuthContext } from "../../contexts/AuthContext"; // Import AuthContext
import axios from "axios";
import "./ProductPage.css";
import Navbar from "../../components/Navbar/Navbar";

function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user, authenticated } = useContext(AuthContext); // Get user from context
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/products/getSingleProduct/${id}`,
          { withCredentials: true }
        );
        setProduct(data);

        // Check if user has already reviewed
        if (user) {
          const existingReview = data.reviews.find(review => review.user._id === user._id);
          if (existingReview) {
            setUserReview(existingReview);
            setRating(existingReview.rating);
            setComment(existingReview.comment);
            setIsEditingReview(true);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id, user]); 

  if (!product) return <div>Loading...</div>;

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product._id, 1, selectedSize);
    }
  };

  const handleSubmitReview = async () => {
    if (!authenticated) {
      alert("Please log in to submit a review.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/reviews/writeReview`,
        {
          productId: id,
          rating,
          comment,
        },
        { withCredentials: true }
      );
  
      const newReview = {
        ...response.data.review,
        user: { _id: user._id, name: user.name } // Ensure user name is included
      };
  
      setProduct(prev => ({
        ...prev,
        reviews: isEditingReview
          ? prev.reviews.map(r => (r.user._id === user._id ? newReview : r))
          : [...prev.reviews, newReview]
      }));
  
      setUserReview(newReview);
      setShowReviewModal(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="product-page-container">
        <div className="product-page-content">
          <div className="product-page-image">
            <img src={`${import.meta.env.VITE_API_BASE_URL}/${product.image}`} alt={product.name} />
          </div>

          <div className="product-page-info">
            <h2>{product.name}</h2>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Size Type:</strong> {product.sizeType}</p>
            <p><strong>Color:</strong> {product.color}</p>
            <p><strong>Gender:</strong> {product.gender}</p>
            <p><strong>Category:</strong> {product.category}</p>

            {product.discount > 0 && (
              <p className="product-discount"><strong>Discount:</strong> {product.discount}% OFF</p>
            )}

            <div className="product-size-selection">
              <label><strong>Select Size:</strong></label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                <option value="">Select</option>
                {product.sizes.map((sizeObj) => (
                  <option key={sizeObj.size} value={sizeObj.size}>{sizeObj.size}</option>
                ))}
              </select>
            </div>

            <button
              className="product-add-to-cart-btn"
              disabled={!selectedSize}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            {/* Display Reviews */}
            <h3>Reviews</h3>
            {product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review._id} className="review">
                  <p><strong>{review.user.name}</strong> - {review.rating.toFixed(1)}⭐</p>
                  <p>{review.comment}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}

            {/* Add Review Button */}
            {authenticated && (
              <button onClick={() => setShowReviewModal(true)}>
                {isEditingReview ? "Edit Your Review" : "Write a Review"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="review-modal">
          <h2>{isEditingReview ? "Edit Your Review" : "Write a Review"}</h2>
          <label>Rating:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />

          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button onClick={handleSubmitReview}>
            {isEditingReview ? "Update Review" : "Submit Review"}
          </button>
          <button onClick={() => setShowReviewModal(false)}>Cancel</button>
        </div>
      )}
    </>
  );
}

export default ProductPage;
