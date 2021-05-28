const Cart = require("../models/cart");

const resetCart = async (req, res, next) => {
	if (req.session.startOrder) {
		req.session.startOrder = false;
	}
	if (req.session.cart) {
		const cart = await Cart.findByIdAndDelete(req.session.cart);
		req.session.cart = null;
	}
	next();
};

module.exports = resetCart;
