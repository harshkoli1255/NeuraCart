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

const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
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
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
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
app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/category", categoryRoutes);
app.use('/cart', cartRoutes);

const Product = require("./models/Product");
const Category = require("./models/Category");

// Shop page
app.get("/shop", async (req, res, next) => {
    try {
        const { category, q, sort, page } = req.query;
        const categories = await Category.find().sort({ name: 1 });
        const query = {};

        if (category) {
            const selected = categories.find(c => c.slug === category);
            if (selected) query.category = selected._id;
        }

        if (q) {
            const pat = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            query.$or = [
                { name: pat }, { title: pat }, { description: pat }, { aiTags: pat }
            ];
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
            activeCategory: category || "",
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
        const products = await Product.find({ isFeatured: true }).populate("category").limit(8);
        res.render("index", { title: "NeuraCart - AI Powered Shopping", products });
    } catch (err) {
        console.error(err);
        res.render("index", { title: "NeuraCart", products: [] });
    }
});

// Product detail
app.get("/product/:id", async (req, res) => {
    try {
        const Review = require("./models/Review");
        const product = await Product.findById(req.params.id).populate("category");
        if (!product) return res.status(404).send("Product not found");

        const reviews = await Review.find({ product: product._id })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.render("product", {
            title: `${product.title} - NeuraCart`,
            product, reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
