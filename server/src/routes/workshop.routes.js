const express = require("express");
const router = express.Router();

const workshopController = require("../controllers/workshop.controller");

// Public route: anyone can view published workshops.
router.get("/", workshopController.getPublishedWorkshops);

module.exports = router;