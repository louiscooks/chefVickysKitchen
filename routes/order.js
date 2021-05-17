const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const order = require("../controllers/order");
const checkForCart = require("../middleware/checkForCart");
const returnTo = require("../middleware/returnTo");

router.get("", checkForCart, order.renderOrder);
router.post("/address", checkForCart, catchAsync(order.verifyAddress));
router.get("/date", checkForCart, returnTo, catchAsync(order.renderDate));
router.get("/menu", checkForCart, returnTo, catchAsync(order.renderMenu));
router.get(
	"/checkout",
	checkForCart,
	returnTo,
	catchAsync(order.renderCheckout)
);
router.get("/contact", returnTo, catchAsync(order.renderContact));
router.post("/add/contact", catchAsync(order.addContactAndPayment));
router.get("/review", returnTo, catchAsync(order.renderReview));
router.post("/confirmed", catchAsync(order.completeOrder));
router.get("/success", returnTo, order.orderNumber);
router.get("/history", returnTo, order.orderHistory);
router.get("/status/:id", returnTo, order.orderStatus);
router.post("/cancel/:id", order.cancelOrder);
router.post("/end", catchAsync(order.endOrder));
//admin page routes
router.get("/index", catchAsync(order.upcomingOrder));
router.get("/:id/show", order.showOrder);
router.post("/:id/status", order.changeStatus);

module.exports = router;
