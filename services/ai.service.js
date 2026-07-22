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
        const client = getClient();
        const response = await client.post('/embeddings', {
            input: text,
            model: "NV-Embed-QA",
            input_type: "passage",
            encoding_format: "float",
            truncate: "NONE"
        });
        
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error.response?.data || error.message);
        throw new Error("Failed to generate vector embedding");
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

module.exports = {
    generateEmbedding,
    parseNaturalLanguageSearch,
    generateReviewSummary
};
