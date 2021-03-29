const Combo = require("../models/combo");
const Product = require("../models/product");
const dateFormat = require("../date/DateFormat");
const cart = require("./cart");
const Cart = require("../models/cart");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.renderOrder = function (req, res) {
	res.render("order/new/order");
};
module.exports.verifyAddress = async function (req, res) {
	console.log("this is req.session.cart in verify route", req.session.cart);
	console.log("this is req.body.address", req.body.address);
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
	console.log("this is the cart", cart);
	res.redirect("/order/date");
};
module.exports.renderMenu = async function (req, res) {
	const query = req.query.product;
	const combo = await Combo.findById(req.session.combo).populate("products");
	const products = await Product.find();
	res.render("order/new/menu", {
		combo,
		query
	});
};
module.exports.renderDate = async function (req, res) {
	const combos = await Combo.find();
	//creating the mindate to restrict date input
	const date = new Date(Date.now());
	console.log("this is date", date);
	let month = date.getMonth() + 1;
	let day = date.getDate() + 2;
	let year = date.getFullYear();
	if (month < 10) month = "0" + month.toString();
	if (day < 10) day = "0" + day.toString();

	let minDate = year + "-" + month + "-" + day;
	res.render("order/new/date", {
		cart,
		combos,
		minDate
	});
};
module.exports.addDateFindCombo = async function (req, res) {
	const date = new Date(req.body.deliveryDate);
	const deliveryDate = req.body.deliveryDate;
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
	let name = days[date.getDay() + 1];
	console.log("this is session cart", req.session.cart);
	const cart = await Cart.findByIdAndUpdate(
		req.session.cart,
		{ deliveryDate },
		{ new: true }
	);
	const combo = await Combo.findOne({ name });
	console.log("this is cart updated", cart);
	console.log("this is combo", combo);
	if (combo) {
		console.log("combo saved to session triggered");
		req.session.combo = combo._id;
		req.session.save(function (err) {
			if (err) {
				console.log(err);
			}
			console.log("this is req.session.userCombo", req.session.userCombo);
		});
		return res.redirect("/order/menu");
	}
};
module.exports.renderCheckout = cart.showCart;
module.exports.endOrder = (req, res) => {
	res.redirect("/cart/menu");
};
