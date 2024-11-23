const mongoose = require("mongoose");
const Offer = require("./Offer");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "L'email ne peut pas être vide"],
    unique: true,
    validate: {
      validator: async function (value) {
        const existingEmail = await mongoose
          .model("User")
          .findOne({ email: value });
        return !existingEmail;
      },
      message: "Tu possèdes déjà un compte !",
    },
    index: { unique: true, collation: { locale: "en", strength: 2 } },
  },
  account: {
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur ne peut pas être vide"],
      unique: true,
      validate: {
        validator: async function (value) {
          const existingUsername = await mongoose
            .model("User")
            .findOne({ "account.username": value });
          return !existingUsername; // Return false if user with same username exists
        },
        message: "Choisis un identifiant différent, celui-ci est déjà pris",
      },
    },
    avatar: Object,
  },
  termsAndConditions: {
    type: Boolean,
    required: [true, "Merci de confirmer pour poursuivre."],
    validate: {
      validator: function (value) {
        return value === true;
      },
      message: "Merci de confirmer pour poursuivre.",
    },
  },
  newsletter: Boolean,
  description: String,
  token: String,
  hash: String,
  salt: String,
});

// cascade delete for user's offers when deleting account
userSchema.pre("deleteOne", async function () {
  await Offer.find({ owner: this._conditions._id }).deleteMany();
});

module.exports = mongoose.model("User", userSchema);
