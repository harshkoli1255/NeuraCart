const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        default: 'Generic'
    },
    description: {
        type: String,
        required: true
    },
    bulletPoints: [{
        type: String
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    images: [{
        type: String // URLs to images
    }],
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    aiTags: [{
        type: String // Keywords for smart AI search (e.g., "audiophile", "noise-canceling", "bass")
    }],
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    specifications: [{
        key: { type: String, required: true },
        value: { type: String, required: true }
    }],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for basic text search just in case we need a fallback from AI search
productSchema.index({ title: 'text', description: 'text', aiTags: 'text' });

module.exports = mongoose.model("Product", productSchema);
