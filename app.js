require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const passport = require("passport");
const flash = require("connect-flash");
const OpenAI = require("openai");

// Initialize OpenAI with NVIDIA API for 2-stage search
const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

require("./config/passport")(passport);

const app = express();

// ── Static Files (bypassing session/db for instant loads) ───────────────
app.use(express.static(path.join(__dirname, "public")));

// ── Security headers ──────────────────────────────────────────────────────────
// Remove any CSP headers so Chrome extensions don't block inline scripts/styles
// Also icons are served via local SVG (icons.js) so no CDN is needed.
app.use((req, res, next) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    next();
});

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const clientPromise = require('./config/database');
const sessionStore = MongoStore.create({ 
    clientPromise: clientPromise,
});
sessionStore.on('error', (error) => {
    console.error('Session store error:', error.message);
    // Prevents the Node.js process from crashing on unhandled rejection
});

app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key_for_development",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: false // Set to true if using HTTPS
    },
    store: sessionStore
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

const themeMiddleware = require('./middleware/theme.middleware');
app.use(themeMiddleware);

const cartMiddleware = require('./middleware/cart.middleware');
app.use(cartMiddleware);

// ── Theme Endpoint (cookie-backed preference) ─────────────────────────────────
app.post('/theme', (req, res) => {
    const { theme } = req.body;
    if (theme === 'dark' || theme === 'light') {
        // Keep this endpoint for clients that prefer to save through the server.
        // The browser cookie remains the sole theme source of truth.
        res.cookie('theme', theme, { maxAge: 31536000000, path: '/', sameSite: 'lax' });
        res.json({ success: true, theme });
    } else {
        res.status(400).json({ error: 'Invalid theme' });
    }
});

// Pass variables to all views
app.use(async (req, res, next) => {
    res.locals.port = req.socket.localPort;
    res.locals.originalUrl = req.originalUrl;
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    res.locals.isSeller = req.user && req.user.role === 'seller';
    
    // Fetch cart for reactive UI
    res.locals.cartItems = [];
    if (req.user && req.user.role === 'buyer') {
        const Cart = require('./models/Cart');
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            res.locals.cartItems = cart.items.map(item => ({ productId: item.product.toString(), quantity: item.quantity }));
        }
    }
    
    try {
        const Category = require('./models/Category');
        res.locals.globalCategories = await Category.find().sort({ name: 1 });
    } catch (err) {
        res.locals.globalCategories = [];
    }

    next();
});

// Serve axios locally (bypassing any CDN/extension blocks)
app.get('/js/axios.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules', 'axios', 'dist', 'axios.min.js'));
});

app.use(methodOverride("_method"));

// ── View engine ───────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require('./routes/cart.routes');
const sellerRoutes = require('./routes/seller.routes');
const searchRoutes = require("./routes/search.routes");
const dealAlertRoutes = require("./routes/dealAlert.routes");
const aiRoutes = require("./routes/ai.routes");

