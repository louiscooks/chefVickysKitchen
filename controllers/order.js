const dateFormat = require("../date/DateFormat");
const Cart = require("../models/cart");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Order = require("../models/order");
const User = require("../models/user");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const Message = require("../nodemailer/message");
const sendMail = require("../nodemailer/index");
const formatPhoneNumber = require("../utilities/formatNumber");

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
	res.redirect("/order");
	return;
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

	res.redirect("/order/date");
};
module.exports.renderDate = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	if (redirectToAddress(cart, req, res)) {
		return;
	}
	//creating the mindate to restrict date input
	const date = new Date(Date.now());
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
	if (day === 33) day = "02";
	let minDate = year + "-" + month + "-" + day;
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
		cart
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
		const arr = [];
		arr.push(preferredContact);
		cart.contact.preferredContact = arr;
	}
	if (typeof preferredContact === typeof ["array"]) {
		cart.contact.preferredContact = preferredContact;
	}
	await cart.save();
	res.redirect("/order/review");
};
module.exports.renderReview = async function (req, res) {
	const cart = await Cart.findById(req.session.cart).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});
	if (redirectToContact(cart, req, res)) {
		return;
	}
	res.render("order/new/review", { cart, formatPhoneNumber });
};
module.exports.completeOrder = async function (req, res) {
	const cart = await Cart.findById(req.session.cart);
	if (parseInt(cart.totalPrice) < 50) {
		req.flash("error", "Your order total must be a minimum of $50");
		res.redirect("/order/review");
		return;
	}
	const order = await new Order({
		items: cart.items,
		status: "pending",
		location: cart.location,
		deliveryDate: cart.deliveryDate,
		totalPrice: cart.totalPrice,
		subtotal: cart.subtotal,
		tax: cart.tax,
		contact: cart.contact,
		geometry: cart.geometry
	});
	await order.save();
	if (req.user) {
		const user = await User.findById(req.user._id);
		user.orders.push(order._id);
		await user.save();
	}
	req.session.startOrder = false;
	req.session.recentOrder = order._id;
	req.session.save(async function (err) {
		if (err) {
			console.log(err);
		}
		await cart.deleteOne();
	});
	const message = new Message(
		order.contact.email,
		"Chef Vickys Kitchen: Your order has been submitted successfully",
		"<h1>We have received your order!</h1><p>We are now reviewing your order to make everything is accurate.<br>Once your order is confirmed we will contact you via email and by phone to process you payment.<br>If you would like to view your order status or cancel you will have to login or email info@chefvickyskitchen.com</p>"
	);
	sendMail(message);
	req.flash("success", "Your order has been submitted!");
	res.redirect("/order/success");
};
module.exports.orderNumber = async (req, res) => {
	const order = await Order.findById(req.session.recentOrder).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});
	if (redirectToReview(order, req, res)) {
		return;
	}
	if (!order.contact.user && req.user) {
		order.contact.user === req.user._id;
		await order.save();
		const user = await User.findById(req.user._id);
		user.orders.push(order._id);
		await user.save();
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
			user.orders.splice(i, 1);
		}
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
	const order = await Order.findById(id).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});

	res.render("order/show/status", { order });
};

//admin order management routes
module.exports.upcomingOrder = async function (req, res) {
	if (req.query.querySearch) {
		const { querySearch } = req.query;
		const orders = await Order.findById(querySearch);

		if (!orders) {
			req.flash("error", "Order can not be found.");
			return;
		} else {
			res.render("admin/order/index", { orders, dateFormat });
			return;
		}
	}
	if (req.query.status) {
		const { status } = req.query;
		const orders = await Order.find({ status });
		res.render("admin/order/index", { orders, dateFormat });
		return;
	} else {
		const orders = await Order.find();
		res.render("admin/order/index", { orders, dateFormat });
	}
};
module.exports.showOrder = async function (req, res) {
	const { id } = req.params;
	const order = await Order.findById(id).populate({
		path: "items",
		populate: {
			path: "product"
		}
	});
	res.render("admin/order/show", {
		order
	});
};
module.exports.changeStatus = async function (req, res) {
	const { id } = req.params;
	const order = await Order.findById(id);
	if (req.body.action === "approved") {
		order.status = "approved";
		await order.save();
		req.flash("success", "order has been approved");
		const message = new Message(
			order.contact.email,
			"Chef Vickys Kitchen: Your order has been confirmed",
			"<h1>We will be processing your payment!</h1><p>Your order is now confirmed. If you would like to view your order status or have an inquiry,<br> you will have to login on our site or email info@chefvickyskitchen.com</p>"
		);
		sendMail(message);
	}
	if (req.body.action === "completed") {
		order.status = "completed";
		await order.save();
		req.flash("success", "order has been completed");
		const message = new Message(
			order.contact.email,
			"Chef Vickys Kitchen: Thank you for ordering with us!",
			"<h1>Thank you for ordering from Chef Vickys Kitchen!</h1><p>We hope that you have enjoyed your service. Please, return to our site to order again.<br>If you have an inquiry you can contact us through our site or email info@chefvickykitchen.com</p>"
		);
		sendMail(message);
	}
	if (req.body.action === "decline") {
		if (order.contact.user) {
			order.status = "denied";
			await order.save();
			req.flash("success", "order has been denied");
		} else {
			await order.deleteOne();
			req.flash("success", "no user account, order has been deleted");
		}
		const message = new Message(
			order.contact.email,
			"Chef Vickys Kitchen: Your order has been denied",
			"<h1>Sorry for the inconvenience.</h1><p>Your order has been denied. if you have and questions email info@chefvickyskitchen.com.<br> Be sure to include the order number, date submitted,and full name in your email to better assist you.</p>"
		);
		sendMail(message);
	}

	res.redirect("/order/index");
};
