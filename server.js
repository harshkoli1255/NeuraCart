// HTTP server entry point.
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
});
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");

connectDB();

const PORT_BUYER = process.env.PORT || 3000;
const PORT_SELLER = process.env.SELLER_PORT || 3001;

// Start Buyer Server
app.listen(PORT_BUYER, () => {
    console.log(`🛍️ Buyer Server running on http://localhost:${PORT_BUYER}`);
});

// Start Seller Server
app.listen(PORT_SELLER, () => {
    console.log(`🏪 Seller Server running on http://localhost:${PORT_SELLER}`);
});