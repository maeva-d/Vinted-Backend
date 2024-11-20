const express = require("express");
const router = express.Router();

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/payment", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      description: "Vinted",
    });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
