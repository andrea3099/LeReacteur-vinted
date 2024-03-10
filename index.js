require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(cors());
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");
app.use(userRouter);
app.use(offerRouter);

app.all("*", (req, res) => {
  res.status(404).json("Page not found");
});
app.listen(3000, () => {
  console.log("Server has started ! 🔥🔥🔥🔥🔥🔥");
});
