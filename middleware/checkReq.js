const ExpressError = require("../utilities/ExpressError");

const checkReq = function (req, res, next) {
	const comboReq = req.body.combo;
	if (comboReq.products.length === 0) {
		throw new ExpressError(
			"You must have atleast one product listed in the combo",
			400
		);
	} else {
		next();
	}
};

module.exports = checkReq;
