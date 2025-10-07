const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sizeType: {
        type: String,
        enum: ["Clothing", "Shoes"],
        required: true
    },
    sizes: [
        {
            size: { type: String, required: true },
            quantity: { type: Number,required:true, default: 0 }
        }
    ],
    color: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    reviews: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ProductReview" } 
    ],
    rating: {
        type: Number,
        default: 0,
    },
},
    { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
