const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const { validateProduct } = require("../middleware/validateSchema");
const checkForAdmin = require("../middleware/checkForAdmin");
const product = require("../controllers/product");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

router.get("", catchAsync(checkForAdmin), catchAsync(product.renderProducts));
router.get("/add", catchAsync(checkForAdmin), product.createProductForm);
router.post(
	"/add",
	catchAsync(checkForAdmin),
	upload.single("image"),
	validateProduct,
	catchAsync(product.createProduct)
);
router.get(
	"/:id/view",
	catchAsync(checkForAdmin),
	catchAsync(product.showProduct)
);
router.get(
	"/:id/edit",
	catchAsync(checkForAdmin),
	catchAsync(product.editProductForm)
);
router.put(
	"/:id/edit",
	catchAsync(checkForAdmin),
	upload.single("image"),
	validateProduct,
	catchAsync(product.editProduct)
);
router.delete(
	"/:id",
	catchAsync(checkForAdmin),
	catchAsync(product.deleteProduct)
);

module.exports = router;
