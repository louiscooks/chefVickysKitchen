const { productSchema, userSchema } = require("../utilities/schemas");
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
