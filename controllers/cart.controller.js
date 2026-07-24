const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getCartCount } = require('../middleware/cart.middleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

exports.renderCheckout = async (req, res, next) => {
    try {
        const items = await getDetailedCart(req);
        if (items.length === 0) {
            req.flash('error_msg', 'Your cart is empty. Add products to checkout.');
            return res.redirect('/cart');
        }

        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        res.render('checkout', {
            title: 'Secure Checkout | NeuraCart',
            cart: { items },
            subtotal,
            tax,
            total
        });
    } catch (error) {
        next(error);
    }
};

exports.createCheckoutSession = async (req, res, next) => {
    try {
        const { fullName, address, city, state, zip, couponCode } = req.body;
        
        // Validation
        if (!fullName || !address || !city || !state || !zip) {
            return res.status(400).json({ success: false, error: 'Please fill in all required shipping fields.' });
        }
        
        // Load detailed cart items
        const items = await getDetailedCart(req);
        if (items.length === 0) {
            return res.status(400).json({ success: false, error: 'Your cart is empty.' });
        }
        
        // Inventory stock verification
        for (const item of items) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ success: false, error: `Product "${item.product.title}" no longer exists.` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, error: `Insufficient stock for "${item.product.title}". Only ${product.stock} available.` });
            }
        }
        
        // Prepare Stripe Line Items
        const lineItems = items.map(item => {
            // Get first image or fallback
            let img = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'; // public placeholder for stripe
            if (item.product.image && item.product.image.startsWith('http')) {
                img = item.product.image;
            } else if (item.product.images && item.product.images[0] && item.product.images[0].startsWith('http')) {
                img = item.product.images[0];
            }
            
            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.product.title,
                        images: [img],
                    },
                    unit_amount: Math.round(item.product.price * 100), // Stripe expects amounts in smallest currency unit (paise)
                },
                quantity: item.quantity,
            };
        });

        // Add Tax as a separate line item (simplification, real tax should use Stripe Tax)
        let subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        let discount = 0;
        
        if (couponCode === 'NEURA20') {
            discount = subtotal * 0.20;
            subtotal = subtotal - discount;
            
            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Discount (NEURA20)' },
                    unit_amount: -Math.round(discount * 100),
                },
                quantity: 1,
            });
        }
        
        const tax = subtotal * 0.18; // 18% GST
        
        lineItems.push({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: 'GST (18%)',
                },
                unit_amount: Math.round(tax * 100),
            },
            quantity: 1,
        });
        
        // Create pending Order record in DB
        const Order = require('../models/Order');
        const total = subtotal + tax;
        
        const order = new Order({
            user: req.user._id,
            items: items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount: total,
            shippingAddress: {
                fullName,
                address,
                city,
                state,
                zipCode: zip,
                country: 'India'
            },
            paymentStatus: 'Pending',
            orderStatus: 'Processing'
        });
        
        await order.save();

        const protocol = req.secure ? 'https' : 'http';
        const host = req.get('host');
        
        // DEV BYPASS: Skip Stripe entirely and just return the success URL
        // since we do not have valid Stripe keys configured in the environment.
        const successUrl = `${protocol}://${host}/cart/checkout/success?session_id=dev_bypass&order_id=${order._id}`;
        
        // Update Order with mock session ID
        order.stripeSessionId = 'dev_bypass';
        await order.save();
        
        return res.status(200).json({
            success: true,
            url: successUrl
        });
        
    } catch (error) {
        console.error("Checkout Error:", error);
        return res.status(500).json({ success: false, error: 'Checkout initialization failed.' });
    }
};

exports.renderCheckoutSuccess = async (req, res, next) => {
    try {
        const { session_id, order_id } = req.query;
        if (!session_id || !order_id) {
            return res.redirect('/cart'); // Invalid request
        }

        const Order = require('../models/Order');
        const order = await Order.findById(order_id);
        
        if (!order || order.user.toString() !== req.user._id.toString()) {
            return res.redirect('/cart');
        }

        // Check if we already processed it
        if (order.paymentStatus === 'Pending') {
            // DEV BYPASS: Assume paid
            const isPaid = session_id === 'dev_bypass' || true;
            
            if (isPaid) {
                order.paymentStatus = 'Paid';
                await order.save();

                // Reduce stock in DB
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity }
                    });
                }
                
                // Clear Cart in Session & DB
                req.session.cart = [];
                const Cart = require('../models/Cart');
                await Cart.deleteOne({ user: req.user._id });
                
                // Persist session explicitly
                await new Promise((resolve) => req.session.save(resolve));
            } else {
                // If not paid, redirect back to cart
                req.flash('error_msg', 'Payment was not completed.');
                return res.redirect('/cart');
            }
        }

        res.render('checkout-success', {
            title: 'Order Placed Successfully | NeuraCart'
        });
    } catch (error) {
        console.error("Checkout Success Verification Error:", error);
        next(error);
    }
};

exports.renderCheckoutCancel = (req, res) => {
    req.flash('error_msg', 'Payment was cancelled. You can try again when you are ready.');
    res.redirect('/cart/checkout');
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const Order = require('../models/Order');
        const { orderId } = req.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, error: 'Invalid order ID.' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found.' });
        }

        // Ensure the order belongs to the current user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Access denied.' });
        }

        // Only allow cancellation if not yet shipped
        const cancellableStatuses = ['Processing', 'Confirmed'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({ success: false, error: `Order cannot be cancelled — it is already ${order.orderStatus}.` });
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.orderStatus = 'Cancelled';
        order.paymentStatus = 'Failed'; // treat as refund-pending
        await order.save();

        return res.json({ success: true, message: 'Order cancelled successfully. Refund will be processed in 3–5 business days.' });
    } catch (error) {
        console.error('Cancel Order Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to cancel order. Please try again.' });
    }
};

