const Cart = require("../models/cart");

const createCart = async function (req) {
	const cart = await new Cart();
	req.session.startOrder = true;
	req.session.cart = cart._id;
	req.session.save(async function (err) {
		if (err) {
			console.log(err);
		}
		await cart.save();
	});
	return cart;
};

const checkForCart = async function (req, res, next) {
	const cart = await Cart.findById(req.session.cart);
	if (!req.session.cart || !cart) {
		await createCart(req);
		return next();
	}
	if (req.session.cart) {
		if (cart._id.toString() !== req.session.cart) {
			req.session.cart = cart._id;
			req.session.save(async function (err) {
				if (err) {
					console.log(err);
				}
			});
			return next();
		}
	}
	return next();
};

module.exports = checkForCart;
