const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  createOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  clearUserOrders,
  requestCancellation,
  getSingleOrder,
  deleteAllOrders,
  mailOrderStatus,
  writeReview,
  deleteReview,
  getUserReviews,
} = require("../controllers/user");

const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Authenticated user routes
router.get("/authCheck", authMiddleware, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});
router.post("/logout", authMiddleware, logoutUser);
router.put("/updateuser/:id", authMiddleware, updateUser);
router.get("/cart", authMiddleware, getCart);
router.post("/cart", authMiddleware, addToCart);
router.put("/cart/:productId", authMiddleware, updateCartItem);
router.delete("/cart",authMiddleware,removeFromCart);

router.post("/address", authMiddleware, addAddress);
router.get("/address", authMiddleware, getAddress);
router.put("/address/:index", authMiddleware, updateAddress);
router.delete("/address/:index", authMiddleware, deleteAddress);

router.post("/orders", authMiddleware, createOrder);
router.get("/orders", authMiddleware, getUserOrders);
router.put("/orders/requestCancellation/:id",authMiddleware,requestCancellation);
router.get("/orders/singleOrder/:id",authMiddleware,getSingleOrder);
router.post("/reviews/writeReview",authMiddleware,writeReview);
router.delete("/reviews/deleteReview/:id",authMiddleware,deleteReview);
router.get("/reviews/getUserReviews",authMiddleware,getUserReviews);

// Admin-only routes
router.get("/", authMiddleware, adminMiddleware, getUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUser);
router.delete("/deleteuser/:id", authMiddleware, adminMiddleware, deleteUser);
router.put("/orders/:orderId", authMiddleware, adminMiddleware, updateOrderStatus);
router.get("/admin/allOrders", authMiddleware, adminMiddleware, getAllOrders);
router.delete("/admin/deleteAllOrders",authMiddleware,adminMiddleware,deleteAllOrders);
router.put("/clearOrders/:id", authMiddleware, adminMiddleware, clearUserOrders);
router.post("/orders/admin/mailStatus/:id",authMiddleware,adminMiddleware,mailOrderStatus);

module.exports = router;
