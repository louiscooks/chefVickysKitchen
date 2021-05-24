const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Order = require("../models/order");
const User = require("../models/user");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const formatPhoneNumber = require("../utilities/formatNumber");
const priceFormatter = require("../utilities/priceFormatter");
const {
	redirectToAddress,
	redirectToCheckout,
	redirectToContact,
	redirectToDelivery,
	redirectToReview
} = require("../utilities/redirect");
const Product = require("../models/product");

//routes for proccessing the order
module.exports.startOrder = (req, res) => {
	req.session.startOrder = true;
	req.session.save(function (err) {
		if (err) {
			console.log(err);
		}
	});
	return res.redirect("/order");
};
module.exports.renderOrder = function (req, res) {
	res.render("order/new/order");
};
module.exports.verifyAddress = async function (req, res) {
	const geoData = await geocoder
		.forwardGeocode({
			query: `${req.body.address.street}, ${req.body.address.zipcode}`,
			limit: 1
		})
		.send();
	const cart = await Cart.findById(req.session.cart);
	cart.location = req.body.address;
	cart.geometry = geoData.body.features[0].geometry;
	await cart.save();
	console.log("this is the cart with address", cart);
	res.redirect("/order/date");
};
module.exports.renderDate = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	if (redirectToAddress(cart, req, res)) {
		return;
	}
	//creating the mindate to restrict date input
	const date = new Date(Date.now());
	console.log("this is date", date);
	let day = date.getDate() + 2;
	const monthModule = function (day) {
		if (day > 31) {
			const month = date.getMonth() + 2;
			return month;
		}
		const month = date.getMonth() + 1;
		return month;
	};
	let month = monthModule(day);
	let year = date.getFullYear();
	if (month < 10) month = "0" + month.toString();
	if (day < 10) day = "0" + day.toString();
	if (day === 32) day = "01";
	if (day === 32) day = "02";
	let minDate = year + "-" + month + "-" + day;
	console.log("this is min date", minDate);
	res.render("order/new/date", {
		minDate
	});
};

module.exports.renderMenu = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	if (redirectToDelivery(cart, req, res)) {
		return;
	}
	const combo = req.session.day;
	const products = await Product.find({ combo });
	res.render("order/new/menu", {
		products
	});
};
module.exports.renderContact = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	if (redirectToCheckout(cart, req, res)) {
		return;
	}
	res.render("order/new/contact", {
		cart,
		priceFormatter
	});
};
module.exports.addContactAndPayment = async function (req, res) {
	const { firstname, lastname, phoneNumber, email, preferredContact } =
		req.body.user;
	const cart = await Cart.findByIdAndUpdate(
		req.session.cart,
		{
			contact: { firstname, lastname, email }
		},
		{ new: true }
	);
	if (phoneNumber.length) {
		const userNumber = formatPhoneNumber(phoneNumber);
		cart.contact.phoneNumber = userNumber;
	}
	if (req.user) {
		cart.contact.user = req.user._id;
	}
	if (typeof preferredContact === typeof "string") {
		console.log("string");
		const arr = [];
		arr.push(preferredContact);
		cart.contact.preferredContact = arr;
	}
	if (typeof preferredContact === typeof ["array"]) {
		console.log("array");
		cart.contact.preferredContact = preferredContact;
	}
	await cart.save();
	console.log("this is cart with contact", cart);
	res.redirect("/order/review");
};
module.exports.renderReview = async function (req, res) {
	const cart = await Cart.findById(req.session.cart)
		.populate({
			path: "contact",
			populate: {
				path: "user"
			}
		})
		.populate({
			path: "items",
			populate: {
				path: "product"
			}
		});
	if (redirectToContact(cart, req, res)) {
		return;
	}
	res.render("order/new/review", { cart, priceFormatter, formatPhoneNumber });
};
module.exports.completeOrder = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	console.log("this is the cart", cart);
	const order = await new Order({
		items: cart.items,
		status: "pending",
		contact: cart.contact,
		deliveryDate: cart.deliveryDate,
		location: cart.location,
		geometry: cart.geometry,
		totalPrice: cart.totalPrice,
		subtotal: cart.subtotal,
		tax: cart.tax
	});
	await order.save();
	console.log("this is order completed", order);
	if (req.user) {
		const user = await User.findById(req.user._id);
		user.orders.push(order._id);
		await user.save();
		console.log("this is user with order saved to it", user);
	}
	req.session.recentOrder = order._id;
	req.session.save(async function (err) {
		if (err) {
			console.log(err);
		}
		await cart.deleteOne();
		console.log("cart has been deleted!!");
	});
	req.flash("success", "Your order has been submitted!");
	res.redirect("/order/success");
};
module.exports.orderNumber = async (req, res) => {
	req.session.startOrder = false;
	const order = await Order.findById(req.session.recentOrder)
		.populate({
			path: "contact",
			populate: {
				path: "user"
			}
		})
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
	if (redirectToReview(order, req, res)) {
		return;
	}
	if (!order.contact.user && req.user) {
		console.log("adding contact.user && user.push(order) triggered!!");
		order.contact.user === req.user._id;
		await order.save();
		const user = await User.findById(req.user._id);
		user.orders.push(order._id);
		await user.save();
		console.log("this is user with order added", user);
		console.log("this is order with contact.user added added", order);
	}
	res.render("order/show/success", {
		order
	});
};
module.exports.cancelOrder = async (req, res) => {
	const { id } = req.params;
	const order = await Order.findByIdAndDelete(id);
	//remove order from user.orders list
	const user = await User.findById(req.user._id);
	for (let i = 0; i < user.orders.length; i++) {
		const x = id;
		const y = user.orders[i];
		if (x === y.toString()) {
			console.log("match found");
			user.orders.splice(i, 1);
		}
		console.log("no match");
	}
	await user.save();
	req.flash("success", "Your order has been cancelled!");
	res.redirect("/order/history");
};
module.exports.renderCheckout = async (req, res) => {
	const cart = await Cart.findById(req.session.cart).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});
	console.log("this is cart", cart);
	if (redirectToAddress(cart, req, res)) {
		return;
	}
	if (redirectToDelivery(cart, req, res)) {
		return;
	}
	res.render("order/new/checkout", {
		cart
	});
};
module.exports.endOrder = async function (req, res) {
	const cart = await Cart.findByIdAndDelete(req.session.cart);
	req.session.startOrder = false;
	req.session.save(function (err) {
		if (err) {
			console.log(err);
		}
	});
	req.flash("error", "Your order has been cancelled");
	return res.redirect("/cart/menu");
};

