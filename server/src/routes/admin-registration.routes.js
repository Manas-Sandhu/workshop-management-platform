
const express = require("express");
const router = express.Router();

const adminRegistrationController = require("../controllers/admin-registration.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");

// Admin dashboard: all workshops and their registration counts.
router.get(
  "/workshops",
  authenticateAdmin,
  adminRegistrationController.getAllWorkshops
);

// All registrations across all workshops.
router.get(
  "/registrations",
  authenticateAdmin,
  adminRegistrationController.getAllRegistrations
);

// Registrations for one particular workshop.
router.get(
  "/workshops/:workshopId/registrations",
  authenticateAdmin,
  adminRegistrationController.getWorkshopRegistrations
);

module.exports = router;
