const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true // Price at the time of purchase
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
    },
    razorpayOrderId: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
