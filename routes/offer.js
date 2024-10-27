const express = require("express");
const router = express.Router();
const Offer = require("../Models/Offer");
// Uploads de photos :
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
// middlewares :
const fileupload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");

/////////////////
// Grâce au middleware fileUpload, on a réussi à récupérer les fichiers envoyés via postman.
// Ils sont désormais stockés dans req.files (voir console.log()) qui contiendra la clé dont nous nous sommes servis pour envoyer les fichiers
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

////// ROUTES
router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      // Toutes les photos converties seront dans un tableau :
      const picturesToUpload = req.files.pictures; // Arr si + de deux fichiers : OK !
      // Push les photos converties dans un nouveau tableau :
      let galleryArr = [];
      // Le package cloudinary utilise la méthode cloudinary.uploader.upload(file, options, callback) pour envoyer un fichier.
      // On devra remplacer file par notre fichier au format base64. Les paramètres options et callback sont facultatifs.
      if (picturesToUpload.length > 1) {
        for (let pic of picturesToUpload) {
          const pictureConverted = await cloudinary.uploader.upload(
            convertToBase64(pic)
          );
          galleryArr.push(pictureConverted);
        }
      } else {
        const pictureConverted = await cloudinary.uploader.upload(
          convertToBase64(picturesToUpload)
        );
        galleryArr.push(pictureConverted);
      }

      //// La requête en BDD
      const { title, description, price, brand, size, condition, color, city } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        product_images: galleryArr,
        owner: req.user._id,
      });

      await newOffer.save();

      //// répondre :
      return res.status(201).json({
        _id: newOffer._id,
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        product_images: galleryArr,

        owner: {
          account: {
            username: req.user.account.username,
            avatar: req.user.account.avatar,
          },
          _id: req.user._id,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
/////////////////
module.exports = router;
