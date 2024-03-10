const express = require("express");
const router = express.Router();
const User = require("../models/User");
const uid2 = require("uid2"); // Sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à hasher
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string

router.post("/user/signup", async (req, res) => {
  try {
    const saltUser = uid2(32);
    const tokenUser = uid2(64);
    const hashUser = SHA256(req.body.password + saltUser).toString(encBase64);
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist !== null) {
      return res.status(400).json("Email not available");
    }
    if (req.body.username === "") {
      return res.status(400).json("Missing username");
    }
    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: tokenUser,
      hash: hashUser,
      salt: saltUser,
    });
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/user/login", async (req, res) => {
  try {
    const userLogin = await User.findOne({ email: req.body.email });
    if (!userLogin) {
      return res.status(401).json("Email ou password incorect");
    }
    const hashUser = SHA256(req.body.password + userLogin.salt).toString(
      encBase64
    );
    if (hashUser === userLogin.hash) {
      res.status(200).json({
        _id: userLogin._id,
        token: userLogin.token,
        account: { username: userLogin.account.username },
      });
    } else {
      res.status(401).json("Email ou password incorect");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
