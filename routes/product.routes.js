const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// Normal product listing and details
router.get("/", productController.getAllProducts);
router.get("/:id/recommendations", productController.getSimilarProductsAI);
router.get("/:id", productController.getProductById);

// AI Search Endpoint
router.post("/ai-search", productController.aiSearch);

// Reviews
router.post("/:id/review", productController.addReview);

module.exports = router;
