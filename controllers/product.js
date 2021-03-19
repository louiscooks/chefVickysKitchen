const Product = require("../models/product");
const Combo = require("../models/combo");

module.exports.addProductForm = async (req, res) => {
	const products = await Product.find();
	res.render("admin/product/new", {
		products
	});
};
module.exports.addProduct = async (req, res) => {
	const product = await new Product(req.body.product);
	await product.save();
	req.flash("success", "Successfully created a new product!");
	res.redirect("/product/add");
};
module.exports.renderProducts = async (req, res) => {
	const products = await Product.find();
	const combos = await Combo.find().populate("products");
	res.render("admin/product/index", {
		products,
		combos
	});
};
module.exports.showProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findById(id);
	res.render("admin/product/show", {
		product
	});
};
module.exports.editProductForm = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findById(id);
	res.render("admin/product/edit", {
		product
	});
};
module.exports.editProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndUpdate(
		id,
		{ ...req.body.product },
		{ new: true }
	);
	res.redirect("/product/");
};
module.exports.deleteProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndDelete(id);
	res.redirect("/product/");
};