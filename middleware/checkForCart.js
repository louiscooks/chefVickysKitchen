const Cart = require("../models/cart");

const createCart = async function (req) {
	const cart = await new Cart();
	req.session.cart = cart._id;
	req.session.save(async function (err) {
		if (err) {
			console.log(err);
		}
		await cart.save();
		console.log("created new cart", cart);
	});
	return cart;
};

const checkForCart = async function (req, res, next) {
	const cart = await Cart.findById(req.session.cart);
	if (!req.session.cart || !cart) {
		console.log("create cart triggered");
		await createCart(req);
		return next();
	}
	if (req.session.cart) {
		if (cart._id.toString() !== req.session.cart) {
			console.log("save user cart to session triggered");
			console.log("this is cart id", typeof cart._id);
			console.log("this is the session cart id", typeof req.session.cart);
			req.session.cart = cart._id;
			req.session.save(async function (err) {
				if (err) {
					console.log(err);
				}
				console.log("user cart saved to session new cart", cart);
			});
			return next();
		}
	}
	console.log("nothing to do go ahead!");
	return next();
};

module.exports = checkForCart;
