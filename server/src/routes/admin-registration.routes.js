const express = require("express");
const router = express.Router();

const adminRegistrationController = require("../controllers/admin-registration.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");
const { validateRequest } = require("../middleware/validation.middleware");

const {
  registrationQuerySchema,
  workshopRegistrationQuerySchema,
  workshopIdParamSchema,
} = require("../validators/admin-registration.validator");

router.get(
  "/workshops",
  authenticateAdmin,
  adminRegistrationController.getAllWorkshops
);

router.get(
  "/registrations",
  authenticateAdmin,
  validateRequest(registrationQuerySchema, "query"),
  adminRegistrationController.getAllRegistrations
);

router.get(
  "/workshops/:workshopId/registrations",
  authenticateAdmin,
  validateRequest(workshopIdParamSchema, "params"),
  validateRequest(workshopRegistrationQuerySchema, "query"),
  adminRegistrationController.getWorkshopRegistrations
);

module.exports = router;