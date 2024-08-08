const express = require("express");
const router = express.Router();
const User = require("../Models/User");

//*********Crypter les MDP *********//
const uid2 = require("uid2");
// ./node_modules/crypto-js/enc-base64
const encBase64 = require("../node_modules/crypto-js/enc-base64");
// ./node_modules/crypto-js/sha256"
const SHA256 = require("../node_modules/crypto-js/sha256");

//////// ROUTES ////////

// route "/user/signup" de type POST
router.post("/user/signup", async (req, res) => {
  try {
    //// Gérer les erreurs
    // - Si l'email existe déjà
    const email = req.body.email;
    const accountsEmails = await User.findOne({ email: email }); // cet email est-il trouvé ou pas?
    if (accountsEmails) {
      return res.json({
        message: "Vous possédez déjà un compte, veuillez vous connecter.",
      });
    }
    const password = req.body.password;
    // - Si le username n'est pas renseigné
    if (!req.body.username) {
      return res.json({ message: "Veuillez rentrer un nom d'utilisateur." });
    }
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    const newAccount = new User({
      email: email,
      account: {
        username: req.body.username,
        avatar: req.body.avatar,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });
    await newAccount.save();
    // Ce qu'il faudra répondre
    res.status(201).json({
      _id: newAccount._id,
      token: newAccount.token,
      account: { username: newAccount.account.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// pour la route user/login
router.post("/user/login", async (req, res) => {
  try {
    const accountsToCheck = await User.findOne({ email: req.body.email });
    console.log("accounts to check =>", accountsToCheck);
    const passwordToCheck = req.body.password;
    // Ce qu'il faudra répondre:
    // - Si le mdp est correct
    if (accountsToCheck.email === req.body.email) {
      const hash = SHA256(passwordToCheck + accountsToCheck.salt).toString(
        encBase64
      );
      if (hash === accountsToCheck.hash) {
        return res.status(200).json({
          _id: accountsToCheck._id,
          token: accountsToCheck.token,
          account: { username: accountsToCheck.account.username },
        });
      }
    }
    // - S'il est incorrect
    return res
      .status(400)
      .json({ message: "Le mot de passe saisi est incorrect." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
