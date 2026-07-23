require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcrypt');

const shoeProducts = require('./shoeProducts');
const homeProducts = require('./homeProducts');
const clothingProducts = require('./clothingProducts');
const techProducts = require('./techProducts');
const toyProducts = require('./toyProducts');
const bookProducts = require('./bookProducts');


const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI, { family: 4 })
    .then(() => console.log('Connected to MongoDB for seeding...'))
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });

const categories = [
    { name: 'Tech', slug: 'tech', icon: '💻' },
    { name: 'Clothing', slug: 'clothing', icon: '👕' },
    { name: 'Home', slug: 'home', icon: '🏡' },
    { name: 'Beauty & Care', slug: 'beauty', icon: '💄' },
    { name: 'Groceries', slug: 'groceries', icon: '🛒' },
    { name: 'Shoes', slug: 'shoes', icon: '👟' },
    { name: 'Books', slug: 'books', icon: '📚' },
    { name: 'Toys', slug: 'toys', icon: '🧸' }
];

const mapCategorySlug = (rawCategory = '', title = '', tags = []) => {
    const cat = (rawCategory || '').toLowerCase();
    const t = (title + ' ' + (Array.isArray(tags) ? tags.join(' ') : '')).toLowerCase();

    if (cat.includes('shoe') || cat.includes('heels') || cat.includes('sneaker') || cat.includes('boot') || t.includes('shoe') || t.includes('sneaker') || t.includes('boot') || t.includes('heels') || t.includes('footwear')) {
        return 'shoes';
    }
    if (cat.includes('smartphone') || cat.includes('laptop') || cat.includes('tablet') || cat.includes('mobile-accessor') || cat.includes('electronics')) {
        return 'tech';
    }
    if (cat.includes('shirt') || cat.includes('dress') || cat.includes('top') || cat.includes('clothing') || cat.includes('bag') || cat.includes('sunglasses') || cat.includes('sports-accessor') || cat.includes('mens-') || cat.includes('womens-')) {
        return 'clothing';
    }
    if (cat.includes('beauty') || cat.includes('skincare') || cat.includes('fragrance')) {
        return 'beauty';
    }
    if (cat.includes('furniture') || cat.includes('home-decoration') || cat.includes('lighting') || cat.includes('kitchen-accessor') || cat.includes('jewel') || cat.includes('jewellery')) {
        return 'home';
    }
    if (cat.includes('grocer')) {
        return 'groceries';
    }
    return 'home';
};

const extractVisualColor = (title = '', description = '', tags = []) => {
    const text = (title + ' ' + description + ' ' + (Array.isArray(tags) ? tags.join(' ') : '')).toLowerCase();
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'gold', 'silver', 'brown', 'grey', 'gray', 'navy', 'orange', 'olive'];
    for (const color of colors) {
        const regex = new RegExp(`\\b${color}\\b`, 'i');
        if (regex.test(text)) {
            return color === 'gray' ? 'grey' : color;
        }
    }
    return 'black';
};

