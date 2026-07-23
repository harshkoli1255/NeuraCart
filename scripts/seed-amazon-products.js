require("dotenv").config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const API_KEY = process.env.RAPIDAPI_KEY || "b3d9494344msh43adb6555348118p13816ajsn6085e162f2f2";
const API_HOST = "real-time-amazon-data.p.rapidapi.com";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/neuracart";

const defaultCategories = [
    { name: 'Tech', slug: 'tech', icon: '💻' },
    { name: 'Clothing', slug: 'clothing', icon: '👕' },
    { name: 'Home', slug: 'home', icon: '🏡' },
    { name: 'Beauty & Care', slug: 'beauty', icon: '💄' },
    { name: 'Groceries', slug: 'groceries', icon: '🛒' },
    { name: 'Shoes', slug: 'shoes', icon: '👟' },
    { name: 'Books', slug: 'books', icon: '📚' },
    { name: 'Toys', slug: 'toys', icon: '🧸' }
];

const searchQueries = [
    { query: 'womens shoes', categorySlug: 'shoes', subcategory: 'shoes' },
    { query: 'mens shoes', categorySlug: 'shoes', subcategory: 'shoes' },
    { query: 'red shoes', categorySlug: 'shoes', subcategory: 'shoes', forcedColor: 'red' },
    { query: 'running shoes', categorySlug: 'shoes', subcategory: 'shoes' },
    { query: 'boots', categorySlug: 'shoes', subcategory: 'shoes' },
    { query: 'red shirt', categorySlug: 'clothing', subcategory: 'shirts', forcedColor: 'red' },
    { query: 't shirt', categorySlug: 'clothing', subcategory: 'shirts' },
    { query: 'mens jacket', categorySlug: 'clothing', subcategory: 'jackets' },
    { query: 'smart phone', categorySlug: 'tech', subcategory: 'smartphones' },
    { query: 'laptop', categorySlug: 'tech', subcategory: 'laptops' },
    { query: 'wireless headphones', categorySlug: 'tech', subcategory: 'audio' },
    { query: 'computer monitor', categorySlug: 'tech', subcategory: 'monitors' },
    { query: 'external ssd', categorySlug: 'tech', subcategory: 'hard drives' },
    { query: 'red lipstick', categorySlug: 'beauty', subcategory: 'lipstick', forcedColor: 'red' },
    { query: 'perfume', categorySlug: 'beauty', subcategory: 'fragrances' },
    { query: 'gold jewelry', categorySlug: 'home', subcategory: 'jewelry', forcedColor: 'gold' },
    { query: 'sofa couch', categorySlug: 'home', subcategory: 'sofas' },
    { query: 'history book', categorySlug: 'books', subcategory: 'history' }
];

const unescapeHtml = (str = '') => {
    return str
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
};

const parsePrice = (priceStr = '') => {
    if (!priceStr) return 29.99;
    const match = priceStr.toString().match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : 29.99;
};

const extractVisualColor = (text = '', forcedColor = null) => {
    if (forcedColor) return forcedColor;
    const str = text.toLowerCase();
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'gold', 'silver', 'brown', 'grey', 'gray', 'navy', 'orange', 'olive'];
    for (const color of colors) {
        const regex = new RegExp(`\\b${color}\\b`, 'i');
        if (regex.test(str)) {
            return color === 'gray' ? 'grey' : color;
        }
    }
    return 'black';
};

const generateAiTags = (title, color, subcategory, brand) => {
    const tags = new Set();
    if (color) tags.add(color.toLowerCase());
    if (subcategory) tags.add(subcategory.toLowerCase());
    if (brand) tags.add(brand.toLowerCase());

    const words = title.toLowerCase().split(/[^a-z0-9]+/);
    words.forEach(w => {
        if (w.length > 2 && !['the', 'and', 'for', 'with', 'pro', 'max', 'deluxe', 'classic', 'everyday', 'modern', 'signature', 'premium', 'limited', 'edition'].includes(w)) {
            tags.add(w);
        }
    });
    return Array.from(tags);
};

