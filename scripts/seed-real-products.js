require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

async function generateEmbedding(text) {
    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                input: [text],
                model: "nvidia/nv-embedqa-e5-v5",
                input_type: "passage",
                encoding_format: "float"
            })
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API error: ${response.status}`);
        }
        const data = await response.json();
        return data.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error.message);
        return [];
    }
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        console.log("Wiping existing products and categories...");
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log("Cleared database.");

        // Create or get seller user
        let seller = await User.findOne({ email: 'seller@neuracart.com' });
        if (!seller) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            seller = new User({
                name: 'Premium Store',
                email: 'seller@neuracart.com',
                password: hashedPassword,
                role: 'seller'
            });
            await seller.save();
            console.log("Created test seller account: seller@neuracart.com / password123");
        } else {
            // Ensure it's a seller
            seller.role = 'seller';
            await seller.save();
        }

        console.log("Fetching real products from DummyJSON API...");
        // Fetch 100 products (which includes smartphones, laptops, fragrances, skincare, groceries, home-decoration)
        const response = await axios.get('https://dummyjson.com/products?limit=200');
        const apiProducts = response.data.products;

        // Process Categories (DummyJSON returns categories like 'smartphones', 'laptops')
        const uniqueCategories = [...new Set(apiProducts.map(p => p.category))];
        const categoryMap = {};
        for (const catName of uniqueCategories) {
            const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let icon = '📁';
            if (['smartphones', 'laptops', 'tablets', 'mobile-accessories'].includes(slug)) icon = '💻';
            else if (['fragrances', 'skincare', 'beauty'].includes(slug)) icon = '✨';
            else if (['groceries'].includes(slug)) icon = '🍎';
            else if (['home-decoration', 'furniture'].includes(slug)) icon = '🏡';
            else if (['mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'womens-watches', 'mens-watches', 'womens-bags', 'womens-jewellery'].includes(slug)) icon = '👕';

            const category = new Category({
                name: catName.charAt(0).toUpperCase() + catName.slice(1).replace(/-/g, ' '),
                slug: slug,
                icon: icon
            });
            await category.save();
            categoryMap[catName] = category._id;
        }

        console.log(`Generating embeddings and saving ${apiProducts.length} products... This may take a couple of minutes.`);
        for (let i = 0; i < apiProducts.length; i++) {
            const apiProd = apiProducts[i];

            // Format data
            const title = apiProd.title;
            const description = apiProd.description;

            // Generate Semantic Vector Embedding
            const embedText = `Title: ${title}. Description: ${description}. Category: ${apiProd.category}. Brand: ${apiProd.brand || ''}`;
            const embedding = await generateEmbedding(embedText);

            const newProduct = new Product({
                name: title,
                title: title,
                brand: apiProd.brand || 'Generic',
                description: description,
                price: apiProd.price * 80, // Convert USD to INR
                category: categoryMap[apiProd.category],
                subcategory: apiProd.category,
                seller: seller._id,
                image: apiProd.thumbnail || apiProd.images[0],
                images: apiProd.images,
                stock: apiProd.stock || Math.floor(Math.random() * 50) + 10,
                embedding: embedding.length > 0 ? embedding : undefined,
                ratings: {
                    average: apiProd.rating,
                    count: apiProd.reviews ? apiProd.reviews.length : Math.floor(Math.random() * 200)
                },
                rating: apiProd.rating,
                aiTags: [apiProd.category, 'premium', ...(apiProd.tags || [])]
            });

            await newProduct.save();
            if (i % 5 === 0) process.stdout.write(`.`);
        }

        console.log("\n\nSuccessfully seeded database with 100 real DummyJSON products and AI embeddings!");
        process.exit(0);
    } catch (err) {
        console.error("\nSeeding error:", err);
        process.exit(1);
    }
}

seed();
