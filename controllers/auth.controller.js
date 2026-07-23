// Authentication request handlers.

const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

exports.renderLogin = (req, res) => {
    res.render("auth/login", { title: "Login - NeuraCart" });
};

exports.renderRegister = (req, res) => {
    res.render("auth/register", { title: "Create Account - NeuraCart" });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            req.flash("error_msg", "Email is already registered. Please log in.");
            return res.redirect("/auth/register");
        }

        // Validate role (don't allow admin via this form)
        let userRole = "buyer";
        if (role === "seller") {
            userRole = "seller";
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the new user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });
        await user.save();

        // 4. Automatically log in the new user
        req.login(user, (err) => {
            if (err) {
                console.error(err);
                req.flash("error_msg", "Account created successfully, but automatic login failed. Please log in.");
                return res.redirect("/auth/login");
            }
            
            req.flash("success_msg", "Welcome to NeuraCart!");
            // Role-based redirection
            if (userRole === "seller") {
                return res.redirect("http://localhost:3001/seller/dashboard");
            } else {
                return res.redirect("http://localhost:3000/");
            }
        });
    } catch (err) {
        console.error(err);
        req.flash("error_msg", "An error occurred during registration. Please try again.");
        res.redirect("/auth/register");
    }
};

exports.loginUser = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error_msg", info.message || "Invalid email or password.");
            return res.redirect("/auth/login");
        }
        
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            
            // Role-based redirection
            if (user.role === "seller") {
                return res.redirect("http://localhost:3001/seller/dashboard");
            } else {
                return res.redirect("http://localhost:3000/");
            }
        });
    })(req, res, next);
};

exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect("/auth/login");
    });
};

exports.renderProfile = (req, res) => {
    res.render("auth/profile", { 
        title: "Account Details - NeuraCart",
        user: req.user,
        activeTab: 'details'
    });
};

exports.renderProfileOrders = (req, res) => {
    res.render("auth/profile", { 
        title: "Order History - NeuraCart",
        user: req.user,
        activeTab: 'orders'
    });
};

exports.renderProfileWishlist = (req, res) => {
    res.render("auth/profile", { 
        title: "Wishlist - NeuraCart",
        user: req.user,
        activeTab: 'wishlist'
    });
};
