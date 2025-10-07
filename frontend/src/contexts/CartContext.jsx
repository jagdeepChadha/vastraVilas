import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { authenticated } = useContext(AuthContext);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users/cart`;

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const { data } = await axios.get(API_URL, { withCredentials: true });
      setCartItems(data || []);
    } catch (error) {
      console.error(
        "Error fetching cart:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchCart();
    }
  }, [authenticated]);

  const addToCart = async (productId, quantity = 1, selectedSize) => {
    try {
      await axios.post(
        API_URL,
        { productId, quantity, selectedSize },
        { withCredentials: true }
      );
      await fetchCart();
    } catch (error) {
      console.error(
        "Error adding to cart:",
        error.response?.data?.message || error.message
      );
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      await axios.delete(
        `${API_URL}?productId=${productId}&selectedSize=${size}`,
        { withCredentials: true }
      );
      setCartItems((prevItems) =>
        prevItems.filter(
          (item) => !(item.product._id === productId && item.size === size)
        )
      );
    } catch (error) {
      console.error(
        "Error removing from cart:",
        error.response?.data?.message || error.message
      );
    }
  };

  const updateCartQuantity = async (productId, size, newQuantity) => {
    try {
      if (newQuantity < 1) return; 
  
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/cart/${productId}`,
        { quantity: newQuantity }, 
        { withCredentials: true }
      );
  
      await fetchCart(); 
    } catch (error) {
      console.error(
        "Error updating cart quantity:",
        error.response?.data?.message || error.message
      );
    }
  };
  

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateCartQuantity, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
