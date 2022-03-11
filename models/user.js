const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Veuillez entrer un identifiant"],
    },
    email: {
      type: String,
      required: [true, "Veuillez entrer une adresse email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Veuillez entrer un mot de passe"],
    },
    avatar: {
      type: String,
      required: false,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    telephone: {
      type: String,
      required: false,
    },
    profileInformation: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
