const returnTo = function (req, res, next) {
	req.session.returnTo = req.originalUrl;
	next();
};
module.exports = returnTo;
