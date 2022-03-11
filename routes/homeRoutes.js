const express = require("express");
const router = express.Router();

// Links to Controllers
const { getHomePage } = require("../controllers/homeController");

// Group routes
router.route("/").get(getHomePage);

module.exports = router;
