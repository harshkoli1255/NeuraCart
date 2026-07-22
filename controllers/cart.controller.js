const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getCartCount } = require('../middleware/cart.middleware');

function getCart(req) {
    if (!Array.isArray(req.session.cart)) req.session.cart = [];
    return req.session.cart;
}

function parseQuantity(value) {
    const quantity = Number.parseInt(value, 10);
    return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
}

function wantsJson(req) {
    return req.xhr || req.get('accept')?.includes('application/json');
}

function sendCartResponse(req, res, status, payload, redirect = '/cart') {
    if (wantsJson(req)) return res.status(status).json(payload);
    if (payload.error) {
        req.flash('error_msg', payload.error);
    } else if (payload.message) {
        req.flash('success_msg', payload.message);
    }
    return res.redirect(redirect);
}

async function getDetailedCart(req) {
    const cart = getCart(req);
    const productIds = cart
        .map((item) => item.productId)
        .filter((productId) => mongoose.isValidObjectId(productId));
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productById = new Map(products.map((product) => [String(product._id), product]));
    const items = [];

    req.session.cart = cart.filter((entry) => {
        const product = productById.get(String(entry.productId));
        if (!product || product.stock < 1) return false;

        const quantity = Math.min(parseQuantity(entry.quantity), product.stock);
        items.push({ product, quantity, subtotal: product.price * quantity });
        entry.quantity = quantity;
        return true;
    });

    return items;
}

exports.renderCart = async (req, res, next) => {
    try {
        const items = await getDetailedCart(req);
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

        res.render('cart', {
            title: 'Your Cart - NeuraCart',
            items,
            subtotal,
            shipping: 0,
            total: subtotal
        });
    } catch (error) {
        next(error);
    }
};

exports.addItem = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!mongoose.isValidObjectId(productId)) {
            return sendCartResponse(req, res, 400, { success: false, error: 'Invalid product.' }, req.get('referer') || '/shop');
        }

        const product = await Product.findById(productId).select('title stock price');
        if (!product) {
            return sendCartResponse(req, res, 404, { success: false, error: 'Product not found.' }, req.get('referer') || '/shop');
        }
        if (product.stock < 1) {
            return sendCartResponse(req, res, 409, { success: false, error: `${product.title} is currently out of stock.` }, req.get('referer') || '/shop');
        }

        const cart = getCart(req);
        const quantity = parseQuantity(req.body.quantity);
        const existingItem = cart.find((item) => String(item.productId) === String(product._id));
        if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
        } else {
            cart.push({ productId: String(product._id), quantity: Math.min(quantity, product.stock) });
        }

        const cartCount = getCartCount(cart);
        return sendCartResponse(req, res, 200, {
            success: true,
            message: `${product.title} added to your cart.`,
            cartCount
        }, '/cart');
    } catch (error) {
        next(error);
    }
};

exports.updateItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const cart = getCart(req);
        const item = cart.find((entry) => String(entry.productId) === productId);
        if (!item) return sendCartResponse(req, res, 404, { success: false, error: 'Cart item not found.' });

        const product = await Product.findById(productId).select('stock');
        if (!product || product.stock < 1) {
            req.session.cart = cart.filter((entry) => String(entry.productId) !== productId);
            return sendCartResponse(req, res, 409, { success: false, error: 'This product is no longer available.' });
        }

        item.quantity = Math.min(parseQuantity(req.body.quantity), product.stock);
        return sendCartResponse(req, res, 200, {
            success: true,
            message: 'Cart updated.',
            cartCount: getCartCount(cart)
        });
    } catch (error) {
        next(error);
    }
};

exports.removeItem = (req, res) => {
    const cart = getCart(req);
    const nextCart = cart.filter((item) => String(item.productId) !== req.params.productId);
    if (nextCart.length === cart.length) {
        return sendCartResponse(req, res, 404, { success: false, error: 'Cart item not found.' });
    }

    req.session.cart = nextCart;
    return sendCartResponse(req, res, 200, {
        success: true,
        message: 'Item removed from your cart.',
        cartCount: getCartCount(nextCart)
    });
};
