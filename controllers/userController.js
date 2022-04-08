const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// pour l'envoi de mail en utilisant sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    res.status(401).json({ error: "Veuillez remplir tout les champs !" });
    throw new Error("Veuillez remplir tout les champs !");
  }

  // chercher si l'utilisateur existe
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(401).json({ error: "Cet utilisateur existe dejà !" });
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
    const token = genrerateJWT(user._id, "1d");

    // Envoyer le mail de connexion
    const msg = {
      to: user.email, // Change to your recipient
      from: process.env.EMAIL_FROM, // Change to your verified sender
      subject: "Activer votre compte",
      html: `
        <h1>Veuillez cliquer sur le lien pour activer votre compte</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>Ce mail contiennt des informations sensibles, si vous n'avez pas créé de compte sur notre plateforme, bien vouloir ne pas y répondre</p>
        <p>${process.env.CLIENT_URL}</p>`,
    };

    sgMail
      .send(msg)
      .then(() => {
        res.status(201).json({
          message: `Email envoyé à l'adresse ${user.email}`,
        });
      })
      .catch((error) => {
        res.status(401).json({ error: "Le mail n'a pas pu être envoyé" });
        throw new Error("Le mail n'a pas pu être envoyé");
      });
  } else {
    res.status(401).json({ error: "Données invalides" });
    throw new Error("Données invalides");
  }
});

/**
 * @desc    Activate account
 * @route   POST /api/users/activate
 * @access  Private
 */
const activate = asyncHandler(async (req, res) => {
  const { token, name } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ error: "Token Expiré veuillez renvoyer le mail !" });
      }
    });
  }

  // Update user and set state to true
  // Retrieve user with token
  const decodeToken = jwt.decode(token);
  const user = await User.findByIdAndUpdate(decodeToken.id, { state: true });
  res.status(200).json({ user: user, token: token });
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
    //if (user.state) {
    const token = genrerateJWT(user._id, "30d");

    const {
      _id,
      name,
      email,
      role,
      avatar,
      firstname,
      lastname,
      address,
      telephone,
      profileInformation,
    } = user;

    res.status(201).json({
      user: {
        _id,
        name,
        email,
        role,
        avatar,
        firstname,
        lastname,
        address,
        telephone,
        profileInformation,
      },
      token: token,
    });
    /*} else {
      res
        .status(400)
        .json(
          "Bien vouloir consulter votre boîte mail pour activer votre compte."
        );
      throw new Error(
        "Bien vouloir consulter votre boîte mail pour activer votre compte"
      );
    }*/
  } else {
    res.status(400).json("Données invalides.");
    throw new Error("Données invalides");
  }
});

/**
 * @desc    Resend link to activate account to user
 * @route   POST /api/users/resent/verify-account
 * @access  Public
 */
const resendEmailActivateAccount = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // chercher si l'utilisateur existe
  const userExist = await User.findOne({ email });

  if (userExist) {
    // Génerer le token
    const token = genrerateJWT(userExist._id, "1d");

    // Envoyer le mail de connexion
    const msg = {
      to: email, // Change to your recipient
      from: process.env.EMAIL_FROM, // Change to your verified sender
      subject: "Activer votre compte",
      html: `
        <h1>Veuillez cliquer sur le lien pour activer votre compte</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>Ce mail contiennt des informations sensibles, si vous n'avez pas créé de compte sur notre plateforme, bien vouloir ne pas y répondre</p>
        <p>${process.env.CLIENT_URL}</p>`,
    };
    console.log(msg);
    sgMail
      .send(msg)
      .then(() => {
        res.status(201).json({
          message: `Email envoyé à l'adresse ${email}`,
        });
      })
      .catch((error) => {
        res.status(400).json({ error: error });
        throw new Error("Le mail n'a pas pu être envoyé");
      });
  } else {
    res.status(400).json({ error: "Cet utilisateur n'existe pas !" });
    throw new Error("Cet utilisateur n'existe pas !");
  }
});

/**
 * @desc    Check if token match to user
 * @route   POST /api/users/verify/token
 * @access  Private
 */
const verifyIsTokenMatchWithUser = asyncHandler(async (req, res) => {
  const { user } = req.body;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") &&
    user
  ) {
    try {
      // Recuperer la partie token du header
      token = req.headers.authorization.split(" ")[1];

      // Verifier le token pour correspondance avec le secret key
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).json({ response: true });
        }
      });
      const decodedToken = jwt.decode(token);

      // Recuperer les informations de l'utilisateur à l'eception du mot de passe
      const userByToken = await User.findById(decodedToken.id);

      if (userByToken._id == user._id) res.status(200).json({ response: true });
      else res.status(401).json({ response: false });
    } catch (err) {
      res.status(401).json({ response: false });
      throw new Error("Vous n'êtes pas autorisé à acceder à ce contenu !");
    }
  }
});

/**
 * @desc    Update profile for user
 * @route   PUT /api/users/profile/:id
 * @access  Public
 */
const updateProfile = asyncHandler(async (req, res) => {
  console.log(req.params.id)
  // chercher l'utilisateur
  const userFind = await User.findById(req.params.id);

  if (!userFind) {
    res.status(401).json({ error: "Utilisateur non trouvée" });
    throw new Error("Utilisateur non trouvée");
  }

  // validation des données de la request
  if (!req.body.name) {
    res.status(400).json({ error: "Veuillez renseigner l'identifiant !" });
    throw new Error("Veuillez renseigner l'identifiant !");
  }

  const update = {
    avatar: req.body.avatar,
    name: req.body.name,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address: req.body.address,
    telephone: req.body.telephone,
    profileInformation: req.body.profileInformation,
  };

  try {
    let newUser = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.status(200).json({ user: newUser, message: "Utilisateur modifié !" });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Une erreur est survenue lors de la modification !" });
    throw new Error("Une erreur est survenue lors de la modification !");
  }
});

/**
 * @desc    Change password for user
 * @route   PUT /api/users/change/password/:id
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  // chercher l'utilisateur
  const userFind = await User.findById(req.params.id);

  if (!userFind) {
    res.status(401).json({ error: "Utilisateur non trouvée" });
    throw new Error("Utilisateur non trouvée");
  }

  // validation des données de la request
  if (!req.body.password) {
    res.status(400).json({ error: "Veuillez renseigner le mot de passe !" });
    throw new Error("Veuillez renseigner le mot de passe !");
  }

  // hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  try {
    let newUser = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      {
        new: true,
      }
    );
    res.status(200).json({ user: newUser, message: "Mot de passe modifié !" });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Une erreur est survenue lors de la modification !" });
    throw new Error("Une erreur est survenue lors de la modification !");
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
const genrerateJWT = (id, expireTime) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: expireTime,
  });
};

module.exports = {
  register,
  login,
  showUser,
  updateProfile,
  activate,
  verifyIsTokenMatchWithUser,
  resendEmailActivateAccount,
  changePassword,
};