async function fetchAmazonProducts(searchItem) {
    const url = `https://${API_HOST}/search?query=${encodeURIComponent(searchItem.query)}&page=1&country=US`;
    console.log(`Fetching Amazon products for query: "${searchItem.query}" ...`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
        }
    });

    if (!response.ok) {
        console.error(`Failed to fetch for "${searchItem.query}": ${response.status} ${response.statusText}`);
        return [];
    }

    const data = await response.json();
    const rawList = (data.data && data.data.products) ? data.data.products : [];
    console.log(`Fetched ${rawList.length} items for "${searchItem.query}".`);
    return rawList.map(p => ({ ...p, _searchMeta: searchItem }));
}

async function seedMongo() {
    await mongoose.connect(MONGO_URI, { family: 4 });
    console.log("Connected to MongoDB for Amazon seeding...");

    try {
        let existingCategories = await Category.find({});
        if (existingCategories.length === 0) {
            existingCategories = await Category.insertMany(defaultCategories);
            console.log("Seeded default categories.");
        }

        const getCategory = (slug) => {
            const cat = existingCategories.find(c => c.slug === slug);
            return cat ? cat._id : existingCategories[0]._id;
        };

        const allRawItems = [];
        for (const item of searchQueries) {
            const items = await fetchAmazonProducts(item);
            allRawItems.push(...items);
        }

        console.log(`Total raw Amazon items collected: ${allRawItems.length}`);

        // Deduplicate by ASIN or title
        const seenAsins = new Set();
        const uniqueItems = [];

        for (const item of allRawItems) {
            const key = item.asin || item.product_title;
            if (key && !seenAsins.has(key)) {
                seenAsins.add(key);
                uniqueItems.push(item);
            }
        }

        console.log(`Unique Amazon items to seed: ${uniqueItems.length}`);

        // Delete all old products completely as requested by user
        const deleteResult = await Product.deleteMany({});
        console.log(`Removed ${deleteResult.deletedCount} previous products from MongoDB database.`);

        const productsToInsert = uniqueItems.map(p => {
            const titleClean = unescapeHtml(p.product_title || 'Amazon Product');
            const priceVal = parsePrice(p.product_price);
            const ratingVal = p.product_star_rating ? parseFloat(p.product_star_rating) : 4.5;
            const ratingCount = p.product_num_ratings ? parseInt(p.product_num_ratings) : 100;
            const imgUrl = p.product_photo || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';

            const brandGuess = titleClean.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') || 'Generic';
            const meta = p._searchMeta;
            let catSlug = meta.categorySlug;

            const nonShoesRegex = /\b(underwear|panties|panti|bra|bras|lingerie|thong|briefs|boxers|swimsuit|bikini|socks|sock|hosiery|tights)\b/i;
            if (catSlug === 'shoes' && nonShoesRegex.test(titleClean)) {
                catSlug = 'clothing';
            }

            const visualColor = extractVisualColor(titleClean, meta.forcedColor);
            const aiTags = generateAiTags(titleClean, visualColor, catSlug === 'clothing' ? 'clothing' : meta.subcategory, brandGuess);

            return {
                name: titleClean,
                title: titleClean,
                brand: brandGuess,
                description: `Official Amazon Product (${p.asin || 'Prime'}). ${p.sales_volume || 'High demand product'}. ${p.delivery || 'Fast shipping available'}.`,
                price: priceVal,
                category: getCategory(catSlug),
                subcategory: catSlug === 'clothing' ? 'Clothing' : meta.subcategory,
                visualColor: visualColor,
                image: imgUrl,
                images: [imgUrl],
                stock: 100,
                attributes: { color: visualColor, Color: visualColor, asin: p.asin || '' },
                aiTags: aiTags,
                rating: ratingVal,
                ratings: {
                    average: ratingVal,
                    count: ratingCount
                }
            };
        });

        const inserted = await Product.insertMany(productsToInsert);
        console.log(`Successfully seeded ${inserted.length} real Amazon products into MongoDB database!`);

    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
}

async function main() {
    try {
        await seedMongo();
        process.exit(0);
    } catch (err) {
        console.error("Amazon Seeding failed:", err.message || err);
        process.exit(1);
    }
}

main();
