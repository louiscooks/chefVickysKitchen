const passport = require("passport");

const authenticateUser = function (req, res, next) {
	passport.authenticate("local", function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			req.flash("error", "Incorrect username or password.");
			return res.redirect("/order/menu");
		}
		req.logIn(user, function (err) {
			if (err) {
				return next(err);
			}
			if (req.user.isAdmin) {
				return next();
			}
			req.session.cart = req.user.shoppingCart;
			req.session.save(function (err) {
				if (err) {
					console.log(err);
				}
			});
			return next();
		});
	})(req, res, next);
};
module.exports = authenticateUser;
