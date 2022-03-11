const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

/**
 * @desc    Register new user
 * @route   POST /api/users
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  // destructuration pour récupérer les données de la request body
  const { name, email, password } = req.body;

  // validation des données de la request
  if (!name || !email || !password) {
    res.status(400).send("Veuillez remplir tout les champs !");
    throw new Error("Veuillez remplir tout les champs !");
  }

  // chercher si l'utilisateur existe
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400).send("Cet utilisateur existe dejà !");
    throw new Error("Cet utilisateur existe dejà !");
  }

  // hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // créer l'utilisateur
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    // Génerer le token
    const token = genrerateJWT(user._id);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: token,
    });
  } else {
    res.status(400).send("Données invalides.");
    throw new Error("Données invalides");
  }
});

/**
 * @desc    Update profile for user
 * @route   PUT /api/users/profile/:id
 * @access  Public
 */
const updateProfile = asyncHandler(async (req, res) => {
  // chercher l'utilisateur
  const userFind = await User.find({
    user: req.user.id,
    id: req.params._id,
  });

  if (!userFind || !req.user) {
    res.status(401).send("Utilisateur non trouvée");
    throw new Error("Utilisateur non trouvée");
  }

  // Make sure the logged in user matches the goal user
  if (userFind._id.toString() !== req.user.id) {
    res.status(401).send("Utilisateur non autorisé");
    throw new Error("Utilisateur non autorisé");
  }

  // validation des données de la request
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send("Veuillez remplir tout les champs !");
    throw new Error("Veuillez remplir tout les champs !");
  }

  const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(newUser);
});

/**
 * @desc    Authenticate a user
 * @route   POST /api/users/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // check if email and password are valid
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = genrerateJWT(user._id);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: token,
    });
  } else {
    res.status(400).send("Données invalides.");
    throw new Error("Données invalides");
  }
});

/**
 * @desc    Get user data
 * @route   GET /api/users/profile/:id
 * @access  Private
 */
const showUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json(user);
});

/**
 * Générer le JWT
 */
const genrerateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

module.exports = {
  register,
  login,
  showUser,
  updateProfile,
};
