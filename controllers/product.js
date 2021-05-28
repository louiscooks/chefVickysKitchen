const Product = require("../models/product");
const { cloudinary } = require("../cloudinary");
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

module.exports.createProductForm = async (req, res) => {
	const products = await Product.find();
	res.render("admin/product/new", {
		products,
		days
	});
};
module.exports.createProduct = async (req, res) => {
	const product = await new Product(req.body.product);
	const imageObj = { url: req.file.path, filename: req.file.filename };
	product.image = imageObj;
	await product.save();
	req.flash("success", "Successfully created a new product!");
	res.redirect("/product/add");
};
module.exports.renderProducts = async (req, res) => {
	const products = await Product.find();
	res.render("admin/product/index", {
		products,
		days
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
		product,
		days
	});
};
module.exports.editProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
	if (req.file) {
		await cloudinary.uploader.destroy(product.image.filename);
		const imageObj = { url: req.file.path, filename: req.file.filename };
		product.image = imageObj;
	}
	product.save();
	res.redirect("/product");
};
module.exports.deleteProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndDelete(id);
	if (product.image) {
		await cloudinary.uploader.destroy(product.image.filename);
	}
	res.redirect("/product");
};
