const mongoose = require('mongoose');
require('dotenv').config();

const clientPromise = require('./config/database');

clientPromise.then(async (client) => {
    try {
        const Product = require('./models/Product');
        
        const titlesToDelete = [
            'Logitech MX Master 3S - Wireless Performance Mouse', 
            'Nintendo Switch – OLED Model w/ White Joy-Con'
        ];
        
        const res = await Product.deleteMany({ title: { $in: titlesToDelete } });
        console.log(`\n✅ Successfully deleted ${res.deletedCount} products from the database!`);
        
        process.exit(0);
    } catch(e) {
        console.error("Error deleting products:", e);
        process.exit(1);
    }
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
});
