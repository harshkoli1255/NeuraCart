require("dotenv").config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const aliExpressService = require("../services/aliexpress.service");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/neuracart";

const sampleKeywords = ['running shoes', 'wireless earbuds', 'women dress', 'smart watch', 'jackets'];

async function seedAliExpress() {
    await mongoose.connect(MONGO_URI, { family: 4 });
    console.log("Connected to MongoDB for AliExpress Seeding...");

    try {
        const categories = await Category.find({});
        const getCategory = (slug) => {
            const cat = categories.find(c => c.slug === slug);
            return cat ? cat._id : categories[0]._id;
        };

        for (const kw of sampleKeywords) {
            const result = await aliExpressService.searchByKeyword(kw);
            if (result.success && result.data) {
                const rawItems = result.data.result || result.data.items || [];
                console.log(`AliExpress keyword "${kw}" returned ${rawItems.length} items.`);
                
                const itemsToInsert = rawItems.map(item => ({
                    name: item.title || 'AliExpress Product',
                    title: item.title || 'AliExpress Product',
                    brand: 'AliExpress',
                    description: `Official AliExpress product (${item.itemId || ''}). Fast international shipping.`,
                    price: parseFloat(item.price || item.promotionPrice || 19.99),
                    category: getCategory('clothing'),
                    subcategory: kw,
                    visualColor: 'black',
                    image: item.image || item.picUrl,
                    images: [item.image || item.picUrl],
                    stock: 100,
                    aiTags: [kw, 'aliexpress'],
                    rating: 4.5,
                    ratings: { average: 4.5, count: 50 }
                }));

                if (itemsToInsert.length > 0) {
                    await Product.insertMany(itemsToInsert);
                    console.log(`Seeded ${itemsToInsert.length} AliExpress products into MongoDB.`);
                }
            } else {
                console.warn(`AliExpress search for "${kw}" returned error:`, result.error || result.status);
            }
        }
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
}

seedAliExpress().catch(console.error);
