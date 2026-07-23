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

// Google OAuth routes
const passport = require('passport');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }),
    (req, res) => {
        req.flash('success_msg', 'Successfully logged in with Google');
        res.redirect('/');
    }
);

// Profile routes
const { ensureAuthenticated } = require("../middleware/auth");
router.get("/profile", ensureAuthenticated, authController.renderProfile);
router.get("/profile/orders", ensureAuthenticated, authController.renderProfileOrders);
router.get("/profile/wishlist", ensureAuthenticated, authController.renderProfileWishlist);

module.exports = router;
