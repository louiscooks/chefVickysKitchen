const priceFormatter = function (price) {
	//Checks if price is an integer
	if (price == parseInt(price)) {
		return "$" + price;
	}

	//Checks if price has only 1 decimal
	else if (Math.round(price * 10) / 10 == price) {
		return "$" + price + "0";
	}

	//Covers other cases
	else {
		return "$" + Math.round(price * 100) / 100;
	}
};

module.exports = priceFormatter;