app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/deals/alerts", dealAlertRoutes);
app.use("/api/ai", aiRoutes);
app.use("/category", categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/seller', sellerRoutes);

const Product = require("./models/Product");
const Category = require("./models/Category");

// Shop page
app.get("/shop", async (req, res, next) => {
    try {
        const { category, q, sort, page } = req.query;
        const categories = await Category.find().sort({ name: 1 });
        const query = { image: { $exists: true, $ne: "" }, title: { $exists: true, $ne: "" } };

        let activeCategorySlug = "";
        if (category && category !== "All Categories" && category !== "All" && category.toLowerCase() !== "all" && category.trim() !== "") {
            const selected = categories.find(c => c.slug.toLowerCase() === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase());
            if (selected) {
                query.$or = [
                    { category: selected._id },
                    { category: new RegExp(`^${category}$`, 'i') }
                ];
                activeCategorySlug = selected.slug;
            } else {
                query.category = new RegExp(`^${category}$`, 'i');
            }
        }

        let products = [];
        let totalProducts = 0;

        let sortOption = { isFeatured: -1, createdAt: -1 };
        if (sort === "price-low") sortOption = { price: 1 };
        if (sort === "price-high") sortOption = { price: -1 };

        const limit = 12; // Products per page
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit;

        if (q) {
            const trimmedQ = q.trim();
            const aiService = require('./services/ai.service');

            // ── Stage 1: Use LLM to understand intent and expand query ──
            let searchTerms = trimmedQ;
            let aiIntent = trimmedQ;
            try {
                const expandCompletion = await openai.chat.completions.create({
                    model: "meta/llama-3.1-70b-instruct",
                    messages: [{
                        role: "system",
                        content: `You analyze shopping queries. Expand this user query into better search terms for our product database.
Our store sells: Smartphones, Laptops, Fragrances, Skincare, Groceries, Home Decoration, Furniture, Clothing, Shoes, Watches, Bags, Jewellery.
Query: "${trimmedQ}"
Respond ONLY with JSON: {"searchTerms":"expanded terms","intent":"brief description"}
Example: "red white shoes"→{"searchTerms":"footwear sneakers athletic shoes sports shoes","intent":"athletic footwear"}
Example: "phone for gaming"→{"searchTerms":"smartphone high performance gaming phone mobile","intent":"gaming smartphone"}`
                    }],
                    temperature: 0.1,
                    max_tokens: 80
                });
                const raw = expandCompletion.choices[0].message.content.trim().replace(/```json/g,'').replace(/```/g,'').trim();
                const parsed = JSON.parse(raw);
                searchTerms = parsed.searchTerms || trimmedQ;
                aiIntent = parsed.intent || trimmedQ;
                console.log(`[Shop Search] Expanded "${trimmedQ}" → "${searchTerms}" (${aiIntent})`);
            } catch(e) {
                console.warn('[Shop Search] LLM expansion failed, using raw query:', e.message);
            }

            // ── Stage 2: Generate Vector Embedding on expanded terms ──
            let queryVector = [];
            try {
                queryVector = await aiService.generateQueryEmbedding(searchTerms);
            } catch (e) {
                console.error("Embedding generation failed, falling back to regex search.", e);
            }

            if (queryVector && queryVector.length > 0) {
                const allProducts = await Product.find({ ...query, embedding: { $exists: true, $ne: [] } })
                                                 .populate('category')
                                                 .select('+embedding');

                const cosineSimilarity = (vecA, vecB) => {
                    let dot = 0, normA = 0, normB = 0;
                    for (let i = 0; i < vecA.length; i++) {
                        dot += vecA[i] * vecB[i];
                        normA += vecA[i] * vecA[i];
                        normB += vecB[i] * vecB[i];
                    }
                    if (normA === 0 || normB === 0) return 0;
                    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
                };

                const scoredProducts = allProducts.map(p => ({
                    product: p,
                    score: cosineSimilarity(queryVector, p.embedding)
                }));

                scoredProducts.sort((a, b) => b.score - a.score);

                // Use adaptive threshold: if nothing above 0.60, return top-8 best matches
                let matchedProducts = scoredProducts.filter(sp => sp.score > 0.60).map(sp => sp.product);
                if (matchedProducts.length === 0) {
                    console.log(`[Shop Search] No results above threshold, returning top-8 closest`);
                    matchedProducts = scoredProducts.slice(0, 8).map(sp => sp.product);
                }

                totalProducts = matchedProducts.length;
                if (sort === "price-low") matchedProducts.sort((a, b) => a.price - b.price);
                if (sort === "price-high") matchedProducts.sort((a, b) => b.price - a.price);
                products = matchedProducts.slice(skip, skip + limit);
            } else {
                // Regex fallback
                const pat = new RegExp(trimmedQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
                query.$or = [{ name: pat }, { title: pat }, { description: pat }, { aiTags: pat }, { subcategory: pat }, { brand: pat }];
                totalProducts = await Product.countDocuments(query);
                products = await Product.find(query).populate("category").sort(sortOption).skip(skip).limit(limit);
            }
        } else {
            totalProducts = await Product.countDocuments(query);
            products = await Product.find(query).populate("category").sort(sortOption).skip(skip).limit(limit);
        }

        const hasNextPage = (skip + limit) < totalProducts;

        // If it's an AJAX request (e.g. from infinite scroll), send JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                products,
                hasNextPage,
                currentPage
            });
        }

        res.render("shop", {
            title: "Shop - NeuraCart",
            products, categories,
            activeCategory: activeCategorySlug,
            activeSort: sort || "popular",
            searchQuery: q || "",
            hasNextPage,
            currentPage
        });
    } catch (err) { next(err); }
});

