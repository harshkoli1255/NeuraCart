require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for seeding...'))
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });

const categories = [
    { name: 'Tech', slug: 'tech', icon: '💻' },
    { name: 'Clothing', slug: 'clothing', icon: '👕' },
    { name: 'Home', slug: 'home', icon: '🏡' },
    { name: 'Shoes', slug: 'shoes', icon: '👟' },
    { name: 'Books', slug: 'books', icon: '📚' },
    { name: 'Toys', slug: 'toys', icon: '🧸' }
];

const seedDB = async () => {
    try {
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data.');

        // Seed Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [
            { name: 'Alex Johnson', email: 'alex@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Maria Garcia', email: 'maria@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Sam Smith', email: 'sam@example.com', password: hashedPassword, role: 'customer' }
        ];
        const insertedUsers = await User.insertMany(users);
        console.log('Users seeded.');

        // Seed Categories
        const insertedCategories = await Category.insertMany(categories);
        console.log('Categories seeded.');

        const getCategory = (slug) => insertedCategories.find(c => c.slug === slug)._id;

        // Seed Products
        const products = [
            {
                title: 'Aurora Sound ANC Buds',
                brand: 'AuroraTech',
                description: 'Experience pure silence and high-fidelity audio with the Aurora Sound Active Noise Cancelling Earbuds. Features 30-hour battery life and customizable EQ settings via our app.',
                bulletPoints: [
                    '【INDUSTRY LEADING ANC】 Experience pure silence and high-fidelity audio with advanced Active Noise Cancelling.',
                    '【30-HOUR BATTERY LIFE】 Enjoy uninterrupted listening for days on a single charge with the included charging case.',
                    '【CUSTOMIZABLE EQ】 Personalize your sound profile using the Aurora App for iOS and Android.',
                    '【ULTRA-COMFORT FIT】 Ergonomically designed with 4 sizes of silicone tips for all-day comfort.',
                    '【CRYSTAL CLEAR CALLS】 Dual-beamforming microphones ensure your voice is heard clearly in noisy environments.'
                ],
                price: 129.99,
                category: getCategory('tech'),
                images: ['/images/placeholder/headphones.png'],
                stock: 50,
                aiTags: ['headphones', 'earbuds', 'audio', 'music', 'noise cancelling', 'bluetooth', 'wireless', 'tech', 'gadget'],
                specifications: [
                    { key: 'Battery Life', value: 'Up to 30 hours' },
                    { key: 'Bluetooth', value: 'Version 5.3' },
                    { key: 'Water Resistance', value: 'IPX4' },
                    { key: 'Weight', value: '4.5g per earbud' }
                ],
                ratings: { average: 4.8, count: 124 },
                isFeatured: true
            },
            {
                title: 'Titanium Smart Watch Pro',
                brand: 'NovaFit',
                description: 'Track your health, receive notifications, and look stylish with the Titanium Smart Watch Pro. Features an AMOLED display, heart rate monitoring, and 5-day battery life.',
                bulletPoints: [
                    '【PREMIUM TITANIUM BUILD】 Crafted from aerospace-grade titanium for ultimate durability and a lightweight feel.',
                    '【BRILLIANT AMOLED DISPLAY】 1.4-inch always-on AMOLED screen with vibrant colors and deep blacks.',
                    '【ADVANCED HEALTH TRACKING】 24/7 heart rate monitoring, SpO2 blood oxygen tracking, and advanced sleep stage analysis.',
                    '【5-DAY BATTERY】 Do not worry about daily charging; enjoy up to 5 days of continuous usage.',
                    '【5ATM WATER RESISTANCE】 Safe for swimming, showering, and all your water-based activities.'
                ],
                price: 249.00,
                category: getCategory('tech'),
                images: ['/images/placeholder/watch.png'],
                stock: 30,
                aiTags: ['watch', 'smartwatch', 'fitness tracker', 'wearable', 'health', 'tech', 'gadget', 'timepiece'],
                specifications: [
                    { key: 'Display', value: '1.4" AMOLED' },
                    { key: 'Sensors', value: 'Heart rate, SpO2, Accelerometer' },
                    { key: 'Battery', value: 'Up to 5 days' },
                    { key: 'Material', value: 'Titanium Alloy' }
                ],
                ratings: { average: 4.6, count: 89 },
                isFeatured: true
            },
            {
                title: 'Lumina 4K Action Camera',
                brand: 'Lumina',
                description: 'Capture your adventures in stunning 4K detail. Waterproof up to 10 meters without a case, featuring ultra-smooth stabilization and voice control.',
                bulletPoints: [
                    '【STUNNING 4K/60FPS】 Capture cinematic, high-resolution footage of your wildest adventures.',
                    '【HYPERSMOOTH 3.0】 Gimbal-like stabilization built directly into the camera for incredibly smooth video.',
                    '【WATERPROOF TO 33FT (10M)】 Dive into the action without needing an external waterproof housing.',
                    '【VOICE CONTROL】 Go hands-free with 14 simple voice commands like "Lumina, start recording."',
                    '【TOUCH DISPLAY】 Intuitive 2-inch rear touchscreen for easy framing and playback.'
                ],
                price: 199.50,
                category: getCategory('tech'),
                images: ['/images/placeholder/camera.png'],
                stock: 15,
                aiTags: ['camera', 'action camera', 'photography', 'video', '4k', 'waterproof', 'travel', 'tech', 'gadget'],
                specifications: [
                    { key: 'Resolution', value: '4K @ 60fps' },
                    { key: 'Waterproof', value: '10m (33ft) without case' },
                    { key: 'Stabilization', value: 'HyperSmooth 3.0' },
                    { key: 'Weight', value: '120g' }
                ],
                ratings: { average: 4.7, count: 56 },
                isFeatured: true
            },
            {
                title: 'Nomad Tech Backpack',
                brand: 'NomadGear',
                description: 'The ultimate backpack for digital nomads. Features padded laptop compartment, hidden security pockets, and water-resistant materials.',
                bulletPoints: [
                    '【WATER-RESISTANT EXTERIOR】 Constructed with high-density nylon to keep your tech safe from the elements.',
                    '【16-INCH LAPTOP SLEEVE】 Thickly padded compartment securely holds laptops up to 16 inches.',
                    '【ANTI-THEFT DESIGN】 Hidden back pocket and lockable zippers ensure your valuables stay secure.',
                    '【ERGONOMIC SUPPORT】 Breathable mesh back panel and contoured shoulder straps for all-day comfort.',
                    '【USB CHARGING PORT】 Built-in external USB port for convenient charging on the go (power bank not included).'
                ],
                price: 89.99,
                category: getCategory('clothing'),
                images: ['/images/placeholder/backpack.png'],
                stock: 100,
                aiTags: ['backpack', 'bag', 'travel', 'luggage', 'laptop bag', 'accessories', 'nomad'],
                specifications: [
                    { key: 'Material', value: 'Water-resistant nylon' },
                    { key: 'Laptop Compartment', value: 'Fits up to 16" laptops' },
                    { key: 'Capacity', value: '25L' },
                    { key: 'Weight', value: '1.2 kg' }
                ],
                ratings: { average: 4.9, count: 342 },
                isFeatured: true
            },
            {
                title: 'Ergonomic Office Chair',
                brand: 'ErgoSit',
                description: 'Say goodbye to back pain with our highly adjustable ergonomic office chair. Features lumbar support, breathable mesh, and adjustable armrests.',
                bulletPoints: [
                    '【DYNAMIC LUMBAR SUPPORT】 Automatically adjusts to your posture to provide continuous lower back support.',
                    '【BREATHABLE MESH】 High-quality mesh back allows for optimal airflow, keeping you cool during long work sessions.',
                    '【3D ADJUSTABLE ARMRESTS】 Customize the height, depth, and angle of the armrests for perfect ergonomics.',
                    '【HEAVY-DUTY BASE】 Solid aluminum alloy base supports up to 300 lbs with smooth-rolling casters.',
                    '【EASY ASSEMBLY】 Comes with all necessary tools and clear instructions; assembles in under 15 minutes.'
                ],
                price: 349.99,
                category: getCategory('home'),
                images: ['/images/placeholder/chair.png'],
                stock: 20,
                aiTags: ['chair', 'furniture', 'office', 'wfh', 'work from home', 'ergonomic', 'home'],
                specifications: [
                    { key: 'Material', value: 'Breathable Mesh' },
                    { key: 'Adjustability', value: 'Seat height, armrests, lumbar, tilt' },
                    { key: 'Max Capacity', value: '300 lbs' },
                    { key: 'Warranty', value: '5 Years' }
                ],
                ratings: { average: 4.5, count: 45 },
                isFeatured: false
            },
            {
                title: 'UltraBoost Running Shoes',
                brand: 'AeroStep',
                description: 'Experience maximum energy return and comfort with the new UltraBoost running shoes. Perfect for long distance runs and everyday wear.',
                bulletPoints: [
                    '【RESPONSIVE CUSHIONING】 Our proprietary Boost midsole delivers incredible energy return with every step.',
                    '【SEAMLESS KNIT UPPER】 Engineered textile upper provides a sock-like fit that adapts to your foot shape.',
                    '【CONTINENTAL RUBBER OUTSOLE】 Superior traction in both wet and dry conditions.',
                    '【HEEL SUPPORT】 Molded heel counter provides a natural fit that allows optimal movement of the Achilles.',
                    '【ECO-FRIENDLY】 Made with a series of high-performance recycled materials.'
                ],
                price: 159.00,
                category: getCategory('shoes'),
                images: ['/images/placeholder/shoes.png'],
                stock: 75,
                aiTags: ['shoes', 'sneakers', 'running', 'sports', 'footwear', 'fitness', 'apparel'],
                specifications: [
                    { key: 'Upper', value: 'Primeknit textle' },
                    { key: 'Midsole', value: 'Boost technology' },
                    { key: 'Outsole', value: 'Continental Rubber' },
                    { key: 'Weight', value: '10.9 oz' }
                ],
                ratings: { average: 4.8, count: 210 },
                isFeatured: false
            }
];

        const insertedProducts = await Product.insertMany(products);
        console.log('Products seeded.');

        // Seed Reviews
        const reviews = [
            { user: insertedUsers[0]._id, product: insertedProducts[0]._id, rating: 5, comment: 'Absolutely incredible sound quality!' },
            { user: insertedUsers[1]._id, product: insertedProducts[0]._id, rating: 4, comment: 'Great bass, but fit is a bit tight.' },
            { user: insertedUsers[2]._id, product: insertedProducts[1]._id, rating: 5, comment: 'Best smartwatch I have owned. Battery life is amazing.' },
            { user: insertedUsers[0]._id, product: insertedProducts[3]._id, rating: 5, comment: 'Fits my Macbook Pro 16 perfectly. Love the hidden pockets.' }
        ];
        await Review.insertMany(reviews);
        console.log('Reviews seeded.');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