const extractSubcategory = (p) => {
    if (p.subcategory) return p.subcategory;
    const cat = p.category || '';
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const generateAiTags = (p, visualColor) => {
    const tags = new Set();
    if (visualColor) tags.add(visualColor.toLowerCase());
    if (p.category) {
        p.category.split('-').forEach(t => tags.add(t.toLowerCase()));
    }
    if (Array.isArray(p.tags)) {
        p.tags.forEach(t => tags.add(t.toLowerCase()));
    }
    if (p.brand) tags.add(p.brand.toLowerCase());

    const words = (p.title || '').toLowerCase().split(/[^a-z0-9]+/);
    words.forEach(w => {
        if (w.length > 2 && !['the', 'and', 'for', 'with', 'pro', 'max', 'deluxe', 'classic', 'everyday', 'modern', 'signature', 'premium', 'limited', 'edition'].includes(w)) {
            tags.add(w);
        }
    });
    return Array.from(tags);
};

const seedDB = async () => {
    try {
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared all previous data.');

        // Seed Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [
            { name: 'Alex Johnson', email: 'alex@example.com', password: hashedPassword, role: 'buyer' },
            { name: 'Maria Garcia', email: 'maria@example.com', password: hashedPassword, role: 'buyer' },
            { name: 'Sam Smith', email: 'sam@example.com', password: hashedPassword, role: 'buyer' }
        ];
        await User.insertMany(users);
        console.log('Users seeded.');

        // Seed Categories
        const insertedCategories = await Category.insertMany(categories);
        const getCategory = (slug) => {
            const cat = insertedCategories.find(c => c.slug === slug);
            return cat ? cat._id : insertedCategories[0]._id;
        };
        console.log('Categories seeded.');

        // Fetch products from FakeStoreAPI
        console.log('Fetching products from FakeStore API...');
        let fakeStoreItems = [];
        try {
            const resFS = await fetch('https://fakestoreapi.com/products');
            fakeStoreItems = await resFS.json();
            console.log(`Fetched ${fakeStoreItems.length} products from FakeStoreAPI.`);
        } catch (e) {
            console.error('Error fetching FakeStoreAPI, proceeding...', e.message);
        }

        // Fetch products from DummyJSON API
        console.log('Fetching products from DummyJSON API...');
        let dummyJsonItems = [];
        try {
            const resDJ = await fetch('https://dummyjson.com/products?limit=200');
            const dataDJ = await resDJ.json();
            dummyJsonItems = dataDJ.products || [];
            console.log(`Fetched ${dummyJsonItems.length} products from DummyJSON API.`);
        } catch (e) {
            console.error('Error fetching DummyJSON API, proceeding...', e.message);
        }

        // Process all products
        const allFetchedProducts = [
            ...fakeStoreItems.map(p => ({
                title: p.title,
                name: p.title,
                brand: p.brand || 'Generic',
                description: p.description,
                price: p.price,
                categoryRaw: p.category,
                image: p.image,
                images: [p.image],
                ratingVal: (p.rating && p.rating.rate) ? p.rating.rate : 4.2,
                ratingCount: (p.rating && p.rating.count) ? p.rating.count : 100,
                tags: []
            })),
            ...dummyJsonItems.map(p => ({
                title: p.title,
                name: p.title,
                brand: p.brand || 'Generic',
                description: p.description,
                price: p.price,
                categoryRaw: p.category,
                image: p.thumbnail || (p.images && p.images[0]),
                images: p.images || [p.thumbnail],
                ratingVal: typeof p.rating === 'number' ? p.rating : 4.0,
                ratingCount: Math.floor(Math.random() * 200) + 25,
                tags: p.tags || []
            }))
        ];

        const filteredFetchedProducts = allFetchedProducts.filter(p => {
            const rawCat = (p.categoryRaw || '').toLowerCase();
            const titleLower = (p.title || '').toLowerCase();
            const brandLower = (p.brand || '').toLowerCase();
            const descLower = (p.description || '').toLowerCase();
            return !rawCat.includes('motorcycle') &&
                   !rawCat.includes('automotive') &&
                   !rawCat.includes('vehicle') &&
                   !titleLower.includes('motorcycle') &&
                   !titleLower.includes('motogp') &&
                   !brandLower.includes('motogp') &&
                   !descLower.includes('motogp');
        });

        const productsToSeed = filteredFetchedProducts.map(p => {
            const catSlug = mapCategorySlug(p.categoryRaw, p.title, p.tags);
            const visualColor = extractVisualColor(p.title, p.description, p.tags);
            const subcategory = extractSubcategory({ category: p.categoryRaw });
            const aiTags = generateAiTags(p, visualColor);

            return {
                name: p.name,
                title: p.title,
                brand: p.brand,
                description: p.description,
                price: p.price,
                category: getCategory(catSlug),
                subcategory: subcategory,
                visualColor: visualColor,
                image: p.image,
                images: p.images,
                stock: 100,
                attributes: { color: visualColor, Color: visualColor },
                aiTags: aiTags,
                rating: p.ratingVal,
                ratings: { average: p.ratingVal, count: p.ratingCount }
            };
        });

        const mapLocalProduct = (p) => {
            const title = p.title || p.name || "Untitled Product";
            const name = p.name || p.title || "Untitled Product";
            
            // Normalize category slug
            let catSlug = 'home';
            const rawCat = (p.category || '').toLowerCase();
            if (rawCat.includes('shoe') || rawCat.includes('wear') || rawCat.includes('footwear')) {
                catSlug = 'shoes';
            } else if (rawCat.includes('clothing') || rawCat.includes('apparel')) {
                catSlug = 'clothing';
            } else if (rawCat.includes('toy')) {
                catSlug = 'toys';
            } else if (rawCat.includes('tech') || rawCat.includes('electr')) {
                catSlug = 'tech';
            } else if (rawCat.includes('home') || rawCat.includes('decor') || rawCat.includes('furni')) {
                catSlug = 'home';
            } else if (rawCat.includes('beauty') || rawCat.includes('care')) {
                catSlug = 'beauty';
            } else if (rawCat.includes('grocer')) {
                catSlug = 'groceries';
            } else if (rawCat.includes('book')) {
                catSlug = 'books';
            }

            const categoryId = getCategory(catSlug);
            
            let description = p.description || p.imageDescription;
            if (!description) {
                description = `${title} - A high-quality product in the ${p.subcategory || 'General'} subcategory.`;
            }

            const visualColor = p.color || extractVisualColor(title, description, p.aiTags || []);
            const aiTags = Array.isArray(p.aiTags) ? p.aiTags : (p.color ? [p.color] : []);

            return {
                name,
                title,
                brand: p.brand || 'Generic',
                description,
                price: typeof p.price === 'number' ? p.price : 29.99,
                category: categoryId,
                subcategory: p.subcategory || 'General',
                visualColor,
                image: p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
                images: p.images || [p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'],
                stock: typeof p.stock === 'number' ? p.stock : 100,
                attributes: p.attributes || { color: visualColor, Color: visualColor },
                aiTags,
                rating: typeof p.rating === 'number' ? p.rating : 4.0,
                ratings: p.ratings || { average: typeof p.rating === 'number' ? p.rating : 4.0, count: Math.floor(Math.random() * 200) + 20 }
            };
        };

        const localMapped = [
            ...shoeProducts.map(mapLocalProduct),
            ...homeProducts.map(mapLocalProduct),
            ...clothingProducts.map(mapLocalProduct),
            ...techProducts.map(mapLocalProduct),
            ...toyProducts.map(mapLocalProduct),
            ...bookProducts.map(mapLocalProduct)
        ];

        const finalProductsToSeed = [
            ...productsToSeed,
            ...localMapped
        ];

        await Product.insertMany(finalProductsToSeed);
        console.log(`Successfully seeded ${finalProductsToSeed.length} products (API + Local files) into MongoDB!`);
        process.exit(0);

    } catch (error) {
        console.error('Error seeding API products:', error);
        process.exit(1);
    }
};

seedDB();
