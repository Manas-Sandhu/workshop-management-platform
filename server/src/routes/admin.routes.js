
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { authenticateAdmin } = require("../middleware/admin.middleware");

router.post("/login", adminController.login);

router.post("/logout", adminController.logout);

router.get("/me", authenticateAdmin, adminController.getMe);

module.exports = router;
