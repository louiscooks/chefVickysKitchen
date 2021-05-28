const User = require("../models/user");
const ExpressError = require("../utilities/ExpressError");

module.exports.login = (req, res) => {
	if (req.user.isAdmin === true) {
		req.flash("success", "Welcome Admin");
		res.redirect("/product");
		return;
	}
	req.flash("success", "Welcome Back");
	const redirectUrl = req.session.returnTo || "/cart/menu";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};
module.exports.renderLogin = (req, res) => {
	if (req.user) {
		const redirectUrl = req.session.returnTo || "/cart/menu";
		delete req.session.returnTo;
		res.redirect(redirectUrl);
	} else {
		res.render("user/login");
	}
};
module.exports.renderRegister = (req, res) => {
	res.render("user/register");
};
module.exports.register = async (req, res, next) => {
	try {
		const { user, location } = req.body;
		const { firstname, lastname, username, email, password } = user;
		const acct = await new User({
			firstname,
			lastname,
			username,
			email,
			location
		});
		const registeredUser = await User.register(acct, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			const redirectUrl = req.session.returnTo || "/cart/menu";
			req.flash("success", "Welcome to the Chef Vicky's Kitchen!");
			res.redirect(redirectUrl);
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("/register");
	}
};
module.exports.renderProfile = (req, res) => {
	if (req.user) {
		res.render("user/profile");
	} else {
		req.flash("error", "You must be logged in order to continue");
		res.redirect("/cart/menu");
	}
};
module.exports.editProfile = async (req, res) => {
	if (req.user) {
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{
				...req.body.user,
				location: req.body.location
			},
			{ new: true }
		);
		req.login(user, (err) => {
			if (err) return next(err);
			req.flash("success", "Your profile has successfully been updated");
			res.redirect("/cart/menu");
		});
	}
};
module.exports.logout = (req, res) => {
	req.session.startOrder = false;
	req.logout();
	req.flash("success", "You have logged out successfully.");
	res.redirect("cart/menu");
};
module.exports.renderAdminLogin = (req, res) => {
	res.render("user/adminlogin");
};
module.exports.renderAdminRegister = (req, res) => {
	res.render("user/adminregister");
};
module.exports.registerAdmin = async (req, res) => {
	try {
		const { email, username, password, firstname, lastname } = req.body.user;
		const user = await new User({
			email,
			username,
			firstname,
			lastname,
			isAdmin: true
		});
		const registeredUser = await User.register(user, password);
		const authUsers = await User.find({ isAdmin: true });
		if (authUsers.length <= 1) {
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash("success", "Welcome Admin");
				res.redirect("/product");
				return;
			});
		}
		req.flash("success", "New admin successfully created");
		res.redirect("/admin/register");
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("admin/register");
	}
};
module.exports.showAdmin = async (req, res) => {
	const users = await User.find({ isAdmin: true });
	res.render("user/showadmins", { users });
};
module.exports.removeAdmin = async (req, res) => {
	const { id } = req.params;
	const users = await User.findByIdAndDelete(id);
	req.flash("success", "user has successfully been deleted");
	res.redirect("/product");
};
module.exports.logoutAdmin = (req, res) => {
	req.logout();
	req.flash("success", "You have logged out successfully.");
	res.redirect("/admin/login");
};
