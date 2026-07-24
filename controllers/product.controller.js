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
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('seller', 'name');
            
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
        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter what you are looking for.' });
        }
        const trimmedQuery = query.trim();
        console.log(`[AI Search] Query: "${trimmedQuery}"`);

        const { generateQueryEmbedding, getCachedEmbeddings } = require('../services/ai.service');

        // ── Stage 1: LLM Intent Expansion ──────────────────────────────────
        let searchTerms = trimmedQuery;
        let aiExplanation = '';
        let intent = trimmedQuery;

        try {
            const expandResp = await openai.chat.completions.create({
                model: 'meta/llama-3.1-8b-instruct',
                messages: [{
                    role: 'system',
                    content: `You are a search expert for an e-commerce store that sells: Smartphones, Laptops, Fragrances, Skincare, Groceries, Home Decoration, Furniture, Men's/Women's Clothing, Shoes, Watches, Bags, Jewellery.

Analyze this user query and respond ONLY with JSON:
{"searchTerms":"rich expanded search terms capturing the user's actual product need","intent":"brief plain English description of what they want","aiExplanation":"one friendly sentence explaining what you understood and what results we are showing"}

Query: "${trimmedQuery}"

Example: "red and white shoes" → {"searchTerms":"footwear sneakers athletic running shoes sports shoes casual","intent":"colored athletic footwear","aiExplanation":"Showing you the best footwear and athletic products we carry — closest match to shoes with color variants."}
Example: "gift for mom" → {"searchTerms":"women gift fragrance perfume jewellery handbag skincare beauty accessories","intent":"women's gift ideas","aiExplanation":"Here are our top picks for gifts — fragrances, jewellery, and accessories that women love."}`
                }],
                temperature: 0.2,
                max_tokens: 150
            });

            const raw = expandResp.choices[0].message.content.trim().replace(/```json/g,'').replace(/```/g,'').trim();
            const parsed = JSON.parse(raw);
            searchTerms = parsed.searchTerms || trimmedQuery;
            intent = parsed.intent || trimmedQuery;
            aiExplanation = parsed.aiExplanation || '';
            console.log(`[AI Search] Expanded: "${searchTerms}" | Intent: ${intent}`);
        } catch (e) {
            console.warn('[AI Search] LLM expansion failed:', e.message);
            searchTerms = trimmedQuery;
        }

        // ── Stage 2: Vector Embedding + Cosine Similarity Search ────────────
        const queryVector = await generateQueryEmbedding(searchTerms);
        let products = [];

        if (queryVector && queryVector.length > 0) {
            const allEmbeddings = await getCachedEmbeddings();

            const scored = allEmbeddings.map(p => ({
                id: p._id,
                score: cosineSimilarity(queryVector, p.embedding)
            }));

            scored.sort((a, b) => b.score - a.score);

            // Adaptive threshold: if nothing > 0.60, always return top-8
            let matched = scored.filter(s => s.score > 0.60);
            if (matched.length === 0) {
                console.log('[AI Search] Below threshold, returning top-8 closest matches');
                matched = scored.slice(0, 8);
            }
            
            const matchedIds = matched.slice(0, 12).map(s => s.id);
            const matchedProducts = await Product.find({ _id: { $in: matchedIds } })
                .populate('category');
                
            // Re-sort matchedProducts according to original score order
            products = matchedIds.map(id => matchedProducts.find(p => p._id.toString() === id.toString())).filter(Boolean);
            console.log(`[AI Search] Returning ${products.length} products (top score: ${scored[0]?.score?.toFixed(3)})`);
        } else {
            // Regex fallback
            const rx = new RegExp(trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
            products = await Product.find({
                image: { $exists: true, $ne: '' },
                $or: [{ title: rx }, { name: rx }, { description: rx }, { aiTags: rx }, { brand: rx }]
            }).populate('category').sort({ 'ratings.average': -1 }).limit(12);
        }

        // Generate explanation if not already set by LLM
        if (!aiExplanation) {
            if (products.length > 0) {
                aiExplanation = `Found ${products.length} products that match your search for "${trimmedQuery}".`;
            } else {
                aiExplanation = `No direct matches for "${trimmedQuery}", but here are our best picks you might like.`;
            }
        }

        return res.status(200).json({
            success: true,
            data: products,
            count: products.length,
            aiExplanation,
            intent,
            queryInfo: { originalQuery: trimmedQuery, expandedTerms: searchTerms }
        });

    } catch (error) {
        console.error('[AI Search] Error:', error);
        return res.status(500).json({ success: false, error: 'Search failed. Please try again.' });
    }
};

// Helper: Calculate Cosine Similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

