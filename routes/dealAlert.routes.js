const express = require("express");
const router = express.Router();
const dealAlertController = require("../controllers/dealAlert.controller");
const { ensureAuthenticated } = require("../middleware/auth");

router.post("/", ensureAuthenticated, dealAlertController.createAlert);

module.exports = router;
