const express = require('express');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', cartController.renderCart);
router.post('/add', cartController.addItem);
router.post('/:productId/update', cartController.updateItem);
router.post('/:productId/remove', cartController.removeItem);

router.get('/checkout', ensureAuthenticated, cartController.renderCheckout);
router.post('/checkout', ensureAuthenticated, cartController.createCheckoutSession);
router.get('/checkout/success', ensureAuthenticated, cartController.renderCheckoutSuccess);
router.get('/checkout/cancel', ensureAuthenticated, cartController.renderCheckoutCancel);

// Order actions
router.post('/orders/:orderId/cancel', ensureAuthenticated, cartController.cancelOrder);

module.exports = router;

