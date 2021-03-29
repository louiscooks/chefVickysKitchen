module.exports.startOrder = (req, res, next) => {
	req.session.startOrder = true;
	next();
};
module.exports.endOrder = (req, res, next) => {
	req.session.startOrder = false;
	next();
};
