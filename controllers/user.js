const Cart = require("../models/cart");
const User = require("../models/user");

const loginCart = async function (req) {
	if (!req.user.shoppingCart) {
		const cart = await new Cart();
		const user = await User.findById(req.user._id);
		user.shoppingCart = cart._id;
		await user.save();
	}
};
module.exports.login = (req, res) => {
	if (req.user.isAdmin === true) {
		req.flash("success", "Welcome Admin");
		res.redirect("/product/view");
		return;
	}
	console.log("this is req.user", req.user);
	req.flash("success", "Welcome Back");
	const redirectUrl = req.session.returnTo || "/cart/menu";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};
module.exports.register = async (req, res, next) => {
	try {
		const {
			email,
			username,
			password,
			phoneNumber,
			firstname,
			lastname
		} = req.body;
		const user = await new User({
			email,
			username,
			phoneNumber,
			firstname,
			lastname
		});
		const registeredUser = await User.register(user, password);
		if (req.session.cart) {
			registeredUser.shoppingCart = req.session.cart;
			await registeredUser.save();
		} else {
			const cart = await new Cart();
			req.session.cart = cart._id;
			req.session.save(async function (err) {
				if (err) {
					console.log(err);
				}
				await cart.save();
				registeredUser.shoppingCart = cart._id;
			});
			await registeredUser.save();
			console.log("registered user", registeredUser);
		}
		console.log("hitting login route");
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
module.exports.logout = (req, res) => {
	req.logout();
	req.session.cart = null;
	req.flash("success", "You have logged out successfully.");
	res.redirect("cart/menu");
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
