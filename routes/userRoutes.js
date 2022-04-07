const express = require("express");
const router = express.Router();

// Links to Controllers
const {
  register,
  login,
  showUser,
  updateProfile,
  activate,
  verifyIsTokenMatchWithUser,
  resendEmailActivateAccount,
  changePassword,
} = require("../controllers/userController");

// Get the protect middleware for routes
const { protect } = require("../middleware/authMiddleware");

// Group routes
router.post("/", register);
router.post("/activate", activate);
router.post("/login", login);
router.post("/verify/token", verifyIsTokenMatchWithUser);
router.post("/resent/verify-account", resendEmailActivateAccount);
router.get("/profile/:id", protect, showUser);
router.put("/profile/:id", protect, updateProfile);
router.put("/change/password/:id", protect, changePassword);

module.exports = router;
