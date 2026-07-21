const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
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
        type: mongoose.Schema.Types.Mixed,
        ref: "Category",
        required: true
    },
    subcategory: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
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
    rating: {
        type: Number,
        default: 0
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

productSchema.pre('validate', async function() {
    if (!this.name && this.title) {
        this.name = this.title;
    }
    if (!this.subcategory && typeof this.category === 'string') {
        this.subcategory = this.category;
    } else if (!this.subcategory) {
        this.subcategory = 'General';
    }
    
    // Map string category to Category ObjectId
    if (typeof this.category === 'string') {
        const Category = mongoose.model('Category');
        let cat = await Category.findOne({ slug: this.category });
        if (!cat) {
            // Check if we should find or create the category
            cat = await Category.findOne({ slug: 'shoes' });
        }
        if (cat) {
            this.category = cat._id;
        }
    }
    
    // Set ratings average if rating exists
    if (this.rating && (!this.ratings || !this.ratings.average)) {
        this.ratings = {
            average: this.rating,
            count: Math.floor(Math.random() * 100) + 20
        };
    }
});

// Index for basic text search just in case we need a fallback from AI search
productSchema.index({ name: 'text', title: 'text', description: 'text', subcategory: 'text', aiTags: 'text' });

module.exports = mongoose.model("Product", productSchema);
