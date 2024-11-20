// npm init -y
// npm i express mongoose ui2d crypto-js dotenv cors cloudinary express-fileupload

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/user");
const offersRoutes = require("./routes/offers");
const paymentRoutes = require("./routes/payment");

app.use(userRoutes);
app.use(offersRoutes);
app.use(paymentRoutes);

/////////////// On n'y touche pas ///////////////

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
