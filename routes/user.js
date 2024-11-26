const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");
const handleErrorMessages = require("../functions/handleErrorMessages");

//********* Crypter les MDP *********//
const uid2 = require("uid2");
const encBase64 = require("../node_modules/crypto-js/enc-base64");
const SHA256 = require("../node_modules/crypto-js/sha256");

// //********* Envoyer une photo (photo de profil) *********//
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../functions/cloudinary");

//////// ROUTES ////////

//// SIGNUP
router.post("/user/signup", fileupload(), async (req, res) => {
  try {
    const { email, username, password, newsletter, termsAndConditions } =
      req.body;

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    //// Gérer les erreurs relatives au MDP (on ne le sauvegarde jamais en BDD, donc on gère l'erreur ici) :
    if (!password) {
      return res
        .status(403)
        .json({ message: "Le mot de passe ne peut pas être vide." }); // OK !
    }

    if (password.length < 7) {
      return res
        .status(403)
        .json({ message: "Mot de passe : 7 caractères minimum" }); // OK !
    }

    // Le MDP doit contenir au moins 1 lettre et 1 chiffre :
    const findLetters = /[a-zA-Z]/; // RegExp pour vérifier la présence de lettres
    const findNumbers = /\d/; // RegExp pour vérifier la présence d'au moins un chiffre
    // const findSpecialCharacters = /[^a-zA-Z0-9\s_-]/g;

    if (!findLetters.test(password)) {
      return res.status(403).json({
        message: "Le mot de passe doit contenir au moins une lettre.", // OK !
      });
    }
    if (!findNumbers.test(password)) {
      return res.status(403).json({
        message: "Le mot de passe doit contenir au moins un chiffre.", // OK !
      });
    }

    const newAccount = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      termsAndConditions: termsAndConditions,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newAccount.save();

    return res.status(201).json({
      _id: newAccount._id,
      token: newAccount.token,
      account: {
        username: newAccount.account.username,
        avatar: newAccount.account.avatar,
      },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(403).json(handleErrorMessages(error));
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

//// LOGIN
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const accountsToCheck = await User.findOne({ email: email });

    if (accountsToCheck.email !== email) {
      return res.status(403).json({ message: "Identifiant incorrect." });
    }

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
        return res.status(403).json({ message: "MDP incorrect." });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const userInfos = await User.findById(req.params.id);

    res.status(200).json({
      _id: userInfos._id,
      account: {
        username: userInfos.account.username,
        avatar: userInfos.account.avatar,
      },
      newsletter: userInfos.newsletter,
      token: userInfos.token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/user/account", isAuthenticated, async (req, res) => {
  try {
    await req.user.deleteOne();

    return res.status(200).json({
      message:
        "Ton compte a bien été supprimé, nous sommes tristes de te voir partir :(",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