//customer route to view order history
module.exports.orderHistory = async (req, res) => {
	if (req.user) {
		const user = await User.findById(req.user._id).populate("orders");
		res.render("order/show/history", { user });
	}
};
module.exports.orderStatus = async (req, res) => {
	const { id } = req.params;
	const order = await Order.findById(id)
		.populate({
			path: "contact",
			populate: {
				path: "user"
			}
		})
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
	res.render("order/show/status", { order });
};

//admin order management routes
module.exports.upcomingOrder = async function (req, res) {
	console.log("this is req.query", req.query);
	if (req.query.querySearch) {
		const { querySearch } = req.query;
		const orders = await Order.findById(querySearch).populate({
			path: "contact",
			populate: {
				path: "user"
			}
		});
		if (!orders) {
			req.flash("error", "Order can not be found.");
			return;
		} else {
			console.log("this is orders query", orders);
			res.render("admin/order/index", { orders, dateFormat });
			return;
		}
	}
	if (req.query.status) {
		const { status } = req.query;
		const orders = await Order.find({ status }).populate({
			path: "contact",
			populate: {
				path: "user"
			}
		});
		res.render("admin/order/index", { orders, dateFormat });
		return;
	} else {
		const orders = await Order.find().populate({
			path: "contact",
			populate: {
				path: "user"
			}
		});
		res.render("admin/order/index", { orders, dateFormat });
	}
};
module.exports.showOrder = async function (req, res) {
	const { id } = req.params;
	const order = await Order.findById(id)
		.populate({
			path: "items",
			populate: {
				path: "product"
			}
		})
		.populate({
			path: "contact",
			populate: {
				path: "user"
			}
		});
	res.render("admin/order/show", {
		order,
		priceFormatter
	});
};
module.exports.changeStatus = async function (req, res) {
	const { id } = req.params;
	const order = await Order.findById(id);
	if (req.body.action === "approved") {
		order.status = "approved";
		await order.save();
		req.flash("success", "order has been approved");
	}
	if (req.body.action === "completed") {
		order.status = "completed";
		await order.save();
		req.flash("success", "order has been completed");
	}
	if (req.body.action === "decline") {
		console.log("decline");
		if (order.contact.user) {
			order.status = "denied";
			await order.save();
			req.flash("success", "order has been denied");
		} else {
			await order.deleteOne();
			req.flash("success", "no user account, order has been deleted");
		}
	}
	res.redirect("/order/index");
};
