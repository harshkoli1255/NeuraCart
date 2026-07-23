// Database connection configuration.
const mongoose = require('mongoose');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config()

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            family: 4 // Force IPv4 to fix DNS SRV resolution issues in Node 18+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Do not exit the process, allow the app to keep running so nodemon doesn't crash loop
    }
};

module.exports = connectDB;
