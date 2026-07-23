const express = require("express");
const router = express.Router();
const { ensureSeller } = require("../middleware/auth");

router.get("/dashboard", ensureSeller, async (req, res) => {
    try {
        const Product = require("../models/Product");
        const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
        
        res.render("seller/dashboard", { 
            title: "Seller Dashboard - NeuraCart",
            user: req.user,
            products
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/add-product", ensureSeller, async (req, res) => {
    try {
        const Category = require("../models/Category");
        const categories = await Category.find({});
        res.render("seller/add-product", {
            title: "Add Product - NeuraCart",
            user: req.user,
            categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post("/add-product", ensureSeller, async (req, res) => {
    try {
        const Product = require("../models/Product");
        const Category = require("../models/Category");
        
        const { name, title, brand, description, price, categoryId, subcategory, image, stock } = req.body;
        
        const catDoc = await Category.findById(categoryId);
        
        const product = new Product({
            name,
            title,
            brand: brand || 'Generic',
            description,
            price: Number(price),
            category: catDoc._id,
            subcategory,
            image,
            images: [image],
            stock: Number(stock) || 0,
            seller: req.user._id,
            attributes: new Map() // Empty map for now
        });
        
        await product.save();
        req.flash('success_msg', 'Product added successfully!');
        res.redirect('/seller/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error adding product.');
        res.redirect('/seller/add-product');
    }
});

module.exports = router;
