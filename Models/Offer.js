const mongoose = require("mongoose");
const { Schema } = mongoose;

const offerSchema = new Schema({
  product_name: {
    type: String,
    required: [
      true,
      "Tu dois donner un nom à ton article pour trouver de potentiels acheteurs!",
    ],
  },
  product_price: {
    type: Number,
    required: [true, "Tu dois donner un prix à ton article"],
    min: [1, "Le prix ne peut pas être en-dessous de 1 euro"],
    max: [10000, "Le prix ne peut pas dépasser 10 000 euros."],
  },
  product_description: String,
  product_details: Array,
  product_images: Array,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Offer", offerSchema);
