const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const user = require("../controllers/user");
const authenticateUser = require("../middleware/authenticateUser");
const checkForAdmin = require("../middleware/checkForAdmin");
const checkForCart = require("../middleware/checkForCart");

router.post("/login", authenticateUser, user.login);
router.post("/register", checkForCart, catchAsync(user.register));
router.get("/logout", user.logout);
router.get("/admin/login", user.renderAdminLogin);
router.get("/admin/register", user.renderAdminRegister);
router.post("/admin/register", checkForCart, catchAsync(user.registerAdmin));
router.get("/admin/logout", user.logoutAdmin);

module.exports = router;
