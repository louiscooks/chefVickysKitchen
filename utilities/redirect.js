module.exports.redirectToAddress = function (cart, req, res) {
	if (cart) {
		if (!cart.geometry.coordinates.length) {
			req.flash("error", "Please verify your address in order to continue.");
			res.redirect("/order");
			return true;
		}
		return false;
	}
	res.redirect("/order");
	return true;
};
module.exports.redirectToDelivery = function (cart, req, res) {
	if (cart) {
		if (!cart.deliveryDate) {
			req.flash("error", "Please enter delivery date before continuing");
			res.redirect("/order/date");
			return true;
		}
		return false;
	}
	res.redirect("/order/date");
	return true;
};
module.exports.redirectToCheckout = function (cart, req, res) {
	if (cart) {
		if (!cart.totalPrice) {
			req.flash("error", "Please enter checkout before continuing");
			res.redirect("/order/checkout");
			return true;
		}
		return false;
	}
	res.redirect("/order/checkout");
	return true;
};
module.exports.redirectToContact = function (cart, req, res) {
	if (cart) {
		if (req.user) {
			if (!cart.contact.user) {
				req.flash("error", "Please enter your contact info before continuing");
				res.redirect("/order/contact");
				return true;
			}
		} else if (!cart.contact.lastname) {
			req.flash("error", "Please enter your contact info before continuing");
			res.redirect("/order/contact");
			return true;
		}

		return false;
	}
	res.redirect("/order/contact");
	return true;
};
module.exports.redirectToReview = function (order, req, res) {
	if (order) {
		if (!order.totalPrice) {
			req.flash(
				"error",
				"Something went wrong while placing your order. Please make sure all the information is correct."
			);
			res.redirect("/order/review");
			return true;
		}
		return false;
	}
	res.redirect("/order/review");
	return true;
};
