const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const checkForCart = require("../middleware/checkForCart");

const order = require("../controllers/order");

router.get("/menu", checkForCart, catchAsync(order.showMenu));
router.get("/view-cart", checkForCart, catchAsync(order.showCart));
router.post("/add/:id", checkForCart, catchAsync(order.addToCart));
router.put("/checkout/:id", catchAsync(order.finalizeCart));

module.exports = router;
