const Cart = require("../models/cart");

module.exports.address = async function (req, res, next) {
	console.log("this is the session cart", req.session.cart);
	const cart = await Cart.findById(req.session.cart);
	console.log("this is the cart", cart);
	if (!cart.geometry.coordinates.length) {
		req.flash("error", "Please verify your address in order to continue.");
		res.redirect("/order");
	}
	next();
};
module.exports.deliveryDate = async function (req, res, next) {
	console.log("this is the session cart", req.session.cart);
	const cart = await Cart.findById(req.session.cart);
	console.log("this is the cart", cart);
	if (!cart.deliveryDate) {
		req.flash("error", "Please enter delivery date before continuing");
		console.log("this is current url", req.originalUrl);
		res.redirect("/order/date");
	}
	next();
};
