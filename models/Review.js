const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
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
        trim: true
    }
}, {
    timestamps: true
});

// Calculate average rating after save/remove
reviewSchema.post('save', async function() {
    await this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post('remove', async function() {
    await this.constructor.calcAverageRatings(this.product);
});

reviewSchema.statics.calcAverageRatings = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            'ratings.count': stats[0].nRating,
            'ratings.average': Math.round(stats[0].avgRating * 10) / 10
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            'ratings.count': 0,
            'ratings.average': 0
        });
    }
};

module.exports = mongoose.model("Review", reviewSchema);
