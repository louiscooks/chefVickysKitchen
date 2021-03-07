const Product = require("../models/product");
const categories = ["Seafood", "Vegan", "Other Meats"];

module.exports.renderCreateProduct = (req, res) => {
	res.render("admin/new", {
		categories
	});
};
module.exports.createProduct = async (req, res) => {
	const product = await new Product(req.body);
	await product.save();
	req.flash("success", "Successfully created a new product!");
	res.redirect("/admin/product-create");
};
module.exports.showProducts = async (req, res) => {
	const { category } = req.query;
	if (category) {
		const products = await Product.find({ category });
		res.render("admin/index", {
			products,
			categories,
			category
		});
	} else {
		const products = await Product.find();
		res.render("admin/index", {
			products,
			categories,
			category: "All Products"
		});
	}
};
module.exports.renderEditProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findById(id);
	res.render("admin/edit", {
		product,
		categories
	});
};
module.exports.editProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndUpdate(
		id,
		{ ...req.body },
		{ new: true }
	);
	res.redirect("/admin/product-view");
};
module.exports.deleteProduct = async (req, res) => {
	const { id } = req.params;
	const product = await Product.findByIdAndDelete(id);
	res.redirect("/admin/product-view");
};
