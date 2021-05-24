const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const Product = require("../models/product");
const verifyProductQtyModule = require("../utilities/verifyProductModule");

module.exports.showMenu = async (req, res) => {
	req.session.startOrder = false;
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
	const products = await Product.find();
	res.render("cart/index", {
		products,
		days
	});
};

module.exports.addDateSaveDay = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	console.log("adding date to combo");
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
		console.log("day is set to weekend");
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
		console.log("day of the week saved to session");
	});
	res.redirect("/order/menu");
	return;
};
module.exports.addProductsToCart = async (req, res) => {
	const storedCart = await Cart.findById(req.session.cart);
	const products = await Product.find({ combo: req.session.day });
	console.log("this is req.body", req.body);
	let cartObj = {};
	for (let i = 0; i < storedCart.items.length; i++) {
		cartObj[storedCart.items[i].product._id] = storedCart.items[i];
	}
	if (products.length) {
		console.log("adding products triggered");
		products.forEach(async (el) => {
			let itemfound = false;
			let e = cartObj[el._id];
			console.log("this is e", e);
			let i = req.body[el._id];
			console.log("this is i", i);
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
						console.log("incrementing qty by 1");
					}
				}
			}
			if (i && !itemfound) {
				console.log("pushing new item");
				storedCart.items.push({
					product: el._id,
					qty: i.qty,
					diet: i.diet,
					specialInstructions: i.specialInstructions
				});
			}
		});
		await storedCart.save();
		console.log("this is stored cart", storedCart);
		console.log("this is cartObj", cartObj);
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
	if (await verifyProductQtyModule(req, res)) {
		console.log("ending code here");
		return;
	}
	console.log("ending continuing code");
	console.log("this is req.body", req.body);
	if (action === "checkout_button") {
		let p = 0;
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			console.log("this is i saving final changes before", i);
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
		console.log("checkedout stored cart", storedCart);
		res.redirect("/order/contact");
	} else if (action === "update_button") {
		console.log("storedCart before changes saved", storedCart);
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			console.log("this is i", i);
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
		console.log("cart saved", storedCart);
		req.flash("success", "Your cart has been updated successfully.");
		res.redirect("/order/checkout");
	}
};
