const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");

const { validateRequest } = require("../middleware/validation.middleware");
const { loginSchema } = require("../validators/auth.validator");

router.post(
  "/login",
  validateRequest(loginSchema),
  adminController.login
);

router.post("/logout", adminController.logout);

router.get("/me", authenticateAdmin, adminController.getMe);

module.exports = router;
