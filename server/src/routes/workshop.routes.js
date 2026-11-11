const express = require("express");
const router = express.Router();

const workshopController = require("../controllers/workshop.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");
const { validateRequest } = require("../middleware/validation.middleware");
const { createWorkshopSchema } = require("../validators/workshop.validator");

router.post(
  "/",
  authenticateAdmin,
  validateRequest(createWorkshopSchema),
  workshopController.createWorkshop
);

router.get(
  "/",
  workshopController.getPublishedWorkshops
);


module.exports = router;

