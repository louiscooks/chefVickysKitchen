const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const user = require("../controllers/user");
const authenticateUser = require("../middleware/authenticateUser");
const checkForAdmin = require("../middleware/checkForAdmin");

router.post("/login", authenticateUser, user.login);
router.get("/register", catchAsync(user.renderRegister));
router.post("/register", catchAsync(user.register));
router.get("/logout", user.logout);
router.get("/admin/login", user.renderAdminLogin);
router.get("/admin/register", user.renderAdminRegister);
router.get("/admin/view", user.showAdmin);
router.post("/admin/:id/delete", user.removeAdmin);
router.post("/admin/register", catchAsync(user.registerAdmin));
router.get("/admin/logout", user.logoutAdmin);

module.exports = router;
