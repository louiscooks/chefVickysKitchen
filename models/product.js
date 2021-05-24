const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
	name: String,
	image: { url: String, fliename: String },
	price: String,
	type: { type: String, enum: ["entree", "drink", "dessert"] },
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
