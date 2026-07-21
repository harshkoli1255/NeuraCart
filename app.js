require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
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
// Require passport config
require("./config/passport")(passport);

const app = express();

// Security — CSP configured to allow scripts/styles from same origin
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc:  ["'self'"],
            scriptSrc:   ["'self'"],
            styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc:     ["'self'", "https://fonts.gstatic.com"],
            imgSrc:      ["'self'", "data:", "blob:", "https://images.unsplash.com"],
            connectSrc:  ["'self'"],
            objectSrc:   ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));

// CORS
app.use(cors());

// Compression
app.use(compression());

// Logger
app.use(morgan("dev"));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key_for_development",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// PUT DELETE support
app.use(methodOverride("_method"));

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/category", categoryRoutes);


const Product = require("./models/Product");
const Category = require("./models/Category");

app.get('/shop', async (req, res, next) => {
    try {
        const { category, q, sort } = req.query;
        const categories = await Category.find().sort({ name: 1 });
        const query = {};

        if (category) {
            const selectedCategory = categories.find(item => item.slug === category);
            if (selectedCategory) {
                query.category = selectedCategory._id;
            }
        }

        if (q) {
            const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchPattern = new RegExp(escapedQuery, 'i');
            query.$or = [
                { name: searchPattern },
                { title: searchPattern },
                { description: searchPattern },
                { aiTags: searchPattern }
            ];
        }

        let sortOption = { isFeatured: -1, createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };

        const products = await Product.find(query).populate('category').sort(sortOption);
        res.render('shop', {
            title: 'Shop - NeuraCart',
            products,
            categories,
            activeCategory: category || '',
            activeSort: sort || 'popular',
            searchQuery: q || ''
        });
    } catch (error) {
        next(error);
    }
});

// Render Homepage
app.get('/', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const featuredProducts = await Product.find({ isFeatured: true }).populate('category').limit(8);
        res.render('index', { 
            title: 'NeuraCart - AI Powered Shopping',
            products: featuredProducts 
        });
    } catch (err) {
        console.error(err);
        res.render('index', { title: 'NeuraCart', products: [] });
    }
});

// Render Product Detail Page
app.get('/product/:id', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const Review = require('./models/Review');
        
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const reviews = await Review.find({ product: product._id })
                                    .populate('user', 'name')
                                    .sort({ createdAt: -1 });

        res.render('product', {
            title: `${product.title} - NeuraCart`,
            product,
            reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;