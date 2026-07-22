require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const aiService = require("../services/ai.service");

async function seedEmbeddings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for embedding seeding.");

        const products = await Product.find({ 
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } }
            ]
        });

        console.log(`Found ${products.length} products needing embeddings.`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            console.log(`[${i+1}/${products.length}] Generating embedding for: ${product.title}`);
            
            try {
                const textToEmbed = `${product.title}. ${product.description}`;
                product.embedding = await aiService.generateEmbedding(textToEmbed);
                
                // We use updateOne to avoid triggering the pre-save hook again unnecessarily
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { embedding: product.embedding } }
                );
                
                console.log(`  ✓ Success.`);
                
                // Rate limiting protection: 500ms delay between API calls
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`  ✗ Failed: ${err.message}`);
            }
        }

        console.log("Embedding seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Script failed:", err);
        process.exit(1);
    }
}

seedEmbeddings();
