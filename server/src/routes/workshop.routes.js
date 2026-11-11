const express = require("express");
const router = express.Router();

const workshopController = require("../controllers/workshop.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");

router.post(
  "/",
  authenticateAdmin,
  workshopController.createWorkshop
);

module.exports = router;