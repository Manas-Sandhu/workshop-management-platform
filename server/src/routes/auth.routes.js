
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validation.middleware");
const { authenticateUser } = require("../middleware/auth.middleware");
const {
  registerUserSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validators/auth.validator");

router.post(
  "/register",
  validateRequest(registerUserSchema),
  authController.register
);

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.login
);
router.get("/me", authenticateUser, authController.me);

router.patch(
  "/profile",
  authenticateUser,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

router.post(
  "/logout",
  authController.logout
);

module.exports = router;
