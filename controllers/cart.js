const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const Product = require("../models/product");
const verifyProductQtyModule = require("../utilities/verifyProductModule");

module.exports.showMenu = async (req, res) => {
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
	const products = await Product.find();
	res.render("cart/index", {
		products,
		days
	});
};

module.exports.addDateSaveDay = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	const date = new Date(req.body.deliveryDate);
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
	if (date.getDay() + 1 === 7 || date.getDay() + 1 === 6) {
		req.flash("error", "This day is unavailable for delivery");
		return res.redirect("/order/date");
	}
	cart.deliveryDate = req.body.deliveryDate;
	await cart.save();
	let dayOfTheWeek = days[date.getDay() + 1];
	req.session.day = dayOfTheWeek;
	req.session.save(function (err) {
		if (err) {
			console.log(err);
		}
	});
	res.redirect("/order/menu");
	return;
};
module.exports.addProductsToCart = async (req, res) => {
	const storedCart = await Cart.findById(req.session.cart);
	const products = await Product.find({ combo: req.session.day });
	let cartObj = {};
	for (let i = 0; i < storedCart.items.length; i++) {
		cartObj[storedCart.items[i].product._id] = storedCart.items[i];
	}
	if (products.length) {
		products.forEach(async (el) => {
			let itemfound = false;
			let e = cartObj[el._id];
			let i = req.body[el._id];
			if (e) {
				if (e.product._id.toString() === i._id.toString()) {
					if (
						e.specialInstructions === i.specialInstructions &&
						e.diet === i.diet
					) {
						// increment the quantity
						let x = i.qty;
						let y = e.qty;
						e.qty = parseInt(x) + parseInt(y);
						itemfound = true;
					}
				}
			}
			if (i && !itemfound) {
				storedCart.items.push({
					product: el._id,
					qty: i.qty,
					diet: i.diet,
					specialInstructions: i.specialInstructions
				});
			}
		});
		await storedCart.save();
	}
	req.flash("success", "Your order has been added to your cart.");
	res.redirect("/order/menu");
};
module.exports.finalizeCart = async (req, res) => {
	const { id } = req.params;
	const action = req.body.action;
	const storedCart = await Cart.findById(id).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});
	if (action === "checkout_button") {
		let p = 0;
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			if (i) {
				element.qty = i.qty;
				element.specialInstructions = i.specialInstructions;
				if (element.product) {
					let a = parseInt(element.qty) * parseInt(element.product.price);
					p += a;
				}
			}
		});
		storedCart.subtotal = p;
		storedCart.tax = p * 0.07;
		storedCart.totalPrice = (storedCart.subtotal + storedCart.tax).toFixed(2);

		await storedCart.save();

		res.redirect("/order/contact");
	} else if (action === "update_button") {
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
				element.specialInstructions = i.specialInstructions.trim();
			}
		});
		await storedCart.save();
		req.flash("success", "Your cart has been updated successfully.");
		res.redirect("/order/checkout");
	}
};