exports.apiSearchRegex = async (req, res, next) => {
    try {
        const query = req.query.q ? req.query.q.trim() : '';
        if (!query) {
            return res.status(400).json({ success: false, error: 'Please enter a search query.' });
        }

        // 1. Generate query embedding using the AI service
        const aiService = require('../services/ai.service');
        let queryVector = [];
        try {
            queryVector = await aiService.generateQueryEmbedding(query);
        } catch (e) {
            console.error("Embedding generation failed, falling back to regex search.", e);
        }

        let products = [];
        if (queryVector && queryVector.length > 0) {
            // 2. Fetch all products that have an embedding
            // Note: We use select('+embedding') because it is excluded by default in the schema
            const allProducts = await Product.find({ embedding: { $exists: true, $ne: [] } })
                                             .populate('category')
                                             .select('+embedding');
            
            // 3. Calculate similarity score for each product
            const scoredProducts = allProducts.map(p => {
                const score = cosineSimilarity(queryVector, p.embedding);
                return { product: p, score };
            });

            // 4. Sort by highest score and take top 20
            scoredProducts.sort((a, b) => b.score - a.score);
            
            // Filter out extremely low relevancy (optional threshold)
            products = scoredProducts.filter(sp => sp.score > 0.70).map(sp => {
                const p = sp.product.toObject();
                delete p.embedding; // Remove large embedding array before sending to client
                return p;
            }).slice(0, 20);
        } else {
            // Fallback to basic regex if AI fails
            const regex = new RegExp(query, 'i');
            products = await Product.find({
                $or: [{ name: regex }, { title: regex }, { description: regex }, { aiTags: regex }]
            }).populate('category').limit(20);
        }

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error("Vector Search API Error:", error);
        res.status(500).json({ success: false, error: 'Search failed. Please try again.' });
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

        const prompt = `You are an AI product recommendation engine building a "Frequently Bought Together" or "Complete the Look" bundle. 
Find the 4 most complementary products to the current product from the catalog. For example, if the current product is a laptop, recommend a mouse, bag, or accessories. DO NOT just recommend similar items.

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
        const categoryName = req.params.categoryName || req.query.category;
        const { sort, page } = req.query;

        // Fetch all categories for the UI
        const categories = await Category.find().sort({ name: 1 });

        const isAllCategories = !categoryName || categoryName === "All Categories" || categoryName === "All" || categoryName.toLowerCase() === "all" || categoryName.trim() === "";

        // Find the category (case-insensitive)
        let category = null;
        if (!isAllCategories) {
            category = categories.find(c => c.slug.toLowerCase() === categoryName.toLowerCase() || c.name.toLowerCase() === categoryName.toLowerCase());
            if (!category) {
                return res.status(404).render('404', { title: 'Category Not Found' });
            }
        }

        // Build product query
        const query = { 
            image: { $exists: true, $ne: "" }, 
            title: { $exists: true, $ne: "" }
        };

        if (category) {
            query.$or = [
                { category: category._id },
                { category: new RegExp(`^${categoryName}$`, 'i') }
            ];
        }

        // Build sort option
        let sortOption = { isFeatured: -1, createdAt: -1 };
        if (sort === "price-low") sortOption = { price: 1 };
        if (sort === "price-high") sortOption = { price: -1 };

        const limit = 12; // Products per page
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit;

        const totalProducts = await Product.countDocuments(query);
        const hasNextPage = (skip + limit) < totalProducts;

        // Fetch products
        const products = await Product.find(query).populate('category').sort(sortOption).skip(skip).limit(limit);

        res.render('shop', {
            title: category ? `${category.name} - NeuraCart` : "All Products - NeuraCart",
            products,
            categories,
            activeCategory: category ? category.slug : "", // normalized to DB slug (lowercase)
            activeSort: sort || "popular",
            searchQuery: "",
            hasNextPage,
            currentPage
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

exports.getReviewSummary = async (req, res) => {
    try {
        const Review = require("../models/Review");
        const reviews = await Review.find({ product: req.params.id }).limit(50);
        
        if (reviews.length === 0) {
            return res.json({ summary: "Not enough reviews yet to generate an AI summary." });
        }

        const reviewTexts = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n');
        
        const prompt = `You are an AI summarizing customer reviews for a product.
Based on the following user reviews, generate a short 2-3 sentence sentiment summary. Highlight what people love and any common complaints.

REVIEWS:
${reviewTexts}

Respond ONLY with the summary paragraph. Keep it helpful, honest, and under 50 words.`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.3,
            max_tokens: 100
        });

        res.json({ summary: completion.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Review Summary Error:", error);
        res.status(500).json({ error: "Failed to generate review summary." });
    }
};
