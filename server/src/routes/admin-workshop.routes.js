const express = require("express");
const router = express.Router();

const workshopController = require("../controllers/workshop.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");
const { validateRequest } = require("../middleware/validation.middleware");
const {
  createWorkshopSchema,
  updateWorkshopSchema,
} = require("../validators/workshop.validator");

// All routes in this file require admin authentication.

router.post(
  "/",
  authenticateAdmin,
  validateRequest(createWorkshopSchema),
  workshopController.createWorkshop
);

router.patch(
  "/:id",
  authenticateAdmin,
  validateRequest(updateWorkshopSchema),
  workshopController.updateWorkshop
);

router.patch(
  "/:id/cancel",
  authenticateAdmin,
  workshopController.cancelWorkshop
);

module.exports = router;