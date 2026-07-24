const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { ensureAuthenticated } = require("../middleware/auth");
const { uploadReviewMedia } = require("../middleware/upload");

// Normal product listing and details
router.get("/", productController.getAllProducts);
router.get("/:id/recommendations", productController.getSimilarProductsAI);

// AI Search Endpoint
router.post("/ai-search", productController.aiSearch);

router.get("/start-gen", async (req, res) => {
    try {
        const OpenAI = require("openai");
        const openai = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
        });
        
        delete require.cache[require.resolve("../scripts/generate-inventory")];
        const { generateAllProducts } = require("../scripts/generate-inventory");
        
        const count = await generateAllProducts(openai);
        res.json({ success: true, message: `Finished generating ${count} products!` });
    } catch (e) {
        res.status(500).json({ error: "Start-gen error: " + e.message, stack: e.stack });
    }
});

router.get("/test-gen", async (req, res) => {
    try {
        const OpenAI = require("openai");
        const Category = require("../models/Category");
        const Product = require("../models/Product");

        const openai = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
        });
        
        const cat = await Category.findOne({ slug: 'tech' });
        
        const prompt = `You are a creative e-commerce inventory generator.
Generate a JSON array of EXACTLY 2 unique, highly detailed products for the category: "Tech".
JSON SCHEMA: [{"name":"Test", "title":"Test Title", "brand":"Test Brand", "description":"Test Desc", "imageDescription":"Test Img Desc", "bulletPoints":["point 1"], "price":99, "subcategory":"Test", "image":"https://test.com/img.jpg", "images":[], "stock":50, "attributes":{"Color":"Red"}, "aiTags":["test"], "specifications":[{"key":"Weight","value":"200g"}]}]
Respond ONLY with the raw JSON array.`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
        });
        
        let responseText = completion.choices[0].message.content.trim();
        if (responseText.startsWith("```json")) responseText = responseText.substring(7);
        else if (responseText.startsWith("```")) responseText = responseText.substring(3);
        if (responseText.endsWith("```")) responseText = responseText.substring(0, responseText.length - 3);
        
        const productArray = JSON.parse(responseText.trim());
        const doc = { ...productArray[0], category: cat._id };
        
        const product = new Product(doc);
        await product.save();

        res.json({ success: true, product });
    } catch (e) {
        res.status(200).json({ error: e.message, stack: e.stack });
    }
});

router.get("/count", async (req, res) => {
    try {
        const Product = require("../models/Product");
        const Category = require("../models/Category");
        const count = await Product.countDocuments();
        const cats = await Category.find({});
        res.json({ count, cats: cats.map(c => c.slug) });
    } catch (e) {
        res.status(200).json({ error: e.message, stack: e.stack });
    }
});

router.get("/debug-gen", async (req, res) => {
    try {
        const OpenAI = require("openai");
        const Category = require("../models/Category");
        const Product = require("../models/Product");

        const openai = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
        });
        
        let cat = await Category.findOne({});
        if (!cat) return res.json({ error: "No categories in DB" });

        const prompt = `You are an AI generating products for e-commerce.
Generate a JSON array of EXACTLY 1 unique, realistic product for the category: "${cat.name}".

JSON SCHEMA FOR EACH PRODUCT:
{
  "name": "Short name",
  "title": "Full product title",
  "brand": "Brand name",
  "description": "HTML description",
  "imageDescription": "Visual appearance",
  "bulletPoints": ["point 1"],
  "price": 99.99,
  "subcategory": "General",
  "image": "https://source.unsplash.com/random/500x500",
  "images": [],
  "stock": 50,
  "attributes": { "Color": "Red" },
  "aiTags": ["tag1"],
  "specifications": [ { "key": "Weight", "value": "200g" } ]
}
Respond ONLY with raw JSON array.`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
        });
        
        let responseText = completion.choices[0].message.content.trim();
        if (responseText.startsWith("```json")) responseText = responseText.substring(7);
        else if (responseText.startsWith("```")) responseText = responseText.substring(3);
        if (responseText.endsWith("```")) responseText = responseText.substring(0, responseText.length - 3);
        
        const productArray = JSON.parse(responseText.trim());
        const doc = { ...productArray[0], category: cat._id };
        
        const fs = require('fs');
        fs.writeFileSync('debug-gen.log', 'Generated JSON: ' + JSON.stringify(doc) + '\n');
        
        const product = new Product(doc);
        fs.appendFileSync('debug-gen.log', 'Saving product...\n');
        await product.save();
        fs.appendFileSync('debug-gen.log', 'Product saved successfully!\n');

        res.json({ success: true, product });
    } catch (e) {
        const fs = require('fs');
        fs.appendFileSync('debug-gen.log', 'Error: ' + e.stack + '\n');
        res.status(500).json({ error: e.message, stack: e.stack });
    }
});

router.post("/:id/review", ensureAuthenticated, uploadReviewMedia.array("media", 3), productController.addReview);
router.delete("/:id/review/:reviewId", ensureAuthenticated, productController.deleteReview);
router.get("/:id/reviews/summary", productController.getReviewSummary);

// MUST BE LAST
router.get("/:id", productController.getProductById);

module.exports = router;
