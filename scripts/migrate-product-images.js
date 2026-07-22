#!/usr/bin/env node

/**
 * Copies reachable external product images into Cloudinary and updates the
 * catalog with the resulting secure URLs. Run with --apply to write changes;
 * without it, the script only reports what would be migrated.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const shouldApply = process.argv.includes('--apply');
const isCloudinaryUrl = (url) => typeof url === 'string' && url.includes('res.cloudinary.com');

async function migrateProduct(product) {
    if (!product.image || isCloudinaryUrl(product.image)) return { status: 'skipped' };

    if (!shouldApply) return { status: 'pending', title: product.title };

    try {
        const upload = await cloudinary.uploader.upload(product.image, {
            folder: 'neuracart/products',
            public_id: String(product._id),
            overwrite: true,
            resource_type: 'image',
            transformation: [{ width: 1200, height: 900, crop: 'limit', fetch_format: 'auto', quality: 'auto' }]
        });

        product.image = upload.secure_url;
        product.images = [upload.secure_url];
        await product.save();
        return { status: 'migrated', title: product.title };
    } catch (error) {
        return { status: 'failed', title: product.title, reason: error.message };
    }
}

async function run() {
    if (!isConfigured()) throw new Error('Cloudinary environment variables are not configured.');

    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find().select('title image images');
    const results = [];

    for (const product of products) results.push(await migrateProduct(product));

    const summary = results.reduce((counts, result) => {
        counts[result.status] = (counts[result.status] || 0) + 1;
        return counts;
    }, {});
    console.log(JSON.stringify({ mode: shouldApply ? 'apply' : 'dry-run', summary, failures: results.filter((result) => result.status === 'failed') }, null, 2));
}

run()
    .catch((error) => {
        console.error(`Image migration failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => mongoose.disconnect());
