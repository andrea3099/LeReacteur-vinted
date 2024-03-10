const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const replaceToken = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: replaceToken });

    if (!user) {
      return res.status(400).json({ message: "Unauthorized" });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
