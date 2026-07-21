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
        const { name, email, password } = req.body;
        
        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send("User already exists"); // Simple error for now
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the new user
        user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();

        // 4. Redirect to login
        res.redirect("/auth/login");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.loginUser = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/", // Where to go on success
        failureRedirect: "/auth/login", // Where to go on failure
    })(req, res, next);
};

exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect("/auth/login");
    });
};
