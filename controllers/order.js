const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const Product = require("../models/product");

module.exports.showMenu = async (req, res) => {
	const products = await Product.find();
	res.render("orders/index", {
		products
	});
};
module.exports.showCart = async (req, res) => {
	const yourCart = req.session.cart;
	const cart = await Cart.findById(req.session.cart).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});
	res.render("orders/show", {
		cart,
		yourCart
	});
};
module.exports.addToCart = async (req, res) => {
	const { id } = req.params;
	const item = req.body.cart;
	const product = await Product.findById(id);
	const storedCart = await Cart.findById(req.session.cart);
	console.log("found storedcart", storedCart);
	itemFound = false;
	storedCart.items.forEach(async (element) => {
		if (
			product._id.toString() === element.product.toString() &&
			req.body.cart.specialInstructions === element.specialInstructions
		) {
			// increment the quantity
			element.qty++;
			itemFound = true;
			await storedCart.save();
			return;
		} else if (product._id.toString() === element.product.toString()) {
			//add another product
			storedCart.items.push({
				product: product._id,
				qty: item.qty,
				specialInstructions: item.specialInstructions
			});
			itemFound = true;
			await storedCart.save();
			return;
		}
	});
	if (!itemFound) {
		//push product in cart
		storedCart.items.push({
			product: product._id,
			qty: item.qty,
			specialInstructions: item.specialInstructions
		});
		await storedCart.save();
		console.log("pushing item in stored cart", storedCart);
	}
	res.redirect("/order/menu");
};
module.exports.finalizeCart = async (req, res) => {
	const { id } = req.params;
	const action = req.body.action;
	const storedCart = await Cart.findById(id);
	if (action === "checkout_button") {
		storedCart.items.forEach((element) => {
			let i = req.body[element._id];
			element.qty = i.qty;
			element.specialInstructions = i.specialInstructions;
			storedCart.deliveryDate = req.body.deliveryDate;
		});
		await storedCart.save();
		console.log("checking for updated price and qty", storedCart);
		res.send("checkout");
	} else if (action === "update_button") {
		console.log("storedCart before changes saved", storedCart);
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			if (!i) {
				await Cart.findByIdAndUpdate(
					id,
					{
						$pull: { items: { _id: element._id } },
						$inc: { totalQty: element.qty }
					},
					{ new: true }
				);
			} else {
				element.qty = i.qty;
				element.specialInstructions = i.specialInstructions;
				storedCart.deliveryDate = req.body.deliveryDate;
			}
		});
		await storedCart.save();
		console.log("cart saved", storedCart);
		res.redirect("/order/view-cart");
	}
};
