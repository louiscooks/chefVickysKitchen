const Product = require("../models/product");

module.exports.createProductForm = async (req, res) => {
	const products = await Product.find();
	res.render("admin/product/new", {
		products
	});
};
module.exports.createProduct = async (req, res) => {
	const product = await new Product(req.body.product);
	console.log(req.file);
	const image = { url: req.file.path, filename: req.file.filename };
	product.image = image;
	console.log("this is product", product);
	await product.save();
	console.log(product);
	req.flash("success", "Successfully created a new product!");
	res.redirect("/product/add");
};
module.exports.renderProducts = async (req, res) => {
	const products = await Product.find();
	res.render("admin/product/index", {
		products
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
	res.redirect("/product");
};
module.exports.deleteProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndDelete(id);
	res.redirect("/product");
};
