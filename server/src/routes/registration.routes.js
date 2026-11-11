const express = require("express");
const router = express.Router();

const registrationController = require("../controllers/registration.controller");

const { authenticateUser } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");

const {
  registerForWorkshopSchema,
} = require("../validators/registration.validator");

router.post(
  "/register",
  authenticateUser,
  validateRequest(registerForWorkshopSchema),
  registrationController.registerForWorkshop
);

module.exports = router;