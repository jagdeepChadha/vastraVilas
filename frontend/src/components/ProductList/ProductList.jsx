import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProductList.css";
import axios from "axios";

function ProductList({ products, fetchProducts }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    price: "",
    category: "",
    sizes: [],
  });

  const clothingSizes = ["S", "M", "L", "XL", "XXL"];
  const shoeSizes = ["6", "7", "8", "9", "10", "11", "12"];
  const availableSizes = productToUpdate?.sizeType === "Clothing" ? clothingSizes : shoeSizes;

  useEffect(() => {
    if (productToUpdate) {
      setUpdatedData({
        name: productToUpdate.name || "",
        price: productToUpdate.price || "",
        category: productToUpdate.category || "",
        sizes: productToUpdate.sizes || [],
      });
    }
  }, [productToUpdate]);

  const openUpdateModal = (product) => {
    setProductToUpdate(product);
    setShowUpdateModal(true);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setProductToUpdate(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (size, checked) => {
    if (checked) {
      setUpdatedData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, { size, quantity: "" }],
      }));
    } else {
      setUpdatedData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((s) => s.size !== size),
      }));
    }
  };

  // Handle Quantity Change
  const handleQuantityChange = (size, quantity) => {
    setUpdatedData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.size === size ? { ...s, quantity } : s)),
    }));
  };

  // Confirm Update
  const confirmUpdate = async () => {
    if (!productToUpdate) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/updateproduct/${productToUpdate._id}`,
        {
          ...updatedData,
          sizes: JSON.stringify(updatedData.sizes), // Fix: Send sizes as JSON string
        }
      );

      fetchProducts();
      toast.success("Product Updated Successfully", { position: "top-right", autoClose: 3000 });
      closeUpdateModal();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Try again!", { position: "top-right" });
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/products/deleteproduct/${productToDelete._id}`);
      fetchProducts();
      toast.success("Product Deleted Successfully", { position: "top-right", autoClose: 3000 });
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Try again!", { position: "top-right" });
    }
  };

  return (
    <div className="product-list">
      <h2>Product List</h2>

      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <img src={`${import.meta.env.VITE_API_BASE_URL}/${product.image}`} alt={product.name} width="50" />
            {product.name} - ${product.price}
            <br />
            Size: {product.sizes.map((s) => `${s.size} (${s.quantity})`).join(", ")}
            <div className="button-group">
              <button className="update-btn" onClick={() => openUpdateModal(product)}>Update</button>
              <button className="delete-btn" onClick={() => openDeleteModal(product)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Update Product Modal */}
      {showUpdateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Product</h3>

            <label>Name</label>
            <input type="text" name="name" value={updatedData.name} onChange={handleUpdateChange} />

            <br />
            <label>Price</label>
            <input type="number" name="price" value={updatedData.price} onChange={handleUpdateChange} />

            <br />
            <label>Category</label>
            <input type="text" name="category" value={updatedData.category} onChange={handleUpdateChange} />

            <br />
            <label>Sizes & Quantities</label>
            <div className="size-container">
              {availableSizes.map((size) => (
                <div key={size}>
                  <input
                    type="checkbox"
                    id={`size-${size}`}
                    checked={updatedData.sizes.some((s) => s.size === size)}
                    onChange={(e) => handleSizeChange(size, e.target.checked)}
                  />
                  <br />
                  <label htmlFor={`size-${size}`}>{size}</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={updatedData.sizes.find((s) => s.size === size)?.quantity || ""}
                    onChange={(e) => handleQuantityChange(size, e.target.value)}
                    disabled={!updatedData.sizes.some((s) => s.size === size)}
                  />
                </div>
              ))}
            </div>

            <button className="confirm-btn" onClick={confirmUpdate}>Update</button>
            <button className="cancel-btn" onClick={closeUpdateModal}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this product?</h3>
            <p>{productToDelete?.name}</p>
            <div className="button-group">
              <button className="confirm-btn" onClick={confirmDelete}>Yes</button>
              <button className="cancel-btn" onClick={closeDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
