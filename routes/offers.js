const express = require("express");
const router = express.Router();
const Offer = require("../Models/Offers");
// Uploads de photos :
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
// middlewares :
const isAuthenticated = require("../middlewares/isAuthenticated");
const fileupload = require("express-fileupload");

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
// Poster une annonce :
router.post(
  "/offers/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      let picturesToUpload;
      let picturesArray = [];

      if (req.files !== null) {
        picturesToUpload = req.files.pictures;
        // Note : .forEach() n'est pas approprié car appel une callback qui devra être async (on ne veut pas ça) et for ... of doit itérer sur un itérable;
        // Donc on utilisera une boucle for classique :
        if (picturesToUpload.length > 1) {
          for (let i = 0; i < picturesToUpload.length; i++) {
            // Le package cloudinary utilise la méthode cloudinary.uploader.upload(file, options, callback) pour envoyer un fichier.
            // On devra remplacer file par notre fichier au format base64. Les paramètres options et callback sont facultatifs.
            const pictureConverted = await cloudinary.uploader.upload(
              convertToBase64(picturesToUpload[i])
            );
            picturesArray.push(pictureConverted);
          }
        } else {
          const pictureConverted = await cloudinary.uploader.upload(
            convertToBase64(picturesToUpload)
          );
          picturesArray.push(pictureConverted);
        }
      }

      //// L'envoi en BDD
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
        product_images: picturesArray,
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
        product_images: picturesArray,
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

// Chercher une annonce par filtre :
router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax } = req.query;
    const limit = 10 || Number(req.query.limit);
    const page = 1 || Number(req.query.page);
    const skip = (page - 1) * limit;

    const filters = {};

    // Si j'ai un titre, j'ajoute une clé product_name qui cherchera tous les product name correspondant à title :
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    // Si j'ai une query priceMin ou PriceMax, ça veut dire qu'il me faut dans tous les cas une clé product_price., dont la valeur sera pour l'instant un objet vide :
    if (priceMin || priceMax) {
      filters.product_price = {};
    }
    // J'ai un priceMin ? Je lui ajoute une clé $gte pour avoir tous les product price supérieurs ou égaux à priceMin :
    if (priceMin) {
      filters.product_price.$gte = Number(priceMin);
    }
    // J'ai un priceMax ? Même logique :
    if (priceMax) {
      filters.product_price.$lte = Number(priceMax);
    }

    //// Tri en prix croissant ou décroissant :
    const sort = {};
    // si req.query.sort === "price-asc" alors j'ajoute une clé product_price à l'objet sort...
    if (sort === "price-desc") {
      // ... qui vaut 1 pour trier en ordre asc :
      sort.product_price = 1;
    } else if (sort === "price-asc") {
      // ... qui vaut -1 pour trier en ordre desc :
      sort.product_price = -1;
    }

    // console.log("filters===>", filters); // ex :: { product_price: { '$lte': 40 } }

    //// La réponse :
    const result = await Offer.find(filters)
      .populate({
        // Aux résultats trouvés, je rajoute une clé owner qui contient juste les infos de sa clé account:
        path: "owner",
        select: "account",
      })
      .sort(sort)
      .limit(limit)
      .skip(skip);

    console.log("results =>", result);
    return res.json({ results: result.length, offers: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les infos d'une annonce en particulier en fonction de son ID :
router.get("/offers/:id", async (req, res) => {
  try {
    const offerInfos = await Offer.findById(req.params.id).populate({
      // Je rajoute un populate() avec la clé account sur owner, sinon je n'ai que l'objectId comme valeur dans owner
      path: "owner",
      select: "account",
    });
    res.status(200).json(offerInfos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
