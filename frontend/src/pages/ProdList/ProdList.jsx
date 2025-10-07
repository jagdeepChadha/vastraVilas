import Navbar from "../../components/Navbar/Navbar";
import "./ProdList.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import debounce from "lodash/debounce";
import { useLocation } from "react-router-dom";

function ProdList() {
  const location = useLocation();
  const searchTerm = location.state?.search || "";

  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 1000]);


  
  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    user.gender,
    page,
    searchTerm,
    selectedCategory,
    selectedSize,
    selectedColor,
    debouncedPriceRange,
  ]);

  // useEffect(() => {
  //   fetchFilters();
  // }, [selectedCategory, selectedColor, selectedSize]);

  const debouncedPriceUpdate = debounce((value) => {
    setDebouncedPriceRange(value);
  }, 500);

  const fetchFilters = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/filters?category=${selectedCategory}&color=${selectedColor}`
      );
      setCategories(data.categories);
      setSizes(data.sizes);
      setColors(data.colors);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: response } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/getproducts`,
        {
          params: {
            page,
            limit: 20,
            gender: user.gender,
            search: searchTerm,
            category: selectedCategory,
            size: selectedSize,
            color: selectedColor,
            minPrice: debouncedPriceRange[0],
            maxPrice: debouncedPriceRange[1],
          },
        }
      );

      setProducts(response.products);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error.message);
    }
    setLoading(false);
  };

  const uniqueSizes = [...new Set(sizes.map((sizeObj) => sizeObj.size))];

  return (
    <div className="products-page">
      <Navbar/>

      {/* Filters Section */}
      <div className="filters">
        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {/* Size Filter */}
        {sizes.length > 0 && (
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="">All Sizes</option>
            {uniqueSizes.map((size, index) => (
              <option key={size || index} value={size}>
                {size}
              </option>
            ))}
          </select>
        )}

        {/* Color Filter */}
        {colors.length > 0 && (
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            <option value="">All Colors</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        )}

        {/* Price Slider Filter */}
        <div className="price-slider">
          <p>Price Range: ${priceRange[0]} - ${priceRange[1]}</p>
          <Slider
            range
            min={0}
            max={400}
            defaultValue={priceRange}
            value={priceRange}
            onChange={(value) => {
              setPriceRange(value);
              debouncedPriceUpdate(value);
            }}
          />
        </div>

        {/* Reset Filters Button */}
        <button
          className="reset-btn"
          onClick={() => {
            setSelectedCategory("");
            setSelectedSize("");
            setSelectedColor("");
            setPriceRange([0, 1000]);
            setDebouncedPriceRange([0, 1000]);
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <div className="product-card" key={product._id}>
                <img src={`${import.meta.env.VITE_API_BASE_URL}/${product.image}`} alt="" />
                <p className="product-name">{product.name}</p>
                <p className="product-price">${product.price}</p>

                {product.rating !== null ? (
                  <p className="product-rating">Rating: {product.rating.toFixed(1)} ⭐</p>
                ) : (
                  <p className="product-rating">No Ratings Yet</p>
                )}

                {product.sizes?.length > 0 && (
                  <p className="available-sizes">
                    Available sizes: {product.sizes.map((sizeObj) => sizeObj.size).join(", ")}
                  </p>
                )}

                {!product.discount && <p className="arrival">New Arrival</p>}
                {product.discount && (
                  <p className="discount">{product.discount}% Discount</p>
                )}

                <div className="add-to-cart">
                  <Link
                    to={`/product/${product._id}`}
                    state={{ product }}
                    className="view-product-link"
                  >
                    <button className="add-to-cart-button">View Product</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              <img className="page-buttons" src="/prev.png" alt="Previous" />
            </button>
            <span> Page {page} of {totalPages} </span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
              <img className="page-buttons" src="/next.png" alt="Next" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProdList;
