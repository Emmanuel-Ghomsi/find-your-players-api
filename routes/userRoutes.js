const express = require("express");
const router = express.Router();

// Links to Controllers
const {
  register,
  login,
  showUser,
  updateProfile,
} = require("../controllers/userController");

// Get the protect middleware for routes
const { protect } = require("../middleware/authMiddleware");

// Group routes
router.post("/", register);
router.post("/login", login);
router.get("/profile/:id", protect, showUser);
router.put("/profile/:id", protect, updateProfile);

module.exports = router;
