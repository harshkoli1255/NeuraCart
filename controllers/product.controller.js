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
        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter a product name or description.' });
        }
        const trimmedQuery = query.trim();
        console.log(`[AI Search] Query: "${trimmedQuery}"`);

        // ── Step 1: Parse natural language with NVIDIA NIM ──────────────────
        let parsed = { keywords: [trimmedQuery], maxPrice: null, category: null };
        let aiExplanation = '';

        const apiKey = process.env.NVIDIA_API_KEY;
        if (apiKey) {
            try {
                const { parseNaturalLanguageSearch } = require('../services/ai.service');
                parsed = await parseNaturalLanguageSearch(trimmedQuery);
                console.log('[AI Search] Parsed intent:', JSON.stringify(parsed));
            } catch (parseErr) {
                console.warn('[AI Search] NLP parse failed, using raw query as fallback:', parseErr.message);
                // Fallback: extract price from query manually
                const priceMatch = trimmedQuery.match(/(?:under|below|less than|within|upto|up to)\s*[₹$]?\s*(\d[\d,]*)/i);
                if (priceMatch) {
                    parsed.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
                }
                // Use all non-stopword words as keywords
                parsed.keywords = trimmedQuery
                    .replace(/[₹$]/g, '')
                    .split(/\s+/)
                    .filter(w => !['under','below','best','good','the','a','an','for','with','and','or','in','of'].includes(w.toLowerCase()))
                    .filter(w => w.length > 2);
            }
        } else {
            console.warn('[AI Search] NVIDIA_API_KEY not set — using regex fallback');
            // Manual price extraction
            const priceMatch = trimmedQuery.match(/(?:under|below|less than|within|upto|up to)\s*[₹$]?\s*(\d[\d,]*)/i);
            if (priceMatch) parsed.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
            parsed.keywords = trimmedQuery.split(/\s+/).filter(w => w.length > 2);
        }

        // ── Step 2: Build Smart MongoDB Query ───────────────────────────────
        const keywords = Array.isArray(parsed.keywords) && parsed.keywords.length > 0
            ? parsed.keywords
            : [trimmedQuery];

        // Build $or conditions for all keywords across all searchable fields
        const searchConditions = [];
        for (const kw of keywords) {
            if (!kw || kw.trim().length < 2) continue;
            const rx = new RegExp(kw.trim(), 'i');
            searchConditions.push(
                { title: rx },
                { name: rx },
                { brand: rx },
                { description: rx },
                { aiTags: rx },
                { subcategory: rx }
            );
        }

        // Also search by category name if extracted
        if (parsed.category) {
            const catDoc = await Category.findOne({ name: new RegExp(`^${parsed.category}$`, 'i') });
            if (catDoc) searchConditions.push({ category: catDoc._id });
        }

        let mongoQuery = {
            image: { $exists: true, $ne: '' },
            ...(searchConditions.length > 0 ? { $or: searchConditions } : {})
        };

        // Apply price filter if extracted
        if (parsed.maxPrice && parsed.maxPrice > 0) {
            mongoQuery.price = { $lte: parsed.maxPrice };
        }

        const products = await Product.find(mongoQuery)
            .populate('category')
            .sort({ 'ratings.average': -1, price: 1 })
            .limit(12);

        console.log(`[AI Search] Found ${products.length} products`);

        // ── Step 3: Generate AI Explanation ─────────────────────────────────
        if (apiKey && products.length > 0) {
            try {
                const client = require('axios').create({
                    baseURL: 'https://integrate.api.nvidia.com/v1',
                    timeout: 8000,
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
                });
                const topTitles = products.slice(0, 3).map(p => `"${p.title}"`).join(', ');
                const priceContext = parsed.maxPrice ? ` within ₹${parsed.maxPrice.toLocaleString()} budget` : '';
                const catContext  = parsed.category  ? ` in the ${parsed.category} category` : '';
                const prompt = `You are NeuraCart's AI shopping assistant. The user searched for: "${trimmedQuery}".
We found ${products.length} matching products${catContext}${priceContext}.
Top results include: ${topTitles}.
Write a single helpful sentence (max 20 words) explaining why these results match the user's query. Be specific and friendly.
Reply with ONLY that one sentence, no preamble.`;

                const resp = await client.post('/chat/completions', {
                    model: 'meta/llama-3.1-8b-instruct',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 60
                });
                aiExplanation = resp.data.choices[0].message.content.trim().replace(/^"|"$/g, '');
            } catch (explainErr) {
                console.warn('[AI Search] Explanation generation failed:', explainErr.message);
                const priceStr = parsed.maxPrice ? ` under ₹${parsed.maxPrice.toLocaleString()}` : '';
                aiExplanation = `Found ${products.length} product${products.length !== 1 ? 's' : ''} matching "${trimmedQuery}"${priceStr}.`;
            }
        } else if (products.length === 0) {
            aiExplanation = `No products found matching "${trimmedQuery}". Try a broader keyword or different budget.`;
        } else {
            const priceStr = parsed.maxPrice ? ` under ₹${parsed.maxPrice.toLocaleString()}` : '';
            aiExplanation = `Found ${products.length} product${products.length !== 1 ? 's' : ''} matching your search${priceStr}.`;
        }

        return res.status(200).json({
            success: true,
            data: products,
            count: products.length,
            aiExplanation,
            queryInfo: {
                keywords: parsed.keywords,
                maxPrice: parsed.maxPrice,
                category: parsed.category,
                originalQuery: trimmedQuery
            }
        });

    } catch (error) {
        console.error('[AI Search] Fatal error:', error);
        return res.status(500).json({
            success: false,
            error: 'AI Search encountered an error. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.apiSearchRegex = async (req, res, next) => {
    try {
        const query = req.query.q ? req.query.q.trim() : '';
        if (!query) {
            return res.status(400).json({ success: false, error: 'Please enter a product name.' });
        }

        const regex = new RegExp(query, 'i');

        // Find matching categories first
        const categories = await Category.find({ name: regex });
        const categoryIds = categories.map(c => c._id);

        const searchConditions = [
            { name: regex },
            { title: regex },
            { brand: regex },
            { description: regex },
            { aiTags: regex }
        ];

        if (categoryIds.length > 0) {
            searchConditions.push({ category: { $in: categoryIds } });
        }

        const products = await Product.find({ $or: searchConditions }).populate('category');

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error("Regex Search API Error:", error);
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
