function getCartCount(cart) {
    if (!Array.isArray(cart)) return 0;

    return cart.reduce((count, item) => {
        const quantity = Number.parseInt(item.quantity, 10);
        return count + (Number.isInteger(quantity) && quantity > 0 ? quantity : 0);
    }, 0);
}

module.exports = (req, res, next) => {
    res.locals.cartCount = getCartCount(req.session && req.session.cart);
    res.locals.path = req.path;
    next();
};

module.exports.getCartCount = getCartCount;
