const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const checkForAdmin = require("../middleware/checkForAdmin");
const admin = require("../controllers/adminProduct");

router.get("/product-create", checkForAdmin, admin.renderCreateProduct);
router.post("/add/product", checkForAdmin, catchAsync(admin.createProduct));
router.get("/product-view", checkForAdmin, catchAsync(admin.showProducts));
router.get(
	"/product/:id/edit",
	checkForAdmin,
	catchAsync(admin.renderEditProduct)
);
router.put("/product/:id/edit", checkForAdmin, catchAsync(admin.editProduct));
router.delete("/product/:id", checkForAdmin, catchAsync(admin.deleteProduct));

module.exports = router;
