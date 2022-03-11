const express = require("express");
const router = express.Router();

// Links to Controllers
const {
  store,
  index,
  show,
  update,
  destroy,
} = require("../controllers/statisticsController");

// Get the protect middleware for routes
const { protect } = require("../middleware/authMiddleware");

// Group routes
router.route("/").get(protect, index).post(protect, store);
router
  .route("/:id")
  .get(protect, show)
  .put(protect, update)
  .delete(protect, destroy);

module.exports = router;
