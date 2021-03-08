const User = require("../models/user");

module.exports.renderLogin = (req, res) => {
	res.render("user/login");
};
module.exports.login = (req, res) => {
	console.log("this is req.user.isAdmin", req.user.isAdmin);
	if (req.user.isAdmin === true) {
		console.log("this is admin", req.user.isAdmin);
		req.flash("success", "Welcome Admin");
		res.redirect("/admin/product-view");
		return;
	}
	req.flash("success", "Welcome Back");
	const redirectUrl = req.session.returnTo || "/order/menu";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};
module.exports.renderRegister = (req, res) => {
	res.render("user/register");
};
module.exports.register = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = await new User({ email, username });
		const registeredUser = await User.register(user, password);
		registeredUser.shoppingCart = req.session.cart;
		await registeredUser.save();
		console.log("registered user has session cart saved", registeredUser);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash("success", "Welcome to the Chef Vicky's Kitchen!");
			res.redirect("/order/menu");
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("/register");
	}
};
module.exports.logout = (req, res) => {
	req.logout();
	req.session.cart = null;
	console.log("this is req.session.cart", req.session.cart);
	req.flash("success", "You have logged out successfully.");
	res.redirect("/order/menu");
};
module.exports.renderAdminLogin = (req, res) => {
	res.render("user/adminlogin");
};
module.exports.renderAdminRegister = (req, res) => {
	res.render("user/adminregister");
};
module.exports.registerAdmin = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = await new User({ email, username, isAdmin: true });
		const registeredUser = await User.register(user, password);
		console.log("this is registerUser", registeredUser);
		req.flash("success", "New admin successfully created");
		res.redirect("/admin/register");
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("admin/register");
	}
};
module.exports.logoutAdmin = (req, res) => {
	req.logout();
	req.flash("success", "You have logged out successfully.");
	res.redirect("/admin/login");
};
