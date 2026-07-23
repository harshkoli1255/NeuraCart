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
        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        const trimmedQuery = query.trim().toLowerCase();

        // 1. Identify colors mentioned in the query
        const KNOWN_COLORS = [
            'red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 
            'purple', 'brown', 'orange', 'grey', 'gray', 'gold', 'silver', 
            'navy', 'beige', 'maroon', 'tan', 'crimson', 'olive'
        ];

        const matchedColors = KNOWN_COLORS.filter(color => {
            const rx = new RegExp(`\\b${color}\\b`, 'i');
            return rx.test(trimmedQuery);
        });

        let primaryColor = matchedColors[0] || null;
        if (primaryColor === 'crimson') primaryColor = 'red';
        if (primaryColor === 'gray') primaryColor = 'grey';

        // Detect Gender intent in query
        const isWomenQuery = /\b(woman|women|womens|female|lady|ladies)\b/i.test(trimmedQuery);
        const isMenQuery = /\b(man|men|mens|male|guy|guys)\b/i.test(trimmedQuery);

        // 2. Classify exact Item-Type intent (e.g. laptop, headphone, monitor, phone, shoes, shirt, pant, jacket, book, toy, chair, lamp)
        const categories = await Category.find().lean();

        // Item-Type Definitions with explicit Subcategory & Search filters
        const itemTypeRules = [
            {
                type: 'laptop',
                rx: /(laptops?|notebooks?|macbooks?|workstations?)/i,
                categorySlug: 'tech',
                matchFilter: {
                    $or: [
                        { subcategory: /laptops?/i },
                        { title: /laptops?|notebooks?|macbooks?|neurabook/i },
                        { name: /laptops?|notebooks?|macbooks?|neurabook/i },
                        { aiTags: 'laptop' }
                    ]
                }
            },
            {
                type: 'headphone',
                rx: /(head\s*phones?|ear\s*buds?|ear\s*phones?|headsets?|airpods?)/i,
                categorySlug: 'tech',
                matchFilter: {
                    subcategory: /audio|headphones?/i
                }
            },
            {
                type: 'monitor',
                rx: /(monitors?|screens?|displays?)/i,
                categorySlug: 'tech',
                matchFilter: {
                    subcategory: /monitors?|displays?/i
                }
            },
            {
                type: 'phone',
                rx: /(smart\s*phones?|cell\s*phones?|\bphones?|\biphones?|\bmobiles?)/i,
                categorySlug: 'tech',
                matchFilter: {
                    subcategory: /smartphones?/i
                }
            },
            {
                type: 'shoes',
                rx: /\b(shoes?|sneakers?|boots?|footwear|loafers?|slip\s*ons?|clogs?|sandals?|heels|pumps|flats|slippers)\b/i,
                categorySlug: 'shoes',
                matchFilter: {
                    $and: [
                        {
                            $or: [
                                { title: /\b(shoes?|sneakers?|boots?|loafers?|slip-ons?|clogs?|sandals?|footwear|runners?|heels|pumps|flats|slippers)\b/i },
                                { name: /\b(shoes?|sneakers?|boots?|loafers?|slip-ons?|clogs?|sandals?|footwear|runners?|heels|pumps|flats|slippers)\b/i }
                            ]
                        },
                        { title: { $not: /\b(underwear|panties|panti|bra|bras|lingerie|thong|briefs|boxers|swimsuit|bikini|socks|sock|hosiery|tights)\b/i } },
                        { name: { $not: /\b(underwear|panties|panti|bra|bras|lingerie|thong|briefs|boxers|swimsuit|bikini|socks|sock|hosiery|tights)\b/i } }
                    ]
                }
            },
            {
                type: 'shirt',
                rx: /(t\s*shirts?|tees?|shirts?|tops?|blouses?)/i,
                categorySlug: 'clothing',
                matchFilter: {
                    $or: [
                        { title: /shirts?|t-?shirts?|tees?|tops?|blouses?/i },
                        { name: /shirts?|t-?shirts?|tees?|tops?|blouses?/i },
                        { aiTags: { $in: ['shirt', 't-shirt', 'tee', 'top', 'blouse'] } }
                    ]
                }
            },
            {
                type: 'pant',
                rx: /(pants?|jeans?|trousers?|shorts?|cargos?)/i,
                categorySlug: 'clothing',
                matchFilter: {
                    $or: [
                        { title: /pants?|jeans?|trousers?|shorts?|cargos?/i },
                        { name: /pants?|jeans?|trousers?|shorts?|cargos?/i },
                        { aiTags: { $in: ['pants', 'jeans', 'trousers', 'shorts'] } }
                    ]
                }
            },
            {
                type: 'jacket',
                rx: /(jackets?|coats?|hoodies?|puffer|sweaters?|bomber)/i,
                categorySlug: 'clothing',
                matchFilter: {
                    $or: [
                        { title: /jackets?|coats?|hoodies?|puffer|sweaters?|bomber/i },
                        { name: /jackets?|coats?|hoodies?|puffer|sweaters?|bomber/i },
                        { aiTags: { $in: ['jacket', 'hoodie', 'coat', 'puffer'] } }
                    ]
                }
            },
            {
                type: 'backpack',
                rx: /(backpacks?|bags?|rucksacks?)/i,
                categorySlug: 'clothing',
                matchFilter: {
                    $or: [
                        { subcategory: /backpacks?/i },
                        { title: /backpack|bag|fjallraven/i },
                        { aiTags: 'backpack' }
                    ]
                }
            },
            {
                type: 'storage',
                rx: /(hard\s*drives?|ssds?|storage|external\s*drive|memory)/i,
                categorySlug: 'tech',
                matchFilter: {
                    $or: [
                        { subcategory: /hard drives?|ssds?/i },
                        { title: /hard drive|ssd|elements|sandisk|silicon power|gaming drive/i },
                        { aiTags: { $in: ['hard drive', 'ssd', 'storage'] } }
                    ]
                }
            },
            {
                type: 'jewelry',
                rx: /(jewelery|jewelry|bracelets?|rings?|earrings?|necklace)/i,
                categorySlug: 'home',
                matchFilter: {
                    $or: [
                        { subcategory: /jewelry/i },
                        { title: /bracelet|ring|earrings|gold|silver|john hardy/i },
                        { aiTags: 'jewelry' }
                    ]
                }
            },
            {
                type: 'lipstick',
                rx: /(lipsticks?|lips?)/i,
                categorySlug: 'beauty',
                matchFilter: {
                    $or: [
                        { subcategory: /lipstick/i },
                        { title: /lipstick/i },
                        { aiTags: 'lipstick' }
                    ]
                }
            },
            {
                type: 'beauty',
                rx: /(beauty|mascara|eyeshadow|powder|nail\s*polish|cosmetics)/i,
                categorySlug: 'beauty',
                matchFilter: {
                    $or: [
                        { subcategory: /mascara|eyeshadow|powder|nail polish|beauty/i },
                        { title: /mascara|eyeshadow|powder|nail polish/i },
                        { aiTags: 'beauty' }
                    ]
                }
            },
            {
                type: 'fragrance',
                rx: /(fragrances?|perfumes?|cologne|eau\s*de)/i,
                categorySlug: 'beauty',
                matchFilter: {
                    $or: [
                        { subcategory: /fragrances?/i },
                        { title: /ck one|coco noir|j'adore|dolce shine|gucci bloom/i },
                        { aiTags: 'fragrances' }
                    ]
                }
            },
            {
                type: 'furniture',
                rx: /(furniture|sofas?|beds?|tables?|couch)/i,
                categorySlug: 'home',
                matchFilter: {
                    $or: [
                        { subcategory: /beds|sofas|tables|chairs|furniture/i },
                        { title: /bed|sofa|table|chair|sink/i },
                        { aiTags: 'furniture' }
                    ]
                }
            },
            {
                type: 'groceries',
                rx: /(groceries|fruits?|vegetables?|steak|food|oil|juice|eggs|pepper)/i,
                categorySlug: 'groceries',
                matchFilter: {
                    $or: [
                        { subcategory: /fruits|vegetables|meat|dairy|seafood|condiments|beverages|groceries/i },
                        { title: /apple|steak|chicken|oil|cucumber|egg|pepper|honey|ice cream|juice|kiwi/i },
                        { aiTags: 'groceries' }
                    ]
                }
            },
            {
                type: 'chair',
                rx: /(chairs?|recliners?|seating)/i,
                categorySlug: 'home',
                matchFilter: {
                    $or: [
                        { title: /chairs?|recliners?/i },
                        { aiTags: 'chair' }
                    ]
                }
            },
            {
                type: 'lamp',
                rx: /(lamps?|lights?|lighting)/i,
                categorySlug: 'home',
                matchFilter: {
                    $or: [
                        { title: /lamps?|lights?/i },
                        { aiTags: 'lamp' }
                    ]
                }
            }
        ];

        const matchedItemType = itemTypeRules.find(rule => rule.rx.test(trimmedQuery));

        // 3. Extract max price constraint if any (e.g. "under 5000", "under $50", "below 80k")
        let maxPrice = null;
        const priceMatch = trimmedQuery.match(/(?:under|below|less than|max|within)\s*(?:₹|\$)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
        if (priceMatch) {
            let val = parseFloat(priceMatch[1]);
            if (priceMatch[2] && priceMatch[2].toLowerCase() === 'k') {
                val *= 1000;
            }
            maxPrice = val;
        }

        // 4. Construct MongoDB Query Filter
        const mongoQuery = {
            image: { $exists: true, $ne: "" },
            title: { $exists: true, $ne: "" }
        };

        if (matchedItemType) {
            const catObj = categories.find(c => c.slug === matchedItemType.categorySlug);
            if (catObj) mongoQuery.category = catObj._id;
            
            mongoQuery.$and = mongoQuery.$and || [];
            mongoQuery.$and.push(matchedItemType.matchFilter);
        } else {
            // General Category Detection fallback
            const isTech = /\b(tech|electronics?|gadgets?)\b/i.test(trimmedQuery);
            const isClothing = /\b(clothing|clothes|fashion|apparel)\b/i.test(trimmedQuery);
            const isHome = /\b(home|furniture|decor|kitchen)\b/i.test(trimmedQuery);
            const isBook = /\b(books?|novels?)\b/i.test(trimmedQuery);
            const isToy = /\b(toys?|games?)\b/i.test(trimmedQuery);

            let detectedSlug = isTech ? 'tech' : isClothing ? 'clothing' : isHome ? 'home' : isBook ? 'books' : isToy ? 'toys' : null;
            if (detectedSlug) {
                const catObj = categories.find(c => c.slug === detectedSlug);
                if (catObj) mongoQuery.category = catObj._id;
            }
        }

        // Apply Gender Hard Filter if specified in query
        if (isWomenQuery) {
            mongoQuery.$and = mongoQuery.$and || [];
            mongoQuery.$and.push({
                $or: [
                    { title: /\b(women|woman|womens|female|ladies|lady)\b/i },
                    { name: /\b(women|woman|womens|female|ladies|lady)\b/i },
                    { aiTags: { $in: ['women', 'womens', 'woman', 'female', 'ladies', 'lady'] } }
                ]
            });
        } else if (isMenQuery) {
            mongoQuery.$and = mongoQuery.$and || [];
            mongoQuery.$and.push({
                $or: [
                    { title: /\b(men|man|mens|male)\b/i },
                    { name: /\b(men|man|mens|male)\b/i },
                    { aiTags: { $in: ['men', 'mens', 'man', 'male'] } }
                ]
            });
        }

        if (maxPrice && !isNaN(maxPrice)) {
            mongoQuery.price = { $lte: maxPrice };
        }

        // Hard Color Filter: Require exact visual color match ONLY when a color is specified
        if (primaryColor) {
            const colorRegex = new RegExp(`\\b${primaryColor}\\b`, 'i');
            mongoQuery.$and = mongoQuery.$and || [];
            mongoQuery.$and.push({
                $or: [
                    { visualColor: primaryColor },
                    { [`attributes.color`]: new RegExp(`^${primaryColor}$`, 'i') },
                    { [`attributes.Color`]: new RegExp(`^${primaryColor}$`, 'i') },
                    { aiTags: primaryColor },
                    { imageDescription: colorRegex }
                ]
            });
        }

        // Fetch candidates matching hard filters
        let products = await Product.find(mongoQuery).populate('category').lean();

        // Fallback: Only search across all categories if NO specific item type or category was matched
        if (products.length === 0 && primaryColor && !matchedItemType) {
            const fallbackQuery = {
                image: { $exists: true, $ne: "" },
                title: { $exists: true, $ne: "" },
                $or: [
                    { visualColor: primaryColor },
                    { [`attributes.color`]: new RegExp(`^${primaryColor}$`, 'i') },
                    { aiTags: primaryColor }
                ]
            };
            if (maxPrice) fallbackQuery.price = { $lte: maxPrice };
            products = await Product.find(fallbackQuery).populate('category').lean();
        }

        // 5. Calculate Multimodal Vision & Attribute Ranking Score (100-point scale)
        const stopwords = new Set(['show', 'me', 'the', 'a', 'an', 'for', 'with', 'under', 'below', 'in', 'of', 'and', 'or', 'to', 'buy', 'find', 'get', 'best', 'top', 'cheap', 'looking', 'want', 'need', 'book', 'books', 'woman', 'women', 'womens', 'man', 'men', 'mens', primaryColor]);
        const queryTerms = trimmedQuery
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 1 && !stopwords.has(w));

        products = products.map(p => {
            let score = 50; // base candidate score
            const titleLower = (p.title || p.name || '').toLowerCase();
            const descLower = (p.description || '').toLowerCase();
            const subcatLower = (p.subcategory || '').toLowerCase();
            const tagsStr = Array.isArray(p.aiTags) ? p.aiTags.join(' ').toLowerCase() : '';
            const brandLower = (p.brand || '').toLowerCase();

            // Gender Match Bonus
            if (isWomenQuery && /\b(women|woman|womens|female|ladies)\b/i.test(titleLower + ' ' + tagsStr)) {
                score += 35;
            } else if (isMenQuery && /\b(men|man|mens|male)\b/i.test(titleLower + ' ' + tagsStr)) {
                score += 35;
            }

            // Visual Color Match Scoring
            if (primaryColor) {
                if (p.visualColor === primaryColor || (p.attributes && typeof p.attributes.get === 'function' && p.attributes.get('color') === primaryColor)) {
                    score += 40; // Exact visual image color match
                } else if (tagsStr.includes(primaryColor)) {
                    score += 25;
                } else {
                    score -= 30; // Color mismatch penalty
                }
            } else {
                score += 20; // No color constraint
            }

            // Subject / Keyword / Subcategory match scoring
            queryTerms.forEach(term => {
                if (subcatLower.includes(term)) score += 20;
                if (titleLower.includes(term)) score += 15;
                if (tagsStr.includes(term)) score += 10;
                if (brandLower.includes(term)) score += 10;
            });

            // Cap max score at 100
            score = Math.min(100, score);

            return { ...p, score };
        })
        .filter(p => p.score >= 65)
        .sort((a, b) => b.score - a.score);

        // When NO color is requested in query, interleave visual colors so top items are visually diverse (not all red)
        if (!primaryColor && products.length > 0) {
            const colorGroups = {};
            products.forEach(p => {
                const col = p.visualColor || 'other';
                if (!colorGroups[col]) colorGroups[col] = [];
                colorGroups[col].push(p);
            });

            const interleaved = [];
            const colors = Object.keys(colorGroups);
            const maxLen = Math.max(...colors.map(c => colorGroups[c].length));

            for (let i = 0; i < maxLen; i++) {
                colors.forEach(col => {
                    if (colorGroups[col][i]) {
                        interleaved.push(colorGroups[col][i]);
                    }
                });
            }
            products = interleaved;
        }

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
            queryInfo: { 
                query, 
                color: primaryColor, 
                itemType: matchedItemType ? matchedItemType.type : null,
                category: matchedItemType ? matchedItemType.categorySlug : null,
                type: "multimodal_ai_search" 
            }
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
