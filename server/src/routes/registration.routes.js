
const express = require("express");
const router = express.Router();

const registrationController = require("../controllers/registration.controller");

const { authenticateUser } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");

const {
  registerForWorkshopSchema,
} = require("../validators/registration.validator");

// Fetch registrations belonging to the currently authenticated user.
router.get(
  "/my-registrations",
  authenticateUser,
  registrationController.getMyRegistrations
);

// Register for a workshop.
router.post(
  "/register",
  authenticateUser,
  validateRequest(registerForWorkshopSchema),
  registrationController.registerForWorkshop
);

module.exports = router;
