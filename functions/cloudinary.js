// npm i cloudinary express-fileupload

const fileUpload = require("express-fileupload"); // middleware qui permet de récupérer les fichiers transmis par les clients

/////////////////
// Grâce au middleware fileUpload, on a réussi à récupérer les fichiers envoyés via postman.
// Ils sont désormais stockés dans req.files (voir console.log()) qui contiendra la clé dont nous nous sommes servis pour envoyer les fichiers
// maintenant, il faut renseigner ses identifiants dans la config du package :
const cloudinary = require("cloudinary").v2; // importer cloudinary et renseigner ses identifiants dans la config du package

require("dotenv").config();

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
