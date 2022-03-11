const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const statisticSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    poste: {
      type: String,
      required: [true, "Veuillez renseigner le poste occupé"],
    },
    nbrBut: {
      type: Number,
      required: [true, "Veuillez renseigner le nombre de but marqué"],
    },
    nbrPasse: {
      type: Number,
      required: [true, "Veuillez renseigner le nombre de passe effectuée"],
    },
    nbrTacle: {
      type: Number,
      required: [true, "Veuillez renseigner le nombre de tacle effectuée"],
    },
    nbrArret: {
      type: Number,
      required: [true, "Veuillez renseigner le nombre d'arrêt effectué"],
    },
    tempsDeJeu: {
      type: Number,
      required: [true, "Veuillez renseigner le temps de jeu moyen"],
    },
    cartonJaune: {
      type: Number,
      required: [true, "Veuillez renseigner le nombre de carton jaune reçu"],
    },
    cartonRouge: {
      type: Number,
      required: [true, "Veuillez renseigner le nombre de carton rouge reçu"],
    },
    saison: {
      type: String,
      required: [true, "Veuillez renseigner le nombre de carton rouge reçu"],
    },
  },
  {
    timestamps: true,
  }
);

statisticSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Statistic", statisticSchema);
