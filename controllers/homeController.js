const asyncHandler = require("express-async-handler");

/**
 * @desc    Get homepage
 * @route   GET /api
 * @access  Private
 *
 * @param {*} req
 * @param {*} res
 */
const getHomePage = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Home page is available" });
});

module.exports = {
  getHomePage,
};
