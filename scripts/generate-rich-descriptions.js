require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const OpenAI = require("openai");

const MONGODB_URI = process.env.MONGO_URI;

// Initialize OpenAI client with NVIDIA API configuration
const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for AI Description Generation...'))
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });

const generateRichDescription = async (product) => {
    try {
        const prompt = `You are an expert e-commerce copywriter. Rewrite the following product description into a highly engaging, structured, and detailed HTML format (similar to an Amazon or Flipkart description). 

Original Title: ${product.title}
Original Description: ${product.description}
Key Specs: ${product.specifications.map(s => `${s.key}: ${s.value}`).join(', ')}

Guidelines:
1. ONLY return the HTML code. No markdown backticks (e.g. \`\`\`html), no conversational text, no explanations. 
2. Use <h3> tags for section headers.
3. Use <ul> and <li> for bullet points.
4. Use <strong> to highlight key benefits.
5. Make it sound premium and persuasive.
6. Do not include <html>, <body>, or <head> tags. Just the HTML snippet for the description body.`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.3,
            max_tokens: 500
        });

        let richHtml = completion.choices[0].message.content.trim();
        
        // Remove markdown backticks if the model ignores the instruction
        if (richHtml.startsWith("```html")) {
            richHtml = richHtml.substring(7);
        } else if (richHtml.startsWith("```")) {
            richHtml = richHtml.substring(3);
        }
        if (richHtml.endsWith("```")) {
            richHtml = richHtml.substring(0, richHtml.length - 3);
        }
        
        return richHtml.trim();
    } catch (e) {
        console.error(`Failed to generate description for ${product.title}`, e.message);
        return null;
    }
};

const run = async () => {
    try {
        const products = await Product.find({});
        console.log(`Found ${products.length} products. Starting generation...`);
        
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            
            // Skip if it looks like it already has HTML (basic check)
            if (p.description.includes('<h3>') || p.description.includes('<ul>')) {
                console.log(`[${i+1}/${products.length}] Skipping ${p.title} - already contains HTML.`);
                continue;
            }
            
            console.log(`[${i+1}/${products.length}] Generating rich description for: ${p.title}...`);
            const richDescription = await generateRichDescription(p);
            
            if (richDescription) {
                p.description = richDescription;
                await p.save();
                console.log(` => Success! Updated ${p.title}`);
            }
            
            // Wait 1 second to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log("All products processed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error during batch generation", err);
        process.exit(1);
    }
};

run();
