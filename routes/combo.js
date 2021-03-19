const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const checkForAdmin = require("../middleware/checkForAdmin");
const checkReq = require("../middleware/checkReq");
const combo = require("../controllers/combo");

router.post("/add", checkReq, catchAsync(combo.createCombo));
router.get("/:id/view", catchAsync(combo.showCombo));
router.get("/:id/edit", catchAsync(combo.editForm));
router.patch("/:id/edit", checkReq, catchAsync(combo.updateCombo));
router.delete("/:id", catchAsync(combo.deleteCombo));

module.exports = router;
