const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                priceAtPurchase: {
                    type: Number,
                    required: true,
                },
                selectedSize:{
                    type: String, required: true
                },
            },
        ],
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            country: { type: String, required: true },
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["Credit Card","Debit Card", "Cash on Delivery"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
        },
        orderStatus: {
            type: String,
            enum: ["Pending","Processing", "Shipped", "Out for Delivery", "Delivered","Cancelled"],
            default: "Processing",
        },
        cancellationRequested: {
            type: Boolean,
            default: false, 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
