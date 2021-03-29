const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const checkForCart = require("../middleware/checkForCart");
const set = require("../middleware/startOrder");

const cart = require("../controllers/cart");

router.get("/menu", set.endOrder, catchAsync(cart.showMenu));
router.post("/add/combo/:id", checkForCart, catchAsync(cart.addComboToCart));
router.post(
	"/add/product/:id",
	checkForCart,
	catchAsync(cart.addProductToCart)
);
router.put("/checkout/:id", catchAsync(cart.finalizeCart));

module.exports = router;
