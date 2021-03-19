const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Cart = require("./cart");

const productSchema = new Schema({
	name: String,
	image: String,
	price: Number,
	combo: String,
	ingredients: String
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
