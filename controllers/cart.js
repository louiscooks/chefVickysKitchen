const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const Product = require("../models/product");
const verifyProductQtyModule = require("../utilities/verifyProductModule");

module.exports.showMenu = async (req, res) => {
	req.session.startOrder = false;
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
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
	let itemfound = false;
	if (storedCart.items.length) {
		itemfound = true;
		storedCart.items.forEach(async (el) => {
			console.log("el.product._id", el.product._id);
			let i = req.body[el.product._id];
			console.log("strored cart i", i);
			if (i) {
				if (
					i.specialInstructions === el.specialInstructions &&
					i.diet === el.diet
				) {
					// increment the quantity
					let x = el.qty;
					let y = i.qty;
					el.qty = parseInt(x) + parseInt(y);
					console.log("incrementing qty by 1");
				} else {
					storedCart.items.push({
						product: i._id,
						qty: i.qty,
						diet: i.diet,
						specialInstructions: i.specialInstructions
					});
				}
			}
		});
		await storedCart.save();
	}
	if (products.length && !itemfound) {
		products.forEach(async (el) => {
			console.log("el._id", el._id);
			let i = req.body[el._id];
			console.log("i", i);
			if (i) {
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
		storedCart.totalPrice = p;
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
