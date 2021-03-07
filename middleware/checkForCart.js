const Cart = require("../models/cart");

const checkForCart = async function (req, res, next) {
	if (!req.session.cart || !req.user) {
		const cart = await new Cart();
		req.session.cart = cart._id;
		req.session.save(async function (err) {
			if (err) {
				console.log(err);
			}
			await cart.save();
			console.log("created new cart", cart);
			next();
		});
	} else {
		next();
	}
};

module.exports = checkForCart;
