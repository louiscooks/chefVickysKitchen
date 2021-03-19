const { findById } = require("../models/combo");
const Combo = require("../models/combo");
const Product = require("../models/product");

module.exports.createCombo = async (req, res) => {
	console.log("this is req.body", req.body);
	const { name, products, price } = req.body.combo;
	const combo = await new Combo({ name, price });
	products.forEach((product) => {
		combo.products.push(product);
	});
	await combo.save();
	console.log("this is the combo created", combo);
	req.flash("success", "You have created a new combo.");
	res.redirect("/product/add");
};
module.exports.showCombo = async (req, res) => {
	const { id } = req.params;
	const combo = await Combo.findById(id).populate("products");
	res.render("admin/combo/show", {
		combo
	});
};
module.exports.editForm = async (req, res) => {
	const { id } = req.params;
	const combo = await Combo.findById(id).populate("products");
	const products = await Product.find();
	res.render("admin/combo/edit", {
		combo,
		products
	});
};
module.exports.updateCombo = async (req, res) => {
	const { id } = req.params;
	console.log("this is req.body", req.body);
	const combo = await Combo.findById(id);
	const array = combo.products;
	let productObject = {};
	for (let i = 0; i < array.length; i++) {
		if (array[i] !== undefined) {
			productObject[array[i]] = array[i];
		}
	}
	const reqArray = req.body.combo.products;
	let reqObject = {};
	for (let i = 0; i < reqArray.length; i++) {
		if (reqArray[i] !== undefined) {
			reqObject[reqArray[i]] = reqArray[i];
		}
	}
	if (req.body.combo.products.length > 0) {
		req.body.combo.products.forEach(async (el) => {
			console.log("this is el", el);
			let a = productObject[el];
			console.log("this is i", a);
			if (!a) {
				combo.products.push(el);
				console.log("pushing el", el);
			}
		});
		combo.products.forEach(async (element) => {
			console.log("this is element", element);
			let i = reqObject[element];
			console.log("this is i", i);
			if (!i) {
				await Combo.findByIdAndUpdate(
					id,
					{
						$pull: { products: element }
					},
					{ new: true }
				);
				console.log("nothing to do here !");
			}
		});
	}
	if (req.body.combo.name) {
		combo.name = req.body.combo.name;
	}
	if (req.body.combo.price) {
		combo.price = req.body.combo.price;
	}
	await combo.save();
	req.flash("success", "Combo successfully updated.");
	res.redirect("/product/view");
};
module.exports.deleteCombo = async (req, res) => {
	const { id } = req.params;
	const combo = await Combo.findByIdAndDelete(id);
	console.log("deleted combo", combo);
	res.redirect("/product/view");
};
