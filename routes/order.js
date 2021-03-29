const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const order = require("../controllers/order");
const set = require("../middleware/startOrder");
const checkForCart = require("../middleware/checkForCart");
const returnTo = require("../middleware/returnTo");
const redirect = require("../middleware/redirect");

router.get("", checkForCart, set.startOrder, order.renderOrder);
router.post("/address", checkForCart, order.verifyAddress);
router.get("/date", checkForCart, redirect.address, returnTo, order.renderDate);
router.post(
	"/add/date",
	checkForCart,
	redirect.address,
	order.addDateFindCombo
);
router.get(
	"/menu",
	checkForCart,
	redirect.deliveryDate,
	returnTo,
	catchAsync(order.renderMenu)
);
router.get(
	"/checkout",
	checkForCart,
	redirect.deliveryDate,
	returnTo,
	catchAsync(order.renderCheckout)
);
router.get("/end", set.endOrder, order.endOrder);

module.exports = router;
