const Product = require("../models/Product");
const Category = require("../models/Category");
const OpenAI = require("openai");

// Initialize OpenAI client with NVIDIA API configuration
const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

exports.getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find().populate('category');
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

exports.aiSearch = async (req, res, next) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        // 1. Generate an embedding for the user's natural language query using NVIDIA's API
        const { generateQueryEmbedding } = require('../services/ai.service');
        const queryVector = await generateQueryEmbedding(query);

        // 2. Perform a true semantic Vector Search in MongoDB Atlas
        const products = await Product.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index", // This is the default name in Atlas, but can be updated
                    path: "embedding",
                    queryVector: queryVector,
                    numCandidates: 50,
                    limit: 8
                }
            },
            {
                $project: {
                    embedding: 0, // exclude large vector from response
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        return res.status(200).json({ 
            success: true, 
            data: products, 
            queryInfo: { keywords: [query], type: "vector_search" }
        });


    } catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ success: false, error: 'AI Search failed' });
    }
};
// appended code
exports.getSimilarProductsAI = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const currentProduct = await Product.findById(productId);
        if (!currentProduct) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Get other products
        const otherProducts = await Product.find({ _id: { $ne: productId } }).populate('category');
        
        // Build minimal catalog for AI
        const catalog = otherProducts.map(p => ({
            id: p._id,
            title: p.title,
            tags: p.aiTags,
            category: p.category.name
        }));

        const prompt = `You are an AI product recommendation engine. 
Find the 4 most semantically similar products to the current product from the catalog.

CURRENT PRODUCT:
Title: ${currentProduct.title}
Tags: ${currentProduct.aiTags.join(', ')}

CATALOG:
${JSON.stringify(catalog)}

Respond ONLY with a JSON array of the 4 best matching product IDs (strings). E.g. ["id1", "id2", "id3", "id4"]`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.2,
            max_tokens: 150
        });

        let recommendedIds = [];
        try {
            const raw = completion.choices[0].message.content.trim();
            const match = raw.match(/\[.*?\]/s);
            if (match) {
                recommendedIds = JSON.parse(match[0]);
            } else {
                recommendedIds = JSON.parse(raw);
            }
        } catch (e) {
            console.error("Failed to parse AI recommendation:", e);
            // Fallback: just return first 4
            recommendedIds = catalog.slice(0, 4).map(c => c.id);
        }

        const recommendations = await Product.find({ _id: { $in: recommendedIds } }).populate('category');
        
        res.status(200).json({ success: true, data: recommendations });

    } catch (error) {
        console.error("AI Recommendation Error:", error);
        res.status(500).json({ success: false, error: 'Recommendation failed' });
    }
};

exports.getCategoryPage = async (req, res, next) => {
    try {
        const { categoryName } = req.params;
        const { subcategory, sort } = req.query;

        // Find the category (case-insensitive)
        const category = await Category.findOne({
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
        });

        if (!category) {
            return res.status(404).render('404', { title: 'Category Not Found' });
        }

        // Distinctly fetch all unique subcategories for this category (for sidebar)
        const subcategories = await Product.distinct('subcategory', { category: category._id });

        // Build product query
        let query = { category: category._id };
        if (subcategory) {
            query.subcategory = subcategory;
        }

        // Build sort option
        let sortOption = {};
        if (sort === 'low') {
            sortOption.price = 1;
        } else if (sort === 'high') {
            sortOption.price = -1;
        }

        // Fetch products
        const products = await Product.find(query).sort(sortOption).populate('category');

        res.render('category', {
            title: `${category.name} - NeuraCart`,
            category,
            products,
            subcategories,
            selectedSubcategory: subcategory || '',
            selectedSort: sort || '',
            categoryName: category.name
        });
    } catch (error) {
        next(error);
    }
};

exports.addReview = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const { rating, comment } = req.body;
        
        if (!req.user) {
            req.flash("error_msg", "You must be logged in to leave a review.");
            return res.redirect(`/product/${productId}`);
        }

        if (!rating || !comment) {
            req.flash("error_msg", "Please provide both a rating and a comment.");
            return res.redirect(`/product/${productId}`);
        }

        const Review = require("../models/Review");
        
        // Optional: Check if user already reviewed this product
        const existingReview = await Review.findOne({ product: productId, user: req.user._id });
        if (existingReview) {
            req.flash("error_msg", "You have already reviewed this product.");
            return res.redirect(`/product/${productId}`);
        }

        const reviewData = {
            product: productId,
            user: req.user._id,
            rating: parseInt(rating, 10),
            comment: comment.trim(),
            media: []
        };

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                // Store the public path for the browser
                reviewData.media.push(`/uploads/reviews/${file.filename}`);
            });
        }

        const review = new Review(reviewData);
        await review.save();
        
        req.flash("success_msg", "Review added successfully!");
        res.redirect(`/product/${productId}`);
    } catch (error) {
        console.error("Add Review Error:", error);
        req.flash("error_msg", "Failed to add review. Please try again.");
        res.redirect(`/product/${req.params.id}`);
    }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const Review = require("../models/Review");
        
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }
        
        // Authorization: Check if user is the author or an admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this review." });
        }
        
        await Review.findByIdAndDelete(reviewId);
        
        res.status(200).json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
