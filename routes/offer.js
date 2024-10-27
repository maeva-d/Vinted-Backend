const express = require("express");
const router = express.Router();
const Offer = require("../Models/Offer");
// Et ça ?
const mongoose = require("mongoose");
const User = require("../Models/User");
//
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

/////////////////
// Grâce au middleware fileUpload, on a réussi à récupérer les fichiers envoyés via postman.
// Ils sont désormais stockés dans req.files (voir console.log() dans la route post) qui contiendra la clé dont nous nous sommes servis pour envoyer les fichiers
// maintenant, il faut renseigner ses identifiants dans la config du package :
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// On ne peut pas directement envoyer un buffer à Cloudinary.
// C'est pourquoi nous allons devoir transformer le buffer en base64, qui est un format compréhensible par Cloudinary.
// Il faut alors créer une fonction de conversion pour cloudinary :
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// importation de mon middleware :
const isAuthenticated = require("../middlewares/isAuthenticated");

////// ROUTES
router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      // console.log(req.files.picture);
      const pictureToUpload = req.files.picture;
      // Le package cloudinary utilise la méthode cloudinary.uploader.upload(file, options, callback) pour envoyer un fichier.
      // On devra remplacer file par notre fichier au format base64. Les paramètres options et callback sont facultatifs.
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );

      //// La requête
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        // product_image: result,
        product_images: [],
        owner: req.user._id,
      });
      await newOffer.save();

      //   console.log("req.user ==>", req.user);
      //   console.log("req.user.account ==>", req.user.account); //  { username: 'John Doe' }
      //   console.log("req.user.account ==>", req.user.account.username); //  { username: 'John Doe' }
      //// répondre :
      return res.status(201).json({
        _id: newOffer._id,
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        owner: {
          account: { username: req.user.account.username, avatar: {} },
          _id: req.user._id,
        },
        // product_image: { secure_url: result.secure_url },
        product_images: [],
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
/////////////////
module.exports = router;
