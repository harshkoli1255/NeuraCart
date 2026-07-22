const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Update the average rating on the Product model when a review is added
reviewSchema.post("save", async function(doc) {
    const Product = mongoose.model("Product");
    const reviews = await this.constructor.find({ product: doc.product });
    
    if (reviews.length > 0) {
        const average = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(doc.product, {
            ratings: {
                average: parseFloat(average.toFixed(1)),
                count: reviews.length
            },
            rating: parseFloat(average.toFixed(1))
        });
    }
});

module.exports = mongoose.model("Review", reviewSchema);
