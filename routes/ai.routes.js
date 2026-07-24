const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Chat endpoint for the floating AI assistant
router.post('/chat', aiController.handleChat);

// Summary endpoint for product reviews
router.get('/product/:id/summary', aiController.getProductSummary);

// Q&A endpoint for specific product
router.post('/product/:id/qa', aiController.getProductQa);

module.exports = router;
