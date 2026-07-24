const OpenAI = require("openai");
const Product = require("../models/Product");
const aiService = require("../services/ai.service");

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

function cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Stage 1: Use LLM to understand what the user really means and generate ideal product search terms.
 * This handles cases like "red and white shoes" → "footwear sneakers athletic shoes"
 */
async function expandQueryWithLLM(userMessage) {
    try {
        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{
                role: "system",
                content: `You are a search intent analyzer for an e-commerce store. 
Your job is to expand a user's shopping query into richer search terms that capture their actual needs.

The store sells: Smartphones, Laptops, Fragrances, Skincare, Beauty, Groceries, Home Decoration, Furniture, Men's & Women's Clothing, Shoes, Watches, Bags, Jewellery.

User message: "${userMessage}"

Respond with ONLY a JSON object like:
{
  "searchTerms": "expanded technical search terms to find relevant products",
  "intent": "brief one-line summary of what user really wants",
  "category": "most likely product category or null",
  "maxPrice": null or number in INR
}

Example: "red and white shoes" → {"searchTerms":"footwear sneakers running shoes athletic shoes sports", "intent":"colored athletic footwear", "category":"shoes", "maxPrice": null}
Example: "something for my mom birthday" → {"searchTerms":"women's gift fragrance perfume jewellery accessories handbag", "intent":"gift ideas for women", "category":null, "maxPrice": null}
Respond ONLY with the JSON. No explanation.`
            }],
            temperature: 0.2,
            max_tokens: 150
        });

        const raw = completion.choices[0].message.content.trim()
            .replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(raw);
    } catch (e) {
        console.warn('[AI Chat] LLM query expansion failed, using raw message:', e.message);
        return { searchTerms: userMessage, intent: userMessage, category: null, maxPrice: null };
    }
}

exports.handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required." });

        // ── Stage 1: Understand Intent ──
        const expanded = await expandQueryWithLLM(message);
        console.log('[AI Chat] Expanded query:', expanded);

        // ── Stage 2: Vector Search with expanded terms ──
        let recommendedProducts = [];
        const searchText = expanded.searchTerms || message;

        const queryVector = await aiService.generateQueryEmbedding(searchText);

        if (queryVector && queryVector.length > 0) {
            const allProducts = await Product.find({ embedding: { $exists: true, $ne: [] } })
                                             .select('+embedding name title price image category brand');

            const scored = allProducts.map(p => ({
                product: p,
                score: cosineSimilarity(queryVector, p.embedding)
            }));

            scored.sort((a, b) => b.score - a.score);

            // Try >0.60 first, then fall back to top-5 best matches
            let filtered = scored.filter(s => s.score > 0.60);
            if (filtered.length === 0) {
                filtered = scored.slice(0, 5);
            }

            recommendedProducts = filtered.slice(0, 4).map(s => s.product);
        }

        // ── Stage 3: Generate natural conversational reply ──
        const productContext = recommendedProducts.length > 0
            ? `AVAILABLE PRODUCTS:\n` + recommendedProducts.map(p =>
                `• ${p.title} (₹${p.price.toLocaleString('en-IN')}) | ID: ${p._id}`
              ).join("\n")
            : "No exact matches found in our current catalog.";

        const systemPrompt = `You are Neura, a friendly and highly intelligent AI shopping assistant for NeuraCart.
You deeply understand what users want — even vague or indirect requests.
You give warm, concise recommendations in 2-3 sentences max.

User's underlying intent: "${expanded.intent}"

${productContext}

RULES:
- If products are listed, recommend them naturally. Use [PRODUCT:ID] tag (replace ID with actual ID) to show a rich card.
- If no exact match exists (e.g., user wants shoes but we only have electronics), honestly say what we do have and suggest alternatives from our catalog.
- NEVER make up product names or prices.
- Keep response conversational and helpful, max 3 sentences.
- Only use [PRODUCT:ID] syntax for product cards, never URLs.`;

        const chatCompletion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [
                { role: "system", content: systemPrompt },
                ...(history || []).slice(-6), // Keep last 6 messages for context
                { role: "user", content: message }
            ],
            temperature: 0.65,
            max_tokens: 280
        });

        let reply = chatCompletion.choices[0].message.content;

        // Extract product data for [PRODUCT:id] tags
        const productTags = [...reply.matchAll(/\[PRODUCT:([a-zA-Z0-9]+)\]/g)];
        const productData = {};
        for (const match of productTags) {
            const pid = match[1];
            const pInfo = recommendedProducts.find(p => p._id.toString() === pid)
                || await Product.findById(pid).catch(() => null);
            if (pInfo) {
                productData[pid] = {
                    _id: pInfo._id,
                    title: pInfo.title,
                    price: pInfo.price,
                    image: pInfo.image
                };
            }
        }

        res.json({ reply, products: productData, intent: expanded.intent });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: "I ran into a technical issue. Please try again!" });
    }
};

exports.getProductSummary = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Not found" });

        const prompt = `You are an expert product reviewer summarizing a product for busy shoppers.

Product: ${product.title}
Brand: ${product.brand || 'Unknown'}
Category: ${product.subcategory || 'General'}
Description: ${product.description}

Give a SHORT summary in this exact format (use emojis):
**✅ Key Pros:**
• [pro 1]
• [pro 2]

**⚡ Best For:**
[one-line use case]

Keep it under 60 words total. Be direct and honest.`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 120
        });

        res.json({ summary: completion.choices[0].message.content });
    } catch (error) {
        console.error("Product Summary Error:", error);
        res.status(500).json({ error: "Failed to generate summary." });
    }
};

exports.getProductQa = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const { question } = req.body;
        if (!question) return res.status(400).json({ error: "Question is required." });

        let purchaseContext = "";
        if (req.user) {
            try {
                const Order = require('../models/Order');
                const userOrders = await Order.find({ user: req.user._id }).populate('items.product');
                const pastProducts = [];
                userOrders.forEach(order => {
                    if (order.items) {
                        order.items.forEach(item => {
                            if (item.product && item.product.title) pastProducts.push(item.product.title);
                        });
                    }
                });
                if (pastProducts.length > 0) {
                    purchaseContext = `\nUSER'S PURCHASE HISTORY:\nThe user has previously bought: ${pastProducts.join(', ')}.\nUse this context ONLY if relevant to the question (e.g. for compatibility, size matching, or comparing).`;
                }
            } catch (err) {
                console.error("Failed to fetch purchase history for AI context:", err);
            }
        }

        const systemPrompt = `You are an AI shopping assistant for NeuraCart, answering a customer's question about a specific product.
        
PRODUCT DETAILS:
Title: ${product.title}
Brand: ${product.brand || 'Unknown'}
Price: ₹${product.price}
Specs: ${JSON.stringify(product.specifications || [])}
Description: ${product.description}${purchaseContext}

CUSTOMER QUESTION: "${question}"

RULES:
- Answer directly and honestly based ONLY on the product details provided.
- If the answer is not in the product context or purchase history, say "I don't know" or "I couldn't find that information". Do NOT guess.
- Keep the answer concise (2-3 sentences max).
- Be friendly and helpful.`;

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: "system", content: systemPrompt }],
            temperature: 0.5,
            max_tokens: 150
        });

        res.json({ answer: completion.choices[0].message.content });
    } catch (error) {
        console.error("Product Q&A Error:", error);
        res.status(500).json({ error: "Failed to answer your question." });
    }
};
