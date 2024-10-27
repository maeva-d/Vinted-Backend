const express = require("express");
const router = express.Router();
const User = require("../Models/User");

//*********Crypter les MDP *********//
const uid2 = require("uid2");
const encBase64 = require("../node_modules/crypto-js/enc-base64");
const SHA256 = require("../node_modules/crypto-js/sha256");

// //********* Envoyer une photo (photo de profil) *********//
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//////// ROUTES ////////

//// SIGNUP
router.post("/user/signup", fileupload(), async (req, res) => {
  try {
    const { email, username, password, newsletter, termsAndConditions } =
      req.body;
    const { avatar } = req.files;

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);
    const avatarPicture = await cloudinary.uploader.upload(
      convertToBase64(avatar)
    );

    //// Gérer les erreurs

    // Si le MDP n'est pas rempli (on ne le sauvegarde jamais en BDD, donc on gère l'erreur ici) :
    if (!password) {
      return res
        .status(403)
        .json({ message: "Le mot de passe ne peut pas être vide." });
    }

    // - Si le MDP ne remplit pas le critère de longueur :
    if (password.length < 7) {
      return res
        .status(403)
        .json({ message: "Mot de passe : 7 caractères minimum" }); // OK !
    }

    // Le MDP doit contenir au moins 1 lettre et 1 chiffre :
    const findLetters = /[a-zA-Z]/; // RegExp pour vérifier la présence de lettres
    const findNumbers = /\d/; // RegExp pour vérifier la présence d'au moins un chiffre
    if (!findLetters.test(password)) {
      return res.status(403).json({
        message: "Le mot de passe doit contenir au moins une lettre.",
      });
    }
    if (!findNumbers.test(password)) {
      return res.status(403).json({
        message: "Le mot de passe doit contenir au moins un chiffre.",
      });
    }

    // Si les termes & conditions ne sont pas acceptées :
    if (termsAndConditions !== "true") {
      // let termsAndConditionsInBooleanFalse = new Boolean("false");
      // console.log("boolean or not? =>", termsAndConditionsInBooleanFalse);
      return res
        .status(403)
        .json({ message: "Merci de confirmer pour poursuivre." });
    }

    //// Si tout va bien :

    const newAccount = new User({
      email: email,
      account: {
        username: username,
        avatar: avatarPicture,
      },
      newsletter: newsletter,
      termsAndConditions: termsAndConditions,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newAccount.save();

    res.status(201).json({
      _id: newAccount._id,
      token: newAccount.token,
      account: {
        username: newAccount.account.username,
        avatar: newAccount.account.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//// LOGIN
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const accountsToCheck = await User.findOne({ email: email });

    //// Gérer les erreurs :
    // - Si l'email n'existe pas en BDD :
    if (accountsToCheck.email !== email) {
      return res.status(403).json({ message: "Identifiant incorrect." });
    }

    // - Si l'email existe, on vérifie si le MDP est bon :
    if (accountsToCheck.email === email) {
      const hash = SHA256(password + accountsToCheck.salt).toString(encBase64);
      if (hash === accountsToCheck.hash) {
        return res.status(200).json({
          _id: accountsToCheck._id,
          token: accountsToCheck.token,
          account: {
            username: accountsToCheck.account.username,
            avatar: accountsToCheck.account.avatar,
          },
        });
      } else {
        // - Si le MDP est incorrect :
        return res.status(409).json({ message: "MDP incorrect." });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
