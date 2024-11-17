// npm i cloudinary express-fileupload (dotenv si pas déjà fait)
const cloudinary = require("cloudinary").v2; // importer cloudinary et renseigner ses identifiants dans la config du package

// Maintenant, il faut renseigner ses identifiants dans la config du package :
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Grâce au middleware fileUpload, on a réussi à récupérer les fichiers envoyés via postman.
// Ils sont désormais stockés dans req.files (voir console.log()) qui contiendra la clé dont nous nous sommes servis pour envoyer les fichiers
// Or, on ne peut pas directement envoyer un buffer à Cloudinary.
// C'est pourquoi nous allons devoir transformer le buffer en base64, qui est un format compréhensible par Cloudinary.
// Il faut alors créer une fonction de conversion pour cloudinary :
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//// -- Comment appeler cette fonction pour convertir un fichier ?
//// -- Le package cloudinary utilise la méthode cloudinary.uploader.upload(file, options, callback) pour envoyer un fichier.
//// -- On devra remplacer file par notre fichier au format base64 à l'aide de la fonction plus haut. Les paramètres options et callback sont facultatifs.
// => const pictureConverted = await cloudinary.uploader.upload(convertToBase64(file);

module.exports = convertToBase64;
