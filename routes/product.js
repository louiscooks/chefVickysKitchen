const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const { validateProduct } = require("../middleware/validateSchema");
const checkForAdmin = require("../middleware/checkForAdmin");
const product = require("../controllers/product");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

router.get("", catchAsync(product.renderProducts));
router.get("/add", product.createProductForm);
router.post(
	"/add",
	upload.single("image"),
	validateProduct,
	catchAsync(product.createProduct)
);
router.get("/:id/view", catchAsync(product.showProduct));
router.get("/:id/edit", catchAsync(product.editProductForm));
router.put("/:id/edit", validateProduct, catchAsync(product.editProduct));
router.delete("/:id", catchAsync(product.deleteProduct));

module.exports = router;
