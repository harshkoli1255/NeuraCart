require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Heavily enriched dataset specifically designed for the AI Assistant feature.
// It includes detailed pros, cons, and highly structured specifications for comparisons.
const aiRichProducts = [
    {
        name: "Echo Dot 5th Gen",
        title: "Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa",
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
        specifications: [{ key: "Dimensions", value: "3.9 x 3.9 x 3.5 in" }, { key: "Weight", value: "304g" }],
        pros: ["Excellent voice recognition", "Compact and unobtrusive design", "Deep integration with smart home ecosystems", "Affordable entry into smart home audio"],
        cons: ["Bass can be overpowering at high volumes", "Requires constant power connection", "No 3.5mm audio out jack"],
        ratings: { average: 4.6, count: 12450 }
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
        specifications: [{ key: "Screen Size", value: "13.6 Inches" }, { key: "CPU", value: "Apple M2" }, { key: "Battery Life", value: "Up to 18 hours" }],
        pros: ["Industry-leading battery life", "Incredibly thin and lightweight", "Stunning Liquid Retina display", "Silent, fanless design"],
        cons: ["Base model has slower SSD speeds", "Only two USB-C ports", "Not ideal for heavy 3D rendering"],
        ratings: { average: 4.8, count: 8302 }
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
        specifications: [{ key: "Battery Life", value: "30 Hours" }, { key: "Bluetooth", value: "5.2" }, { key: "Weight", value: "250g" }],
        pros: ["Class-leading active noise cancellation (ANC)", "Exceptional audio clarity and bass response", "Extremely comfortable for long listening sessions", "Excellent microphone quality for calls"],
        cons: ["Design does not fold down completely", "Expensive price point", "Not fully water or sweat resistant"],
        ratings: { average: 4.7, count: 15200 }
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
        specifications: [{ key: "Sensor", value: "8000 DPI" }, { key: "Battery", value: "70 days on full charge" }],
        pros: ["Unmatched ergonomic comfort for right-handed users", "Ultra-fast and precise MagSpeed scroll wheel", "Nearly silent click mechanism", "Seamlessly control multiple computers simultaneously"],
        cons: ["Not suitable for left-handed users", "Heavier than typical travel or gaming mice", "Premium price tag"],
        ratings: { average: 4.9, count: 21040 }
    },
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
        specifications: [{ key: "Fit", value: "Straight Leg" }, { key: "Care", value: "Machine Wash" }],
        pros: ["Timeless, classic aesthetic that never goes out of style", "Extremely durable 100% cotton denim", "Versatile straight leg fit suits most body types"],
        cons: ["100% cotton takes time to break in", "Button fly can be cumbersome compared to zippers", "May shrink slightly after first wash"],
        ratings: { average: 4.5, count: 54000 }
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
        specifications: [{ key: "Insulation", value: "700 Fill Down" }, { key: "Fit", value: "Boxy/Relaxed" }],
        pros: ["Exceptional warmth-to-weight ratio", "Packs down into its own pocket for easy travel", "Highly durable water-repellent (DWR) finish", "Iconic streetwear styling"],
        cons: ["Boxy fit might not appeal to everyone", "Can be too warm for mild winter days", "High price point for a casual jacket"],
        ratings: { average: 4.7, count: 3200 }
    },
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
        specifications: [{ key: "Runtime", value: "60 mins" }, { key: "Bin Volume", value: "0.2 Gal" }],
        pros: ["Laser illumination highlights microscopic dust", "Incredible suction power for a cordless vacuum", "LCD screen gamifies cleaning by showing dust stats", "Automatically adjusts power based on floor type"],
        cons: ["Very expensive", "Battery life drops significantly on Boost mode", "Requires holding the trigger down continuously"],
        ratings: { average: 4.8, count: 6500 }
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
        specifications: [{ key: "Capacity", value: "40 Fluid Ounces" }, { key: "Wattage", value: "1350 watts" }],
        pros: ["Brews excellent crema-rich coffee and espresso", "Incredibly simple one-touch operation", "Barcode scanning optimizes brew settings automatically", "Fast 15-second heat up time"],
        cons: ["Locked into buying proprietary Nespresso pods", "Pods are more expensive than traditional coffee", "Can be noisy during the extraction process"],
        ratings: { average: 4.6, count: 18900 }
    }
];

const clientPromise = require('../config/database');

clientPromise.then(async (client) => {
    try {
        console.log("Connected to MongoDB via DoH bypass.");
        
        console.log("Wiping existing products to prep for AI overhaul...");
        await Product.deleteMany({});
        console.log("✅ Database cleared of old products.");

        console.log("Seeding rich AI-optimized products...");
        let count = 0;
        
        for (let seed of aiRichProducts) {
            let catDoc = await Category.findOne({ slug: seed.categorySlug });
            if (!catDoc) {
                console.warn(`Warning: Category ${seed.categorySlug} not found. Skipping.`);
                continue;
            }
            
            const doc = { ...seed, category: catDoc._id };
            delete doc.categorySlug;
            
            // The pre('save') hook handles NVIDIA vector embedding generation!
            const p = new Product(doc);
            await p.save();
            console.log(`Saved product & generated embedding: ${p.title}`);
            count++;
        }

        console.log(`\n✅ Successfully injected ${count} hyper-detailed AI products into the database!`);
        process.exit(0);
    } catch (e) {
        console.error("Fatal Error during generation:", e);
        process.exit(1);
    }
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
});
