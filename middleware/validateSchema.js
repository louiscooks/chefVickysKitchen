const {
	productSchema,
	userSchema,
	adminSchema,
	contactSchema,
	addressSchema
} = require("../utilities/schemas");
const ExpressError = require("../utilities/ExpressError");

module.exports.validateProduct = (req, res, next) => {
	const { error } = productSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	}
	next();
};

module.exports.validateUser = (req, res, next) => {
	const { error } = userSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		req.flash("error", `${msg}`);
		res.redirect("/register");
		return;
	} else {
		next();
	}
};
module.exports.validateAdmin = (req, res, next) => {
	const { error } = adminSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		req.flash("error", `${msg}`);
		res.redirect("/admin/register");
		return;
	} else {
		next();
	}
};
module.exports.validateContact = (req, res, next) => {
	const { error } = contactSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		req.flash("error", `${msg}`);
		res.redirect("/order/contact");
		return;
	} else {
		next();
	}
};
module.exports.validateAddress = (req, res, next) => {
	const { error } = addressSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		req.flash("error", `${msg}`);
		res.redirect("/order");
		return;
	} else {
		next();
	}
};
