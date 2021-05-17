const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const checkForAdmin = require("../middleware/checkForAdmin");
const product = require("../controllers/product");

router.get("", catchAsync(product.renderProducts));
router.get("/add", product.addProductForm);
router.post("/add", catchAsync(product.addProduct));
router.get("/:id/view", catchAsync(product.showProduct));
router.get("/:id/edit", catchAsync(product.editProductForm));
router.put("/:id/edit", catchAsync(product.editProduct));
router.delete("/:id", checkForAdmin, catchAsync(product.deleteProduct));

module.exports = router;
