const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const user = require("../controllers/user");
const authenticateUser = require("../middleware/authenticateUser");
const checkForAdmin = require("../middleware/checkForAdmin");

router.get("/login", user.renderLogin);
router.post("/login", authenticateUser, user.login);
router.get("/register", user.renderRegister);
router.post("/register", catchAsync(user.register));
router.get("/logout", user.logout);
router.get("/admin/login", user.renderAdminLogin);
router.get("/admin/register", checkForAdmin, user.renderAdminRegister);
router.post("/admin/register", checkForAdmin, catchAsync(user.registerAdmin));
router.get("/admin/logout", user.logoutAdmin);

module.exports = router;
