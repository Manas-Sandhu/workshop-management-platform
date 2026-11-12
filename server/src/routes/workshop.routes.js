const express = require("express");
const router = express.Router();

const workshopController = require("../controllers/workshop.controller");

// Public route: fetch all published workshops.
router.get("/", workshopController.getPublishedWorkshops);

// Public route: fetch one published workshop.
router.get("/:workshopId", workshopController.getPublishedWorkshopById);

module.exports = router;