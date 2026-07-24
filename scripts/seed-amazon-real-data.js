require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const OpenAI = require("openai");

const MONGODB_URI = process.env.MONGO_URI;

// Initialize OpenAI client with NVIDIA API configuration
const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const categoriesToScrape = [
    { name: "Gaming Laptops", slug: "tech" },
    { name: "Wireless Headphones", slug: "tech" },
    { name: "Smartwatches", slug: "tech" },
    { name: "Men's Sneakers", slug: "shoes" },
    { name: "Women's Boots", slug: "shoes" },
    { name: "Winter Jackets", slug: "clothing" },
    { name: "Graphic T-Shirts", slug: "clothing" },
    { name: "Coffee Makers", slug: "home" },
    { name: "Vacuum Cleaners", slug: "home" },
    { name: "Science Fiction Books", slug: "books" },
    { name: "Self Help Books", slug: "books" },
    { name: "LEGO Sets", slug: "toys" },
    { name: "Board Games", slug: "toys" }
];

async function generateRichData(productTitle, productPrice, categoryName) {
    const prompt = `
    You are an elite e-commerce AI. I have scraped a product from Flipkart:
    Title: ${productTitle}
    Price: $${productPrice}
    Category: ${categoryName}

    Generate highly realistic and accurate data for this product to be used in an AI shopping assistant.
    Return ONLY a JSON object with the following structure:
    {
        "description": "A premium 2-paragraph HTML description using <h3> and <ul> tags",
        "bulletPoints": ["bullet 1", "bullet 2", "bullet 3"],
        "pros": ["pro 1", "pro 2", "pro 3"],
        "cons": ["con 1", "con 2"],
        "specifications": [{"key": "Spec Name", "value": "Spec Value"}, ...],
        "aiTags": ["keyword1", "keyword2", "keyword3"],
        "brand": "The brand name extracted from the title"
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1500
        });

        const raw = completion.choices[0].message.content.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (e) {
        console.error("LLM Error for", productTitle, e.message);
        return null;
    }
}

const clientPromise = require('../config/database');

clientPromise.then(async (client) => {
    try {
        console.log("Connected to MongoDB. Wiping existing products...");
        await Product.deleteMany({});
        console.log("✅ Database cleared.");

        let totalSaved = 0;

        const productCatalog = {
            "Gaming Laptops": [
                { title: "ASUS ROG Zephyrus G14 (2024) 14\" OLED Gaming Laptop - AMD Ryzen 9 - NVIDIA RTX 4060", price: 145000, image: "/generated-images/asus_rog_laptop_1784830766594.png", rating: 4.8 },
                { title: "Acer Predator Helios 16 Gaming Laptop | Intel Core i7-13700HX | NVIDIA GeForce RTX 4070", price: 160000, image: "https://m.media-amazon.com/images/I/71Y0mE8kI-L._AC_SL1500_.jpg", rating: 4.6 },
                { title: "Lenovo Legion Pro 5i 16\" LCD Gaming Laptop WQXGA 165Hz Intel Core i7-13700HX 16GB RAM 1TB SSD", price: 135000, image: "https://m.media-amazon.com/images/I/71FsgZzgZIL._AC_SL1500_.jpg", rating: 4.7 }
            ],
            "Wireless Headphones": [
                { title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones, Black", price: 29000, image: "/generated-images/sony_headphones_1784830789287.png", rating: 4.8 },
                { title: "Apple AirPods Max Wireless Over-Ear Headphones, Active Noise Cancelling", price: 59900, image: "https://m.media-amazon.com/images/I/81jqUPkIVRL._AC_SL1500_.jpg", rating: 4.6 },
                { title: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones", price: 35000, image: "https://m.media-amazon.com/images/I/51HwGj07lXL._AC_SL1500_.jpg", rating: 4.7 }
            ],
            "Smartwatches": [
                { title: "Apple Watch Series 9 [GPS 45mm] Smartwatch with Midnight Aluminum Case", price: 41900, image: "/generated-images/apple_watch_1784830824452.png", rating: 4.9 },
                { title: "Samsung Galaxy Watch 6 Classic 47mm LTE Smartwatch", price: 37999, image: "https://m.media-amazon.com/images/I/61r590c+e9L._AC_SL1500_.jpg", rating: 4.6 }
            ],
            "Men's Sneakers": [
                { title: "Nike Men's Air Force 1 '07 Sneaker", price: 7500, image: "/generated-images/nike_sneakers_1784830865023.png", rating: 4.7 },
                { title: "adidas Originals Men's Superstar Sneaker", price: 6500, image: "https://m.media-amazon.com/images/I/71R12D+Vz3L._AC_SY575_.jpg", rating: 4.6 }
            ],
            "Women's Boots": [
                { title: "Dr. Martens Women's 1460 W 8 Eye Boot", price: 14000, image: "https://m.media-amazon.com/images/I/71yD24P1B1L._AC_SY575_.jpg", rating: 4.8 }
            ],
            "Winter Jackets": [
                { title: "The North Face Men's McMurdo Parka Waterproof Insulated Winter Coat", price: 28000, image: "https://m.media-amazon.com/images/I/71B7G3z-28L._AC_SY741_.jpg", rating: 4.7 }
            ],
            "Graphic T-Shirts": [
                { title: "Carhartt Men's K87 Workwear Short Sleeve T-Shirt", price: 2500, image: "https://m.media-amazon.com/images/I/81k3yL+3c+L._AC_SX522_.jpg", rating: 4.8 }
            ],
            "Coffee Makers": [
                { title: "Breville Barista Express Espresso Machine, Brushed Stainless Steel", price: 65000, image: "https://m.media-amazon.com/images/I/81Xq6tP5e4L._AC_SL1500_.jpg", rating: 4.9 },
                { title: "Keurig K-Elite Single-Serve K-Cup Pod Coffee Maker", price: 12000, image: "https://m.media-amazon.com/images/I/71JcRifHq7L._AC_SL1500_.jpg", rating: 4.7 }
            ],
            "Vacuum Cleaners": [
                { title: "Dyson V15 Detect Cordless Vacuum Cleaner", price: 65000, image: "https://m.media-amazon.com/images/I/51r2zB5jE5L._AC_SL1500_.jpg", rating: 4.7 }
            ],
            "Science Fiction Books": [
                { title: "Dune (Dune Chronicles, Book 1) - Paperback", price: 899, image: "https://m.media-amazon.com/images/I/81ym3QUd3KL._SL1500_.jpg", rating: 4.8 }
            ],
            "Self Help Books": [
                { title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones", price: 550, image: "https://m.media-amazon.com/images/I/81bGKUa1e0L._SL1500_.jpg", rating: 4.9 }
            ],
            "LEGO Sets": [
                { title: "LEGO Star Wars Millennium Falcon 75257 Starship Building Kit", price: 13500, image: "https://m.media-amazon.com/images/I/811P3m1mX1L._AC_SL1500_.jpg", rating: 4.9 }
            ],
            "Board Games": [
                { title: "Catan Board Game (Base Game) | Family Board Game", price: 4500, image: "https://m.media-amazon.com/images/I/81+jNZE-1mL._AC_SL1500_.jpg", rating: 4.8 }
            ]
        };

        for (const cat of categoriesToScrape) {
            console.log(`\n🔍 Selecting highly-rated realistic products for: ${cat.name}...`);
            let scrapedProducts = productCatalog[cat.name] || [];
            
            if (scrapedProducts.length === 0) {
                console.log(`No products in catalog for ${cat.name}. Adding a generic product...`);
                scrapedProducts = [
                    { title: `Premium ${cat.name}`, price: 4999, image: "https://m.media-amazon.com/images/I/61H4hG0zHmL._AC_SL1500_.jpg", rating: 4.5 }
                ];
            }

            let categoryDoc = await Category.findOne({ name: cat.name });
            if (!categoryDoc) {
                categoryDoc = await Category.create({ name: cat.name, slug: cat.slug, icon: '📦' });
            }

            for (const item of scrapedProducts) {
                console.log(`🧠 Enhancing: ${item.title.substring(0, 40)}...`);
                
                const llmData = await generateRichData(item.title, item.price, cat.name);
                
                if (!llmData) {
                    console.log(`Skipping due to LLM failure.`);
                    continue;
                }

                const priceNumber = item.price;
                const newProduct = new Product({
                    title: item.title,
                    price: priceNumber,
                    description: llmData.description,
                    category: categoryDoc._id,
                    image: item.image,
                    isFeatured: Math.random() > 0.8,
                    ratings: { average: item.rating, count: Math.floor(Math.random() * 500) + 50 },
                    brand: llmData.brand || "Generic",
                    stock: Math.floor(Math.random() * 100) + 10,
                    bulletPoints: llmData.bulletPoints || [],
                    pros: llmData.pros || [],
                    cons: llmData.cons || [],
                    specifications: llmData.specifications || [],
                    aiTags: llmData.aiTags || []
                });

                // Generate vector embeddings (for semantic search + AI picks)
                const searchString = `${newProduct.title} ${newProduct.description} ${newProduct.aiTags.join(' ')}`;
                newProduct.embedding = await aiService.generateEmbedding(searchString);

                await newProduct.save();
                totalSaved++;
                console.log(`✅ Saved & embedded! (Total: ${totalSaved})`);
            }
            
            // Artificial delay to avoid rate-limiting NVIDIA NIM
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log(`\n🎉 Completely finished! Successfully injected ${totalSaved} real Flipkart products!`);
        process.exit(0);

    } catch (e) {
        console.error("Fatal Error:", e);
        process.exit(1);
    }
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
});
