const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Recuperer la partie token du header
      token = req.headers.authorization.split(" ")[1];

      // Verifier le token pour correspondance avec le secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Recuperer les informations de l'utilisateur à l'eception du mot de passe
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      res
        .status(401)
        .json({ error: "Vous n'êtes pas autorisé à acceder à ce contenu !" });
      throw new Error("Vous n'êtes pas autorisé à acceder à ce contenu !");
    }
  }

  if (!token) {
    res.status(401).json({
      error: "Vous n'êtes pas autorisé à acceder à ce contenu, pas de token !",
    });
    throw new Error(
      "Vous n'êtes pas autorisé à acceder à ce contenu, pas de token !"
    );
  }
});

module.exports = { protect };
