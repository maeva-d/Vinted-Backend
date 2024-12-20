const mongoose = require("mongoose");
const { Schema } = mongoose;

const offerSchema = new Schema({
  product_name: {
    type: String,
    required: [true, "Titre ne peut pas être vide."],
    maxLength: [50, "Limite de caractère atteinte"],
  },
  product_price: {
    type: Number,
    required: [true, "Prix ne peut pas être vide."],
    min: [1, "Le prix ne peut pas être en-dessous de 1 euro."],
    max: [10000, "Le prix ne peut pas dépasser 10 000 euros."],
  },
  product_description: {
    type: String,
    required: [true, "Description ne peut pas être vide."],
    maxLength: [500, "Limite de caractère atteinte"],
  },
  product_details: Array,
  product_images: {
    type: Array,
    validate: [
      {
        validator: function (value) {
          return value.length > 0;
        },
        // Si la valeur de retour est fausse :
        message: "La photo est obligatoire.",
      },
      {
        validator: function (value) {
          return value.length < 3;
        },
        message: "Tu ne peux pas ajouter plus de deux photos pour l'instant :/",
      },
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Offers", offerSchema);
