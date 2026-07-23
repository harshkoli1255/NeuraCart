require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// A highly curated, realistic list of Amazon-style products with rich HTML descriptions and Unsplash imagery
const productsSeed = [
    // --- TECH ---
    {
        name: "Echo Dot 5th Gen",
        title: "Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa | Charcoal",
        brand: "Amazon",
        categorySlug: "tech",
        description: "<h3>Our best-sounding Echo Dot yet</h3><p>Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room.</p><ul><li><strong>Your favorite music and content:</strong> Play music, audiobooks, and podcasts from Amazon Music, Apple Music, Spotify and others.</li><li><strong>Alexa is ready to help:</strong> Ask Alexa for weather updates and to set hands-free timers, get answers to your questions and even hear jokes.</li></ul>",
        imageDescription: "A small, spherical smart speaker in dark charcoal fabric with a glowing blue light ring around the base.",
        bulletPoints: ["Improved audio experience", "Voice control your smart home", "Designed to protect your privacy"],
        price: 49.99,
        subcategory: "Smart Home",
        image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80"],
        stock: 250,
        attributes: { "Color": "Charcoal", "Connectivity": "Wi-Fi, Bluetooth" },
        aiTags: ["smart speaker", "alexa", "home assistant", "audio", "voice control", "amazon echo"],
        specifications: [{ key: "Dimensions", value: "3.9 x 3.9 x 3.5 in" }, { key: "Weight", value: "304g" }]
    },
    {
        name: "MacBook Air M2",
        title: "Apple 2022 MacBook Air Laptop with M2 chip: 13.6-inch Liquid Retina Display",
        brand: "Apple",
        categorySlug: "tech",
        description: "<h3>Supercharged by M2</h3><p>The redesigned MacBook Air is more portable than ever and weighs just 2.7 pounds. It’s the incredibly capable laptop that lets you work, play or create just about anything — anywhere.</p><ul><li><strong>Strikingly thin design:</strong> The redesigned MacBook Air is more portable than ever.</li><li><strong>Supercharged by M2:</strong> Get more done faster with a next-generation 8-core CPU, up to 10-core GPU and up to 24GB of unified memory.</li></ul>",
        imageDescription: "A sleek, incredibly thin silver laptop partially opened, showcasing a vibrant display.",
        bulletPoints: ["13.6-inch Liquid Retina display", "M2 chip with 8-core CPU", "18 hours of battery life"],
        price: 1099.00,
        subcategory: "Laptops",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"],
        stock: 45,
        attributes: { "Color": "Silver", "RAM": "8GB", "Storage": "256GB SSD" },
        aiTags: ["laptop", "apple", "macbook", "m2", "computer", "productivity", "retina"],
        specifications: [{ key: "Screen Size", value: "13.6 Inches" }, { key: "CPU", value: "Apple M2" }]
    },
    {
        name: "Sony WH-1000XM5",
        title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        brand: "Sony",
        categorySlug: "tech",
        description: "<h3>Industry-leading noise cancellation</h3><p>Two processors control 8 microphones for unprecedented noise cancellation. With Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions and environment.</p><ul><li><strong>Magnificent Sound:</strong> Engineered to perfection with the new Integrated Processor V1.</li><li><strong>Crystal clear hands-free calling:</strong> 4 beamforming microphones, precise voice pickup.</li></ul>",
        imageDescription: "Premium over-ear wireless headphones with a matte black finish and sleek, minimal headband.",
        bulletPoints: ["Industry-leading noise cancellation", "Up to 30-hour battery life", "Touch sensor controls"],
        price: 348.00,
        subcategory: "Audio",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80"],
        stock: 120,
        attributes: { "Color": "Black", "Form Factor": "Over Ear" },
        aiTags: ["headphones", "wireless", "noise canceling", "audio", "sony", "music"],
        specifications: [{ key: "Battery Life", value: "30 Hours" }, { key: "Bluetooth", value: "5.2" }]
    },
    {
        name: "Logitech MX Master 3S",
        title: "Logitech MX Master 3S - Wireless Performance Mouse",
        brand: "Logitech",
        categorySlug: "tech",
        description: "<h3>An icon remastered</h3><p>Meet MX Master 3S – an iconic mouse remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks and an 8,000 DPI track-on-glass sensor.</p><ul><li><strong>Quiet Clicks:</strong> Deliver satisfying tactile feel with 90% less click noise.</li><li><strong>MagSpeed Scrolling:</strong> A computer mouse with remarkable speed, precision, and near silence.</li></ul>",
        imageDescription: "An ergonomic right-handed wireless mouse in graphite grey with a thumb rest and metal scroll wheel.",
        bulletPoints: ["8000 DPI, Track on glass", "Quiet Clicks", "USB-C Rechargeable"],
        price: 99.99,
        subcategory: "Accessories",
        image: "https://images.unsplash.com/photo-1527814050087-179f0011ab33?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1527814050087-179f0011ab33?w=800&q=80"],
        stock: 300,
        attributes: { "Color": "Graphite", "Connectivity": "Bluetooth, Logi Bolt" },
        aiTags: ["mouse", "wireless", "ergonomic", "productivity", "logitech", "accessories"],
        specifications: [{ key: "Sensor", value: "8000 DPI" }, { key: "Battery", value: "70 days on full charge" }]
    },
    
    // --- CLOTHING ---
    {
        name: "Levi's 501 Original",
        title: "Levi's Men's 501 Original Fit Jeans",
        brand: "Levi's",
        categorySlug: "clothing",
        description: "<h3>The original blue jean</h3><p>Since Levi Strauss invented them in 1873, the 501® Original has been a blank canvas for self-expression. A cultural icon, always original.</p><ul><li><strong>Classic Fit:</strong> Sits at waist, regular fit through thigh, straight leg.</li><li><strong>Button Fly:</strong> The iconic detail that started it all.</li></ul>",
        imageDescription: "Classic dark wash blue denim jeans folded neatly, showing the iconic copper rivets and tan leather patch.",
        bulletPoints: ["100% Cotton", "Button closure", "Machine Wash"],
        price: 59.50,
        subcategory: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"],
        stock: 500,
        attributes: { "Color": "Dark Wash", "Material": "Cotton" },
        aiTags: ["jeans", "denim", "clothing", "pants", "levis", "men's fashion", "casual"],
        specifications: [{ key: "Fit", value: "Straight Leg" }, { key: "Care", value: "Machine Wash" }]
    },
    {
        name: "The North Face Nuptse",
        title: "The North Face Men's 1996 Retro Nuptse Jacket",
        brand: "The North Face",
        categorySlug: "clothing",
        description: "<h3>Iconic Retro Design</h3><p>We've brought our iconic Nuptse design straight from the slopes of the 90s to the street. The 1996 Retro Nuptse Jacket has a boxy silhouette, original shiny ripstop fabric, iconic oversize baffles and stowable hood.</p><ul><li><strong>Warmth:</strong> 700-fill goose down offers warmth yet remains extremely compressible.</li><li><strong>Packable:</strong> Stows in right hand pocket.</li></ul>",
        imageDescription: "A thick, puffy winter jacket in a striking yellow and black two-tone colorway.",
        bulletPoints: ["700-fill goose down", "Water-repellent finish", "Stowable hood"],
        price: 280.00,
        subcategory: "Outerwear",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
        stock: 80,
        attributes: { "Color": "Yellow/Black", "Material": "Nylon, Down Fill" },
        aiTags: ["jacket", "winter", "puffer", "north face", "outerwear", "cold weather", "clothing"],
        specifications: [{ key: "Insulation", value: "700 Fill Down" }, { key: "Fit", value: "Boxy/Relaxed" }]
    },

    // --- HOME ---
    {
        name: "Dyson V15 Detect",
        title: "Dyson V15 Detect Cordless Vacuum Cleaner",
        brand: "Dyson",
        categorySlug: "home",
        description: "<h3>Dyson's most powerful, intelligent cordless vacuum</h3><p>A laser reveals microscopic dust on hard floors. A piezo sensor continuously sizes and counts dust particles – automatically increasing suction power when needed.</p><ul><li><strong>Laser dust detection:</strong> Makes invisible dust visible on hard floors.</li><li><strong>LCD screen:</strong> Shows scientific proof of a deep clean.</li></ul>",
        imageDescription: "A futuristic-looking cordless stick vacuum cleaner with a bright yellow wand and a digital display on the handle.",
        bulletPoints: ["Up to 60 minutes run time", "Laser reveals microscopic dust", "Automatically adapts suction"],
        price: 749.99,
        subcategory: "Appliances",
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80"],
        stock: 35,
        attributes: { "Color": "Yellow/Iron", "Power Source": "Battery Powered" },
        aiTags: ["vacuum", "cleaning", "home", "dyson", "cordless", "appliance", "dust"],
        specifications: [{ key: "Runtime", value: "60 mins" }, { key: "Bin Volume", value: "0.2 Gal" }]
    },
    {
        name: "Nespresso Vertuo",
        title: "Nespresso Vertuo Coffee and Espresso Machine by De'Longhi",
        brand: "Nespresso",
        categorySlug: "home",
        description: "<h3>Versatile Coffee Maker</h3><p>Brew 4 different cup sizes at the touch of a button (5 oz, 8 oz Coffee, and single and double Espresso). Pour over ice to create your favorite iced Coffee drinks.</p><ul><li><strong>Smart Coffee Maker:</strong> Centrifusion technology gently extracts coffee.</li><li><strong>Simple One-Touch:</strong> Barista grade coffee brewed simply.</li></ul>",
        imageDescription: "A sleek black capsule coffee machine with a large water reservoir and a small espresso cup sitting on the tray.",
        bulletPoints: ["Brews 4 cup sizes", "Heats up in 15 seconds", "Includes Aeroccino milk frother"],
        price: 199.00,
        subcategory: "Kitchen",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80"],
        stock: 150,
        attributes: { "Color": "Matte Black", "Material": "Plastic" },
        aiTags: ["coffee", "espresso", "machine", "kitchen", "nespresso", "caffeine", "home"],
        specifications: [{ key: "Capacity", value: "40 Fluid Ounces" }, { key: "Wattage", value: "1350 watts" }]
    },

    // --- SHOES ---
    {
        name: "Nike Air Force 1",
        title: "Nike Men's Air Force 1 '07 Basketball Shoe",
        brand: "Nike",
        categorySlug: "shoes",
        description: "<h3>Legendary Style</h3><p>The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash to make you shine.</p><ul><li><strong>Durable Leather:</strong> Stitched leather overlays on the upper add heritage style, durability and support.</li><li><strong>Nike Air Cushioning:</strong> Originally designed for performance hoops, Nike Air cushioning adds lightweight, all-day comfort.</li></ul>",
        imageDescription: "A pristine all-white leather low-top sneaker featuring the classic Nike swoosh logo on the side.",
        bulletPoints: ["100% Leather", "Rubber sole", "Padded, low-cut collar"],
        price: 110.00,
        subcategory: "Sneakers",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"],
        stock: 400,
        attributes: { "Color": "White", "Material": "Leather" },
        aiTags: ["shoes", "sneakers", "nike", "air force 1", "footwear", "white", "casual", "fashion"],
        specifications: [{ key: "Sole", value: "Rubber" }, { key: "Closure", value: "Lace-up" }]
    },
    {
        name: "Adidas Ultraboost",
        title: "adidas Men's Ultraboost 22 Running Shoe",
        brand: "adidas",
        categorySlug: "shoes",
        description: "<h3>Energy Return</h3><p>Get a little extra push. The Ultraboost running shoes serve up comfort and responsiveness at every pace and distance. The adidas PRIMEKNIT upper includes foam around the heel to prevent blisters.</p><ul><li><strong>Boost Midsole:</strong> Incredible energy return and comfort.</li><li><strong>Continental Rubber:</strong> Extraordinary traction in wet and dry conditions.</li></ul>",
        imageDescription: "A modern athletic running shoe with a textured black knit upper and a thick, textured white foam midsole.",
        bulletPoints: ["Textile upper", "Boost midsole", "Stretchweb outsole with Continental Rubber"],
        price: 190.00,
        subcategory: "Athletic",
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80"],
        stock: 220,
        attributes: { "Color": "Core Black/White", "Material": "Primeknit" },
        aiTags: ["running", "shoes", "sneakers", "adidas", "ultraboost", "athletic", "sports", "footwear"],
        specifications: [{ key: "Drop", value: "10mm" }, { key: "Weight", value: "11.7 oz" }]
    },

    // --- BOOKS ---
    {
        name: "Atomic Habits",
        title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
        brand: "Penguin Random House",
        categorySlug: "books",
        description: "<h3>Tiny Changes, Remarkable Results</h3><p>No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.</p><ul><li><strong>System for success:</strong> A proven system that can take you to new heights.</li><li><strong>Actionable advice:</strong> Learn how to make time for new habits, overcome a lack of motivation, and design your environment to make success easier.</li></ul>",
        imageDescription: "A minimalist book cover featuring the title 'Atomic Habits' in bold text with a small graphic of multiple dots forming a line.",
        bulletPoints: ["#1 New York Times Bestseller", "Over 10 million copies sold", "Practical, actionable strategies"],
        price: 13.79,
        subcategory: "Self-Help",
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80"],
        stock: 1000,
        attributes: { "Format": "Hardcover", "Language": "English" },
        aiTags: ["book", "reading", "habits", "self-help", "productivity", "psychology", "james clear"],
        specifications: [{ key: "Pages", value: "320" }, { key: "Publisher", value: "Avery" }]
    },
    {
        name: "Dune",
        title: "Dune (Dune Chronicles, Book 1)",
        brand: "Ace Books",
        categorySlug: "books",
        description: "<h3>A Sci-Fi Masterpiece</h3><p>Frank Herbert’s classic masterpiece—a triumph of the imagination and one of the bestselling science fiction novels of all time. Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the ‘spice’ melange.</p><ul><li><strong>Epic world-building:</strong> A stunningly complex political and ecological universe.</li><li><strong>Hugo and Nebula Award winner:</strong> Widely considered the greatest sci-fi novel ever written.</li></ul>",
        imageDescription: "A science fiction book cover depicting a vast desert landscape with small figures walking across sweeping sand dunes.",
        bulletPoints: ["The bestselling science fiction novel of all time", "Now a major motion picture", "First book in an epic series"],
        price: 10.99,
        subcategory: "Science Fiction",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"],
        stock: 500,
        attributes: { "Format": "Mass Market Paperback", "Language": "English" },
        aiTags: ["book", "sci-fi", "dune", "frank herbert", "fiction", "novel", "reading"],
        specifications: [{ key: "Pages", value: "896" }, { key: "Publisher", value: "Ace" }]
    },

    // --- TOYS ---
    {
        name: "LEGO Star Wars Millennium Falcon",
        title: "LEGO Star Wars Millennium Falcon 75257 Starship Building Kit",
        brand: "LEGO",
        categorySlug: "toys",
        description: "<h3>Own the iconic ship</h3><p>Inspire fans with a true icon of the Star Wars universe – the Millennium Falcon! This model starship building kit makes a great addition to any Star Wars collection.</p><ul><li><strong>Authentic details:</strong> Features rotating top and bottom gun turrets, 2 spring-loaded shooters, a lowering ramp and an opening cockpit.</li><li><strong>Includes 7 characters:</strong> Finn, Chewbacca, C-3PO, Lando Calrissian and Boolio minifigures, plus R2-D2 and D-O LEGO droid figures.</li></ul>",
        imageDescription: "A highly detailed LEGO model of the Millennium Falcon spaceship constructed with grey bricks.",
        bulletPoints: ["1351 pieces", "Measures over 5” high, 17” long and 12” wide", "Great for kids and adults"],
        price: 159.99,
        subcategory: "Building Sets",
        image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80"],
        stock: 80,
        attributes: { "Material": "Plastic", "Theme": "Star Wars" },
        aiTags: ["toy", "lego", "star wars", "millennium falcon", "building blocks", "kids", "hobby"],
        specifications: [{ key: "Age Range", value: "9+ Years" }, { key: "Pieces", value: "1351" }]
    },
    {
        name: "Nintendo Switch OLED",
        title: "Nintendo Switch – OLED Model w/ White Joy-Con",
        brand: "Nintendo",
        categorySlug: "toys",
        description: "<h3>Play anytime, anywhere</h3><p>Meet the newest member of the Nintendo Switch family. The new system features a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.</p><ul><li><strong>7-inch OLED screen:</strong> Feast your eyes on vivid colors and crisp contrast when you play on-the-go.</li><li><strong>Wide, adjustable stand:</strong> Flip out the sturdy stand for easy viewing in Tabletop mode.</li></ul>",
        imageDescription: "A sleek portable gaming console with a vibrant screen, flanked by white detachable controllers on the left and right.",
        bulletPoints: ["7-inch OLED screen", "64 GB internal storage", "Enhanced audio"],
        price: 349.99,
        subcategory: "Video Games",
        image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80"],
        stock: 200,
        attributes: { "Color": "White", "Platform": "Nintendo Switch" },
        aiTags: ["gaming", "console", "nintendo switch", "video games", "toys", "entertainment", "oled"],
        specifications: [{ key: "Storage", value: "64GB" }, { key: "Screen", value: "7-inch OLED" }]
    }
];

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log("Connected to MongoDB!");

        console.log("Clearing existing products...");
        await Product.deleteMany({});
        console.log("Database cleared of old products.");

        console.log("Seeding Amazon-style products...");
        let count = 0;
        
        for (let seed of productsSeed) {
            let catDoc = await Category.findOne({ slug: seed.categorySlug });
            if (!catDoc) {
                console.warn(`Warning: Category ${seed.categorySlug} not found.`);
                continue;
            }
            
            // Map the seed structure exactly to our Mongoose model
            const doc = { ...seed, category: catDoc._id };
            delete doc.categorySlug;
            
            // Using `new Product(doc).save()` intentionally ensures the pre('save') hook runs!
            // The pre-save hook invokes the fixed NVIDIA embedding API (via OpenAI SDK) 
            // so every seeded product will get an AI vector automatically.
            const p = new Product(doc);
            await p.save();
            console.log(`Saved product & generated embedding: ${p.title}`);
            count++;
        }

        console.log(`\n✅ Finished generating ${count} seed products successfully with AI embeddings!`);
        process.exit(0);
    } catch (e) {
        console.error("Fatal Error during generation:", e);
        process.exit(1);
    }
};

run();
