const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // console.log(req.headers.authorization.replace("Bearer ", ""));
    const token = req.headers.authorization.replace("Bearer ", "");
    const connectedUser = await User.findOne({ token: token });

    if (!connectedUser) {
      return res.status(401).json({ message: "Unauthorized2" });
    }

    // pour transmettre connectedUser => je le stocke dasn req
    // console.log(req.user);
    req.user = connectedUser;
    return next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
