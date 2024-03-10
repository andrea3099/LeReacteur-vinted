const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const pictureToUpload = req.files.picture;
      convertToBase64(pictureToUpload);
      const imageResult = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload),
        {
          use_filename: true,
          unique_filename: false,
          folder: "vinted/offers",
        }
      );

      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        product_image: imageResult,
        owner: req.user,
      });
      await newOffer.save();
      const offerResponse = {
        product_name: newOffer.product_name,
        product_description: newOffer.product_description,
        product_price: newOffer.product_price,
        product_details: newOffer.product_details,
      };

      res.json({
        _id: newOffer._id,
        offerResponse,
        owner: {
          account: {
            username: newOffer.owner.account.username,
          },
          _id: newOffer.owner._id,
        },
        product_image: newOffer.product_image,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offer", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    console.log(req.query);
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: priceMin };
    }
    if (priceMax) {
      if (priceMin) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: priceMax };
      }
    }
    const sorter = {};
    if (sort === "price-asc") {
      sorter.product_price = "asc";
    } else if (sort === "price-desc") {
      sorter.product_price = "desc";
    }

    let skip = 0;

    if (page) {
      skip = (page - 1) * 5;
    }
    const offers = await Offer.find(filters)
      .sort(sorter)
      .skip(skip)
      .limit(5)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filters);
    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
