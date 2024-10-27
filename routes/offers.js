// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const Offer = require("../Models/Offer");

// router.get("/offers", async (req, res) => {
//   try {
//     const limit = 2;

//     ////////////
//     const { title, priceMin, priceMax, sort, pageNumber } = req.query;

//     const page = parseFloat(pageNumber);
//     let filters = {};
//     if (title || priceMin || priceMax || sort || page) {
//       filters = {
//         product_name: new RegExp(title, "i"),
//         minimum_price: priceMin,
//         maximum_price: priceMax,
//         sortedOrder: sort,
//         whichPage: page,
//       };
//       let result = await Offer.find().sort().skip(2).limit(2);
//       //   console.log("filters===>", filters); OK
//       return res.json({ message: result });
//     }

//     ///// pages

//     /////

//     const result = await Offer.find({}).sort({}.skip(2).limit(2));
//     res.json({ message: result });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
