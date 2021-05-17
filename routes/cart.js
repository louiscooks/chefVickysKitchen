const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const checkForCart = require("../middleware/checkForCart");

const cart = require("../controllers/cart");

router.get("/menu", catchAsync(cart.showMenu));
router.post("/add/products", checkForCart, catchAsync(cart.addProductsToCart));
router.post("/add/date", checkForCart, catchAsync(cart.addDateSaveDay));
router.put("/checkout/:id", catchAsync(cart.finalizeCart));

module.exports = router;
