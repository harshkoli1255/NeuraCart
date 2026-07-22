const express = require('express');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', cartController.renderCart);
router.post('/add', cartController.addItem);
router.post('/:productId/update', cartController.updateItem);
router.post('/:productId/remove', cartController.removeItem);

router.get('/checkout', (req, res) => {
    res.render('checkout', {
        title: 'Secure Checkout | NeuraCart'
    });
});

module.exports = router;
