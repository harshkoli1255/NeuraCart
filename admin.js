require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (shares the same DB as main app)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`Admin DB Connected`))
  .catch(err => console.log(err));

// Admin Routes
app.get("/", (req, res) => {
    res.send("Admin Dashboard API running on Port " + PORT);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Admin Server started on http://localhost:${PORT}`);
});
