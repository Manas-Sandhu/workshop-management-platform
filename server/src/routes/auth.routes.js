
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validation.middleware");

const {
  registerUserSchema,
  loginSchema,
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

router.post(
  "/logout",
  authController.logout
);

module.exports = router;
