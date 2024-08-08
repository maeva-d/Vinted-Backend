// npm init -y
// npm i express mongoose ui2d crypto-js
// npm i cloudinary express-fileupload

const express = require("express");
const mongoose = require("mongoose");
// nouveau
const fileUpload = require("express-fileupload"); // permet de récupérer les fichiers transmis par les clients
// importer cloudinary et renseigner ses identifiants dans la config du package
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());

// On fait tourner le serveur local avec npx nodemon

// On relie notre serveur à la BDD ET on lui donne un nom!!!
mongoose.connect("mongodb://localhost:27017/Vinted");

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const offersRoutes = require("./routes/offers");

app.use(userRoutes);
app.use(offerRoutes);
app.use(offersRoutes);

/////////////// On n'y touche pas ///////////////

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(3000, () => {
  console.log("Server started");
});
