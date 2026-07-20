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
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security
app.use(helmet());

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

// PUT DELETE support
app.use(methodOverride("_method"));

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

// Home
app.get("/", (req, res) => {
    res.render("index", {
        title: "NeuraCart"
    });
});

app.use(notFound);
app.use(errorHandler);

app.use(session(
    {
        secret:process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
        store:MongoStore.create({
            mongoUrl:process.env.MONGO_URI
        })
    })
);

module.exports = app;