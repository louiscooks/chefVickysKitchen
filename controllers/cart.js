const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const Product = require("../models/product");
const getTaxAndTotal = function (subtotal) {
	let tax = subtotal * 0.07;
	let totalPrice = (subtotal + tax).toFixed(2);
	return { tax, totalPrice };
};
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
	const { id } = req.params;
	const storedCart = await Cart.findById(req.session.cart);
	const productBody = req.body.product;
	const product = await Product.findById(id);
	if (!storedCart.items.length && product) {
		let price = parseInt(productBody.qty) * parseInt(product.price);
		storedCart.items.push({
			product: product._id,
			price,
			qty: productBody.qty,
			specialInstructions: productBody.specialInstructions.trim(),
			diet: productBody.diet
		});
		storedCart.subtotal = price;
		const reciept = getTaxAndTotal(storedCart.subtotal);
		storedCart.tax = reciept.tax;
		storedCart.totalPrice = reciept.totalPrice;
		await storedCart.save();
		req.flash("success", `${product.name} has been added to your cart.`);
		res.redirect("/order/menu");
		return;
	}
	if (storedCart.items.length && product) {
		let itemfound = false;
		let p = 0;
		storedCart.items.forEach(async (el) => {
			if (product.id.toString() === el.product._id.toString()) {
				if (
					productBody.specialInstructions.trim() ===
						el.specialInstructions.trim() &&
					productBody.diet === el.diet
				) {
					// increment the quantity
					let x = productBody.qty;
					let y = el.qty;
					el.qty = parseInt(x) + parseInt(y);
					el.price = el.qty * parseInt(product.price);
					let a = x * parseInt(product.price);
					storedCart.subtotal = storedCart.subtotal + a;
					const reciept = getTaxAndTotal(storedCart.subtotal);
					storedCart.tax = reciept.tax;
					storedCart.totalPrice = reciept.totalPrice;
					itemfound = true;
				}
			}
		});
		if (!itemfound) {
			let price = parseInt(productBody.qty) * parseInt(product.price);
			storedCart.items.push({
				product: product._id,
				qty: productBody.qty,
				diet: productBody.diet,
				specialInstructions: productBody.specialInstructions.trim(),
				price
			});
			let a = productBody.qty * parseInt(product.price);
			storedCart.subtotal += a;
			const reciept = getTaxAndTotal(storedCart.subtotal);
			storedCart.tax = reciept.tax;
			storedCart.totalPrice = reciept.totalPrice;
		}
		await storedCart.save();
	}
	req.flash("success", `${product.name} has been added to your cart.`);
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
		if (parseInt(storedCart.totalPrice) < 50) {
			req.flash("error", "Your order total must be a minimum of $50");
			res.redirect("/order/checkout");
			return;
		}
		res.redirect("/order/contact");
	} else if (action === "update_button") {
		storedCart.items.forEach(async (element) => {
			let i = req.body[element._id];
			if (!i) {
				storedCart.subtotal = storedCart.subtotal - element.price;
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
				storedCart.subtotal = storedCart.subtotal - element.price;
				element.price = element.qty * parseInt(element.product.price);
				storedCart.subtotal = storedCart.subtotal + element.price;
			}
		});
		const reciept = getTaxAndTotal(storedCart.subtotal);
		storedCart.tax = reciept.tax;
		storedCart.totalPrice = reciept.totalPrice;
		await storedCart.save();
		req.flash("success", "Your cart has been updated successfully.");
		res.redirect("/order/checkout");
	}
};
