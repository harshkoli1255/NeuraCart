const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    icon: {
        type: String, // e.g., '💻', '👕', or an icon class name
        default: '📁'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);
