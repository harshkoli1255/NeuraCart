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
        const getCategory = (slug) => insertedCategories.find(c => c.slug === slug)._id;
        console.log('Categories seeded.');

        // Seed Products
        const products = [
            // TECH
            {
                name: 'NeuraBook Pro 16',
                title: 'NeuraBook Pro 16',
                brand: 'NeuraTech',
                description: 'Unleash your creativity with the NeuraBook Pro. Features the latest M4 chip, 32GB unified memory, and a stunning 16-inch Liquid Retina XDR display.',
                bulletPoints: [
                    '【SUPERCHARGED BY M4】 Blaze through demanding workflows with the powerful M4 processor.',
                    '【32GB UNIFIED MEMORY】 Smooth multitasking and heavy project handling without slowdowns.',
                    '【LIQUID RETINA XDR】 Stunning 16.2-inch display with 1600 nits peak brightness and ProMotion.',
                    '【22-HOUR BATTERY LIFE】 Go all day and night with industry-leading power efficiency.',
                    '【STUDIO-QUALITY AUDIO】 Six-speaker sound system with spatial audio and studio-grade mics.'
                ],
                price: 1999.00,
                category: getCategory('tech'),
                subcategory: 'Laptops',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop'],
                stock: 25,
                aiTags: ['laptop', 'computer', 'notebook', 'macbook', 'workstation', 'm4', 'tech'],
                specifications: [
                    { key: 'Processor', value: 'Neura M4 Octa-Core' },
                    { key: 'Memory', value: '32GB Unified RAM' },
                    { key: 'Storage', value: '1TB Superfast SSD' },
                    { key: 'Display Size', value: '16.2-inch' }
                ],
                ratings: { average: 4.9, count: 48 },
                isFeatured: true,
                highlights: [
                    'Neura M4 Octa-Core Processor',
                    '32GB Unified Memory',
                    '1TB Superfast SSD',
                    '16.2-inch Liquid Retina XDR Display',
                    '22-Hour Battery Life',
                    'Studio-Quality 6-Speaker Audio System'
                ],
                features: [
                    { icon: '⚡', title: 'Lightning Fast', description: 'Unmatched M4 Performance' },
                    { icon: '🛡️', title: 'Premium Build', description: 'CNC Aluminium Chassis' },
                    { icon: '🔋', title: '22hr Battery Life', description: 'Work Without Limits' },
                    { icon: '🖥️', title: 'XDR Display', description: '1600 nits Peak Brightness' }
                ],
                delivery: 'Free express delivery by Tomorrow',
                warranty: '1 Year Apple-Equivalent Brand Warranty',
                emi: 'No-cost EMI from ₹1,666/month on 12 months',
                returnPolicy: '10-day easy returns, no questions asked'
            },
            {
                name: 'Aurora Sound ANC Buds',
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
                subcategory: 'Audio',
                image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop'],
                stock: 50,
                aiTags: ['headphones', 'earbuds', 'audio', 'music', 'noise cancelling', 'bluetooth', 'wireless', 'tech', 'gadget'],
                specifications: [
                    { key: 'Battery Life', value: 'Up to 30 hours' },
                    { key: 'Bluetooth', value: 'Version 5.3' },
                    { key: 'Water Resistance', value: 'IPX4' },
                    { key: 'Weight', value: '4.5g per earbud' }
                ],
                ratings: { average: 4.8, count: 124 },
                isFeatured: true,
                highlights: [
                    'Industry-Leading Active Noise Cancellation',
                    '30-Hour Total Battery Life with Case',
                    'Bluetooth 5.3 with Multipoint Connect',
                    'IPX4 Water Resistance Rating',
                    'Customizable EQ via Aurora App',
                    'Dual-Beamforming Crystal-Clear Mics'
                ],
                features: [
                    { icon: '🎧', title: 'Deep ANC', description: 'Pure Silence Mode' },
                    { icon: '🔋', title: '30hr Battery', description: 'All-Day Listening' },
                    { icon: '💧', title: 'IPX4 Rated', description: 'Sweat & Rain Proof' },
                    { icon: '📱', title: 'App Control', description: 'Custom EQ Settings' }
                ],
                delivery: 'Free delivery within 2 business days',
                warranty: '1 Year Manufacturer Warranty',
                emi: 'No-cost EMI from ₹108/month on 12 months',
                returnPolicy: '7-day easy returns'
            },
            {
                name: 'Horizon 34" UltraWide Monitor',
                title: 'Horizon 34" UltraWide Monitor',
                brand: 'Horizon',
                description: 'Immerse yourself in your work or gaming with a 34-inch curved UltraWide QHD display featuring a 144Hz refresh rate and HDR400 support.',
                bulletPoints: [
                    '【CURVED ULTRAWIDE DISPLAY】 21:9 aspect ratio curved screen increases field of view for immersive gaming.',
                    '【QHD RESOLUTION】 3440 x 1440 resolution provides pin-sharp details and crisp text.',
                    '【144Hz REFRESH RATE】 Ultra-smooth gaming performance with AMD FreeSync Premium support.',
                    '【HDR400 SUPPORT】 High dynamic range colors for brighter whites and deeper black levels.',
                    '【USB-C CONNECTIVITY】 Single cable for video input and 65W power delivery to charge your laptop.'
                ],
                price: 499.99,
                category: getCategory('tech'),
                subcategory: 'Displays',
                image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop'],
                stock: 12,
                aiTags: ['monitor', 'screen', 'display', 'ultrawide', 'curved', 'gaming', '4k', 'tech'],
                specifications: [
                    { key: 'Panel Type', value: 'IPS Curved' },
                    { key: 'Resolution', value: '3440 x 1440 QHD' },
                    { key: 'Refresh Rate', value: '144Hz' },
                    { key: 'Inputs', value: '1x USB-C, 2x HDMI, 1x DP' }
                ],
                ratings: { average: 4.5, count: 32 },
                isFeatured: false,
                highlights: [
                    '34-inch Curved QHD UltraWide Panel',
                    '144Hz Smooth Gaming Refresh Rate',
                    'AMD FreeSync Premium Support',
                    'HDR400 High Dynamic Range',
                    'USB-C 65W Power Delivery',
                    'Height & Tilt Adjustable Stand'
                ],
                features: [
                    { icon: '🖥️', title: 'Curved UltraWide', description: '21:9 Immersive View' },
                    { icon: '⚡', title: '144Hz Refresh', description: 'Buttery Smooth Gaming' },
                    { icon: '🎨', title: 'HDR400', description: 'Vivid Colors & Contrast' },
                    { icon: '🔌', title: 'USB-C 65W', description: 'Single Cable Setup' }
                ],
                delivery: 'Free delivery in 3–5 business days',
                warranty: '3 Year Panel Warranty',
                emi: 'No-cost EMI from ₹416/month on 12 months',
                returnPolicy: '10-day easy returns'
            },
            // CLOTHING
            {
                name: 'Classic Oxford Cotton Shirt',
                title: 'Classic Oxford Cotton Shirt',
                brand: 'ThreadCraft',
                description: 'Crafted from 100% premium long-staple cotton, this classic Oxford shirt is breathable, durable, and perfect for both casual and formal occasions.',
                bulletPoints: [
                    '【100% OXFORD COTTON】 High-density weave fabric that feels premium, durable and gets softer with every wash.',
                    '【BREATHABLE & COMFORTABLE】 Keeps you cool and comfortable all day long.',
                    '【TAILORED FIT】 Modern fit that is relaxed through the shoulders but slightly tapered at the waist.',
                    '【BUTTON-DOWN COLLAR】 Classic styling that looks great with or without a tie.',
                    '【EASY IRON FINISH】 Resists heavy wrinkling to save you time and keep you looking crisp.'
                ],
                price: 45.00,
                category: getCategory('clothing'),
                subcategory: 'Shirts',
                image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop'],
                stock: 80,
                aiTags: ['shirt', 'formal shirt', 'cotton', 'top', 'clothing', 'apparel', 'menswear'],
                specifications: [
                    { key: 'Material', value: '100% Cotton' },
                    { key: 'Fit', value: 'Modern Tailored' },
                    { key: 'Care Instructions', value: 'Machine wash warm, tumble dry low' }
                ],
                ratings: { average: 4.4, count: 64 },
                isFeatured: false,
                highlights: [
                    '100% Premium Long-Staple Oxford Cotton',
                    'Breathable & Gets Softer with Every Wash',
                    'Modern Tailored Slim Fit',
                    'Button-Down Classic Collar',
                    'Easy Iron Wrinkle-Resistant Finish',
                    'Machine Washable — Warm Cycle Safe'
                ],
                features: [
                    { icon: '👕', title: 'Oxford Cotton', description: 'Premium Feel' },
                    { icon: '🌬️', title: 'Breathable', description: 'All-Day Comfort' },
                    { icon: '🧺', title: 'Easy Care', description: 'Machine Washable' },
                    { icon: '✂️', title: 'Tailored Fit', description: 'Modern Silhouette' }
                ],
                delivery: 'Free delivery in 2–4 business days',
                warranty: 'Manufacturer quality guarantee',
                emi: 'No EMI required — affordable at ₹45',
                returnPolicy: '14-day easy returns'
            },
            {
                name: 'Flex-Fit Stretch Chinos',
                title: 'Flex-Fit Stretch Chinos',
                brand: 'UrbanPace',
                description: 'All-day comfort meets modern style. These chinos feature an elasticated waistband and 4-way stretch fabric for ultimate mobility.',
                bulletPoints: [
                    '【4-WAY STRETCH】 High-performance fabric blend allows complete freedom of movement.',
                    '【ELASTICATED WAISTBAND】 Hidden elastic inserts provide up to 2 inches of comfortable stretch.',
                    '【SMART CASUAL DESIGN】 Versatile cut that transitions effortlessly from the office to dinner.',
                    '【WRINKLE RESISTANT】 Looks fresh all day with double-stitched durable seams.',
                    '【DEEP POCKETS】 Two front slant pockets and two buttoned back pockets to keep items secure.'
                ],
                price: 59.99,
                category: getCategory('clothing'),
                subcategory: 'Pants',
                image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop'],
                stock: 65,
                aiTags: ['pants', 'chinos', 'trousers', 'clothing', 'apparel', 'stretch pants'],
                specifications: [
                    { key: 'Material', value: '97% Cotton, 3% Elastane' },
                    { key: 'Closure', value: 'Button and zipper fly' },
                    { key: 'Fit', value: 'Slim Straight' }
                ],
                ratings: { average: 4.6, count: 92 },
                isFeatured: true,
                highlights: [
                    '4-Way Stretch High-Performance Fabric',
                    'Hidden Elasticated Waistband — 2" Stretch',
                    'Smart Casual Design for Office & Dinner',
                    'Wrinkle-Resistant Double-Stitched Seams',
                    'Two Buttoned Back Pockets',
                    'Slim Straight Versatile Cut'
                ],
                features: [
                    { icon: '🏃', title: '4-Way Stretch', description: 'Full Range of Motion' },
                    { icon: '👔', title: 'Smart Casual', description: 'Office to Evening' },
                    { icon: '✨', title: 'Wrinkle-Free', description: 'All-Day Fresh Look' },
                    { icon: '🎯', title: 'Slim Straight', description: 'Flattering Silhouette' }
                ],
                delivery: 'Free delivery in 2–4 business days',
                warranty: 'Brand quality guarantee',
                emi: 'No EMI required',
                returnPolicy: '14-day easy returns'
            },
            {
                name: 'WeatherShield Windbreaker',
                title: 'WeatherShield Windbreaker',
                brand: 'AeroStep',
                description: 'A lightweight, packable jacket engineered to protect you from wind and light rain. Features zippered pockets and an adjustable hood.',
                bulletPoints: [
                    '【WATER & WIND RESISTANT】 Ripstop shell fabric with durable water repellent (DWR) finish.',
                    '【PACKABLE DESIGN】 Folds down compactly into its own chest pocket for easy travel.',
                    '【ADJUSTABLE FIT】 Drawcord hem and hook-and-loop cuffs lock out cold wind.',
                    '【SECURE POCKETS】 Two zippered hand pockets and one internal media pocket.',
                    '【LIGHTWEIGHT】 Weighs only 7 ounces, perfect for hiking, running, or casual wear.'
                ],
                price: 79.99,
                category: getCategory('clothing'),
                subcategory: 'Jackets',
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop'],
                stock: 45,
                aiTags: ['jacket', 'windbreaker', 'outerwear', 'clothing', 'waterproof', 'activewear'],
                specifications: [
                    { key: 'Shell Material', value: '100% Ripstop Nylon' },
                    { key: 'Weight', value: '198g (7 oz)' },
                    { key: 'Pockets', value: '3 zipped pockets' }
                ],
                ratings: { average: 4.7, count: 58 },
                isFeatured: false,
                highlights: [
                    'Wind & Water Resistant DWR Shell Fabric',
                    'Packable into Own Chest Pocket',
                    'Adjustable Drawcord Hem',
                    'Two Zippered Hand Pockets',
                    'Weighs Only 198g (7oz)',
                    'Breathable Mesh Lining'
                ],
                features: [
                    { icon: '🌧️', title: 'Weather Shield', description: 'Wind & Rain Resistant' },
                    { icon: '🎒', title: 'Packable', description: 'Fits in its Own Pocket' },
                    { icon: '⚖️', title: 'Ultralight', description: 'Only 198g Weight' },
                    { icon: '🌬️', title: 'Breathable', description: 'Mesh Lining Inside' }
                ],
                delivery: 'Free delivery in 2–4 business days',
                warranty: '2 Year Brand Warranty',
                emi: 'No EMI required',
                returnPolicy: '14-day easy returns'
            },
            // HOME
            {
                name: 'Ergonomic Office Chair',
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
                subcategory: 'Furniture',
                image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop'],
                stock: 20,
                aiTags: ['chair', 'furniture', 'office', 'wfh', 'work from home', 'ergonomic', 'home'],
                specifications: [
                    { key: 'Material', value: 'Breathable Mesh' },
                    { key: 'Adjustability', value: 'Seat height, armrests, lumbar, tilt' },
                    { key: 'Max Capacity', value: '300 lbs' },
                    { key: 'Warranty', value: '5 Years' }
                ],
                ratings: { average: 4.5, count: 45 },
                isFeatured: true
            },
            {
                name: 'Precision 8" Chef Knife',
                title: 'Precision 8" Chef Knife',
                brand: 'KitchPro',
                description: 'Forged from high-carbon German steel, this razor-sharp 8-inch chef knife delivers exceptional balance, durability, and cutting precision.',
                bulletPoints: [
                    '【HIGH-CARBON GERMAN STEEL】 Forged from top-grade steel for maximum sharpness, edge retention, and rust resistance.',
                    '【FULL TANG DESIGN】 Blade runs full length of the handle for superior strength, balance, and leverage.',
                    '【TRIPLE-RIVETED HANDLE】 Ergonomic military-grade handle scales are durable and slip-resistant.',
                    '【VERSATILE BLADE SHAPE】 Curved belly allows smooth rocking motion for effortless chopping, dicing, and mincing.',
                    '【LIFETIME WARRANTY】 Purchase with confidence; backed by our lifetime guarantee.'
                ],
                price: 69.95,
                category: getCategory('home'),
                subcategory: 'Kitchen',
                image: 'https://images.unsplash.com/photo-1593618998160-e34014e6754d?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1593618998160-e34014e6754d?w=500&auto=format&fit=crop'],
                stock: 40,
                aiTags: ['knife', 'chef knife', 'kitchen', 'cutlery', 'cooking', 'tools', 'home'],
                specifications: [
                    { key: 'Blade Material', value: 'German X50CrMov15 Steel' },
                    { key: 'Hardness', value: '58+ HRC' },
                    { key: 'Blade Length', value: '8 inches' }
                ],
                ratings: { average: 4.8, count: 88 },
                isFeatured: false
            },
            {
                name: 'Ambient Smart LED Floor Lamp',
                title: 'Ambient Smart LED Floor Lamp',
                brand: 'Lumina',
                description: 'Transform your room\'s vibe with a sleek, minimalist floor lamp offering 16 million colors, voice control, and music sync functionality.',
                bulletPoints: [
                    '【16 MILLION COLORS】 Wide spectrum of vibrant colors and warm-to-cool whites to match any mood.',
                    '【SMART VOICE CONTROL】 Works with Alexa and Google Assistant for convenient hands-free operation.',
                    '【MUSIC SYNC MODE】 Built-in high sensitivity mic syncs light to the beat of your favorite music or movie.',
                    '【MINIMALIST CORNER FIT】 Slim vertical pole design fits perfectly into corners to maximize space.',
                    '【SCHEDULES & TIMERS】 Create automated timers to wake up, sleep, or change lighting themes.'
                ],
                price: 89.00,
                category: getCategory('home'),
                subcategory: 'Decor',
                image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop'],
                stock: 35,
                aiTags: ['lamp', 'floor lamp', 'light', 'smart lighting', 'led', 'home decor', 'smart home'],
                specifications: [
                    { key: 'Height', value: '55 inches (140 cm)' },
                    { key: 'Power Connection', value: 'DC 12V Adapter' },
                    { key: 'Control Methods', value: 'App, Remote, Voice Control' }
                ],
                ratings: { average: 4.6, count: 110 },
                isFeatured: false
            },
            // SHOES
            {
                name: 'UltraBoost Running Shoes',
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
                subcategory: 'Running',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop'],
                stock: 75,
                aiTags: ['shoes', 'sneakers', 'running', 'sports', 'footwear', 'fitness', 'apparel'],
                specifications: [
                    { key: 'Upper', value: 'Primeknit textile' },
                    { key: 'Midsole', value: 'Boost technology' },
                    { key: 'Outsole', value: 'Continental Rubber' },
                    { key: 'Weight', value: '10.9 oz' }
                ],
                ratings: { average: 4.8, count: 210 },
                isFeatured: true
            },
            {
                name: 'CityStride Leather Sneakers',
                title: 'CityStride Leather Sneakers',
                brand: 'UrbanPace',
                description: 'Classic clean silhouette crafted with premium full-grain leather and a durable rubber outsole. Perfect for smart-casual wear.',
                bulletPoints: [
                    '【FULL-GRAIN LEATHER】 Supple, high-grade leather upper that looks refined and patinas beautifully over time.',
                    '【CUSHIONED INSOLE】 Memory foam footbed molds to your foot for supreme all-day comfort.',
                    '【STITCHED CUP SOLE】 Sturdily stitched rubber outsole provides durable, long-lasting construction.',
                    '【CLEAN MINIMALIST DESIGN】 Subtle logo and sleek profile pairs perfectly with trousers, chinos, or denim.',
                    '【BREATHABLE LINING】 Soft cotton canvas lining prevents sweat build-up and keeps feet fresh.'
                ],
                price: 95.00,
                category: getCategory('shoes'),
                subcategory: 'Casual',
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop'],
                stock: 60,
                aiTags: ['shoes', 'sneakers', 'casual shoes', 'footwear', 'leather shoes', 'apparel'],
                specifications: [
                    { key: 'Upper Material', value: 'Full-Grain Calfskin Leather' },
                    { key: 'Lining', value: 'Breathable Canvas' },
                    { key: 'Sole', value: 'Anti-slip rubber cupsole' }
                ],
                ratings: { average: 4.5, count: 76 },
                isFeatured: false
            },
            {
                name: 'Outdoor Waterproof Boots',
                title: 'Outdoor Waterproof Boots',
                brand: 'TerraGear',
                description: 'Conquer any terrain in these waterproof hiking boots. Features deep-lug Vibram outsoles and a cushioned EVA midsole for all-day comfort.',
                bulletPoints: [
                    '【100% WATERPROOF】 Breathable membrane keeps water out while venting inner moisture.',
                    '【VIBRAM GRIP OUTSOLE】 High-performance rubber sole delivers reliable traction on wet, rocky surfaces.',
                    '【ANKLE STABILITY】 High-cut padded collar protects your ankles from sprains on uneven trails.',
                    '【REINFORCED TOE CAP】 Rubber guard shields your toes from rocks, roots, and debris.',
                    '【CUSHIONED EVA MIDSOLE】 Dual-density foam absorbs shock and reduces foot fatigue.'
                ],
                price: 135.00,
                category: getCategory('shoes'),
                subcategory: 'Boots',
                image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop'],
                stock: 30,
                aiTags: ['boots', 'hiking boots', 'shoes', 'waterproof boots', 'outdoor', 'footwear'],
                specifications: [
                    { key: 'Material', value: 'Suede leather and mesh' },
                    { key: 'Sole Type', value: 'Vibram deep-lug' },
                    { key: 'Weight', value: '1.4 lbs per boot' }
                ],
                ratings: { average: 4.7, count: 42 },
                isFeatured: false
            },
            // BOOKS
            {
                name: 'Echoes of the Universe',
                title: 'Echoes of the Universe',
                brand: 'Nova Press',
                description: 'A gripping contemporary drama exploring the interconnected lives of three strangers across different continents. A Sunday Times bestseller.',
                bulletPoints: [
                    '【GRIPPING NARRATIVE】 Keeps you turning pages with beautifully intertwined storylines.',
                    '【AWARDS & RECOGNITION】 Selected as the Book of the Month and a Sunday Times Bestseller.',
                    '【BEAUTIFUL PROSE】 Critically acclaimed for its rich vocabulary and evocative settings.',
                    '【QUALITY PRINTING】 High-quality acid-free paper with a premium matte paperback cover.'
                ],
                price: 14.99,
                category: getCategory('books'),
                subcategory: 'Fiction',
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop'],
                stock: 120,
                aiTags: ['books', 'fiction', 'novel', 'bestseller', 'drama', 'literature'],
                specifications: [
                    { key: 'Format', value: 'Paperback, 384 pages' },
                    { key: 'Publisher', value: 'Nova Press' },
                    { key: 'Language', value: 'English' }
                ],
                ratings: { average: 4.6, count: 184 },
                isFeatured: false
            },
            {
                name: 'Chrono-Grid Paradox',
                title: 'Chrono-Grid Paradox',
                brand: 'Apex Sci-Fi',
                description: 'When a quantum physicist accidentally creates a localized time loop, she must race against time to prevent the collapse of reality itself.',
                bulletPoints: [
                    '【HARD SCI-FI DRAMA】 Thought-provoking concepts rooted in real quantum physics theories.',
                    '【THRILLING PACE】 A ticking clock thriller that will keep you guessing until the final page.',
                    '【MEMORABLE CHARACTERS】 Features a brilliant, determined female protagonist facing impossible stakes.'
                ],
                price: 16.50,
                category: getCategory('books'),
                subcategory: 'Sci-Fi',
                image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop'],
                stock: 95,
                aiTags: ['books', 'sci-fi', 'science fiction', 'novel', 'time travel', 'physics'],
                specifications: [
                    { key: 'Format', value: 'Hardcover, 420 pages' },
                    { key: 'Release Date', value: 'October 2024' },
                    { key: 'Age Group', value: 'Young Adult & Adult' }
                ],
                ratings: { average: 4.8, count: 54 },
                isFeatured: true
            },
            {
                name: 'Sparks of Genius: The Innovator\'s Story',
                title: 'Sparks of Genius: The Innovator\'s Story',
                brand: 'Biography Labs',
                description: 'An intimate and inspiring biography of a legendary tech pioneer whose ideas reshaped the modern digital landscape.',
                bulletPoints: [
                    '【EXCLUSIVE INTERVIEWS】 Features over 50 interviews with colleagues, competitors, and close family members.',
                    '【INSPIRATIONAL JOURNEY】 Highlights the struggles, failures, and triumphs behind world-changing inventions.',
                    '【COLLECTOR\'S EDITION】 Includes 16 pages of rare historical photographs and notes.'
                ],
                price: 22.00,
                category: getCategory('books'),
                subcategory: 'Biography',
                image: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=500&auto=format&fit=crop'],
                stock: 70,
                aiTags: ['books', 'biography', 'history', 'tech history', 'nonfiction', 'inspiration'],
                specifications: [
                    { key: 'Format', value: 'Hardcover, 512 pages' },
                    { key: 'Subject', value: 'Technology Pioneers' },
                    { key: 'Language', value: 'English' }
                ],
                ratings: { average: 4.7, count: 145 },
                isFeatured: false
            },
            // TOYS
            {
                name: 'Mecha-Knight Titan Action Figure',
                title: 'Mecha-Knight Titan Action Figure',
                brand: 'ToyNation',
                description: 'A fully articulated 12-inch action figure featuring premium metallic paint, interchangeable hands, and light-up LED eyes.',
                bulletPoints: [
                    '【12-INCH ULTRA FIGURE】 Impressive vertical scale with 35 points of articulation for dynamic posing.',
                    '【LIGHT-UP LED EYES】 Toggle switch powers bright blue LED eyes (batteries included).',
                    '【PREMIUM METALLIC PAINT】 High-gloss, battle-damaged metallic finish for realistic shelf presence.',
                    '【INTERCHANGEABLE WEAPONS】 Includes shield, energy sword, and 3 sets of swap-out hand gestures.'
                ],
                price: 34.99,
                category: getCategory('toys'),
                subcategory: 'Action Figures',
                image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=500&auto=format&fit=crop'],
                stock: 45,
                aiTags: ['toys', 'action figure', 'robot', 'mecha', 'collectibles', 'gifts for kids'],
                specifications: [
                    { key: 'Size', value: '12 inches tall' },
                    { key: 'Material', value: 'ABS & PVC Plastic' },
                    { key: 'Battery', value: '2x LR44 Button Cell (included)' }
                ],
                ratings: { average: 4.6, count: 39 },
                isFeatured: false
            },
            {
                name: '3D Crystal Castle Puzzle',
                title: '3D Crystal Castle Puzzle',
                brand: 'PuzzleMaster',
                description: 'Challenge your mind with this intricate 150-piece 3D crystal puzzle that builds a beautiful translucent castle model.',
                bulletPoints: [
                    '【3D CRYSTAL PUZZLE】 A brand new dimension of jigsaw puzzle that builds a solid, shiny 3D sculpture.',
                    '【150 TRANSLUCENT PIECES】 Interlocking plastic pieces are precisely manufactured for a perfect friction fit.',
                    '【DISPLAY STAND & LIGHT】 Includes a display base with optional LED color-changing pedestal lights.'
                ],
                price: 24.50,
                category: getCategory('toys'),
                subcategory: 'Puzzles',
                image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop'],
                stock: 60,
                aiTags: ['toys', 'puzzle', '3d puzzle', 'crystal puzzle', 'brain teaser', 'hobby'],
                specifications: [
                    { key: 'Pieces', value: '150 interlocking parts' },
                    { key: 'Assembled Dimensions', value: '6 x 6 x 8 inches' },
                    { key: 'Age Level', value: '12 years and up' }
                ],
                ratings: { average: 4.4, count: 28 },
                isFeatured: true
            },
            {
                name: 'Terraforming Alpha Board Game',
                title: 'Terraforming Alpha Board Game',
                brand: 'GamerGrotto',
                description: 'A strategic board game of resource management, technology progression, and planetary colonization for 2 to 5 players.',
                bulletPoints: [
                    '【STRATEGIC RESOURCE GAME】 Build cities, raise temperatures, and create oceans in a race to claim Mars-like planet Alpha.',
                    '【200+ UNIQUE CARDS】 Enormous variety of project, event, and resource cards ensure no two playthroughs are the same.',
                    '【PREMIUM PIECES】 Includes double-sided gameboard, 5 player mats, 200 metallic resource cubes, and 80 cardboard tiles.'
                ],
                price: 49.99,
                category: getCategory('toys'),
                subcategory: 'Board Games',
                image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop',
                images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop'],
                stock: 40,
                aiTags: ['toys', 'board game', 'tabletop game', 'strategy game', 'mars colonization', 'gamer gift'],
                specifications: [
                    { key: 'Players', value: '2-5 players' },
                    { key: 'Play Time', value: '90-120 minutes' },
                    { key: 'Recommended Age', value: '14+' }
                ],
                ratings: { average: 4.9, count: 112 },
                isFeatured: false
            }
        ];

        const bookProducts = [
            // ==================== TRADING & FINANCE ====================
            {
                name: "Trading in the Zone",
                title: "Trading in the Zone",
                brand: "Prentice Hall Press",
                description: "Douglas uncovers the underlying reasons for lack of consistency and helps traders overcome the mental habits that cost them money.",
                bulletPoints: [
                    "【MENTAL DISCIPLINE】 Learn how to think like a professional trader and accept risk.",
                    "【PROBABILISTIC THINKING】 Understand how to view market movements through the lens of probabilities.",
                    "【OVERCOME FEAR】 Eliminate the psychological barriers that lead to costly mistakes."
                ],
                price: 24.99,
                category: getCategory('books'),
                subcategory: "Trading",
                image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"],
                stock: 85,
                aiTags: ["books", "trading", "finance", "investing", "psychology", "bestseller"],
                specifications: [
                    { key: "Format", value: "Hardcover, 224 pages" },
                    { key: "Publisher", value: "Prentice Hall Press" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 184 },
                isFeatured: true
            },
            {
                name: "The Intelligent Investor",
                title: "The Intelligent Investor",
                brand: "Harper Business",
                description: "The classic text on value investing, shielding investors from substantial error and teaching them to develop long-term strategies.",
                bulletPoints: [
                    "【VALUE INVESTING】 Learn how to buy stocks trading far below their intrinsic value.",
                    "【MARGIN OF SAFETY】 Protect your portfolio from significant downside risk.",
                    "【MR. MARKET】 Understand market emotions and exploit fluctuations."
                ],
                price: 22.50,
                category: getCategory('books'),
                subcategory: "Trading",
                image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["books", "trading", "finance", "investing", "value investing", "classic"],
                specifications: [
                    { key: "Format", value: "Paperback, 640 pages" },
                    { key: "Publisher", value: "Harper Business" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 320 },
                isFeatured: true
            },
            {
                name: "Technical Analysis of the Financial Markets",
                title: "Technical Analysis of the Financial Markets",
                brand: "New York Institute of Finance",
                description: "The comprehensive guide to technical analysis methods and applications in the futures and stock markets.",
                bulletPoints: [
                    "【CHARTING TOOLS】 Master patterns, indicators, and systems to analyze trends.",
                    "【ELLIOTT WAVE】 Learn advanced methodologies including Fibonacci retracements.",
                    "【PRACTICAL GUIDE】 Step-by-step application for short-term and swing traders."
                ],
                price: 49.99,
                category: getCategory('books'),
                subcategory: "Trading",
                image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80"],
                stock: 60,
                aiTags: ["books", "trading", "technical analysis", "charts", "finance", "hot"],
                specifications: [
                    { key: "Format", value: "Hardcover, 576 pages" },
                    { key: "Publisher", value: "New York Institute of Finance" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 98 },
                isFeatured: false
            },
            {
                name: "A Random Walk Down Wall Street",
                title: "A Random Walk Down Wall Street",
                brand: "W. W. Norton & Company",
                description: "A classic guide to investing, featuring asset allocation models and the efficient market hypothesis.",
                bulletPoints: [
                    "【INDEXING ADVANTAGE】 Discover why index funds consistently outperform managed mutual funds.",
                    "【ASSET ALLOCATION】 Master portfolio rebalancing strategies for different life stages.",
                    "【MARKET BUBBLES】 Learn the history of speculative bubbles and how to spot them."
                ],
                price: 18.99,
                category: getCategory('books'),
                subcategory: "Trading",
                image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"],
                stock: 75,
                aiTags: ["books", "trading", "finance", "investing", "economics", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 464 pages" },
                    { key: "Publisher", value: "W. W. Norton & Company" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 142 },
                isFeatured: false
            },
            {
                name: "Rich Dad Poor Dad",
                title: "Rich Dad Poor Dad",
                brand: "Plata Publishing",
                description: "The number one personal finance book of all time, sharing lessons on financial literacy and building wealth.",
                bulletPoints: [
                    "【ASSETS VS LIABILITIES】 Master the core difference between what makes you rich and what drains your wallet.",
                    "【FINANCIAL FREEDOM】 Shift from working for an income to having investments generate cash flow.",
                    "【INVESTING MINDSET】 Learn how to spot opportunities and take calculated risks."
                ],
                price: 16.99,
                category: getCategory('books'),
                subcategory: "Trading",
                image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"],
                stock: 220,
                aiTags: ["books", "finance", "personal finance", "mindset", "investing", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 336 pages" },
                    { key: "Publisher", value: "Plata Publishing" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 580 },
                isFeatured: true
            },

            // ==================== MARKETING & BRANDING ====================
            {
                name: "Principles of Marketing",
                title: "Principles of Marketing",
                brand: "Pearson",
                description: "A comprehensive introduction to modern marketing theory, blending customer value and digital strategy.",
                bulletPoints: [
                    "【MARKETING SYSTEMS】 Learn core concepts of branding, positioning, and segmentation.",
                    "【DIGITAL LANDSCAPE】 Master SEO, social media, and data-driven customer acquisition.",
                    "【CUSTOMER VALUE】 Learn how to create and capture customer lifetime value."
                ],
                price: 65.00,
                category: getCategory('books'),
                subcategory: "Marketing",
                image: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=800&q=80"],
                stock: 40,
                aiTags: ["books", "marketing", "branding", "business", "education", "essential"],
                specifications: [
                    { key: "Format", value: "Hardcover, 736 pages" },
                    { key: "Publisher", value: "Pearson" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 65 },
                isFeatured: false
            },
            {
                name: "Building a StoryBrand",
                title: "Building a StoryBrand",
                brand: "HarperCollins Leadership",
                description: "Donald Miller's framework to clarify your message so customers will listen, using the elements of storytelling.",
                bulletPoints: [
                    "【7 STORY POINTS】 Clarify your brand message using a proven narrative framework.",
                    "【CUSTOMER IS HERO】 Stop talking about yourself; make your customer the central character.",
                    "【CLEAR CALL TO ACTION】 Structure your website to drive conversions and minimize friction."
                ],
                price: 19.99,
                category: getCategory('books'),
                subcategory: "Marketing",
                image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["books", "marketing", "branding", "copywriting", "business", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 240 pages" },
                    { key: "Publisher", value: "HarperCollins Leadership" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 215 },
                isFeatured: true
            },
            {
                name: "Influence: The Psychology of Persuasion",
                title: "Influence: The Psychology of Persuasion",
                brand: "Harper Business",
                description: "The classic study of persuasion, explaining the six psychological principles that drive human decision-making.",
                bulletPoints: [
                    "【6 KEY PRINCIPLES】 Master Reciprocation, Commitment, Social Proof, Liking, Authority, and Scarcity.",
                    "【ETHICAL PERSUASION】 Learn how to apply influence principles honestly and effectively.",
                    "【DEFENSIVE THINKING】 Shield yourself from manipulative sales and marketing tactics."
                ],
                price: 21.50,
                category: getCategory('books'),
                subcategory: "Marketing",
                image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["books", "marketing", "psychology", "persuasion", "negotiation", "classic"],
                specifications: [
                    { key: "Format", value: "Paperback, 336 pages" },
                    { key: "Publisher", value: "Harper Business" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 280 },
                isFeatured: true
            },
            {
                name: "Contagious: Why Things Catch On",
                title: "Contagious: Why Things Catch On",
                brand: "Simon & Schuster",
                description: "Jonah Berger explores why certain products, ideas, and behaviors become viral and sweep through populations.",
                bulletPoints: [
                    "【STEPPS FRAMEWORK】 Structure virality through Social currency, Triggers, Emotion, Public, Practical value, and Stories.",
                    "【WORD OF MOUTH】 Turn your user base into active marketers of your product.",
                    "【EMOTIONAL RESONANCE】 Understand the science behind what makes us share content."
                ],
                price: 17.80,
                category: getCategory('books'),
                subcategory: "Marketing",
                image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"],
                stock: 80,
                aiTags: ["books", "marketing", "virality", "business", "psychology", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 256 pages" },
                    { key: "Publisher", value: "Simon & Schuster" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 112 },
                isFeatured: false
            },
            {
                name: "Digital Marketing Strategy Blueprint",
                title: "Digital Marketing Strategy Blueprint",
                brand: "Kogan Page",
                description: "A modern playbook detailing how to execute integrated digital campaigns that achieve measurable corporate growth.",
                bulletPoints: [
                    "【CAMPAIGN METRICS】 Establish reliable benchmarks to track ROI and acquisition costs.",
                    "【MULTICHANNEL DESIGN】 Align social media, email marketing, and content marketing calendars.",
                    "【SEO BEST PRACTICES】 Optimize web pages to rank high on search engine result pages."
                ],
                price: 29.99,
                category: getCategory('books'),
                subcategory: "Marketing",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"],
                stock: 65,
                aiTags: ["books", "marketing", "digital marketing", "strategy", "seo", "new"],
                specifications: [
                    { key: "Format", value: "Paperback, 320 pages" },
                    { key: "Publisher", value: "Kogan Page" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.5, count: 35 },
                isFeatured: false
            },

            // ==================== DISCIPLINE & MINDSET ====================
            {
                name: "Atomic Habits",
                title: "Atomic Habits",
                brand: "Avery",
                description: "James Clear shares a practical framework to build good habits, break bad ones, and achieve 1% progress daily.",
                bulletPoints: [
                    "【4 LAWS OF HABIT】 Make cues obvious, attractive, easy, and satisfying.",
                    "【IDENTITY BASED】 Build long-term routines by focusing on the identity you wish to cultivate.",
                    "【COMPOUND EFFECTS】 Discover how tiny daily choices accumulate into massive outcomes."
                ],
                price: 18.00,
                category: getCategory('books'),
                subcategory: "Discipline",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
                stock: 250,
                aiTags: ["books", "habits", "discipline", "self-improvement", "productivity", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 320 pages" },
                    { key: "Publisher", value: "Avery" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 5.0, count: 950 },
                isFeatured: true
            },
            {
                name: "Deep Work: Rules for Focused Success",
                title: "Deep Work: Rules for Focused Success",
                brand: "Grand Central Publishing",
                description: "Cal Newport explains how to cultivate deep focus and produce high-quality work in a world full of digital distractions.",
                bulletPoints: [
                    "【COGNITIVE FOCUS】 Train your brain to work intensely without checking notifications.",
                    "【SHALLOW VS DEEP】 Minimize admin overhead and maximize high-value creative output.",
                    "【DEEP RITUALS】 Build specialized routines to enter deep focus states quickly."
                ],
                price: 20.00,
                category: getCategory('books'),
                subcategory: "Discipline",
                image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["books", "productivity", "deep work", "discipline", "focus", "must read"],
                specifications: [
                    { key: "Format", value: "Paperback, 304 pages" },
                    { key: "Publisher", value: "Grand Central Publishing" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 410 },
                isFeatured: true
            },
            {
                name: "The 5 AM Club",
                title: "The 5 AM Club",
                brand: "HarperCollins",
                description: "Robin Sharma reveals the 20/20/20 morning routine to help you own your morning and elevate your performance.",
                bulletPoints: [
                    "【OWN YOUR MORNING】 Master the 20/20/20 routine split between movement, reflection, and growth.",
                    "【ELITE WILLPOWER】 Develop structural habits that support emotional and physical wellness.",
                    "【PRODUCTIVITY BOOST】 Start your workday before the world wakes up to minimize distractions."
                ],
                price: 15.99,
                category: getCategory('books'),
                subcategory: "Discipline",
                image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["books", "discipline", "habits", "morning routine", "self-help", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 336 pages" },
                    { key: "Publisher", value: "HarperCollins" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.4, count: 180 },
                isFeatured: false
            },
            {
                name: "Can't Hurt Me: Master Your Mind",
                title: "Can't Hurt Me: Master Your Mind",
                brand: "Lioncrest Publishing",
                description: "David Goggins shares his journey of overcoming extreme trauma through self-discipline and mental toughness.",
                bulletPoints: [
                    "【40% RULE】 Understand how to push past your brain's perceived safety limits.",
                    "【ACCOUNTABILITY MIRROR】 Face your flaws directly and design daily challenges.",
                    "【CALLOUS YOUR MIND】 Build resilience by actively choosing the path of most resistance."
                ],
                price: 22.00,
                category: getCategory('books'),
                subcategory: "Discipline",
                image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"],
                stock: 160,
                aiTags: ["books", "discipline", "mindset", "goggins", "memoir", "hot"],
                specifications: [
                    { key: "Format", value: "Paperback, 364 pages" },
                    { key: "Publisher", value: "Lioncrest Publishing" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 520 },
                isFeatured: true
            },
            {
                name: "Make Your Bed",
                title: "Make Your Bed",
                brand: "Grand Central Publishing",
                description: "Admiral William H. McRaven outlines ten simple lessons he learned in Navy SEAL training to help you change your life.",
                bulletPoints: [
                    "【START STRONG】 Learn why completing one task early sets a tone of success for the day.",
                    "【COLLABORATION】 Realize the importance of finding partners to help you paddle.",
                    "【NEVER GIVE UP】 Develop a stubborn resolve to stand up under the worst conditions."
                ],
                price: 12.50,
                category: getCategory('books'),
                subcategory: "Discipline",
                image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["books", "discipline", "military", "inspiration", "principles", "inspirational"],
                specifications: [
                    { key: "Format", value: "Hardcover, 130 pages" },
                    { key: "Publisher", value: "Grand Central Publishing" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 95 },
                isFeatured: false
            },

            // ==================== ATTITUDE & PERSONALITY ====================
            {
                name: "The Power of Positive Thinking",
                title: "The Power of Positive Thinking",
                brand: "Fawcett",
                description: "A classic guide to developing a mindset of optimism and faith to build satisfying personal and professional relationships.",
                bulletPoints: [
                    "【BANISH DOUBT】 Learn how to replace negative self-talk with confident thoughts.",
                    "【ENERGY MANAGEMENT】 Maximize your stamina by cultivating mental calm.",
                    "【HEALTH & FAITH】 Apply basic psychological tools to reduce anxiety and stress."
                ],
                price: 14.99,
                category: getCategory('books'),
                subcategory: "Attitude",
                image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"],
                stock: 100,
                aiTags: ["books", "attitude", "positivity", "psychology", "self-help", "classic"],
                specifications: [
                    { key: "Format", value: "Paperback, 240 pages" },
                    { key: "Publisher", value: "Fawcett" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 180 },
                isFeatured: true
            },
            {
                name: "How to Win Friends and Influence People",
                title: "How to Win Friends and Influence People",
                brand: "Simon & Schuster",
                description: "Dale Carnegie's rock-solid, time-tested advice on how to build relationships and influence people in business and life.",
                bulletPoints: [
                    "【SOCIAL INTELLIGENCE】 Master the core methods of handling people without giving offense.",
                    "【BUILD CHARISMA】 Learn how to make people like you instantly through basic dialogue habits.",
                    "【LEADERSHIP SKILLS】 Learn how to change people's behavior without raising resentment."
                ],
                price: 16.50,
                category: getCategory('books'),
                subcategory: "Attitude",
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"],
                stock: 180,
                aiTags: ["books", "attitude", "communication", "leadership", "psychology", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 288 pages" },
                    { key: "Publisher", value: "Simon & Schuster" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 680 },
                isFeatured: true
            },
            {
                name: "Mindset: The New Psychology of Success",
                title: "Mindset: The New Psychology of Success",
                brand: "Ballantine Books",
                description: "Carol S. Dweck explains how our beliefs about our abilities dictate our accomplishments and how a growth mindset can unleash potential.",
                bulletPoints: [
                    "【GROWTH VS FIXED】 Shift from proving your intelligence to actively improving it.",
                    "【RESILIENCE】 Learn why embracing setbacks leads to deeper skill acquisition.",
                    "【RELATIONSHIPS】 Apply growth principles to coaching, parenting, and leadership."
                ],
                price: 17.99,
                category: getCategory('books'),
                subcategory: "Attitude",
                image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["books", "attitude", "mindset", "dweck", "psychology", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 320 pages" },
                    { key: "Publisher", value: "Ballantine Books" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 240 },
                isFeatured: false
            },
            {
                name: "The Subtle Art of Not Giving a F*ck",
                title: "The Subtle Art of Not Giving a F*ck",
                brand: "HarperOne",
                description: "A refreshing self-help guide that tells us to accept our flaws and choose the problems we care about, rather than seeking empty positivity.",
                bulletPoints: [
                    "【CHOOSE YOUR STRUGGLE】 Accept that pain is inevitable; pick what you want to suffer for.",
                    "【DEFEND YOUR TIME】 Stop caring about trivial opinions; preserve focus for what matters.",
                    "【HUMILITY】 Banish entitlement and accept responsibility for your emotional responses."
                ],
                price: 18.99,
                category: getCategory('books'),
                subcategory: "Attitude",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
                stock: 210,
                aiTags: ["books", "attitude", "philosophy", "self-improvement", "humor", "hot"],
                specifications: [
                    { key: "Format", value: "Paperback, 224 pages" },
                    { key: "Publisher", value: "HarperOne" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 480 },
                isFeatured: true
            },
            {
                name: "Ego is the Enemy",
                title: "Ego is the Enemy",
                brand: "Portfolio",
                description: "Ryan Holiday explores how ego sabatoges our progress, hinders learning, and ruins relationships, presenting stoic tools to combat it.",
                bulletPoints: [
                    "【MANAGE INTENSITY】 Learn how ego distorts logic during career ascents and descents.",
                    "【SILENT MASTERY】 Focus on the actual doing rather than public recognition.",
                    "【STOIC CALM】 Cultivate objective awareness to survive professional failures."
                ],
                price: 19.00,
                category: getCategory('books'),
                subcategory: "Attitude",
                image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["books", "stoicism", "attitude", "holiday", "self-improvement", "recommended"],
                specifications: [
                    { key: "Format", value: "Hardcover, 226 pages" },
                    { key: "Publisher", value: "Portfolio" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 165 },
                isFeatured: false
            },

            // ==================== COMPUTER SCIENCE & SOFTWARE ====================
            {
                name: "Introduction to Algorithms (CLRS)",
                title: "Introduction to Algorithms (CLRS)",
                brand: "MIT Press",
                description: "The classic, comprehensive manual covering all algorithms and data structures, standard in top computer science curricula.",
                bulletPoints: [
                    "【ALGORITHM THEORY】 Rigorous analysis of sorting, graphs, and dynamic programming.",
                    "【PSEUDOCODE FOCUS】 Implementation guides written in language-agnostic frameworks.",
                    "【BIG O COMPLEXITY】 Mathematical proofs establishing runtime and space bounds."
                ],
                price: 85.00,
                category: getCategory('books'),
                subcategory: "Computer Science",
                image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"],
                stock: 45,
                aiTags: ["books", "computer science", "algorithms", "data structures", "academic", "standard"],
                specifications: [
                    { key: "Format", value: "Hardcover, 1312 pages" },
                    { key: "Publisher", value: "MIT Press" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 120 },
                isFeatured: true
            },
            {
                name: "Clean Code: A Handbook of Agile Software Craftsmanship",
                title: "Clean Code: A Handbook of Agile Software Craftsmanship",
                brand: "Prentice Hall",
                description: "Robert C. Martin explains how to write professional code, refactor legacy structures, and establish clean unit testing habits.",
                bulletPoints: [
                    "【DESIGN PRINCIPLES】 Learn variable naming, function decomposition, and object cohesion.",
                    "【TEST DRIVEN DEVELOPMENT】 Master clean test structures that support rapid features.",
                    "【REFACTORING SKILLS】 Safely restructure code without altering behavioral inputs."
                ],
                price: 42.50,
                category: getCategory('books'),
                subcategory: "Computer Science",
                image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"],
                stock: 150,
                aiTags: ["books", "programming", "software engineering", "clean code", "refactoring", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 464 pages" },
                    { key: "Publisher", value: "Prentice Hall" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 390 },
                isFeatured: true
            },
            {
                name: "Designing Data-Intensive Applications",
                title: "Designing Data-Intensive Applications",
                brand: "O'Reilly Media",
                description: "The definitive guide to the concepts, architectures, and trade-offs of building scalable, reliable, and maintainable backend systems.",
                bulletPoints: [
                    "【DATABASE DESIGN】 Master storage engines, relational schemas, NoSQL, and indexes.",
                    "【DISTRIBUTED ARCHITECTURES】 Compare partition strategies, replication models, and consensus.",
                    "【DATA PIPELINES】 Master batch processing and stream analysis patterns."
                ],
                price: 49.99,
                category: getCategory('books'),
                subcategory: "Computer Science",
                image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["books", "system design", "distributed systems", "databases", "backend", "top rated"],
                specifications: [
                    { key: "Format", value: "Paperback, 616 pages" },
                    { key: "Publisher", value: "O'Reilly Media" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 5.0, count: 480 },
                isFeatured: true
            },
            {
                name: "Cracking the Coding Interview",
                title: "Cracking the Coding Interview",
                brand: "CareerCup",
                description: "189 programming questions and solutions, plus walkthroughs on how to approach data structures, algorithms, and system design interviews.",
                bulletPoints: [
                    "【189 ALGORITHM QUESTIONS】 Covers trees, graphs, strings, DP, and array logic.",
                    "【INTERVIEW WALKTHROUGHS】 Step-by-step techniques to optimize time and space complexity.",
                    "【BEHAVIORAL CHECKLISTS】 Master communications to fit into elite engineering cultures."
                ],
                price: 38.00,
                category: getCategory('books'),
                subcategory: "Computer Science",
                image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["books", "coding interview", "algorithms", "software engineering", "leetcode", "must have"],
                specifications: [
                    { key: "Format", value: "Paperback, 696 pages" },
                    { key: "Publisher", value: "CareerCup" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 310 },
                isFeatured: true
            },
            {
                name: "The Pragmatic Programmer",
                title: "The Pragmatic Programmer",
                brand: "Addison-Wesley",
                description: "The classic software development playbook covering coding best practices, career development, and code maintainability.",
                bulletPoints: [
                    "【MODULARITY】 Learn structural DRY (Don't Repeat Yourself) design concepts.",
                    "【CAREER DEVELOPMENT】 Cultivate a strong personal engineering reputation.",
                    "【DEFENSIVE PATTERNS】 Master exceptions, contract-based logic, and runtime debugging."
                ],
                price: 45.00,
                category: getCategory('books'),
                subcategory: "Computer Science",
                image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"],
                stock: 95,
                aiTags: ["books", "software engineering", "best practices", "programming", "classic"],
                specifications: [
                    { key: "Format", value: "Hardcover, 352 pages" },
                    { key: "Publisher", value: "Addison-Wesley" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 190 },
                isFeatured: true
            },

            // ==================== MATHEMATICS ====================
            {
                name: "Linear Algebra Done Right",
                title: "Linear Algebra Done Right",
                brand: "Springer",
                description: "A classic undergraduate math textbook focusing on linear operators on finite-dimensional vector spaces.",
                bulletPoints: [
                    "【GEOMETRIC ANALYSIS】 Develop strong intuition for spaces and transformations.",
                    "【OPERATOR ORIENTED】 Focus on eigenvalues and inner products without premature determinants.",
                    "【RIGOROUS PROOFS】 Master mathematical proof-writing standards in abstract algebra."
                ],
                price: 52.00,
                category: getCategory('books'),
                subcategory: "Mathematics",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"],
                stock: 50,
                aiTags: ["books", "mathematics", "linear algebra", "matrices", "academic"],
                specifications: [
                    { key: "Format", value: "Hardcover, 340 pages" },
                    { key: "Publisher", value: "Springer" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 68 },
                isFeatured: false
            },
            {
                name: "Calculus Made Easy",
                title: "Calculus Made Easy",
                brand: "Macmillan",
                description: "The classic introduction to calculus, demystifying derivatives and integrals in simple, conversational language.",
                bulletPoints: [
                    "【SIMPLIFIED MATH】 Demystifies complex integration and derivative notations.",
                    "【FUN EXAMPLES】 Solve basic physics and rate-of-change challenges with ease.",
                    "【PERFECT FOR SELF-STUDY】 Ideal primer for students entering engineering or physics."
                ],
                price: 18.50,
                category: getCategory('books'),
                subcategory: "Mathematics",
                image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["books", "mathematics", "calculus", "self-study", "classic", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 256 pages" },
                    { key: "Publisher", value: "Macmillan" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 110 },
                isFeatured: false
            },
            {
                name: "The Art of Problem Solving",
                title: "The Art of Problem Solving",
                brand: "AoPS",
                description: "A comprehensive guide designed to prepare students for mathematical olympiads and competitive exams.",
                bulletPoints: [
                    "【OLYMPIAD METHODS】 Learn tricks for solving AMC, AIME, and high school contests.",
                    "【CREATIVE ALGEBRA】 Master factorization, coordinate geometry, and number theory.",
                    "【DEEP ANALYSIS】 Tackle problems that require combining multiple abstract concepts."
                ],
                price: 34.00,
                category: getCategory('books'),
                subcategory: "Mathematics",
                image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80"],
                stock: 60,
                aiTags: ["books", "mathematics", "problem solving", "olympiad", "advanced"],
                specifications: [
                    { key: "Format", value: "Paperback, 312 pages" },
                    { key: "Publisher", value: "AoPS" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 75 },
                isFeatured: true
            },
            {
                name: "Concrete Mathematics: A Foundation for CS",
                title: "Concrete Mathematics: A Foundation for CS",
                brand: "Addison-Wesley",
                description: "Donald Knuth and co-authors bridge the gap between abstract math and real-world algorithm complexity analysis.",
                bulletPoints: [
                    "【CS MATHEMATICS】 Master combinatorics, summation notation, and generating functions.",
                    "【KNUTH ALGORITHMS】 Dive into the math underpinnings of sorting and tree parsing.",
                    "【ACADEMIC STANDARD】 Standard textbook for graduate computer science engineers."
                ],
                price: 68.00,
                category: getCategory('books'),
                subcategory: "Mathematics",
                image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80"],
                stock: 40,
                aiTags: ["books", "mathematics", "computer science", "knuth", "combinatorics", "standard"],
                specifications: [
                    { key: "Format", value: "Hardcover, 650 pages" },
                    { key: "Publisher", value: "Addison-Wesley" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 58 },
                isFeatured: false
            },
            {
                name: "How Not to Be Wrong: The Power of Mathematical Thinking",
                title: "How Not to Be Wrong: The Power of Mathematical Thinking",
                brand: "Penguin Press",
                description: "Jordan Ellenberg shows how mathematical thinking is a critical tool to navigate decisions in daily life, politics, and science.",
                bulletPoints: [
                    "【REAL STATISTICS】 Understand how data modeling and probability shape election results.",
                    "【LOGIC LOOPS】 Banish typical misconceptions about regressions and correlations.",
                    "【ACCESSIBLE PROSE】 Highly engaging histories of how mathematicians shaped modern warfare."
                ],
                price: 21.00,
                category: getCategory('books'),
                subcategory: "Mathematics",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["books", "mathematics", "statistics", "logic", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 480 pages" },
                    { key: "Publisher", value: "Penguin Press" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 154 },
                isFeatured: true
            },

            // ==================== SCIENCE & QUANTUM PHYSICS ====================
            {
                name: "A Brief History of Time",
                title: "A Brief History of Time",
                brand: "Bantam Books",
                description: "Stephen Hawking's definitive guide to modern cosmology, explaining black holes, space-time, and physics in clear prose.",
                bulletPoints: [
                    "【COSMOLOGY PRIMER】 Grasp gravity, space-time curvatures, and theoretical physics.",
                    "【NO JARGON】 Designed for laymen, removing intense calculations from the equations.",
                    "【UNIVERSAL TOPICS】 Explore the ultimate origin and eventual heat death of reality."
                ],
                price: 18.99,
                category: getCategory('books'),
                subcategory: "Science",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"],
                stock: 150,
                aiTags: ["books", "science", "physics", "cosmology", "hawking", "classic"],
                specifications: [
                    { key: "Format", value: "Paperback, 224 pages" },
                    { key: "Publisher", value: "Bantam Books" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 320 },
                isFeatured: true
            },
            {
                name: "Principles of Quantum Mechanics",
                title: "Principles of Quantum Mechanics",
                brand: "Springer",
                description: "R. Shankar provides a rigorous mathematical introduction to quantum mechanics starting from first principles.",
                bulletPoints: [
                    "【VECTOR MATHEMATICS】 Master Hilbert spaces, bra-ket notation, and eigenbasis transformations.",
                    "【DYNAMICAL SYSTEMS】 Understand operators, Hamiltonian states, and the Schrodinger equation.",
                    "【SCATTERING & DYNAMICS】 Solve standard potential well and scattering math problems."
                ],
                price: 74.50,
                category: getCategory('books'),
                subcategory: "Science",
                image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80"],
                stock: 35,
                aiTags: ["books", "science", "physics", "quantum mechanics", "academic", "advanced"],
                specifications: [
                    { key: "Format", value: "Hardcover, 694 pages" },
                    { key: "Publisher", value: "Springer" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 48 },
                isFeatured: false
            },
            {
                name: "Sapiens: A Brief History of Humankind",
                title: "Sapiens: A Brief History of Humankind",
                brand: "Harper",
                description: "Yuval Noah Harari's groundbreaking history of humanity's cognitive, agricultural, and scientific revolutions.",
                bulletPoints: [
                    "【COGNITIVE SHIFT】 Learn how shared imagination (money, states, myths) enabled mass cooperation.",
                    "【EVOLUTION HISTORY】 Trace the path of Homo Sapiens compared to other extinct human species.",
                    "【SCIENTIFIC EXPANSION】 Understand the nexus of capitalism, imperialism, and science in history."
                ],
                price: 22.99,
                category: getCategory('books'),
                subcategory: "Science",
                image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80"],
                stock: 200,
                aiTags: ["books", "science", "history", "anthropology", "evolution", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 512 pages" },
                    { key: "Publisher", value: "Harper" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 640 },
                isFeatured: true
            },
            {
                name: "The Feynman Lectures on Physics",
                title: "The Feynman Lectures on Physics",
                brand: "Basic Books",
                description: "The complete three-volume boxed set of Richard Feynman's iconic lectures, an essential resource for physics students.",
                bulletPoints: [
                    "【THREE VOLUMES】 Covers mechanics, thermodynamics, electromagnetism, and quantum logic.",
                    "【PHYSICAL ANALOGIES】 Master Feynman's unique way of explaining complex theories intuitively.",
                    "【COLLECTOR SPECIFICATIONS】 Premium hardcover box set with corrected diagrams."
                ],
                price: 95.00,
                category: getCategory('books'),
                subcategory: "Science",
                image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"],
                stock: 25,
                aiTags: ["books", "science", "physics", "feynman", "textbook", "masterpiece"],
                specifications: [
                    { key: "Format", value: "Hardcover Box Set, 1552 pages" },
                    { key: "Publisher", value: "Basic Books" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 5.0, count: 180 },
                isFeatured: true
            },
            {
                name: "Astrophysics for People in a Hurry",
                title: "Astrophysics for People in a Hurry",
                brand: "W. W. Norton & Company",
                description: "Neil deGrasse Tyson explains the cosmos, quantum mechanics, and the search for life in brief, witty chapters.",
                bulletPoints: [
                    "【BRIEF CHAPTERS】 Understand black holes, gravity, and cosmology on your daily commute.",
                    "【TYSON'S WIT】 Engaging writing style that makes complex physics fun and easy.",
                    "【COSMIC SCALE】 Gain perspective on the timeline and geometry of the universe."
                ],
                price: 15.99,
                category: getCategory('books'),
                subcategory: "Science",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["books", "science", "astrophysics", "astronomy", "tyson", "popular"],
                specifications: [
                    { key: "Format", value: "Hardcover, 224 pages" },
                    { key: "Publisher", value: "W. W. Norton & Company" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 210 },
                isFeatured: false
            },

            // ==================== EDUCATION & LEARNING TECHNIQUES ====================
            {
                name: "Make It Stick: The Science of Successful Learning",
                title: "Make It Stick: The Science of Successful Learning",
                brand: "Harvard University Press",
                description: "Authors explain how memory is constructed and how cognitive psychology findings can make learning more efficient.",
                bulletPoints: [
                    "【ACTIVE RETRIEVAL】 Learn why self-testing is vastly superior to passive highlighting.",
                    "【SPACED REVIEW】 Interleave different subjects to build robust neural networks.",
                    "【DESIRABLE DIFFICULTIES】 Understand why struggle and mistakes accelerate long-term memory."
                ],
                price: 23.00,
                category: getCategory('books'),
                subcategory: "Education",
                image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["books", "education", "learning", "psychology", "studying", "must read"],
                specifications: [
                    { key: "Format", value: "Hardcover, 336 pages" },
                    { key: "Publisher", value: "Harvard University Press" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 195 },
                isFeatured: true
            },
            {
                name: "A Mind for Numbers: How to Excel at Math & Science",
                title: "A Mind for Numbers: How to Excel at Math & Science",
                brand: "TarcherPerigee",
                description: "Barbara Oakley shares learning techniques she used to master math and science concepts in adulthood.",
                bulletPoints: [
                    "【FOCUSED VS DIFFUSE】 Train your brain to alternate modes for creative problem solving.",
                    "【CONCEPT CHUNKING】 Build small, automated mental steps to solve equations easily.",
                    "【POMODORO ROUTINES】 Conquer procrastination by focusing on process over product."
                ],
                price: 19.50,
                category: getCategory('books'),
                subcategory: "Education",
                image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["books", "education", "learning", "math", "pomodoro", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 320 pages" },
                    { key: "Publisher", value: "TarcherPerigee" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 140 },
                isFeatured: false
            },
            {
                name: "How We Learn: The Surprising Truth About When and Where",
                title: "How We Learn: The Surprising Truth About When and Where",
                brand: "Random House",
                description: "Benedict Carey explores the biological mechanisms of memory, explaining why cramming fails and how context variation boosts retention.",
                bulletPoints: [
                    "【ENVIRONMENT SWITCH】 Learn why studying in varying rooms increases recall speed.",
                    "【SLEEP EFFECT】 Discover how different stages of sleep catalog facts and physical skills.",
                    "【FORGETTING GAIN】 Understand why structured forgetting acts as a filter for deep learning."
                ],
                price: 17.00,
                category: getCategory('books'),
                subcategory: "Education",
                image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"],
                stock: 95,
                aiTags: ["books", "education", "learning", "memory", "neuroscience", "recommended"],
                specifications: [
                    { key: "Format", value: "Paperback, 272 pages" },
                    { key: "Publisher", value: "Random House" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.5, count: 78 },
                isFeatured: false
            },
            {
                name: "Ultralearning: Master Hard Skills Fast",
                title: "Ultralearning: Master Hard Skills Fast",
                brand: "Harper Business",
                description: "Scott Young outlines nine principles to create intense, self-directed learning projects to acquire skills quickly.",
                bulletPoints: [
                    "【DIRECT PRACTICE】 Cut out intermediate books and start doing the actual skill.",
                    "【METALEARNING MAPS】 Learn how to categorize the facts, concepts, and procedures of any topic.",
                    "【DRILL DEFICIENCIES】 Isolate your worst weaknesses and target them intensively."
                ],
                price: 21.99,
                category: getCategory('books'),
                subcategory: "Education",
                image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["books", "education", "learning", "ultralearning", "productivity", "hot"],
                specifications: [
                    { key: "Format", value: "Paperback, 304 pages" },
                    { key: "Publisher", value: "Harper Business" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 185 },
                isFeatured: true
            },
            {
                name: "The Art of Learning: An Inner Journey to Optimal Performance",
                title: "The Art of Learning: An Inner Journey to Optimal Performance",
                brand: "Free Press",
                description: "Josh Waitzkin details his strategies to reach elite performance levels in chess and martial arts.",
                bulletPoints: [
                    "【INVEST IN LOSS】 Accept quick defeats that expose structural bugs in your strategies.",
                    "【MICRO CIRCLES】 Deconstruct complex motions and automate them at tiny scales.",
                    "【FOCUS TRIGGERS】 Build physiological anchors to enter deep states on command."
                ],
                price: 18.00,
                category: getCategory('books'),
                subcategory: "Education",
                image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"],
                stock: 85,
                aiTags: ["books", "education", "performance", "learning", "psychology", "classic"],
                specifications: [
                    { key: "Format", value: "Paperback, 288 pages" },
                    { key: "Publisher", value: "Free Press" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 110 },
                isFeatured: true
            },

            // ==================== GENERAL KNOWLEDGE & WORLD HISTORY ====================
            {
                name: "Guns, Germs, and Steel",
                title: "Guns, Germs, and Steel",
                brand: "W. W. Norton & Company",
                description: "Jared Diamond explores how environmental and geographic factors dictated the global rise of industrial civilizations.",
                bulletPoints: [
                    "【GEOGRAPHIC ROOTS】 Learn how grain varieties and draft animals favored specific latitudes.",
                    "【PATHOGEN HISTORY】 Understand how animal domestication bred immunity to major diseases.",
                    "【COLONIZATION STAGES】 Review how steel weaponry and print media accelerated conquests."
                ],
                price: 21.00,
                category: getCategory('books'),
                subcategory: "General Knowledge",
                image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["books", "history", "geography", "anthropology", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 528 pages" },
                    { key: "Publisher", value: "W. W. Norton & Company" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 290 },
                isFeatured: true
            },
            {
                name: "The Concise Encyclopedia of World History",
                title: "The Concise Encyclopedia of World History",
                brand: "Oxford University Press",
                description: "A comprehensive reference detailing major battles, dynasties, political movements, and cultural shifts from ancient times to the modern age.",
                bulletPoints: [
                    "【ANCIENT TO DIGITAL】 Full coverage of Greek, Roman, Chinese, and Mesoamerican empires.",
                    "【MAPS & TIMELINES】 Beautiful visual charts tracking migration and trade routes.",
                    "【REFERENCE TOOL】 Ideal resource for students, history buffs, and trivia enthusiasts."
                ],
                price: 35.00,
                category: getCategory('books'),
                subcategory: "General Knowledge",
                image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80"],
                stock: 75,
                aiTags: ["books", "history", "encyclopedia", "reference", "world history"],
                specifications: [
                    { key: "Format", value: "Hardcover, 480 pages" },
                    { key: "Publisher", value: "Oxford University Press" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 68 },
                isFeatured: false
            },
            {
                name: "Factfulness: Ten Reasons We're Wrong About the World",
                title: "Factfulness: Ten Reasons We're Wrong About the World",
                brand: "Flatiron Books",
                description: "Hans Rosling shares a hopeful framework to view global statistics, explaining the ten cognitive instincts that distort our worldview.",
                bulletPoints: [
                    "【GLOBAL DEVELOPMENT】 Learn why poverty, safety, and health indices are rising globally.",
                    "【COGNITIVE SHIELD】 Guard against the negativity gap, fear instincts, and single perspectives.",
                    "【FOUR INCOME TIERS】 Categorize global economic status into reliable development levels."
                ],
                price: 19.99,
                category: getCategory('books'),
                subcategory: "General Knowledge",
                image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["books", "statistics", "optimism", "global development", "rosling", "must read"],
                specifications: [
                    { key: "Format", value: "Paperback, 352 pages" },
                    { key: "Publisher", value: "Flatiron Books" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.9, count: 320 },
                isFeatured: true
            },
            {
                name: "Prisoners of Geography",
                title: "Prisoners of Geography",
                brand: "Scribner",
                description: "Tim Marshall explains how physical barriers shape national policy, military goals, and geopolitical conflicts.",
                bulletPoints: [
                    "【10 GEOPOLITICAL MAPS】 Read about Russia, China, USA, Latin America, and Africa.",
                    "【PHYSICAL LIMITS】 Learn why Russia fears plains and why China guards the Himalayas.",
                    "【TRADE & WARS】 Understand how ocean access and resource maps dictate global alliances."
                ],
                price: 18.50,
                category: getCategory('books'),
                subcategory: "General Knowledge",
                image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["books", "geography", "politics", "foreign policy", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 304 pages" },
                    { key: "Publisher", value: "Scribner" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 185 },
                isFeatured: false
            },
            {
                name: "The Knowledge: How to Rebuild Civilization from Scratch",
                title: "The Knowledge: How to Rebuild Civilization from Scratch",
                brand: "Penguin Books",
                description: "Lewis Dartnell shares the science behind fundamental civilization technologies, from agriculture and medicine to power grids.",
                bulletPoints: [
                    "【POST APOCALYPSE DIY】 Learn to manufacture soap, purify water, and make medicines.",
                    "【TECHNOLOGY ROOTS】 Trace the logical evolution of engines, calendars, and telescopes.",
                    "【CIVIL DESIGN】 Understand the basic infrastructure that supports city life."
                ],
                price: 20.00,
                category: getCategory('books'),
                subcategory: "General Knowledge",
                image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"],
                stock: 80,
                aiTags: ["books", "science", "rebuilding", "technology", "diy", "fascinating"],
                specifications: [
                    { key: "Format", value: "Paperback, 352 pages" },
                    { key: "Publisher", value: "Penguin Books" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 95 },
                isFeatured: false
            },

            // ==================== SOCIAL SCIENCE, ECONOMICS & STRATEGY ====================
            {
                name: "Thinking, Fast and Slow",
                title: "Thinking, Fast and Slow",
                brand: "Farrar, Straus and Giroux",
                description: "Nobel Laureate Daniel Kahneman explains the two cognitive systems that drive our thoughts: intuitive System 1 and logical System 2.",
                bulletPoints: [
                    "【SYSTEM 1 & 2】 Learn when to trust intuition and when to use slow calculation.",
                    "【DECISION BIASES】 Master concepts like anchoring, loss aversion, and framing.",
                    "【BEHAVIORAL ECONOMICS】 Read the definitive guide to how humans make choices."
                ],
                price: 22.00,
                category: getCategory('books'),
                subcategory: "Social Science",
                image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"],
                stock: 190,
                aiTags: ["books", "social science", "economics", "kahneman", "psychology", "bestseller"],
                specifications: [
                    { key: "Format", value: "Paperback, 499 pages" },
                    { key: "Publisher", value: "Farrar, Straus and Giroux" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 540 },
                isFeatured: true
            },
            {
                name: "Freakonomics: A Rogue Economist Explores Everything",
                title: "Freakonomics: A Rogue Economist Explores Everything",
                brand: "William Morrow",
                description: "Steven Levitt and Stephen Dubner explore the hidden incentive structures that dictate human decisions across society.",
                bulletPoints: [
                    "【INCENTIVES】 Learn how financial, social, and moral incentives shape behaviors.",
                    "【DATA ANALYSIS】 Discover how statistics uncovers fraud and hidden connections.",
                    "【CONTRARIAN VIEWS】 Fun, data-driven look at parenting and school grades."
                ],
                price: 17.50,
                category: getCategory('books'),
                subcategory: "Social Science",
                image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["books", "economics", "freakonomics", "social science", "incentives", "popular"],
                specifications: [
                    { key: "Format", value: "Paperback, 336 pages" },
                    { key: "Publisher", value: "William Morrow" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.6, count: 310 },
                isFeatured: false
            },
            {
                name: "The 48 Laws of Power",
                title: "The 48 Laws of Power",
                brand: "Viking",
                description: "Robert Greene synthesizes thousands of years of historical strategies to outline the rules of power dynamics.",
                bulletPoints: [
                    "【HISTORICAL STRATEGY】 Learn classic laws from Sun Tzu, Machiavelli, and historic leaders.",
                    "【POWER NETWORKS】 Understand how authority is designed and defended in organizations.",
                    "【DEFENSIVE INSIGHTS】 Learn to recognize when others play power dynamics against you."
                ],
                price: 26.00,
                category: getCategory('books'),
                subcategory: "Social Science",
                image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80"],
                stock: 150,
                aiTags: ["books", "social science", "strategy", "power", "greene", "classic"],
                specifications: [
                    { key: "Format", value: "Paperback, 480 pages" },
                    { key: "Publisher", value: "Viking" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 480 },
                isFeatured: true
            },
            {
                name: "The Lean Startup: How Constant Innovation Creates Radically Successful Businesses",
                title: "The Lean Startup: How Constant Innovation Creates Radically Successful Businesses",
                brand: "Crown Business",
                description: "Eric Ries outlines the Build-Measure-Learn feedback loop, detailing how startups can optimize resource use.",
                bulletPoints: [
                    "【MINIMUM PRODUCT】 Launch fast, cheap tests to validate customer value hypothesis.",
                    "【PIVOT OR STAY】 Use structured data to decide when to change business vectors.",
                    "【VANITY METRICS】 Banish vanity tracking; focus on actionable metrics of growth."
                ],
                price: 24.99,
                category: getCategory('books'),
                subcategory: "Social Science",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["books", "business", "startups", "lean startup", "innovation", "hot"],
                specifications: [
                    { key: "Format", value: "Hardcover, 336 pages" },
                    { key: "Publisher", value: "Crown Business" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.7, count: 290 },
                isFeatured: true
            },
            {
                name: "Zero to One: Notes on Startups, or How to Build the Future",
                title: "Zero to One: Notes on Startups, or How to Build the Future",
                brand: "Crown Business",
                description: "Peter Thiel explores the philosophy of technology entrepreneurship, explaining how to create new markets.",
                bulletPoints: [
                    "【VERTICAL PROGRESS】 Strive to go from 0 to 1 (creating) rather than 1 to n (copying).",
                    "【MONOPOLY POWER】 Build proprietary tech and networks to establish long-term profits.",
                    "【COMPETITIVE DECEPTIONS】 Learn why perfect competition destroys returns in startups."
                ],
                price: 21.00,
                category: getCategory('books'),
                subcategory: "Social Science",
                image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"],
                stock: 160,
                aiTags: ["books", "business", "startups", "thiel", "economics", "essential"],
                specifications: [
                    { key: "Format", value: "Hardcover, 224 pages" },
                    { key: "Publisher", value: "Crown Business" },
                    { key: "Language", value: "English" }
                ],
                ratings: { average: 4.8, count: 350 },
                isFeatured: true
            }
        ];

        const techProducts = [
            // ==================== GAMING LAPTOPS ====================
            {
                name: "NeuraRig RTX 4080 Gaming Laptop",
                title: "NeuraRig RTX 4080 Gaming Laptop",
                brand: "NeuraTech",
                description: "An ultra-performance gaming powerhouse featuring the latest Intel Core i9 processor, NVIDIA RTX 4080 GPU, and a liquid-cooled chassis design.",
                bulletPoints: [
                    "【NVIDIA RTX 4080】 Uncompromising frame rates and path tracing in modern titles.",
                    "【INTEL i9 CHIPSET】 24-core processing power to handle streaming and gaming simultaneously.",
                    "【LIQUID COOLED】 Integrated thermal vapor chamber keeps temperatures low under full loads."
                ],
                price: 2199.99,
                category: getCategory('tech'),
                subcategory: "Gaming Laptops",
                image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80"],
                stock: 35,
                aiTags: ["tech", "laptop", "gaming", "rtx 4080", "intel i9", "portable console"],
                specifications: [
                    { key: "Processor", value: "Intel Core i9-14900HX" },
                    { key: "Graphics Card", value: "NVIDIA GeForce RTX 4080 12GB GDDR6" },
                    { key: "Memory", value: "32GB DDR5 RAM" },
                    { key: "Storage", value: "2TB NVMe PCIe 4.0 SSD" }
                ],
                ratings: { average: 4.9, count: 88 },
                isFeatured: true
            },
            {
                name: "Alienware M18 Beast Edition",
                title: "Alienware M18 Beast Edition",
                brand: "Alienware",
                description: "Experience desktop-class gaming performance in a portable format. Features a massive 18-inch QHD+ 480Hz display and high-end hardware.",
                bulletPoints: [
                    "【18-INCH DISPLAY】 Immersive QHD+ resolution with an ultra-smooth 480Hz refresh rate.",
                    "【CHERRY MX KEYS】 Mechanical low-profile keyboard with per-key AlienFX RGB lighting.",
                    "【CRYOTECH COOLING】 Advanced quad-fan cooling system for sustained high speeds."
                ],
                price: 2499.00,
                category: getCategory('tech'),
                subcategory: "Gaming Laptops",
                image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"],
                stock: 20,
                aiTags: ["tech", "laptop", "gaming", "alienware", "high refresh rate", "480hz"],
                specifications: [
                    { key: "Processor", value: "AMD Ryzen 9 7945HX" },
                    { key: "Graphics Card", value: "NVIDIA GeForce RTX 4090 16GB GDDR6" },
                    { key: "Memory", value: "64GB DDR5 RAM" },
                    { key: "Display", value: "18-inch QHD+ 480Hz" }
                ],
                ratings: { average: 4.8, count: 54 },
                isFeatured: true
            },
            {
                name: "ROG Strix SCAR 16 240Hz",
                title: "ROG Strix SCAR 16 240Hz",
                brand: "ASUS",
                description: "Defeat the competition with the power of ROG Strix SCAR. Equipped with ROG Nebula HDR display featuring a Mini LED panel.",
                bulletPoints: [
                    "【MINI LED DISPLAY】 Stunning ROG Nebula HDR display with 240Hz refresh rate and HDR1000.",
                    "【TRI-FAN TECH】 Auxiliary third fan directs air directly to the GPU for cooling.",
                    "【ROG BOOST】 Factory overclocked GPU running up to 175W dynamic boost power."
                ],
                price: 1899.50,
                category: getCategory('tech'),
                subcategory: "Gaming Laptops",
                image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"],
                stock: 45,
                aiTags: ["tech", "laptop", "gaming", "rog strix", "mini led", "240hz"],
                specifications: [
                    { key: "Processor", value: "Intel Core i9-14900HX" },
                    { key: "Graphics Card", value: "NVIDIA GeForce RTX 4080 12GB GDDR6" },
                    { key: "Memory", value: "32GB DDR5 RAM" },
                    { key: "Display", value: "16-inch Mini LED QHD+ 240Hz" }
                ],
                ratings: { average: 4.7, count: 110 },
                isFeatured: true
            },
            {
                name: "Razer Blade 15 OLED Gaming",
                title: "Razer Blade 15 OLED Gaming",
                brand: "Razer",
                description: "The ultimate thin and light gaming laptop. CNC milled anodized aluminum design containing a stunning 240Hz QHD OLED display.",
                bulletPoints: [
                    "【QHD OLED SCREEN】 Infinite contrast ratio and vibrant colors with 1ms response time.",
                    "【ULTRA-PORTABLE】 CNC milled aluminum body measuring only 0.67 inches thick.",
                    "【CHROMA RGB】 Per-key RGB keyboard synchronization across all Razer peripherals."
                ],
                price: 2299.00,
                category: getCategory('tech'),
                subcategory: "Gaming Laptops",
                image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80"],
                stock: 30,
                aiTags: ["tech", "laptop", "gaming", "razer blade", "oled", "thin and light"],
                specifications: [
                    { key: "Processor", value: "Intel Core i7-13800H" },
                    { key: "Graphics Card", value: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
                    { key: "Memory", value: "16GB DDR5 RAM" },
                    { key: "Display", value: "15.6-inch OLED QHD 240Hz" }
                ],
                ratings: { average: 4.6, count: 68 },
                isFeatured: false
            },
            {
                name: "Lenovo Legion Pro 7i",
                title: "Lenovo Legion Pro 7i",
                brand: "Lenovo",
                description: "Harness AI-tuned performance with the Lenovo Legion Pro 7i. Driven by the Lenovo LA2-Q AI chip for intelligent frame rate scaling.",
                bulletPoints: [
                    "【AI ENGINE+】 Dynamically optimizes power distribution between CPU and GPU.",
                    "【COLDFRONT 5.0】 Vapor chamber cooling system with liquid metal interface.",
                    "【LEGION TRUESTRIKE】 Full-sized tactile keyboard with anti-ghosting design."
                ],
                price: 1649.99,
                category: getCategory('tech'),
                subcategory: "Gaming Laptops",
                image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"],
                stock: 50,
                aiTags: ["tech", "laptop", "gaming", "lenovo legion", "ai-tuned", "tactile"],
                specifications: [
                    { key: "Processor", value: "Intel Core i9-13900HX" },
                    { key: "Graphics Card", value: "NVIDIA GeForce RTX 4080 12GB GDDR6" },
                    { key: "Memory", value: "32GB DDR5 RAM" },
                    { key: "Display", value: "16-inch WQXGA 240Hz" }
                ],
                ratings: { average: 4.8, count: 140 },
                isFeatured: false
            },

            // ==================== WORKING LAPTOPS & ULTRABOOKS ====================
            {
                name: "NeuraBook Pro 16 M-Series",
                title: "NeuraBook Pro 16 M-Series",
                brand: "NeuraTech",
                description: "Designed for intensive creative workflows, programming, and machine learning models. High-efficiency battery lasts up to 22 hours.",
                bulletPoints: [
                    "【PRO PERFORMANCE】 High-bandwidth unified memory for local LLM loading.",
                    "【LIQUID RETINA】 ProMotion HDR display with dynamic color mapping.",
                    "【EXTENDED CHARGE】 Up to 22 hours of continuous web browsing on battery."
                ],
                price: 1999.00,
                category: getCategory('tech'),
                subcategory: "Working Laptops",
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"],
                stock: 80,
                aiTags: ["tech", "laptop", "workstation", "ultrabook", "unified memory", "long battery"],
                specifications: [
                    { key: "Processor", value: "Neura M4 Pro Octa-Core" },
                    { key: "Memory", value: "32GB Unified Memory" },
                    { key: "Storage", value: "1TB PCIe NVMe SSD" },
                    { key: "Battery", value: "Up to 22 hours" }
                ],
                ratings: { average: 4.9, count: 210 },
                isFeatured: true
            },
            {
                name: "Dell XPS 13 Plus Ultrabook",
                title: "Dell XPS 13 Plus Ultrabook",
                brand: "Dell",
                description: "Minimalist design and cutting-edge features. Features a seamless glass touchpad, capacitive touch function rows, and edge-to-edge keyboard.",
                bulletPoints: [
                    "【SEAMLESS GLASS TOUCHPAD】 Invisible haptic feedback area under spacebar.",
                    "【CAPACITIVE TOUCH ROW】 Toggle function and media keys instantly.",
                    "【INFINITYEDGE DISPLAY】 Gorgeous 13.4-inch OLED display with 4-sided narrow borders."
                ],
                price: 1299.99,
                category: getCategory('tech'),
                subcategory: "Working Laptops",
                image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["tech", "laptop", "ultrabook", "workplace", "haptic touchpad", "oled"],
                specifications: [
                    { key: "Processor", value: "Intel Core i7-1360P" },
                    { key: "Memory", value: "16GB LPDDR5 RAM" },
                    { key: "Storage", value: "512GB PCIe SSD" },
                    { key: "Weight", value: "2.71 lbs" }
                ],
                ratings: { average: 4.7, count: 124 },
                isFeatured: false
            },
            {
                name: "ThinkPad X1 Carbon Gen 11",
                title: "ThinkPad X1 Carbon Gen 11",
                brand: "ThinkPad",
                description: "The gold standard for enterprise laptops. Built from carbon fiber weave for extreme durability, with legendary key travel.",
                bulletPoints: [
                    "【CARBON FIBER BODY】 Mil-Spec certified build quality survives drops and spills.",
                    "【TACTILE KEYBOARD】 Standard-setting typing comfort and integrated TrackPoint.",
                    "【PRIVACY GUARD】 Integrated webcam shutter and electronic privacy filter."
                ],
                price: 1450.00,
                category: getCategory('tech'),
                subcategory: "Working Laptops",
                image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["tech", "laptop", "business", "thinkpad", "workplace", "robust"],
                specifications: [
                    { key: "Processor", value: "Intel Core i7-1355U vPro" },
                    { key: "Memory", value: "32GB LPDDR5 RAM" },
                    { key: "Storage", value: "1TB PCIe NVMe SSD" },
                    { key: "Security", value: "dTPM 2.0 & Fingerprint Reader" }
                ],
                ratings: { average: 4.8, count: 195 },
                isFeatured: true
            },
            {
                name: "ASUS ZenBook Duo Dual Screen",
                title: "ASUS ZenBook Duo Dual Screen",
                brand: "ASUS",
                description: "Unlock dual-screen productivity. Features a primary 14-inch OLED display combined with an secondary tilting ScreenPad Plus touch panel.",
                bulletPoints: [
                    "【SCREENPAD PLUS】 Tilting secondary touchscreen for code parsing, timelines, or multitasking.",
                    "【DUAL OLED DISPLAYS】 Experience infinite contrast ratios and professional-grade DCI-P3 gamut.",
                    "【STYLUS INCLUDED】 Precision inputs for drawing, graphic editing, or quick note taking."
                ],
                price: 1699.00,
                category: getCategory('tech'),
                subcategory: "Working Laptops",
                image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80"],
                stock: 40,
                aiTags: ["tech", "laptop", "ultrabook", "dual screen", "zenbook", "creators"],
                specifications: [
                    { key: "Processor", value: "Intel Core i9-13900H" },
                    { key: "Primary Display", value: "14.5-inch 120Hz OLED Touch" },
                    { key: "Secondary Display", value: "12.7-inch ScreenPad Plus" },
                    { key: "Memory", value: "32GB LPDDR5 RAM" }
                ],
                ratings: { average: 4.5, count: 76 },
                isFeatured: false
            },
            {
                name: "HP Spectre x360 2-in-1",
                title: "HP Spectre x360 2-in-1",
                brand: "HP",
                description: "Flip from laptop to tablet mode instantly. Premium gem-cut chassis, long-lasting battery, and included active pen.",
                bulletPoints: [
                    "【360-DEGREE HINGE】 Fold to tablet, tent, or presentation configurations.",
                    "【GEM-CUT DESIGN】 CNC aluminum build with gold accents and angled corner ports.",
                    "【HP PALETTE CORE】 Automatically coordinates sketching assets across devices."
                ],
                price: 1199.50,
                category: getCategory('tech'),
                subcategory: "Working Laptops",
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"],
                stock: 70,
                aiTags: ["tech", "laptop", "2-in-1", "convertible", "tablet mode", "drawing"],
                specifications: [
                    { key: "Processor", value: "Intel Core i7-1355U" },
                    { key: "Memory", value: "16GB LPDDR5 RAM" },
                    { key: "Display", value: "13.5-inch OLED Touch Display" },
                    { key: "Stylus", value: "HP Rechargeable MPP 2.0 Tilt Pen" }
                ],
                ratings: { average: 4.6, count: 112 },
                isFeatured: false
            },

            // ==================== WIRELESS EARBUDS ====================
            {
                name: "Aurora Sound ANC Earbuds",
                title: "Aurora Sound ANC Earbuds",
                brand: "AuroraTech",
                description: "Enjoy your favorite music in peace. Features hybrid active noise cancellation, ambient passthrough, and custom EQ modes.",
                bulletPoints: [
                    "【HYBRID ANC】 Banish lower-frequency hums and traffic noise automatically.",
                    "【CUSTOMISABLE EQ】 Tweak bass, mid-tones, and trebles via the mobile app.",
                    "【SWEAT RESISTANT】 IPX4 certified splash barrier for intense training workouts."
                ],
                price: 129.99,
                category: getCategory('tech'),
                subcategory: "Wireless Earbuds",
                image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["tech", "earbuds", "wireless", "audio", "noise canceling", "aurora"],
                specifications: [
                    { key: "Battery Life", value: "Up to 8 hours (32 hours with case)" },
                    { key: "Bluetooth Version", value: "Bluetooth 5.3" },
                    { key: "Water Resistance", value: "IPX4" }
                ],
                ratings: { average: 4.8, count: 154 },
                isFeatured: true
            },
            {
                name: "AirPods Pro 2nd Gen",
                title: "AirPods Pro 2nd Gen",
                brand: "Apple",
                description: "Upgraded active noise cancellation, adaptive transparency, personalized spatial audio, and volume adjustments on the stem.",
                bulletPoints: [
                    "【APPLE H2 CHIP】 Powering next-gen noise cancellation and customized spatial profiles.",
                    "【ADAPTIVE AUDIO】 Dynamically mixes transparency and ANC as you move environments.",
                    "【STEM CONTROL】 Swipe up or down to adjust playback volume."
                ],
                price: 239.00,
                category: getCategory('tech'),
                subcategory: "Wireless Earbuds",
                image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80"],
                stock: 250,
                aiTags: ["tech", "earbuds", "wireless", "apple", "airpods pro", "spatial audio"],
                specifications: [
                    { key: "Processor", value: "Apple H2 Headphone Chip" },
                    { key: "Noise Control", value: "Active Noise Cancellation / Transparency" },
                    { key: "Water Resistance", value: "IP54 Dust & Sweat Resistant" }
                ],
                ratings: { average: 4.9, count: 850 },
                isFeatured: true
            },
            {
                name: "Sony WF-1000XM5 Noise Canceling",
                title: "Sony WF-1000XM5 Noise Canceling",
                brand: "Sony",
                description: "Industry leading noise canceling earbuds. Advanced audio processors and dynamic driver unit reproduce wide frequencies.",
                bulletPoints: [
                    "【V1 INTEGRATED CHIP】 Unmatched active noise cancellation performance.",
                    "【DYNAMIC DRIVER X】 Specially designed dome-edge structure reproduces deep bass.",
                    "【HI-RES AUDIO】 Supports LDAC codec for high bit-rate wireless music streams."
                ],
                price: 279.99,
                category: getCategory('tech'),
                subcategory: "Wireless Earbuds",
                image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["tech", "earbuds", "wireless", "sony", "noise canceling", "ldac"],
                specifications: [
                    { key: "Driver Unit", value: "8.4 mm Dynamic Driver X" },
                    { key: "Frequency Response", value: "20Hz - 40,000Hz (LDAC)" },
                    { key: "Codec Support", value: "SBC, AAC, LDAC, LC3" }
                ],
                ratings: { average: 4.8, count: 320 },
                isFeatured: true
            },
            {
                name: "Sennheiser Momentum True Wireless 4",
                title: "Sennheiser Momentum True Wireless 4",
                brand: "Sennheiser",
                description: "Audiophile-grade acoustic architecture. Features Bluetooth 5.4, Auracast support, and lossless audio streams.",
                bulletPoints: [
                    "【TRUE RESPONSE DRIVER】 Recreates natural, detailed studio audio signatures.",
                    "【LOSSLESS QUALITY】 Snapdragon Sound integration for flawless wireless streams.",
                    "【AURACAST READY】 Connect directly to public transmitter broadcasts."
                ],
                price: 299.00,
                category: getCategory('tech'),
                subcategory: "Wireless Earbuds",
                image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80"],
                stock: 80,
                aiTags: ["tech", "earbuds", "wireless", "sennheiser", "lossless", "audiophile"],
                specifications: [
                    { key: "Bluetooth Version", value: "Bluetooth 5.4" },
                    { key: "Codec Support", value: "aptX Lossless, AAC, SBC" },
                    { key: "Charging Interface", value: "USB-C & Qi Wireless" }
                ],
                ratings: { average: 4.7, count: 95 },
                isFeatured: true
            },
            {
                name: "Nothing Ear (2) Transparent",
                title: "Nothing Ear (2) Transparent",
                brand: "Nothing",
                description: "Unique transparent earbud casing. Ultra-light custom dynamic driver design, delivering deep bass and crisp highs.",
                bulletPoints: [
                    "【TRANSPARENT SHELL】 Aesthetic polycarbonate casing exposes structural design.",
                    "【CUSTOM DYNAMIC DRIVER】 Large 11.6mm driver reproduces rich soundstages.",
                    "【DUAL CONNECTION】 Seamlessly toggle audio between your computer and mobile phone."
                ],
                price: 149.00,
                category: getCategory('tech'),
                subcategory: "Wireless Earbuds",
                image: "https://images.unsplash.com/photo-1631867675167-90a456a90863?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1631867675167-90a456a90863?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["tech", "earbuds", "wireless", "nothing ear", "transparent", "cool tech"],
                specifications: [
                    { key: "Driver size", value: "11.6 mm Dynamic" },
                    { key: "Codec Support", value: "LHDC 5.0, AAC, SBC" },
                    { key: "Weight", value: "4.5g per earbud" }
                ],
                ratings: { average: 4.5, count: 180 },
                isFeatured: false
            },

            // ==================== CABLE / WIRED EARBUDS ====================
            {
                name: "Sennheiser IE 200 In-Ear Monitors",
                title: "Sennheiser IE 200 In-Ear Monitors",
                brand: "Sennheiser",
                description: "Designed for audiophiles starting their high-fidelity audio journey. Features adjustable dual-tuning ear tips.",
                bulletPoints: [
                    "【TRUE RESPONSE TRANSDUCER】 7mm extra-wide band driver minimizes harmonic distortion.",
                    "【DUAL TUNING POSITION】 Place ear tips in distinct positions to alternate bass depth.",
                    "【DETACHABLE CABLE】 Braided cable with standard gold-plated MMCX connectors."
                ],
                price: 149.95,
                category: getCategory('tech'),
                subcategory: "Cable Earbuds",
                image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["tech", "earbuds", "wired", "iem", "sennheiser", "analog audio"],
                specifications: [
                    { key: "Transducer Principle", value: "Dynamic 7mm" },
                    { key: "Frequency Response", value: "6Hz - 20,000Hz" },
                    { key: "Connector Type", value: "MMCX to 3.5mm jack" }
                ],
                ratings: { average: 4.7, count: 110 },
                isFeatured: true
            },
            {
                name: "Shure SE215 Sound Isolating",
                title: "Shure SE215 Sound Isolating",
                brand: "Shure",
                description: "The choice of professional stage musicians. Designed to physically block up to 37 dB of ambient noise.",
                bulletPoints: [
                    "【STAGE AUDIO GRADE】 Detailed sound with enhanced bass signature.",
                    "【SOUND ISOLATING】 Sleeve design cancels ambient sound without electronics.",
                    "【OVER-EAR DESIGN】 Wireform cable wraps behind the ear to keep earbuds secure."
                ],
                price: 99.00,
                category: getCategory('tech'),
                subcategory: "Cable Earbuds",
                image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["tech", "earbuds", "wired", "iem", "shure", "musician gear"],
                specifications: [
                    { key: "Speaker Type", value: "Single Dynamic MicroDriver" },
                    { key: "Frequency Range", value: "22Hz - 17,500Hz" },
                    { key: "Sensitivity", value: "107 dB SPL/mW" }
                ],
                ratings: { average: 4.8, count: 245 },
                isFeatured: true
            },
            {
                name: "7Hz Salnotes Zero Hi-Fi IEM",
                title: "7Hz Salnotes Zero Hi-Fi IEM",
                brand: "7Hz",
                description: "The champion of affordable high-fidelity audio. Features a large 10mm dynamic driver with metal composite diaphragm.",
                bulletPoints: [
                    "【10MM DYNAMIC】 Incredible detail separation at an entry-level price.",
                    "【ERGONOMIC BODY】 Plastic shell design with metal faceplates fits snugly.",
                    "【DETACHABLE 0.78MM】 High-purity copper cable with 2-pin connector interface."
                ],
                price: 25.00,
                category: getCategory('tech'),
                subcategory: "Cable Earbuds",
                image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80"],
                stock: 300,
                aiTags: ["tech", "earbuds", "wired", "iem", "budget", "hi-fi"],
                specifications: [
                    { key: "Driver size", value: "10mm Dynamic" },
                    { key: "Impedance", value: "32 Ohm" },
                    { key: "Cable Interface", value: "0.78mm 2-Pin" }
                ],
                ratings: { average: 4.6, count: 480 },
                isFeatured: false
            },
            {
                name: "Moondrop Aria High-Performance",
                title: "Moondrop Aria High-Performance",
                brand: "Moondrop",
                description: "Known for its balanced, target-aligned frequency response. Features a liquid crystal polymer dynamic diaphragm.",
                bulletPoints: [
                    "【LCP DIAPHRAGM】 Excellent high-frequency transient response and clarity.",
                    "【HARMAN TARGET】 Tuned to match research-based listener preferences.",
                    "【MATTE BLACK SHELL】 CNC brass structure painted with robust matte finish."
                ],
                price: 79.99,
                category: getCategory('tech'),
                subcategory: "Cable Earbuds",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
                stock: 150,
                aiTags: ["tech", "earbuds", "wired", "iem", "moondrop", "harman target"],
                specifications: [
                    { key: "Driver Type", value: "Liquid Crystal Polymer Dynamic" },
                    { key: "Interface Type", value: "0.78mm 2-Pin to 3.5mm" },
                    { key: "Frequency Response", value: "5Hz - 36,000Hz" }
                ],
                ratings: { average: 4.8, count: 190 },
                isFeatured: false
            },
            {
                name: "Sony MDR-XB55AP Extra Bass Wired",
                title: "Sony MDR-XB55AP Extra Bass Wired",
                brand: "Sony",
                description: "Built for bass lovers. Bass Duct technology provides heavy, tight bass responses with inline remote control microphone.",
                bulletPoints: [
                    "【EXTRA BASS】 Bass Duct design delivers deep, thumping low-frequency response.",
                    "【INLINE MICROPHONE】 Easy hands-free calls and track management controls.",
                    "【TANGLE-FREE CABLE】 Serrated cord resists knots and loops."
                ],
                price: 39.99,
                category: getCategory('tech'),
                subcategory: "Cable Earbuds",
                image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"],
                stock: 200,
                aiTags: ["tech", "earbuds", "wired", "sony", "heavy bass", "microphone"],
                specifications: [
                    { key: "Driver Unit", value: "12 mm dome-type" },
                    { key: "Inline Controls", value: "Microphone & Playback Button" },
                    { key: "Cable Length", value: "1.2 meters" }
                ],
                ratings: { average: 4.4, count: 320 },
                isFeatured: false
            },

            // ==================== HEADPHONES ====================
            {
                name: "Sony WH-1000XM5 Wireless Headphones",
                title: "Sony WH-1000XM5 Wireless Headphones",
                brand: "Sony",
                description: "Redefined listening comfort. Equipped with multiple microphones for class-leading active noise cancellation.",
                bulletPoints: [
                    "【AUTO NC OPTIMISER】 Automatically tweaks active noise cancellation based on fit and environment.",
                    "【LDAC HIGH RES】 Transmits three times more data than standard Bluetooth algorithms.",
                    "【QUICK CHARGE】 Get up to 5 hours of playback from a quick 3-minute charge."
                ],
                price: 398.00,
                category: getCategory('tech'),
                subcategory: "Headphones",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["tech", "headphones", "wireless", "sony wh-1000xm5", "noise canceling", "ldac"],
                specifications: [
                    { key: "Battery Life", value: "Up to 30 hours" },
                    { key: "Charge Interface", value: "USB-C Power Delivery" },
                    { key: "Microphones", value: "8 mics total for ANC & voice" }
                ],
                ratings: { average: 4.9, count: 580 },
                isFeatured: true
            },
            {
                name: "Bose QuietComfort Ultra",
                title: "Bose QuietComfort Ultra",
                brand: "Bose",
                description: "Unmatched over-ear cushion comfort. Immersive spatial audio technology paired with industry-standard noise isolation.",
                bulletPoints: [
                    "【IMMERSIVE AUDIO】 Custom DSP virtualizes standard stereo tracks into spatial soundstages.",
                    "【ULTRA COMFORT】 Ultra-soft ear cushions and balanced headband clamping force.",
                    "【BOSE SIMPLE SYNC】 Pair directly with Bose Smart Soundbars for TV audio."
                ],
                price: 429.00,
                category: getCategory('tech'),
                subcategory: "Headphones",
                image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["tech", "headphones", "wireless", "bose", "spatial audio", "comfy cushions"],
                specifications: [
                    { key: "Audio modes", value: "Quiet, Aware, and Immersion" },
                    { key: "Battery Life", value: "Up to 24 hours" },
                    { key: "Bluetooth Codecs", value: "AAC, SBC, aptX Adaptive" }
                ],
                ratings: { average: 4.8, count: 210 },
                isFeatured: true
            },
            {
                name: "AirPods Max Spatial Audio",
                title: "AirPods Max Spatial Audio",
                brand: "Apple",
                description: "Over-ear acoustic design crafted from custom aluminum mesh. Driven by dual Apple H1 chips for spatial tracking.",
                bulletPoints: [
                    "【ALUMINUM CUPS】 CNC milled aluminum casing creates independent acoustic chambers.",
                    "【HEAD TRACKING】 Dynamic spatial positioning follows your head motion.",
                    "【CUSHION COMFORT】 Acoustically engineered memory foam pads spread pressure evenly."
                ],
                price: 549.00,
                category: getCategory('tech'),
                subcategory: "Headphones",
                image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"],
                stock: 60,
                aiTags: ["tech", "headphones", "wireless", "apple", "airpods max", "luxury design"],
                specifications: [
                    { key: "Processor", value: "Apple H1 Headphone Chip (x2)" },
                    { key: "Battery Life", value: "Up to 20 hours" },
                    { key: "Weight", value: "384.8g" }
                ],
                ratings: { average: 4.7, count: 185 },
                isFeatured: true
            },
            {
                name: "Audio-Technica ATH-M50x",
                title: "Audio-Technica ATH-M50x",
                brand: "Audio-Technica",
                description: "The gold standard studio tracking headphone. Critically acclaimed for its flat, accurate audio reproduction.",
                bulletPoints: [
                    "【PRO MONITORING】 45mm large-aperture dynamic drivers replicate reference sounds.",
                    "【90-DEGREE CUPS】 Swiveling earcups facilitate easy single-ear track monitoring.",
                    "【COILED CABLE】 Includes detachable straight and coiled cables for studio use."
                ],
                price: 149.00,
                category: getCategory('tech'),
                subcategory: "Headphones",
                image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["tech", "headphones", "wired", "audio-technica", "studio monitor", "flat tuning"],
                specifications: [
                    { key: "Driver size", value: "45mm Neodymium" },
                    { key: "Frequency Response", value: "15Hz - 28,000Hz" },
                    { key: "Max Input Power", value: "1600 mW at 1 kHz" }
                ],
                ratings: { average: 4.9, count: 520 },
                isFeatured: true
            },
            {
                name: "SteelSeries Arctis Nova Pro Wireless",
                title: "SteelSeries Arctis Nova Pro Wireless",
                brand: "SteelSeries",
                description: "The ultimate gaming headset. Dual wireless connectivity lets you mix PC audio and mobile audio simultaneously.",
                bulletPoints: [
                    "【HOT-SWAP BATTERY】 Infinity Power system lets you swap batteries mid-game.",
                    "【SONAR AUDIO SUITE】 Professional EQ control to isolate enemy footsteps.",
                    "【CLEARCAST MIC】 Bidirectional noise canceling retractable microphone."
                ],
                price: 349.99,
                category: getCategory('tech'),
                subcategory: "Headphones",
                image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80"],
                stock: 75,
                aiTags: ["tech", "headphones", "wireless", "gaming", "steelseries", "chatmix"],
                specifications: [
                    { key: "Transmitter Station", value: "Base Station OLED Display" },
                    { key: "Connection", value: "2.4GHz Wireless & Bluetooth 5.0" },
                    { key: "Microphone", value: "Bidirectional Noise-Canceling" }
                ],
                ratings: { average: 4.8, count: 165 },
                isFeatured: false
            },

            // ==================== SMARTWATCHES ====================
            {
                name: "NeuraPulse Smartwatch Ultra",
                title: "NeuraPulse Smartwatch Ultra",
                brand: "NeuraTech",
                description: "Advanced health tracker featuring real-time ECG analysis, stress indexing, and custom AI sleep coaching recommendations.",
                bulletPoints: [
                    "【STRESS INDEX】 Automatically calculates your heart rate variability hourly.",
                    "【ECG MONITOR】 Generate immediate electrocardiogram reports to detect arrhythmias.",
                    "【COACHING RECOMMENDATIONS】 Get daily workout paths designed by NeuraAI."
                ],
                price: 299.99,
                category: getCategory('tech'),
                subcategory: "Smartwatches",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"],
                stock: 100,
                aiTags: ["tech", "smartwatch", "wearables", "fitness tracker", "health diagnostic"],
                specifications: [
                    { key: "Display", value: "1.4-inch AMOLED Always-On" },
                    { key: "Battery Life", value: "Up to 7 days" },
                    { key: "Sensors", value: "ECG, SpO2, HRV, Skin Temp" }
                ],
                ratings: { average: 4.8, count: 145 },
                isFeatured: true
            },
            {
                name: "Apple Watch Ultra 2",
                title: "Apple Watch Ultra 2",
                brand: "Apple",
                description: "Built for extreme training conditions. Aerospace-grade titanium body casing with dual-frequency GPS accuracy.",
                bulletPoints: [
                    "【TITANIUM CASE】 Ultra-light rugged frame with scratch-resistant sapphire screens.",
                    "【3000 NITS DISPLAY】 Apple\'s brightest display remains readable in scorching sun.",
                    "【PRECISION GPS】 Dual-frequency L1 & L5 system maps accurate running routes."
                ],
                price: 799.00,
                category: getCategory('tech'),
                subcategory: "Smartwatches",
                image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"],
                stock: 50,
                aiTags: ["tech", "smartwatch", "apple watch ultra", "titanium", "rugged watch"],
                specifications: [
                    { key: "Case Material", value: "Aerospace-Grade Titanium" },
                    { key: "Battery Life", value: "Up to 36 hours (72 hours in low power)" },
                    { key: "Water Resistance", value: "100m (WR100)" }
                ],
                ratings: { average: 4.9, count: 280 },
                isFeatured: true
            },
            {
                name: "Samsung Galaxy Watch 6 Classic",
                title: "Samsung Galaxy Watch 6 Classic",
                brand: "Samsung",
                description: "Features a physical rotating bezel to navigate screens easily. Detailed body composition analysis algorithms.",
                bulletPoints: [
                    "【ROTATING BEZEL】 Cycle through widgets smoothly without smudging the screen.",
                    "【BIA COMPOSITION】 Bioelectrical impedance sensor monitors muscle, fat, and hydration levels.",
                    "【SLEEP TRACKING】 Sleep consistency charts help optimize night rest cycles."
                ],
                price: 369.99,
                category: getCategory('tech'),
                subcategory: "Smartwatches",
                image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["tech", "smartwatch", "samsung watch", "rotating bezel", "body composition"],
                specifications: [
                    { key: "Bezel Type", value: "Physical Rotating Bezel" },
                    { key: "OS", value: "Wear OS Powered by Samsung" },
                    { key: "Material", value: "Stainless Steel Case" }
                ],
                ratings: { average: 4.6, count: 180 },
                isFeatured: false
            },
            {
                name: "Garmin Fenix 7 Pro Solar",
                title: "Garmin Fenix 7 Pro Solar",
                brand: "Garmin",
                description: "Solar-charging dynamic multi-sport watch. Built-in LED flashlight and detailed global TopoActive map files.",
                bulletPoints: [
                    "【SOLAR CHARGED】 Extends battery life up to 22 days in typical smartwatch modes.",
                    "【TopoActive MAPS】 Detailed terrain maps downloaded directly via Wi-Fi.",
                    "【LED FLASHLIGHT】 Integrated multi-intensity strobe lights for night runs."
                ],
                price: 799.99,
                category: getCategory('tech'),
                subcategory: "Smartwatches",
                image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80"],
                stock: 40,
                aiTags: ["tech", "smartwatch", "garmin", "solar", "hiking navigation"],
                specifications: [
                    { key: "Charging", value: "Solar & Wired Charger" },
                    { key: "Maps", value: "Preloaded TopoActive & Golf Maps" },
                    { key: "Screen", value: "Transflective Memory-in-Pixel" }
                ],
                ratings: { average: 4.9, count: 95 },
                isFeatured: true
            },
            {
                name: "Fitbit Charge 6 Health Tracker",
                title: "Fitbit Charge 6 Health Tracker",
                brand: "Fitbit",
                description: "Streamlined wrist-worn tracker. Built-in heart rate monitors, sleep score indexes, and seamless Google Maps connectivity.",
                bulletPoints: [
                    "【GOOGLE TOOLS】 Control YouTube Music playback and receive Google Maps alerts.",
                    "【7-DAY BATTERY】 Go a full week without recharging standard active modes.",
                    "【HEART ALERTS】 Get immediately notified of high or low resting rates."
                ],
                price: 159.95,
                category: getCategory('tech'),
                subcategory: "Smartwatches",
                image: "https://images.unsplash.com/photo-1557935728-e6d1eaeb5576?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1557935728-e6d1eaeb5576?auto=format&fit=crop&w=800&q=80"],
                stock: 130,
                aiTags: ["tech", "smartwatch", "fitbit", "fitness tracker", "google tools"],
                specifications: [
                    { key: "Battery Life", value: "Up to 7 days" },
                    { key: "Sensors", value: "EDA, SpO2, Heart Rate, Accelerometer" },
                    { key: "GPS", value: "Connected GPS" }
                ],
                ratings: { average: 4.4, count: 110 },
                isFeatured: false
            },

            // ==================== SPEAKERS & AUDIO ====================
            {
                name: "JBL Charge 5 Portable Bluetooth Speaker",
                title: "JBL Charge 5 Portable Bluetooth Speaker",
                brand: "JBL",
                description: "Delivers powerful JBL Original Pro Sound with its optimized long excursion driver, separate tweeter and dual pumping bass radiators.",
                bulletPoints: [
                    "【PRO SOUND】 Separate high-frequency tweeter and dual bass radiators boost sound signature.",
                    "【IP67 WATERPROOF】 Resists sand, water splashes, and dust at pools and beaches.",
                    "【BUILT-IN POWERBANK】 Charge mobile phones directly using integrated USB ports."
                ],
                price: 179.95,
                category: getCategory('tech'),
                subcategory: "Speakers",
                image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"],
                stock: 160,
                aiTags: ["tech", "speaker", "jbl charge", "bluetooth", "pool party"],
                specifications: [
                    { key: "Output Power", value: "30W RMS Woofer, 10W RMS Tweeter" },
                    { key: "Waterproof rating", value: "IP67 Certified" },
                    { key: "Powerbank Port", value: "USB-A Output (5V / 2A)" }
                ],
                ratings: { average: 4.8, count: 290 },
                isFeatured: true
            },
            {
                name: "Marshall Stanmore III Bluetooth",
                title: "Marshall Stanmore III Bluetooth",
                brand: "Marshall",
                description: "Bring iconic classic design into your living room. Features Marshall's signature wider stereo soundstage.",
                bulletPoints: [
                    "【VINTAGE CABINET】 Vinyl texturing and gold brass plate controls mimic retro guitar amps.",
                    "【WIDER STEREO】 Outward angled tweeters project audio wider into rooms.",
                    "【DYNAMIC LOUDNESS】 Automatically balances tone response as volume levels switch."
                ],
                price: 379.99,
                category: getCategory('tech'),
                subcategory: "Speakers",
                image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80"],
                stock: 75,
                aiTags: ["tech", "speaker", "marshall", "vintage", "retro amp"],
                specifications: [
                    { key: "Amplifiers", value: "1x 50W Class D (Woofer), 2x 15W Class D (Tweeters)" },
                    { key: "Connectivity", value: "Bluetooth 5.2, RCA, 3.5mm Aux" },
                    { key: "Controls", value: "Analogue Bass, Treble, and Volume Knobs" }
                ],
                ratings: { average: 4.9, count: 120 },
                isFeatured: true
            },
            {
                name: "Sonos Era 100 Smart Speaker",
                title: "Sonos Era 100 Smart Speaker",
                brand: "Sonos",
                description: "Stream high-definition audio over Wi-Fi. Features voice controls, Trueplay room calibration, and multiroom synchronization.",
                bulletPoints: [
                    "【TRUEPLAY CALIBRATION】 Optimizes tone signature using mobile microphone acoustics.",
                    "【STEREO SOUNDSTAGE】 Dual angled tweeters deliver wide stereo separations.",
                    "【MULTIROOM SYNC】 Stream music across multiple Sonos speakers in your home."
                ],
                price: 249.00,
                category: getCategory('tech'),
                subcategory: "Speakers",
                image: "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80"],
                stock: 80,
                aiTags: ["tech", "speaker", "sonos era", "wi-fi streaming", "smart home"],
                specifications: [
                    { key: "Connectivity", value: "Wi-Fi 6, Bluetooth 5.0, USB-C Line-In" },
                    { key: "Voice Assist", value: "Sonos Voice Control, Amazon Alexa" },
                    { key: "Trueplay OS", value: "iOS & Android Calibration Support" }
                ],
                ratings: { average: 4.7, count: 185 },
                isFeatured: false
            },
            {
                name: "Bose SoundLink Flex Portable",
                title: "Bose SoundLink Flex Portable",
                brand: "Bose",
                description: "Astonishing audio depth in a pocketable build. Proprietary PositionIQ technology detects orientation to balance EQ.",
                bulletPoints: [
                    "【POSITION IQ】 Automatically calculates EQ balance based on vertical or horizontal placements.",
                    "【IP67 DUSTPROOF】 Sealed casing floats on water surfaces if dropped.",
                    "【SILICONE BODY】 Soft touch silicone casing survives severe drops."
                ],
                price: 149.00,
                category: getCategory('tech'),
                subcategory: "Speakers",
                image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80"],
                stock: 110,
                aiTags: ["tech", "speaker", "bose soundlink", "portable", "floatable"],
                specifications: [
                    { key: "Battery Life", value: "Up to 12 hours" },
                    { key: "Water Resistance", value: "IP67 Floatable Design" },
                    { key: "Microphone", value: "Integrated voice mic" }
                ],
                ratings: { average: 4.8, count: 310 },
                isFeatured: true
            },
            {
                name: "Anker Soundcore Motion+",
                title: "Anker Soundcore Motion+",
                brand: "Anker",
                description: "Audiophile audio quality at a budget price. High-resolution audio certification and Qualcomm aptX codec support.",
                bulletPoints: [
                    "【HI-RES CERTIFIED】 Outfitted with dual high-frequency tweeters and neodymium woofers.",
                    "【aptX COMPATIBLE】 Lossless sound transmission from android source devices.",
                    "【ACTIVE CROSSOVER】 Powered by independent amplifiers to separate highs from bass."
                ],
                price: 99.99,
                category: getCategory('tech'),
                subcategory: "Speakers",
                image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80"],
                stock: 150,
                aiTags: ["tech", "speaker", "anker soundcore", "aptx", "budget audiophile"],
                specifications: [
                    { key: "Output Power", value: "30 Watts RMS" },
                    { key: "Frequency Range", value: "50Hz - 40,000Hz" },
                    { key: "Waterproof rating", value: "IPX7 Certified" }
                ],
                ratings: { average: 4.6, count: 190 },
                isFeatured: false
            },

            // ==================== PC ACCESSORIES & PERIPHERALS ====================
            {
                name: "Logitech MX Master 3S Wireless Mouse",
                title: "Logitech MX Master 3S Wireless Mouse",
                brand: "Logitech",
                description: "The gold standard mouse for creators and programmers. Features quiet clicks and an 8000 DPI tracking sensor.",
                bulletPoints: [
                    "【MAGSPEED WHEEL】 Electromagnetic wheel scrolls 1,000 lines per second silently.",
                    "【8000 DPI SENSOR】 Track on any surface—even glass—with custom cursor speed scaling.",
                    "【LOGI FLOW】 Copy-paste text and files across three computers simultaneously."
                ],
                price: 99.99,
                category: getCategory('tech'),
                subcategory: "PC Accessories",
                image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"],
                stock: 220,
                aiTags: ["tech", "pc accessories", "mouse", "logitech mx master", "developer gear"],
                specifications: [
                    { key: "Sensor Resolution", value: "200 to 8000 DPI" },
                    { key: "Buttons", value: "7 customizable inputs" },
                    { key: "Battery Life", value: "Up to 70 days on full charge" }
                ],
                ratings: { average: 5.0, count: 950 },
                isFeatured: true
            },
            {
                name: "Keychron K2 Pro Mechanical Keyboard",
                title: "Keychron K2 Pro Mechanical Keyboard",
                brand: "Keychron",
                description: "Fully customizable mechanical keyboard. QMK/VIA compatible keys allow you to remap layout inputs instantly.",
                bulletPoints: [
                    "【VIA LAYOUT REMAP】 Program macros and shortcut binds using open-source software.",
                    "【HOT SWAPPABLE】 Swap switch modules without soldering PCB circuits.",
                    "【MAC & WINDOWS OS】 Included replacement keycaps for Mac and Windows layouts."
                ],
                price: 119.00,
                category: getCategory('tech'),
                subcategory: "PC Accessories",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"],
                stock: 140,
                aiTags: ["tech", "pc accessories", "mechanical keyboard", "keychron", "qmk via"],
                specifications: [
                    { key: "Key Layout", value: "75% compact format" },
                    { key: "Switch Type", value: "Keychron K Pro Red (Linear)" },
                    { key: "Connectivity", value: "Bluetooth 5.1 & Wired USB-C" }
                ],
                ratings: { average: 4.8, count: 410 },
                isFeatured: true
            },
            {
                name: "Elgato Stream Deck MK.2",
                title: "Elgato Stream Deck MK.2",
                brand: "Elgato",
                description: "15 customizable LCD keys to trigger immediate actions in OBS, Photoshop, Premiere, and developer tool chains.",
                bulletPoints: [
                    "【15 LCD KEYS】 Program infinite shortcuts with custom icon displays.",
                    "【ELGATO STORE】 Download plugins, profile templates, and royalty-free music.",
                    "【MULTI ACTIONS】 Trigger multiple complex commands sequentially with one press."
                ],
                price: 149.99,
                category: getCategory('tech'),
                subcategory: "PC Accessories",
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"],
                stock: 95,
                aiTags: ["tech", "pc accessories", "stream deck", "elgato", "macros panel"],
                specifications: [
                    { key: "Keys", value: "15 customizable LCD keys" },
                    { key: "Interface", value: "USB 2.0" },
                    { key: "Dimensions", value: "118 x 84 x 25 mm" }
                ],
                ratings: { average: 4.9, count: 180 },
                isFeatured: true
            },
            {
                name: "Razer DeathAdder V3 Pro Wireless",
                title: "Razer DeathAdder V3 Pro Wireless",
                brand: "Razer",
                description: "Pro-grade gaming mouse. Ergonomic ultra-lightweight design measuring only 63 grams, with a 30K optical sensor.",
                bulletPoints: [
                    "【63G LIGHTWEIGHT】 Excellent tracking speeds for twitch shooters and competitive gaming.",
                    "【FOCUS PRO 30K】 Dynamic surface calibration tracks on glass with high precision.",
                    "【8000Hz POLLING】 Upgrade latency response to 8000Hz with hyperpolling adapters."
                ],
                price: 149.99,
                category: getCategory('tech'),
                subcategory: "PC Accessories",
                image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT_W8wHYLs081O2IECqaPotLCDFTWZSfLVoeJYJejP3W2Ddi-Zuy00cYWJS_CHsG-1UeLQIevLsoYLrwMh6c3GeoWPqR82IpJA5pW9iFJsLnGP9B5idxekmlQ",
                images: ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT_W8wHYLs081O2IECqaPotLCDFTWZSfLVoeJYJejP3W2Ddi-Zuy00cYWJS_CHsG-1UeLQIevLsoYLrwMh6c3GeoWPqR82IpJA5pW9iFJsLnGP9B5idxekmlQ"],
                stock: 130,
                aiTags: ["tech", "pc accessories", "gaming mouse", "razer deathadder", "esports gear"],
                specifications: [
                    { key: "Sensor Resolution", value: "30,000 DPI Max" },
                    { key: "Weight", value: "63 grams" },
                    { key: "Switch Type", value: "Gen-3 Optical Mouse Switches (90M clicks)" }
                ],
                ratings: { average: 4.7, count: 110 },
                isFeatured: false
            },
            {
                name: "Horizon 34\" UltraWide 144Hz Monitor",
                title: "Horizon 34\" UltraWide 144Hz Monitor",
                brand: "Horizon",
                description: "Immersive curved monitor featuring 1500R screen curvature, QHD resolution, and AMD FreeSync Premium sync algorithms.",
                bulletPoints: [
                    "【1500R CURVE】 Matches the field of view of human eyes for immersive viewing.",
                    "【QHD ULTRAWIDE】 21:9 aspect ratio provides 34% more workspace than standard screens.",
                    "【144Hz REFRESH】 Eliminates motion blur and screen tearing during gaming sessions."
                ],
                price: 499.99,
                category: getCategory('tech'),
                subcategory: "PC Accessories",
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"],
                stock: 35,
                aiTags: ["tech", "pc accessories", "monitor", "ultrawide", "gaming screen"],
                specifications: [
                    { key: "Panel Tech", value: "VA Curved 1500R" },
                    { key: "Resolution", value: "3440 x 1440 QHD" },
                    { key: "Refresh Rate", value: "144Hz" }
                ],
                ratings: { average: 4.7, count: 154 },
                isFeatured: true
            },

            // ==================== CAMERAS & CREATOR GEAR ====================
            {
                name: "Sony Alpha 7 IV Mirrorless Camera",
                title: "Sony Alpha 7 IV Mirrorless Camera",
                brand: "Sony",
                description: "The benchmark mirrorless hybrid camera. Features a 33 megapixel Exmor R sensor and 4K 60p video recording.",
                bulletPoints: [
                    "【33MP SENSOR】 High-resolution back-illuminated sensor captures rich details.",
                    "【REAL-TIME EYE AF】 AI tracking locks onto human, animal, and bird eyes in real time.",
                    "【4K 60P RECORDING】 Crisp 10-bit video encoding perfect for post-production color grading."
                ],
                price: 2498.00,
                category: getCategory('tech'),
                subcategory: "Creator Gear",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"],
                stock: 25,
                aiTags: ["tech", "creator gear", "camera", "mirrorless", "sony alpha", "pro video"],
                specifications: [
                    { key: "Sensor Type", value: "33.0 Megapixel Full-Frame CMOS Exmor R" },
                    { key: "Stabilisation", value: "5-axis optical in-body image stabilization" },
                    { key: "ISO Range", value: "ISO 100 - 51,200" }
                ],
                ratings: { average: 4.9, count: 320 },
                isFeatured: true
            },
            {
                name: "DJI Osmo Pocket 3 Gimbal Camera",
                title: "DJI Osmo Pocket 3 Gimbal Camera",
                brand: "DJI",
                description: "Pocketable vlog camera with a large 1-inch sensor, 3-axis mechanical gimbal stabilization, and a rotatable touchscreen.",
                bulletPoints: [
                    "【1-INCH CMOS】 Captures clear shadow details and brilliant night highlights.",
                    "【3-AXIS GIMBAL】 Steady shots even during fast running or dynamic camera pans.",
                    "【ROTATABLE TOUCHSCREEN】 Spin the screen to start shooting vertical or horizontal frames."
                ],
                price: 519.00,
                category: getCategory('tech'),
                subcategory: "Creator Gear",
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80"],
                stock: 45,
                aiTags: ["tech", "creator gear", "dji pocket", "vlog camera", "handheld gimbal"],
                specifications: [
                    { key: "Sensor size", value: "1-inch CMOS" },
                    { key: "Max Video", value: "4K at 120fps" },
                    { key: "Stabilisation", value: "3-axis mechanical gimbal" }
                ],
                ratings: { average: 4.9, count: 180 },
                isFeatured: true
            },
            {
                name: "GoPro HERO12 Black Action Cam",
                title: "GoPro HERO12 Black Action Cam",
                brand: "GoPro",
                description: "Rugged action camera featuring HyperSmooth 6.0 stabilization and high dynamic range video recording capabilities.",
                bulletPoints: [
                    "【HYPERSMOOTH 6.0】 Emmy-award winning image stabilization removes all bumps.",
                    "【HDR VIDEO】 Records vibrant high dynamic range color spectrums in 5.3K.",
                    "【WATERPROOF 33FT】 Sealed chassis operates deep underwater without external cases."
                ],
                price: 399.99,
                category: getCategory('tech'),
                subcategory: "Creator Gear",
                image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["tech", "creator gear", "action camera", "gopro", "waterproof", "underwater"],
                specifications: [
                    { key: "Video Resolution", value: "5.3K at 60fps, 4K at 120fps" },
                    { key: "Photo Resolution", value: "27 Megapixels" },
                    { key: "Waterproof depth", value: "10 meters (33 feet) out of the box" }
                ],
                ratings: { average: 4.7, count: 210 },
                isFeatured: false
            },
            {
                name: "Shure SM7B Dynamic Studio Microphone",
                title: "Shure SM7B Dynamic Studio Microphone",
                brand: "Shure",
                description: "The definitive dynamic microphone for podcasting and broadcasting. Rejects electromagnetic hum and background noises.",
                bulletPoints: [
                    "【VOCAL CLARITY】 Smooth, flat frequency response preserves natural vocal dynamics.",
                    "【HUM SHIELDING】 Advanced shielding defends against computer monitor interference.",
                    "【POP FILTER】 Built-in pop filter eliminates explosive breath sounds."
                ],
                price: 399.00,
                category: getCategory('tech'),
                subcategory: "Creator Gear",
                image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80"],
                stock: 35,
                aiTags: ["tech", "creator gear", "microphone", "podcast", "shure sm7b", "studio mic"],
                specifications: [
                    { key: "Microphone Type", value: "Dynamic Cardioid" },
                    { key: "Frequency Response", value: "50Hz - 20,000Hz" },
                    { key: "Connector Type", value: "XLR interface" }
                ],
                ratings: { average: 5.0, count: 950 },
                isFeatured: true
            },
            {
                name: "Elgato Facecam Pro 4K60",
                title: "Elgato Facecam Pro 4K60",
                brand: "Elgato",
                description: "The world's first webcam to capture true 4K resolution at 60 frames per second. Studio-grade lens with auto focus.",
                bulletPoints: [
                    "【4K60 VIDEO】 Ultra HD video capture provides high-fidelity streams.",
                    "【STUDIO LENS】 Premium f/2.0 aperture 21mm focal length lens architecture.",
                    "【FLASH MEMORY】 Save camera parameter presets directly on webcam hardware."
                ],
                price: 299.99,
                category: getCategory('tech'),
                subcategory: "Creator Gear",
                image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80"],
                stock: 80,
                aiTags: ["tech", "creator gear", "webcam", "4k webcam", "elgato facecam", "streaming setup"],
                specifications: [
                    { key: "Video Resolution", value: "2160p at 60fps / 1080p at 60fps" },
                    { key: "Focus Range", value: "10 cm to infinity" },
                    { key: "Sensor Type", value: "Sony STARVIS CMOS" }
                ],
                ratings: { average: 4.6, count: 140 },
                isFeatured: false
            },

            // ==================== SMART HOME & TECH GADGETS ====================
            {
                name: "Oculus / Meta Quest 3 VR Headset",
                title: "Oculus / Meta Quest 3 VR Headset",
                brand: "Meta",
                description: "Mixed reality virtual headset. Powered by the Snapdragon XR2 Gen 2 chip with dual 4K Infinite Display panels.",
                bulletPoints: [
                    "【MIXED REALITY】 Full-color passthrough blends virtual objects into physical rooms.",
                    "【INFINITE DISPLAY】 High resolution panels (2064x2208 pixels per eye) sharpen visuals.",
                    "【TOUCH PLUS KEYS】 Ring-less controllers feature TruTouch haptic interactions."
                ],
                price: 499.99,
                category: getCategory('tech'),
                subcategory: "Smart Gadgets",
                image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80"],
                stock: 60,
                aiTags: ["tech", "smart gadgets", "vr headset", "meta quest 3", "mixed reality", "gaming gear"],
                specifications: [
                    { key: "Processor", value: "Snapdragon XR2 Gen 2" },
                    { key: "Display Resolution", value: "2064 x 2208 pixels per eye" },
                    { key: "Storage Capacity", value: "128GB High-Speed Flash" }
                ],
                ratings: { average: 4.8, count: 290 },
                isFeatured: true
            },
            {
                name: "Steam Deck OLED 512GB",
                title: "Steam Deck OLED 512GB",
                brand: "Valve",
                description: "Handheld PC gaming console. Features a gorgeous HDR OLED display, custom AMD APU, and long-life batteries.",
                bulletPoints: [
                    "【HDR OLED PANEL】 90Hz refresh rate screen with deep blacks and vibrant highlights.",
                    "【CUSTOM AMD APU】 High performance silicon designed to run AAA games easily.",
                    "【PRO THROTTLE】 Dual trackpads and capacitive thumbsticks for precise input control."
                ],
                price: 549.00,
                category: getCategory('tech'),
                subcategory: "Smart Gadgets",
                image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"],
                stock: 50,
                aiTags: ["tech", "smart gadgets", "gaming console", "steam deck", "handheld computer"],
                specifications: [
                    { key: "Display", value: "7.4-inch 90Hz HDR OLED Touch" },
                    { key: "Storage", value: "512GB NVMe SSD" },
                    { key: "Battery Life", value: "Up to 3-12 hours of gameplay" }
                ],
                ratings: { average: 4.9, count: 320 },
                isFeatured: true
            },
            {
                name: "Anker 737 Power Bank 24,000mAh 140W",
                title: "Anker 737 Power Bank 24,000mAh 140W",
                brand: "Anker",
                description: "High-capacity portable charger. Power Delivery 3.1 protocol outputs up to 140W to charge laptops on the go.",
                bulletPoints: [
                    "【140W FAST CHARGE】 High output power charges a MacBook Pro 16 to 50% in 40 minutes.",
                    "【DIGITAL DISPLAY】 Smart screen displays charging input, output, and remaining battery time.",
                    "【24,000mAh CELL】 Massive capacity charges laptops, tablets, and phones multiple times."
                ],
                price: 149.99,
                category: getCategory('tech'),
                subcategory: "Smart Gadgets",
                image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80"],
                stock: 150,
                aiTags: ["tech", "smart gadgets", "power bank", "anker 737", "laptop charger"],
                specifications: [
                    { key: "Capacity", value: "24,000 mAh" },
                    { key: "Max Output", value: "140 Watts Power Delivery 3.1" },
                    { key: "Ports", value: "2x USB-C, 1x USB-A" }
                ],
                ratings: { average: 4.8, count: 185 },
                isFeatured: false
            },
            {
                name: "Apple iPad Air M2 11-inch",
                title: "Apple iPad Air M2 11-inch",
                brand: "Apple",
                description: "Lightweight productivity tablet driven by Apple's high-performance M2 processor. Supports Apple Pencil Pro.",
                bulletPoints: [
                    "【M2 PROCESSOR】 Blazing-fast performance for graphic design, gaming, and 3D modeling.",
                    "【LIQUID RETINA】 Gorgeous 11-inch display with anti-reflective coating and True Tone.",
                    "【CREATOR FRIENDLY】 Pair with Magic Keyboard or Pencil Pro for tablet productivity."
                ],
                price: 599.00,
                category: getCategory('tech'),
                subcategory: "Smart Gadgets",
                image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"],
                stock: 90,
                aiTags: ["tech", "smart gadgets", "ipad air", "tablet", "apple m2", "drawing screen"],
                specifications: [
                    { key: "Processor", value: "Apple M2 Octa-Core Chip" },
                    { key: "Display Size", value: "11-inch Liquid Retina Display" },
                    { key: "Storage", value: "128GB High-Speed Flash" }
                ],
                ratings: { average: 4.8, count: 210 },
                isFeatured: false
            },
            {
                name: "Kindle Paperwhite Signature Edition",
                title: "Kindle Paperwhite Signature Edition",
                brand: "Amazon",
                description: "Designed for reader comfort. Features a glare-free e-ink screen, auto-adjusting front light, and wireless charging support.",
                bulletPoints: [
                    "【GLARE-FREE SCREEN】 300 ppi paper-like display reads easily even in bright sunlight.",
                    "【AUTO ADJUST LIGHT】 Adjusts display brightness and color warmth based on room lighting.",
                    "【32GB CAPACITY】 Save thousands of books, audiobooks, and magazines locally."
                ],
                price: 189.99,
                category: getCategory('tech'),
                subcategory: "Smart Gadgets",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
                stock: 120,
                aiTags: ["tech", "smart gadgets", "kindle", "e-reader", "glare free", "books device"],
                specifications: [
                    { key: "Display Size", value: "6.8-inch e-ink screen" },
                    { key: "Storage Capacity", value: "32GB Flash Storage" },
                    { key: "Water Resistance", value: "IPX8 waterproof" }
                ],
                ratings: { average: 4.7, count: 180 },
                isFeatured: false
            }
        ];

        const rawClothingProducts = require('./clothingProducts');
        const clothingProducts = rawClothingProducts.map(p => {
            const isClassic = p.subcategory.includes('Classic');
            const isWomens = p.subcategory.includes('Women');
            
            let brand = "Aesthetic Wear";
            if (isClassic) {
                brand = isWomens ? "Atelier Classic" : "Savile Row Classic";
            } else {
                brand = isWomens ? "Gen-Z Couture" : "Retro Streetwear";
            }

            const bulletPoints = [
                `【PREMIUM QUALITY】 Made from high-quality fabric for maximum comfort and durability.`,
                `【TRENDY STYLE】 Styled for a perfect fit, ideal for ${p.subcategory.toLowerCase()} wardrobes.`,
                `【VERSATILE WEAR】 Easy to clean and pair with a variety of other styles.`
            ];

            const specifications = [
                { key: "Material", value: isClassic ? "Premium Wool & Cotton Blend" : "Cotton & Polyester Streetwear Blend" },
                { key: "Fit Type", value: p.name.toLowerCase().includes("oversized") ? "Oversized Fit" : "Regular Fit" },
                { key: "Care Instructions", value: "Machine wash cold, tumble dry low" }
            ];

            return {
                name: p.name,
                title: p.name,
                brand: brand,
                description: `Elevate your wardrobe with the ${p.name}. Specially designed for ${p.subcategory} styles, this piece features premium materials and high attention to detail for both comfort and aesthetic appeal.`,
                bulletPoints: bulletPoints,
                price: p.price,
                category: getCategory('clothing'),
                subcategory: p.subcategory,
                image: p.image,
                images: [p.image],
                stock: 120,
                aiTags: ["clothing", "fashion", p.subcategory.toLowerCase(), ...p.name.toLowerCase().split(" ")],
                specifications: specifications,
                ratings: { average: p.rating, count: Math.floor(Math.random() * 150) + 50 },
                isFeatured: p.badge === "Trending" || p.badge === "Hot" || p.badge === "Bestseller" || p.badge === "Luxury" || p.badge === "Old Money" || p.badge === "Elegance"
            };
        });

        products.push(...techProducts);
        products.push(...bookProducts);
        products.push(...clothingProducts);

        const rawToyProducts = require('./toyProducts');
        const toyProducts = rawToyProducts.map(p => {
            let brand = "NeuraToys";
            const nameLower = p.name.toLowerCase();
            if (nameLower.includes("lego")) brand = "LEGO";
            else if (nameLower.includes("hot wheels")) brand = "Hot Wheels";
            else if (nameLower.includes("nerf") || nameLower.includes("super soaker")) brand = "Nerf";
            else if (nameLower.includes("gel blaster")) brand = "Gel Blaster";
            else if (nameLower.includes("fisher-price")) brand = "Fisher-Price";
            else if (nameLower.includes("squishmallows")) brand = "Squishmallows";
            else if (nameLower.includes("barbie")) brand = "Barbie";
            else if (nameLower.includes("monopoly") || nameLower.includes("uno") || nameLower.includes("jenga") || nameLower.includes("catan") || nameLower.includes("connect 4")) brand = "Hasbro Gaming";
            else if (nameLower.includes("play-doh")) brand = "Play-Doh";
            else if (nameLower.includes("melissa & doug")) brand = "Melissa & Doug";
            else if (nameLower.includes("crayola")) brand = "Crayola";
            else if (nameLower.includes("vtech")) brand = "VTech";
            else if (nameLower.includes("leapfrog")) brand = "LeapFrog";
            else if (nameLower.includes("transformers") || nameLower.includes("g.i. joe")) brand = "Hasbro";
            else if (nameLower.includes("spider-man") || nameLower.includes("marvel")) brand = "Marvel";
            else if (nameLower.includes("dragon ball") || nameLower.includes("goku")) brand = "Bandai";

            const bulletPoints = [
                `【ENDLESS FUN】 Perfect for engaging, interactive play sessions with friends and family.`,
                `【HIGH QUALITY & SAFE】 Built with child-safe, durable materials tested for standard safety guidelines.`,
                `【STEM & CREATIVE DEVELOPMENT】 Promotes motor skills, strategy coordination, and creative thinking.`
            ];

            const specifications = [
                { key: "Recommended Age", value: nameLower.includes("fisher-price") || nameLower.includes("cocomelon") ? "18 months and up" : "6 years and up" },
                { key: "Material", value: nameLower.includes("lego") || nameLower.includes("hot wheels") ? "High-grade ABS plastic" : "Mixed child-safe materials" },
                { key: "Safety Standard", value: "ASTM F963 Certified" }
            ];

            return {
                name: p.name,
                title: p.name,
                brand: brand,
                description: `Experience the best of play with the ${p.name}. Perfect for both fans and collectors, this ${p.subcategory.toLowerCase()} toy delivers excellent quality, interactive fun, and creative stimulation.`,
                bulletPoints: bulletPoints,
                price: p.price,
                category: getCategory('toys'),
                subcategory: p.subcategory,
                image: p.image,
                images: [p.image],
                stock: 150,
                aiTags: ["toys", "play", "kids", p.subcategory.toLowerCase(), ...p.name.toLowerCase().split(" ")],
                specifications: specifications,
                ratings: { average: p.rating, count: Math.floor(Math.random() * 100) + 30 },
                isFeatured: p.badge === "Trending" || p.badge === "Hot" || p.badge === "Bestseller" || p.badge === "Top Rated" || p.badge === "Collector" || p.badge === "Masterpiece"
            };
        });

        products.push(...toyProducts);

        const rawShoeProducts = require('./shoeProducts');
        const shoeProducts = rawShoeProducts.map(p => {
            let subcat = "General";
            if (p.category === "daily-wear") subcat = "Daily Wear";
            else if (p.category === "formal-wear") subcat = "Formal Wear";
            else if (p.category === "sneakers") subcat = "Sneakers";
            else if (p.category === "sports") subcat = "Sports";

            return {
                name: p.title || p.name,
                title: p.title || p.name,
                brand: p.brand || "Generic",
                description: p.description,
                price: p.price,
                category: getCategory('shoes'),
                subcategory: subcat,
                image: p.image,
                images: [p.image],
                stock: 120,
                ratings: { average: p.rating, count: Math.floor(Math.random() * 100) + 20 },
                rating: p.rating
            };
        });

        products.push(...shoeProducts);

        const rawHomeProducts = require('./homeProducts');
        const homeProducts = rawHomeProducts.map(p => {
            const firstWord = p.title.split(' ')[0];
            let brand = firstWord;
            const nonBrands = ["Set", "Collage", "Handpainted", "Abstract", "Peaceful", "Hanging", "Lightweight", "Contemporary", "Classic", "Modern", "Bronze-finish", "Brass", "Ethnic", "Durable", "Solid"];
            if (nonBrands.includes(firstWord)) {
                brand = "Generic";
            }

            return {
                name: p.title,
                title: p.title,
                brand: brand,
                description: p.description,
                price: p.price,
                category: getCategory('home'),
                subcategory: p.subcategory,
                image: p.image,
                images: [p.image],
                stock: 100,
                ratings: { average: p.rating, count: Math.floor(Math.random() * 100) + 20 },
                rating: p.rating
            };
        });

        products.push(...homeProducts);

        const insertedProducts = await Product.insertMany(products);
        console.log('Products seeded.');

        // Seed Reviews
        const reviews = [
            { user: insertedUsers[0]._id, product: insertedProducts[1]._id, rating: 5, comment: 'Absolutely incredible sound quality!' },
            { user: insertedUsers[1]._id, product: insertedProducts[1]._id, rating: 4, comment: 'Great bass, but fit is a bit tight.' },
            { user: insertedUsers[2]._id, product: insertedProducts[0]._id, rating: 5, comment: 'This NeuraBook Pro is extremely fast! Highly recommend.' },
            { user: insertedUsers[0]._id, product: insertedProducts[3]._id, rating: 5, comment: 'Great shirt, fits me perfectly. Will buy another.' }
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
