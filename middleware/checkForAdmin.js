const ExpressError = require("../utilities/ExpressError");
const User = require("../models/user");

const checkForAdmin = async function (req, res, next) {
	const authUsers = await User.find({ isAdmin: true });
	if (authUsers.length) {
		if (req.user && req.user.isAdmin) {
			next();
			return;
		} else {
			throw new ExpressError("You are an unauthorized user", 401);
		}
	}
	next();
};

module.exports = checkForAdmin;
