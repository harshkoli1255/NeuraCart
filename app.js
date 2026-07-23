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

app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/deals/alerts", dealAlertRoutes);
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

        if (q) {
            const trimmedQ = q.trim();
            const colors = ['red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 'purple', 'brown', 'orange', 'grey', 'gray', 'gold', 'silver', 'navy', 'beige', 'maroon', 'tan', 'crimson'];
            const foundColor = colors.find(c => new RegExp(`\\b${c}\\b`, 'i').test(trimmedQ));
            
            if (foundColor) {
                const colorRegex = new RegExp(`\\b${foundColor}\\b`, 'i');
                const colorFilter = {
                    $or: [
                        { title: colorRegex },
                        { name: colorRegex },
                        { description: colorRegex },
                        { imageDescription: colorRegex },
                        { aiTags: colorRegex },
                        { subcategory: colorRegex },
                        { brand: colorRegex }
                    ]
                };

                const restWords = trimmedQ.toLowerCase()
                    .replace(new RegExp(`\\b${foundColor}\\b`, 'i'), '')
                    .replace(/[^a-z0-9\s]/g, '')
                    .trim()
                    .split(/\s+/)
                    .filter(w => w.length > 2 && !['show', 'the', 'for', 'buy', 'get', 'with', 'and'].includes(w));

                if (restWords.length > 0) {
                    const wordFilters = restWords.map(w => ({
                        $or: [
                            { title: new RegExp(w, 'i') },
                            { name: new RegExp(w, 'i') },
                            { description: new RegExp(w, 'i') },
                            { subcategory: new RegExp(w, 'i') },
                            { brand: new RegExp(w, 'i') },
                            { aiTags: new RegExp(w, 'i') }
                        ]
                    }));
                    query.$and = [colorFilter, ...wordFilters];
                } else {
                    Object.assign(query, colorFilter);
                }
            } else {
                const pat = new RegExp(trimmedQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
                query.$or = [
                    { name: pat }, { title: pat }, { description: pat }, { aiTags: pat }, { subcategory: pat }, { brand: pat }
                ];
            }
        }

        let sortOption = { isFeatured: -1, createdAt: -1 };
        if (sort === "price-low") sortOption = { price: 1 };
        if (sort === "price-high") sortOption = { price: -1 };

        const limit = 12; // Products per page
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit;

        const totalProducts = await Product.countDocuments(query);
        const hasNextPage = (skip + limit) < totalProducts;

        const products = await Product.find(query).populate("category").sort(sortOption).skip(skip).limit(limit);

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
        const products = await Product.find({ image: { $exists: true, $ne: "" }, title: { $exists: true, $ne: "" } }).populate("category").limit(8);
        res.render("index", { title: "NeuraCart - AI Powered Shopping", products });
    } catch (err) {
        console.error(err);
        res.render("index", { title: "NeuraCart", products: [] });
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
            }).limit(4);
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
