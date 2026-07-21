// Database connection configuration.
const mongoose = require("mongoose");
require('dotenv').config()
const uri = process.env.MONGO_URI;

async function connectDB() {
    await mongoose.connect(uri);
}

module.exports = connectDB;

