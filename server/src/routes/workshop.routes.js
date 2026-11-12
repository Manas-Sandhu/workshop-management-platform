const express = require("express");
const router = express.Router();

const workshopController = require("../controllers/workshop.controller");
const {
  optionalAuthenticateUser,
} = require("../middleware/auth.middleware");

// Public listing, with optional user identification.
router.get(
  "/",
  optionalAuthenticateUser,
  workshopController.getPublishedWorkshops
);

// Public individual workshop route.
router.get("/:workshopId", workshopController.getPublishedWorkshopById);

module.exports = router;