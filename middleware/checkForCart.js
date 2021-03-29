const Cart = require("../models/cart");

const checkForCart = async function (req, res, next) {
	if (!req.session.cart) {
		console.log("create cart triggered");
		const cart = await new Cart();
		req.session.cart = cart._id;
		req.session.save(async function (err) {
			if (err) {
				console.log(err);
			}
			await cart.save();
			console.log("created new cart", cart);
		});
		return next();
	}
	if (req.user) {
		const cart = await Cart.findById(req.user.shoppingCart);
		console.log("this is req.user shopping cart", cart);
		if (cart._id !== req.session.cart) {
			console.log("save user cart to session triggered");
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
