require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Cart = require('../models/Cart');

const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for Database Reset...'))
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });

const reset = async () => {
    try {
        console.log("Clearing all Products...");
        await Product.deleteMany({});
        
        console.log("Clearing all Users...");
        await User.deleteMany({});
        
        console.log("Clearing all Reviews...");
        await Review.deleteMany({});
        
        console.log("Clearing all Carts...");
        await Cart.deleteMany({});
        
        console.log("Database reset complete. All inventory and users have been purged.");
        process.exit(0);
    } catch (e) {
        console.error("Failed to reset database", e);
        process.exit(1);
    }
};

reset();
