const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Order = require("../models/order");
const Combo = require("../models/combo");

module.exports.showMenu = async (req, res) => {
	const products = await Product.find();
	res.render("cart/index", {
		products
	});
};
module.exports.showCart = async (req, res) => {
	const yourCart = req.session.cart;
	const cart = await Cart.findById(req.session.cart)
		.populate({
			path: "items",
			populate: {
				path: "product"
			}
		})
		.populate({
			path: "items",
			populate: {
				path: "combo",
				populate: "products"
			}
		});
	res.render("order/new/checkout", {
		cart,
		yourCart,
		req
	});
};
module.exports.addComboToCart = async (req, res) => {
	const { id } = req.params;
	const item = req.body.cart;
	const combo = await Combo.findById(id);
	const storedCart = await Cart.findById(req.session.cart);
	console.log("found storedcart", storedCart);
	itemFound = false;
	storedCart.items.forEach(async (element) => {
		if (combo._id.toString() === element.combo.toString()) {
			if (
				req.body.cart.specialInstructions === element.specialInstructions &&
				req.body.cart.diet === element.diet
			) {
				// increment the quantity
				element.qty++;
				itemFound = true;
				await storedCart.save();
				console.log("incrementing qty by 1", storedCart);
				return;
			}
		}
	});
	if (!itemFound) {
		//push product in cart
		storedCart.items.push({
			combo: combo._id,
			qty: item.qty,
			specialInstructions: item.specialInstructions,
			diet: item.diet
		});
		await storedCart.save();
		console.log("pushing item in stored cart", storedCart);
	}
	res.redirect("/order/menu?product=true");
};
module.exports.addProductToCart = async (req, res) => {
	const { id } = req.params;
	const item = req.body.cart;
	const product = await Product.findById(id);
	const storedCart = await Cart.findById(req.session.cart);
	console.log("found storedcart", storedCart);
	let itemFound = false;
	storedCart.items.forEach(async (element) => {
		if (product._id.toString() === element.product.toString()) {
			if (
				req.body.cart.specialInstructions === element.specialInstructions &&
				req.body.cart.diet === element.diet
			) {
				// increment the quantity
				element.qty++;
				itemFound = true;
				await storedCart.save();
				console.log("incrementing qty by 1", storedCart);
				return;
			}
		}
	});
	if (!itemFound) {
		//push product in cart
		storedCart.items.push({
			product: product._id,
			qty: item.qty,
			specialInstructions: item.specialInstructions,
			diet: item.diet
		});
		await storedCart.save();
		console.log("pushing item in stored cart", storedCart);
	}
	res.redirect("/order/menu?product=true");
};
module.exports.finalizeCart = async (req, res) => {
	const { id } = req.params;
	const action = req.body.action;
	const storedCart = await Cart.findById(id);
	console.log("this is req.body", req.body);
	const orderModule = async function () {
		if (req.user) {
			const order = await new Order({
				contact: { user: req.user._id },
				deliveryDate: storedCart.deliveryDate
			});
			return order;
		} else {
			const order = await new Order({
				contact: { ...req.body.user },
				deliveryDate: storedCart.deliveryDate
			});
			if (!order.contact.preferredContact)
				req.body.user.preferredContact.forEach((element) => {
					order.contact.preferredContact.push(element);
					return order;
				});
			return order;
		}
	};
	const receipt = await orderModule();
	if (action === "checkout_button") {
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			element.qty = i.qty;
			element.specialInstructions = i.specialInstructions;
			receipt.items.push(element);
		});
		await storedCart.save();

		console.log("checkedout stored cart", storedCart);
		console.log("this is order receipt", receipt);
		res.send("checkout");
	} else if (action === "update_button") {
		console.log("storedCart before changes saved", storedCart);
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			if (!i) {
				await Cart.findByIdAndUpdate(
					id,
					{
						$pull: { items: { _id: element._id } }
					},
					{ new: true }
				);
			} else {
				element.qty = i.qty;
				element.specialInstructions = i.specialInstructions;
			}
		});
		await storedCart.save();
		console.log("cart saved", storedCart);
		res.redirect("/order/checkout");
	}
};