// Homepage
app.get("/", async (req, res) => {
    try {
        let products = [];
        let isPersonalized = false;
        
        // 1. Check if user is logged in and has past orders
        if (req.user && req.user.role === 'buyer') {
            const Order = require('./models/Order');
            const pastOrders = await Order.find({ user: req.user._id }).populate('items.product').lean();
            
            if (pastOrders.length > 0) {
                // Generate a semantic profile from past purchases
                const purchasedProducts = pastOrders.flatMap(o => o.items.map(i => i.product));
                const uniqueTitles = [...new Set(purchasedProducts.filter(p => p).map(p => p.title))].slice(0, 5); // take top 5
                
                if (uniqueTitles.length > 0) {
                    const aiService = require('./services/ai.service');
                    try {
                        const profileText = `Customer who bought: ${uniqueTitles.join(', ')}`;
                        const queryVector = await aiService.generateQueryEmbedding(profileText);
                        
                        if (queryVector && queryVector.length > 0) {
                            const boughtIds = purchasedProducts.map(p => p._id.toString());
                            
                            const cosineSimilarity = (vecA, vecB) => {
                                let dot = 0, normA = 0, normB = 0;
                                for (let i = 0; i < vecA.length; i++) {
                                    dot += vecA[i] * vecB[i];
                                    normA += vecA[i] * vecA[i];
                                    normB += vecB[i] * vecB[i];
                                }
                                if (normA === 0 || normB === 0) return 0;
                                return dot / (Math.sqrt(normA) * Math.sqrt(normB));
                            };
                            
                            const { getCachedEmbeddings } = require('./services/ai.service');
                            const allEmbeddings = await getCachedEmbeddings();
                            
                            const scored = allEmbeddings
                                .filter(p => !boughtIds.includes(p._id))
                                .map(p => ({
                                    id: p._id,
                                    score: cosineSimilarity(queryVector, p.embedding)
                                }));
                            
                            scored.sort((a, b) => b.score - a.score);
                            const matchedIds = scored.slice(0, 8).map(s => s.id);
                            
                            const matchedProducts = await Product.find({ _id: { $in: matchedIds }, image: { $exists: true, $ne: "" } }).populate('category');
                            
                            products = matchedIds.map(id => {
                                const p = matchedProducts.find(prod => prod._id.toString() === id.toString());
                                return p ? p.toObject() : null;
                            }).filter(Boolean);
                            isPersonalized = true;
                        }
                    } catch (e) {
                        console.warn("[Personalization] Vector search failed, falling back to default.", e.message);
                    }
                }
            }
        }
        
        // 2. Fallback to standard top products if no personalization found
        if (products.length === 0) {
            products = await Product.find({ image: { $exists: true, $ne: "" }, title: { $exists: true, $ne: "" } }).populate("category").limit(8);
        }

        res.render("index", { 
            title: "NeuraCart - AI Powered Shopping", 
            products,
            isPersonalized
        });
    } catch (err) {
        console.error(err);
        res.render("index", { title: "NeuraCart", products: [], isPersonalized: false });
    }
});

// Deals Page
app.get("/deals", async (req, res) => {
    try {
        // Fetch all products with images for deals
        const allProducts = await Product.find({ image: { $exists: true, $ne: "" } }).populate("category").sort({ price: 1 }).limit(40);

        // Featured deal: highest-priced product (best visual impact)
        const featuredDeal = allProducts.length > 0 ? allProducts[allProducts.length - 1] : null;

        // Flash deals: cheapest 8 products (biggest perceived savings)
        const flashDeals = allProducts.slice(0, 8);

        // More deals: remaining products excluding featured
        const moreDeals = allProducts.filter(p => 
            featuredDeal ? p._id.toString() !== featuredDeal._id.toString() : true
        ).slice(8);

        // Get all categories from MongoDB Category collection
        const dealCategories = await Category.find().sort({ name: 1 });

        res.render("deals", { 
            title: "Today's Deals - NeuraCart", 
            featuredDeal,
            flashDeals,
            moreDeals,
            dealCategories,
            totalDeals: allProducts.length,
            activeCategory: req.query.category || 'all',
            activeDiscount: parseInt(req.query.discount, 10) || 0
        });
    } catch (err) {
        console.error(err);
        res.render("deals", { 
            title: "Today's Deals", 
            featuredDeal: null,
            flashDeals: [],
            moreDeals: [],
            dealCategories: [],
            totalDeals: 0
        });
    }
});

