const asyncHandler = require("express-async-handler");
const Statistic = require("../models/statistic");
const User = require("../models/user");

/**
 * @desc    Create statistics
 * @route   POST /statistics
 * @access  Public
 */
const store = asyncHandler(async (req, res) => {
  console.log(req.body);
  const {
    poste,
    nbrBut,
    nbrPasse,
    nbrTacle,
    nbrArret,
    tempsDeJeu,
    cartonJaune,
    cartonRouge,
    saison,
  } = req.body;

  // validation des données de la request
  if (
    !poste ||
    !nbrBut ||
    !nbrPasse ||
    !nbrTacle ||
    !nbrArret ||
    !tempsDeJeu ||
    !cartonJaune ||
    !cartonRouge ||
    !saison
  ) {
    res.status(400).send("Veuillez remplir tout les champs !");
    throw new Error("Veuillez remplir tout les champs !");
  }

  const statistic = await Statistic.create({
    poste,
    nbrBut,
    nbrPasse,
    nbrTacle,
    nbrArret,
    tempsDeJeu,
    cartonJaune,
    cartonRouge,
    saison,
    user: req.user.id,
  });

  if (statistic) res.status(201).json(statistic);
  else {
    res.status(400).send("Données invalides.");
    throw new Error("Données invalides");
  }
});

/**
 * @desc    Get all statistic
 * @route   GET /api/statistics
 * @access  Private
 */
const index = asyncHandler(async (req, res) => {
  const statistic = await Statistic.find({
    user: req.user.id,
  });
  res.status(200).json(statistic);
});

/**
 * @desc    Get a specific statistic
 * @route   GET /api/statistics/:id
 * @access  Private
 */
const show = asyncHandler(async (req, res) => {
  const statistic = await Statistic.find({
    user: req.user.id,
    id: req.params._id,
  });
  res.status(200).json(statistic);
});

/**
 * @desc    Update a statistic
 * @route   PUT /api/statistics/:id
 * @access  Private
 */
const update = asyncHandler(async (req, res) => {
  const statistic = await Statistic.findById(req.params.id);

  if (!statistic) {
    res.status(400).send("Statistique non trouvée");
    throw new Error("Statistique non trouvée");
  }

  if (!req.user) {
    res.status(401).send("Utilisateur non trouvée");
    throw new Error("Utilisateur non trouvée");
  }

  // Make sure the logged in user matches the goal user
  if (statistic.user.toString() !== req.user.id) {
    res.status(401).send("Utilisateur non autorisé");
    throw new Error("Utilisateur non autorisé");
  }

  const newStatistic = await Statistic.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  res.status(200).json(newStatistic);
});

/**
 * @desc    Delete a statistic
 * @route   DELETE /api/statistics/:id
 * @access  Private
 */
const destroy = asyncHandler(async (req, res) => {
  const statistic = await Statistic.findById(req.params.id);

  if (!statistic) {
    res.status(400).send("Statistique non trouvée");
    throw new Error("Statistique non trouvée");
  }

  if (!req.user) {
    res.status(401).send("Utilisateur non trouvée");
    throw new Error("Utilisateur non trouvée");
  }

  // Make sure the logged in user matches the goal user
  if (statistic.user.toString() !== req.user.id) {
    res.status(401).send("Utilisateur non autorisé");
    throw new Error("Utilisateur non autorisé");
  }

  await statistic.remove();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  store,
  index,
  show,
  update,
  destroy,
};
