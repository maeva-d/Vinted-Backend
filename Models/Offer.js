const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: { type: String, required: true },
  product_price: { type: Number, required: true },
  product_description: String,
  product_details: Array,
  // product_image: Object,
  product_images: Array,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
