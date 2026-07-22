const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
        variantSku: {
            type: String // Optional: if selecting a specific variant
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }
    }],
    status: {
        type: String,
        enum: ["Active", "Abandoned", "Converted"],
        default: "Active"
    }
}, {
    timestamps: true
});

// Calculate total price virtually
cartSchema.virtual('totalPrice').get(function() {
    let total = 0;
    if (this.items && this.items.length > 0) {
        // This requires populate('items.product') to work correctly in the application
        this.items.forEach(item => {
            if (item.product && item.product.price) {
                total += item.product.price * item.quantity;
            }
        });
    }
    return total;
});

module.exports = mongoose.model("Cart", cartSchema);
