const ExpressError = require("../utilities/ExpressError");

const checkForAdmin = function (req, res, next) {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		throw new ExpressError("You are an unauthorized user", 401);
	}
};

module.exports = checkForAdmin;
