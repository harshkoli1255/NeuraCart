const express = require("express");
const router = express.Router();
const { ensureSeller } = require("../middleware/auth");
const OpenAI = require("openai");
const aiService = require("../services/ai.service");

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

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
        
        let finalDescription = description;
        let aiTags = [];
        let embedding = [];
        
        try {
            // Generate richer description and tags if needed
            const prompt = `You are an expert copywriter for an e-commerce store.
Based on the following product details, generate a compelling HTML description (max 3 short paragraphs, use <b> tags for emphasis) AND a list of 5-8 SEO keywords/tags.

Title: ${title}
Brand: ${brand || 'Generic'}
Category: ${catDoc.name}
Subcategory: ${subcategory}
Provided Description: ${description || 'None'}

Respond ONLY with JSON:
{
  "description": "<p>...</p>",
  "tags": ["tag1", "tag2"]
}`;
            const completion = await openai.chat.completions.create({
                model: "meta/llama-3.1-70b-instruct",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.6,
                max_tokens: 300
            });
            const raw = completion.choices[0].message.content.trim().replace(/```json/g,'').replace(/```/g,'').trim();
            const parsed = JSON.parse(raw);
            
            if (!description || description.trim() === '') {
                finalDescription = parsed.description;
            }
            aiTags = parsed.tags;
            
            // Generate embedding for AI Search
            const textToEmbed = `${title} ${brand || ''} ${catDoc.name} ${subcategory} ${aiTags.join(' ')}`;
            embedding = await aiService.generateEmbedding(textToEmbed);
        } catch (e) {
            console.error("AI Generation failed for new product:", e.message);
        }
        
        const product = new Product({
            name,
            title,
            brand: brand || 'Generic',
            description: finalDescription,
            price: Number(price),
            category: catDoc._id,
            subcategory,
            image,
            images: [image],
            stock: Number(stock) || 0,
            seller: req.user._id,
            attributes: new Map(), // Empty map for now
            aiTags: aiTags,
            embedding: embedding
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
