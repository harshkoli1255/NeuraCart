const axios = require('axios');

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1';

/**
 * Helper to get the authenticated Axios instance for NVIDIA API
 */
function getClient() {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        console.warn("NVIDIA_API_KEY is not set in environment variables!");
    }
    return axios.create({
        baseURL: NVIDIA_API_URL,
        timeout: 10000,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Generate Vector Embeddings for a given text
 * @param {string} text - The text to embed (e.g., product title + description)
 * @returns {Promise<number[]>} Array of floats representing the vector
 */
async function generateEmbedding(text) {
    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
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
            const errorText = await response.text();
            throw new Error(`NVIDIA API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error.message);
        throw new Error("Failed to generate vector embedding");
    }
}

/**
 * Generate Vector Embeddings for a search query
 * @param {string} text - The text to embed (e.g., product title + description)
 * @returns {Promise<number[]>} Array of floats representing the vector
 */
async function generateQueryEmbedding(text) {
    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                input: [text],
                model: "nvidia/nv-embedqa-e5-v5",
                input_type: "query",
                encoding_format: "float"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NVIDIA API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    } catch (error) {
        console.error("Error generating query embedding:", error.message);
        throw new Error("Failed to generate vector embedding for query");
    }
}

/**
 * Parse a natural language search query to extract core intent, price max, etc.
 * @param {string} query - e.g., "I need a fast laptop for video editing under $2000"
 * @returns {Promise<Object>} JSON object with extracted fields
 */
async function parseNaturalLanguageSearch(query) {
    try {
        const client = getClient();
        const prompt = `
        You are an AI assistant for an e-commerce store. 
        Extract the shopping intent from the following natural language query.
        Return ONLY a JSON object with the following keys:
        - "keywords": array of core search terms (strings)
        - "maxPrice": number or null
        - "category": string or null
        
        User Query: "${query}"
        JSON:
        `;

        const response = await client.post('/chat/completions', {
            model: "meta/llama3-70b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 150
        });

        const content = response.data.choices[0].message.content;
        
        // Find JSON block in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { keywords: [query], maxPrice: null, category: null };
        
    } catch (error) {
        console.error("Error parsing natural language search:", error.response?.data || error.message);
        // Fallback gracefully
        return { keywords: [query], maxPrice: null, category: null };
    }
}

/**
 * Generate a concise 1-sentence sentiment summary from an array of reviews
 * @param {string[]} reviews - Array of review text strings
 * @returns {Promise<string>}
 */
async function generateReviewSummary(reviews) {
    if (!reviews || reviews.length === 0) return "";
    
    try {
        const client = getClient();
        const reviewsText = reviews.join("\n\n");
        const prompt = `
        Read the following customer reviews for a product and summarize the overall sentiment in exactly ONE concise sentence.
        
        Reviews:
        ${reviewsText}
        
        Summary:
        `;

        const response = await client.post('/chat/completions', {
            model: "meta/llama3-70b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 60
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating review summary:", error.response?.data || error.message);
        return "";
    }
}

let embeddingCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Get cached product embeddings to avoid fetching large vectors from DB on every search
 */
async function getCachedEmbeddings() {
    const Product = require('../models/Product');
    const now = Date.now();
    
    if (embeddingCache && (now - lastCacheUpdate) < CACHE_TTL) {
        return embeddingCache;
    }
    
    console.log('[AI Cache] Refreshing product embeddings cache from DB...');
    const allProducts = await Product.find({ embedding: { $exists: true, $ne: [] }, stock: { $gt: 0 } })
        .select('_id embedding');
        
    embeddingCache = allProducts.map(p => ({
        _id: p._id.toString(),
        embedding: p.embedding
    }));
    
    lastCacheUpdate = now;
    console.log(`[AI Cache] Loaded ${embeddingCache.length} embeddings into memory.`);
    return embeddingCache;
}

module.exports = {
    generateEmbedding,
    generateQueryEmbedding,
    parseNaturalLanguageSearch,
    generateReviewSummary,
    getCachedEmbeddings
};
