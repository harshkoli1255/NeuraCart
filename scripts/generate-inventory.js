const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function generateAllProducts(openai) {
    const categories = [
        { name: 'Tech', slug: 'tech' },
        { name: 'Clothing', slug: 'clothing' },
        { name: 'Home', slug: 'home' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Books', slug: 'books' },
        { name: 'Toys', slug: 'toys' }
    ];

    let totalGenerated = 0;

    for (let cat of categories) {
        console.log(`Generating 20 products for category: ${cat.name}...`);
        
        let categoryDoc = await Category.findOne({ slug: cat.slug });
        if (!categoryDoc) continue;

        // Generate 5 products at a time, 4 times = 20 products
        for (let batch = 0; batch < 4; batch++) {
            const prompt = `You are a creative e-commerce inventory generator.
Generate a JSON array of EXACTLY 5 unique, highly detailed, realistic products for the category: "${cat.name}".

JSON SCHEMA FOR EACH PRODUCT:
{
  "name": "Short name",
  "title": "Full product title",
  "brand": "Brand name",
  "description": "A very detailed, structured HTML description (use <h3>, <ul>, <li>, <strong>). DO NOT USE MARKDOWN BACKTICKS in the string.",
  "imageDescription": "A highly descriptive, detailed sentence of exactly what the product visually looks like (e.g. 'A sleek matte black over-ear headphone with metallic silver accents'). This is crucial for AI image search.",
  "bulletPoints": ["point 1", "point 2", "point 3"],
  "price": 99.99,
  "subcategory": "relevant subcategory",
  "image": "https://source.unsplash.com/random/500x500/?${cat.name},product",
  "images": [],
  "stock": 50,
  "attributes": {
     "Color": "Red",
     "Material": "Plastic"
  },
  "aiTags": ["tag1", "tag2", "tag3"],
  "specifications": [
     { "key": "Weight", "value": "200g" }
  ]
}

Respond ONLY with the raw JSON array. Do not include markdown \`\`\`json backticks or any introductory text. Ensure it is perfectly valid JSON.`;

            try {
                const completion = await openai.chat.completions.create({
                    model: "meta/llama-3.1-70b-instruct",
                    messages: [{ role: "system", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 2000
                });
                
                let responseText = completion.choices[0].message.content.trim();
                if (responseText.startsWith("```json")) responseText = responseText.substring(7);
                else if (responseText.startsWith("```")) responseText = responseText.substring(3);
                if (responseText.endsWith("```")) responseText = responseText.substring(0, responseText.length - 3);
                
                const productArray = JSON.parse(responseText.trim());
                
                const docsToInsert = productArray.map(p => ({
                    ...p,
                    category: categoryDoc._id,
                }));
                
                for (let doc of docsToInsert) {
                    const product = new Product(doc);
                    await product.save();
                    totalGenerated++;
                }
                
                console.log(`Successfully generated batch ${batch+1}/4 for ${cat.name}.`);
                require('fs').appendFileSync('gen.log', `Batch ${batch+1} success for ${cat.name}\n`);
            } catch (e) {
                console.error(`Failed batch ${batch+1} for ${cat.name}`, e.message);
                require('fs').appendFileSync('gen.log', `Error batch ${batch+1} ${cat.name}: ${e.message}\n`);
            }
        }
    }
    
    return totalGenerated;
}

module.exports = { generateAllProducts };