// ── Deals Filter API ─────────────────────────────────────────────────────────
// Synthetic discount pool mirrors the EJS display order for visual consistency
const DEAL_DISCOUNTS_POOL = [55, 42, 38, 30, 48, 35, 25, 60, 20, 33, 28, 45, 22, 40, 15, 50, 35, 18];

app.get("/api/deals/filter", async (req, res) => {
    try {
        const categoryName = (req.query.category || 'all').trim();
        const minDiscount  = Math.max(0, parseInt(req.query.discount, 10) || 0);

        let productQuery = { image: { $exists: true, $ne: "" } };

        if (categoryName !== 'all') {
            const cat = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
            if (!cat) {
                return res.json({ success: true, products: [], count: 0, category: categoryName, discount: minDiscount });
            }
            productQuery.category = cat._id;
        }

        const allMatched = await Product.find(productQuery)
            .populate('category')
            .sort({ price: 1 })
            .limit(80)
            .lean();

        // Assign synthetic discounts and filter by minDiscount threshold
        const productsWithDiscount = allMatched
            .map((p, idx) => {
                const disc = DEAL_DISCOUNTS_POOL[idx % DEAL_DISCOUNTS_POOL.length];
                return {
                    ...p,
                    _syntheticDiscount: disc,
                    _originalPrice: parseFloat((p.price / (1 - disc / 100)).toFixed(2))
                };
            })
            .filter(p => p._syntheticDiscount >= minDiscount);

        return res.json({
            success: true,
            products: productsWithDiscount,
            count: productsWithDiscount.length,
            category: categoryName,
            discount: minDiscount
        });
    } catch (err) {
        console.error("Deals Filter API Error:", err);
        return res.status(500).json({ success: false, error: 'Filter failed. Please try again.' });
    }
});

// AI Picks Page
const { ensureAuthenticated } = require('./middleware/auth');
app.get("/ai-picks", ensureAuthenticated, async (req, res) => {
    try {
        // We simulate highly personalized AI picks by grabbing random top-rated items
        // In a true production app, this would use the user's view history and vector search
        const products = await Product.aggregate([
            { $match: { image: { $exists: true, $ne: "" } } },
            { $sample: { size: 12 } }
        ]);
        
        // Populate category manually since aggregate doesn't populate
        await Product.populate(products, { path: "category" });
        
        res.render("ai-picks", { title: "AI Picks For You - NeuraCart", products });
    } catch (err) {
        console.error(err);
        res.render("ai-picks", { title: "AI Picks", products: [] });
    }
});

// Product detail
app.get("/product/:id", async (req, res) => {
    try {
        const Review = require("./models/Review");
        
        let product;
        try {
            product = await Product.findById(req.params.id).populate("category");
        } catch (e) {
            product = null;
        }

        if (!product) {
            return res.status(404).render("product", {
                title: "Product Not Found - NeuraCart",
                product: null,
                reviews: [],
                similarProducts: [],
                error: "Product not found"
            });
        }

        const reviews = await Review.find({ product: product._id })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        let similarProducts = [];
        if (product.category && product.category._id) {
            similarProducts = await Product.find({ 
                category: product.category._id, 
                _id: { $ne: product._id } 
            }).populate('category').limit(4);
        }

        res.render("product", {
            title: `${product.title} - NeuraCart`,
            product, reviews, similarProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("product", {
            title: "Server Error - NeuraCart",
            product: null,
            reviews: [],
            similarProducts: [],
            error: "An internal server error occurred while retrieving this product."
        });
    }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
