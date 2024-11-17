// npm init -y
// npm i express mongoose ui2d crypto-js dotenv cors
// npm i cloudinary express-fileupload

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// On fait tourner le serveur local avec npx nodemon

// On relie notre serveur à la BDD ET on lui donne un nom!!!
mongoose.connect(process.env.MONGO_URI);

const userRoutes = require("./routes/user");
const offersRoutes = require("./routes/offers");

app.use(userRoutes);
app.use(offersRoutes);

/////////////// On n'y touche pas ///////////////

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
