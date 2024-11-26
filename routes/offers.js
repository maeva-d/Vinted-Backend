const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Offer = require("../Models/Offer");
// middlewares :
const isAuthenticated = require("../middlewares/isAuthenticated");
const fileupload = require("express-fileupload"); // permet de récupérer les fichiers transmis par les clients
// Uploads de photos :
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../functions/cloudinary");
// Fonction pour gestion des erreurs :
const handleErrorMessages = require("../functions/handleErrorMessages");

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
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json(handleErrorMessages(error));
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);

// Chercher une annonce par filtre :
router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax } = req.query;
    const limit = 20 || Number(req.query.limit);
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
        select: "_id account",
      })
      .sort(sort)
      .limit(limit)
      .skip(skip);

    return res.json({ count: result.length, limit: limit, offers: result });
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
