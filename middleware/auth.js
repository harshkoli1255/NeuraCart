module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },
    ensureBuyer: function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'buyer') {
            return next();
        }
        req.flash('error_msg', 'Access denied. Buyer area only.');
        res.redirect('/');
    },
    ensureSeller: function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'seller') {
            return next();
        }
        req.flash('error_msg', 'Access denied. Seller area only.');
        res.redirect('/');
    }
};