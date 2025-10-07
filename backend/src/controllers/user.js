const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ProductReview = require("../models/ProductReview")
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");
require("dotenv").config();


const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, gender, isAdmin } = req.body;

        let existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            } else {
                return res.status(400).json({ message: "Username already exists" });
            }
        };

        const user = await User.create({ name, username, email, password, gender, isAdmin });

        generateToken(res, user);

        res.status(201).json({ userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        generateToken(res, user);

        res.status(200).json({ userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logged out" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedData = { ...req.body };

        if (req.body.deleteOrders) {
            updatedData.orders = [];
        }

        const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//Cart
const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("cart.product");
        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, selectedSize } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const existingItem = user.cart.find(
            (item) => item.product.toString() === productId && item.size === selectedSize
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({ product: productId, quantity, size: selectedSize });
        }

        await user.save();
        res.status(200).json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
};


const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.user._id);

        const cartItem = user.cart.find(item => item.product.toString() === req.params.productId);
        if (!cartItem) return res.status(404).json({ message: "Item not found in cart" });

        cartItem.quantity = quantity;
        await user.save();
        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId, selectedSize } = req.query;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.cart = user.cart.filter(
            (item) => !(item.product.toString() === productId && item.size === selectedSize)
        );

        await user.save();
        res.status(200).json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: "Error removing from cart", error: error.message });
    }
};

//Address
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedAddresses.push(req.body);
        await user.save();
        res.status(200).json(user.savedAddresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ addresses: user.savedAddresses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedAddresses[req.params.index] = req.body;
        await user.save();
        res.status(200).json(user.savedAddresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedAddresses.splice(req.params.index, 1);
        await user.save();
        res.status(200).json({ message: "Address deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//Orders
const createOrder = async (req, res) => {
    try {
        const { address, paymentMethod, paymentStatus, paymentIntentId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId).populate("cart.product");
        if (!user || user.cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

        let subtotal = 0;
        const orderProducts = user.cart.map((item) => {
            subtotal += item.product.price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity,
                priceAtPurchase: item.product.price,
                selectedSize: item.size || "N/A"
            };
        });

        const taxRate = 0.1;
        const shippingFee = 1.99;
        const taxAmount = subtotal * taxRate;
        const totalPrice = subtotal + taxAmount + shippingFee;

        const newOrder = await Order.create({
            user: userId,
            products: orderProducts,
            totalPrice,
            shippingAddress: address,
            paymentMethod,
            paymentStatus,
            orderStatus: "Pending",
        });

        user.cart = [];
        user.orders.push(newOrder._id);
        await user.save();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            console.log("Access Denied: Not an admin");
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { status, cancellationRequested, search } = req.query;

        let filter = [];
        if (search) {
            filter.push({
                $search: {
                    index: "orders",  
                    text: {
                        query: search,
                        path: {
                          wildcard: "*",
                        },
                        fuzzy: { maxEdits: 2 },
                      },
                }
            });
        }

        if (status) {
            filter.push({ orderStatus: status });
        }

        if (cancellationRequested === "true") {
            filter.push({ cancellationRequested: true });
        } else if (cancellationRequested === "false") {
            filter.push({ cancellationRequested: false });
        }

        const orders = await Order.aggregate([
            { $match: filter.length > 0 ? { $and: filter } : {} },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "products.product" } }
        ]);

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: error.message });
    }
};


const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate("products.product");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ["Pending", "Processing", "Shipped","Out for Delivery", "Delivered","Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.orderStatus = status;
        if (status === "Cancelled") {
            order.cancellationRequested = false;
        }
        await order.save();

        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const mailOrderStatus = async (req, res) => {
    const { newStatus, email } = req.body;
    const orderId = req.params.id;

    if (!email) {
        return res.status(400).json({ error: "Customer email is required" });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Order Status Update",
            html: `<p>Hello,</p>
               <p>Your order <strong>#${orderId}</strong> status has been updated to <strong>${newStatus}</strong>.</p>
               <p>Thank you for shopping with us!</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
}

const clearUserOrders = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { orders: [] }, { new: true });
        res.status(200).json({ message: "Orders cleared successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        let order;
        if (req.user.isAdmin) {
            order = await Order.findById(id).populate("products.product");
        } else {
            order = await Order.findOne({ _id: id, user: req.user._id }).populate("products.product");
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: error.message });
    }
};


const requestCancellation = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.cancellationRequested = true;
        await order.save();

        res.json({ message: "Cancellation request submitted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteAllOrders = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        await Order.deleteMany({});

        res.status(200).json({ message: "All orders have been deleted successfully." });
    } catch (error) {
        console.error("Error deleting orders:", error);
        res.status(500).json({ error: error.message });
    }
};

//reviews
const updateProductRating = async (productId) => {
    const reviews = await ProductReview.find({ product: productId });

    if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, { rating: 0 });
        return;
    }

    const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, { rating: averageRating.toFixed(1) });
};


const writeReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let review = await ProductReview.findOne({ user: userId, product: productId });

        if (review) {
            review.rating = rating;
            review.comment = comment;
            await review.save();
        } else {
            review = new ProductReview({
                user: userId,
                product: productId,
                rating,
                comment
            });

            await review.save();

            product.reviews.push(review._id);
            await product.save();
        }
        await updateProductRating(productId);

        res.status(200).json({ message: "Review submitted successfully", review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const review = await ProductReview.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        const productId = review.product;

        await Product.updateOne(
            { reviews: id },
            { $pull: { reviews: id } }
        );

        await review.deleteOne();

        await updateProductRating(productId);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id; 

        const reviews = await ProductReview.find({ user: userId })
            .populate("product", "name brand image price") 
            .sort({ createdAt: -1 }); 

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    registerUser,
    loginUser,
    logoutUser,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
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
    getUserReviews
};
