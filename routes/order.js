const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const order = require("../controllers/order");
const checkForCart = require("../middleware/checkForCart");
const returnTo = require("../middleware/returnTo");
const resetCart = require("../middleware/resetCart");
const checkForAdmin = require("../middleware/checkForAdmin");
const {
	validateAddress,
	validateContact
} = require("../middleware/validateSchema");

router.get("", checkForCart, returnTo, order.renderOrder);
router.post("/start", order.startOrder);
router.post("/end", catchAsync(order.endOrder));
router.post(
	"/address",
	checkForCart,
	validateAddress,
	catchAsync(order.verifyAddress)
);
router.get("/date", checkForCart, returnTo, catchAsync(order.renderDate));
router.get("/menu", checkForCart, returnTo, catchAsync(order.renderMenu));
router.get(
	"/checkout",
	checkForCart,
	returnTo,
	catchAsync(order.renderCheckout)
);
router.get("/contact", returnTo, catchAsync(order.renderContact));
router.post(
	"/add/contact",
	validateContact,
	catchAsync(order.addContactAndPayment)
);
router.get("/review", returnTo, catchAsync(order.renderReview));
router.post("/confirmed", catchAsync(order.completeOrder));
router.get("/success", returnTo, catchAsync(order.orderNumber));
router.get("/history", resetCart, returnTo, catchAsync(order.orderHistory));
router.get("/status/:id", resetCart, returnTo, catchAsync(order.orderStatus));
router.post("/cancel/:id", order.cancelOrder);

//admin page routes
router.get(
	"/index",
	catchAsync(checkForAdmin),
	returnTo,
	catchAsync(order.upcomingOrder)
);
router.get(
	"/:id/show",
	catchAsync(checkForAdmin),
	returnTo,
	catchAsync(order.showOrder)
);
router.post(
	"/:id/status",
	catchAsync(checkForAdmin),
	catchAsync(order.changeStatus)
);

module.exports = router;
