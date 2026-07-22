// HTTP server entry point.
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
});
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});