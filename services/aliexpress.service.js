/**
 * AliExpress DataHub Service (RapidAPI)
 * Host: aliexpress-datahub.p.rapidapi.com
 */

const API_KEY = process.env.RAPIDAPI_KEY || "b3d9494344msh43adb6555348118p13816ajsn6085e162f2f2";
const API_HOST = "aliexpress-datahub.p.rapidapi.com";

/**
 * Search products by Image URL using AliExpress DataHub Vision API
 * @param {string} imageUrl - Absolute URL of the image to search
 */
exports.searchByImage = async (imageUrl) => {
    try {
        const url = `https://${API_HOST}/item_search_image?sort=default&catId=0&imgUrl=${encodeURIComponent(imageUrl)}`;
        console.log(`AliExpress Vision Search: ${imageUrl}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`AliExpress Image Search response (${response.status}):`, errorText);
            return { success: false, status: response.status, error: errorText };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("AliExpress Image Search Service Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Search products by keyword on AliExpress DataHub
 * @param {string} query - Keyword search term
 * @param {number} page - Page number
 */
exports.searchByKeyword = async (query, page = 1) => {
    try {
        const url = `https://${API_HOST}/item_search?q=${encodeURIComponent(query)}&page=${page}`;
        console.log(`AliExpress Keyword Search: "${query}" (page ${page})`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`AliExpress Keyword Search response (${response.status}):`, errorText);
            return { success: false, status: response.status, error: errorText };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("AliExpress Keyword Search Service Error:", error);
        return { success: false, error: error.message };
    }
};
