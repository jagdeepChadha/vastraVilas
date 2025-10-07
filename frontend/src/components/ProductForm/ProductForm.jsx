import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProductForm.css";

function ProductForm({ fetchProducts, onClose }) {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    price: "",
    sizeType: "Clothing",
    sizes: [],
    color: "",
    gender: "Male",
    category: "",
    discount: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const clothingSizes = ["S", "M", "L", "XL", "XXL"];
  const shoeSizes = ["6", "7", "8", "9", "10", "11", "12"];
  const availableSizes =
    product.sizeType === "Clothing" ? clothingSizes : shoeSizes;

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSizeChange = (size, checked) => {
    if (checked) {
      setProduct((prev) => ({
        ...prev,
        sizes: [...prev.sizes, { size, quantity: "" }],
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((s) => s.size !== size),
      }));
    }
  };

  const handleQuantityChange = (size, quantity) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.size === size ? { ...s, quantity } : s)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!image) {
      toast.warn("Please upload an image.", { position: "top-right" });
      return;
    }
  
    // Ensure all selected sizes have a valid quantity
    if (product.sizes.some((s) => s.quantity === "" || s.quantity <= 0)) {
      toast.warn("Please enter quantity for all selected sizes.", { position: "top-right" });
      return;
    }
  
    const formData = new FormData();
    Object.keys(product).forEach((key) => {
      if (key === "sizes") {
        formData.append("sizes", JSON.stringify(product.sizes));
      } else {
        formData.append(key, product[key]);
      }
    });
    formData.append("image", image);
  
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/addproduct`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      toast.success("Product added successfully!", { position: "top-right", autoClose: 3000 });
      fetchProducts();
      
      setProduct({
        name: "",
        brand: "",
        price: "",
        sizeType: "Clothing",
        sizes: [],
        color: "",
        gender: "Male",
        category: "",
        discount: "",
      });
      setImage(null);
      if (onClose) onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add product. Try again!";
      toast.error(errorMsg, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="brand"
        placeholder="Brand"
        value={product.brand}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={product.price}
        onChange={handleChange}
        required
      />

      <select
        name="sizeType"
        value={product.sizeType}
        onChange={handleChange}
        required
      >
        <option value="Clothing">Clothing</option>
        <option value="Shoes">Shoes</option>
      </select>

      <div className="size-container">
        {availableSizes.map((size) => (
          <div key={size}>
            <input
              type="checkbox"
              id={`size-${size}`}
              checked={product.sizes.some((s) => s.size === size)}
              onChange={(e) => handleSizeChange(size, e.target.checked)}
            />
            <label className="size-label" htmlFor={`size-${size}`}>
              {size}
            </label>
            <input
              type="number"
              placeholder="Quantity"
              value={product.sizes.find((s) => s.size === size)?.quantity || ""}
              onChange={(e) => handleQuantityChange(size, e.target.value)}
              disabled={!product.sizes.some((s) => s.size === size)}
            />
          </div>
        ))}
      </div>

      <input
        type="text"
        name="color"
        placeholder="Color"
        value={product.color}
        onChange={handleChange}
        required
      />

      <select
        name="gender"
        value={product.gender}
        onChange={handleChange}
        required
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={product.category}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="discount"
        placeholder="Discount"
        value={product.discount}
        onChange={handleChange}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}

export default ProductForm;
