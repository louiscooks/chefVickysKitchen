const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const { validateUser, validateAdmin } = require("../middleware/validateSchema");
const user = require("../controllers/user");
const authenticateUser = require("../middleware/authenticateUser");
const checkForAdmin = require("../middleware/checkForAdmin");

router.get("/login", user.renderLogin);
router.post("/login", authenticateUser, user.login);
router.get("/register", catchAsync(user.renderRegister));
router.post("/register", validateUser, catchAsync(user.register));
router.get("/profile", user.renderProfile);
router.put("/profile/update", user.editProfile);
router.get("/logout", user.logout);
router.get("/admin/login", user.renderAdminLogin);
router.get(
	"/admin/register",
	catchAsync(checkForAdmin),
	user.renderAdminRegister
);
router.get("/admin/view", catchAsync(checkForAdmin), user.showAdmin);
router.post("/admin/:id/delete", catchAsync(checkForAdmin), user.removeAdmin);
router.post(
	"/admin/register",
	catchAsync(checkForAdmin),
	validateAdmin,
	catchAsync(user.registerAdmin)
);
router.get("/admin/logout", user.logoutAdmin);

module.exports = router;
