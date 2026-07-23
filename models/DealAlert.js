const mongoose = require("mongoose");

const dealAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        default: "all"
    },
    minDiscount: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("DealAlert", dealAlertSchema);
