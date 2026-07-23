require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const defaultCategories = [
        { name: 'Tech', slug: 'tech', icon: '💻' },
        { name: 'Clothing', slug: 'clothing', icon: '👕' },
        { name: 'Home', slug: 'home', icon: '🏡' },
        { name: 'Beauty & Care', slug: 'beauty', icon: '💄' },
        { name: 'Groceries', slug: 'groceries', icon: '🛒' },
        { name: 'Shoes', slug: 'shoes', icon: '👟' },
        { name: 'Books', slug: 'books', icon: '📚' },
        { name: 'Toys', slug: 'toys', icon: '🧸' }
    ];

    const catDocs = {};
    for (const cat of defaultCategories) {
        let doc = await Category.findOne({ name: new RegExp('^' + cat.name.replace('&', '\\&') + '$', 'i') });
        if (!doc) {
            doc = new Category(cat);
            await doc.save();
        }
        catDocs[cat.slug] = doc;
    }

    const items = [
        {
            title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            brand: "Avery",
            description: "No matter your goals, Atomic Habits offers a proven framework for improving every day.",
            price: 18.99,
            category: catDocs['books']._id,
            subcategory: "self-help",
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
            stock: 45,
            ratings: { average: 4.9, count: 1250 },
            visualColor: "blue",
            aiTags: ["book", "self-help", "habits", "bestseller"]
        },
        {
            title: "The Psychology of Money: Timeless lessons on wealth, greed, and happiness",
            brand: "Harriman House",
            description: "Doing well with money isn't necessarily about what you know. It's about how you behave.",
            price: 16.49,
            category: catDocs['books']._id,
            subcategory: "finance",
            image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80"],
            stock: 30,
            ratings: { average: 4.8, count: 980 },
            visualColor: "white",
            aiTags: ["book", "finance", "money", "investing"]
        },
        {
            title: "CeraVe Hydrating Facial Cleanser for Daily Face Washing",
            brand: "CeraVe",
            description: "Formulated with hyaluronic acid, ceramides, and glycerin.",
            price: 14.99,
            category: catDocs['beauty']._id,
            subcategory: "skincare",
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"],
            stock: 60,
            ratings: { average: 4.7, count: 540 },
            visualColor: "white",
            aiTags: ["beauty", "skincare", "cleanser"]
        },
        {
            title: "Matte Liquid Lipstick Set Long Lasting Waterproof",
            brand: "LuxeBeauty",
            description: "High-pigment matte liquid lipstick formula that glides on smooth.",
            price: 19.99,
            category: catDocs['beauty']._id,
            subcategory: "makeup",
            image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80"],
            stock: 40,
            ratings: { average: 4.6, count: 320 },
            visualColor: "red",
            aiTags: ["beauty", "lipstick", "makeup"]
        },
        {
            title: "Nike Air Max 270 Men's Running Shoes",
            brand: "Nike",
            description: "The Nike Air Max 270 delivers unmatched, all-day comfort.",
            price: 150.00,
            category: catDocs['shoes']._id,
            subcategory: "sneakers",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
            stock: 25,
            ratings: { average: 4.8, count: 810 },
            visualColor: "red",
            aiTags: ["shoes", "nike", "sneakers"]
        },
        {
            title: "Adidas Ultraboost Light Running Shoes",
            brand: "Adidas",
            description: "Experience epic energy with the new Ultraboost Light.",
            price: 140.00,
            category: catDocs['shoes']._id,
            subcategory: "sneakers",
            image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80"],
            stock: 35,
            ratings: { average: 4.7, count: 620 },
            visualColor: "black",
            aiTags: ["shoes", "adidas", "sneakers"]
        },
        {
            title: "Extra Virgin Olive Oil First Cold Pressed 1 Liter",
            brand: "OrtaBio",
            description: "100% pure extra virgin olive oil harvested from Mediterranean olive groves.",
            price: 22.50,
            category: catDocs['groceries']._id,
            subcategory: "pantry",
            image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80"],
            stock: 50,
            ratings: { average: 4.9, count: 410 },
            visualColor: "green",
            aiTags: ["groceries", "olive oil", "organic"]
        },
        {
            title: "LEGO Star Wars Millennium Falcon Building Kit",
            brand: "LEGO",
            description: "Inspire youngsters and collectors with this LEGO Star Wars model.",
            price: 159.99,
            category: catDocs['toys']._id,
            subcategory: "building sets",
            image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80",
            images: ["https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80"],
            stock: 20,
            ratings: { average: 4.9, count: 1100 },
            visualColor: "grey",
            aiTags: ["toys", "lego", "star wars"]
        }
    ];

    for (const item of items) {
        const ex = await Product.findOne({ title: item.title });
        if (!ex) {
            await new Product(item).save();
            console.log('Inserted product:', item.title);
        } else {
            console.log('Already exists:', item.title);
        }
    }

    console.log('ALL CATEGORY PRODUCTS SEEDED SUCCESSFULLY!');
    await mongoose.disconnect();
}

seed().catch(err => console.error(err));
