// Database connection configuration.
const mongoose = require("mongoose");
require('dotenv').config()
const uri = process.env.MONGO_URI;

async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        // Do not crash the process so static files can still be served
    }
}

module.exports = connectDB;

