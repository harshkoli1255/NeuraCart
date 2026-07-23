require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcrypt');

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
    if (cat.includes('smartphone') || cat.includes('laptop') || cat.includes('tablet') || cat.includes('mobile-accessor') || cat.includes('electronics') || cat.includes('automotive') || cat.includes('motorcycle')) {
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

        const productsToSeed = allFetchedProducts.map(p => {
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

        await Product.insertMany(productsToSeed);
        console.log(`Successfully seeded ${productsToSeed.length} API products (FakeStore + DummyJSON) into MongoDB!`);
        process.exit(0);

    } catch (error) {
        console.error('Error seeding API products:', error);
        process.exit(1);
    }
};

seedDB();
