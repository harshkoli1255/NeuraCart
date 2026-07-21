const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/:categoryName", productController.getCategoryPage);

module.exports = router;
