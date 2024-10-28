const mongoose = require("mongoose");
const { Schema } = mongoose;

const offerSchema = new Schema({
  product_name: {
    type: String,
    required: [
      true,
      "Tu dois donner un nom à ton article pour trouver de potentiels acheteurs!",
    ],
    maxLength: [20, "limite de caractère atteinte"],
  },
  product_price: {
    type: Number,
    required: [true, "Tu dois donner un prix à ton article"],
    min: [1, "Le prix ne peut pas être en-dessous de 1 euro"],
    max: [10000, "Le prix ne peut pas dépasser 10 000 euros"],
  },
  product_description: {
    type: String,
    maxLength: [500, "limite de caractère atteinte"],
  },
  product_details: Array,
  product_images: {
    type: Array,
    validate: {
      validator: function (value) {
        return value.length > 0;
      },
      // Si la valeur de retour est fausse :
      message: "La photo est obligatoire",
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Offers", offerSchema);
