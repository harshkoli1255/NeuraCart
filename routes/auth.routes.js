// Authentication
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// GET routes to render the UI
router.get("/login", authController.renderLogin);
router.get("/register", authController.renderRegister);

// POST routes to handle form submissions
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// Logout route
router.get("/logout", authController.logoutUser);

module.exports = router;
