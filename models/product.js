const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
	name: String,
	image: { url: String, filename: String },
	price: String,
	combo: {
		type: String,
		enum: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		]
	},
	ingredients: String
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
