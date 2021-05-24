const Cart = require("../models/cart");
const Product = require("../models/product");
const verifyProductModule = async (req, res) => {
	const products = await Product.find({ combo: req.session.day });
	// create a new empty object
	const productsObj = {};
	// copy array elements to th object
	for (let i = 0; i < products.length; i++) {
		productsObj[products[i]._id] = products[i]._id;
	}
	console.log("this is productsObj", productsObj);
	const storedCart = await Cart.findById(req.session.cart);
	storedCart.items.forEach(async (el) => {
		console.log("el._id", el.product._id);
		let i = productsObj[el.product._id];
		console.log("i", i);
		if (!i) {
			req.flash(
				"error",
				"You must have at least 1 qty of each product to continue"
			);
			res.redirect("/order/checkout");
			console.log("returning true");
			return true;
		}
	});
	console.log("returning false");
	return false;
};

module.exports = verifyProductModule;