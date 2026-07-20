// Database connection configuration.
const mongoose = require("mongoose");
require('dotenv').config()
const uri = process.env.MONGO_URI;

async function connectDB() {
    await mongoose.connect(uri);
}

connectDB().then(() => {
    console.log("MongoDB Connected");
}).catch((err)=> {
    console.error(err.message);
    process.exit(1);
})

module.exports = connectDB;

