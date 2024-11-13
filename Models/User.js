const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "L'email ne peut pas être vide"],
  },
  account: {
    avatar: Object,
    username: {
      type: String,
      unique: true,
      required: [true, "Le nom d'utilisateur ne peut pas être vide"],
      validate: {
        validator: async function (value) {
          const existingUser = await mongoose
            .model("User")
            .findOne({ "account.username": value });
          return !existingUser; // Return false if user with same username exists
        },
        message: "Choisis un identifiant différent, celui-ci est déjà pris",
      },
    },
  },
  termsAndConditions: {
    type: Boolean,
    required: [true, "Merci de confirmer pour poursuivre."],
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

userSchema.post("save", (error, doc, next) => {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.keyValue.email) {
      next(new Error("Tu possèdes déjà un compte !"));
    }
  } else {
    console.log("err =>", error.keyValue);
    next();
  }
});

module.exports = mongoose.model("User", userSchema);
