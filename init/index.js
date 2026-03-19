const mongoose = require("mongoose");
require('dotenv').config({ path: "../.env" });
const initData = require("./data.js");
const User = require("../models/user.js");
const Listing = require("../models/listings.js");

const MONGO_URL = process.env.MONGO_URI;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Fetch a default user to be the owner
  const defaultUser = await User.findOne({});
  if (!defaultUser) {
    console.log("Error: No users found in database. Create a user first before running init.");
    mongoose.connection.close();
    return;
  }

  const categories = ["Trending", "Rooms", "Iconic Cities", "Mountains", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Houseboats", "Castles"];

  initData.data = initData.data.map((obj, i) => ({
    ...obj,
    owner: defaultUser._id,
    image: { url: obj.image, filename: "listingimage" },
    category: categories[i % categories.length]
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized with categories and owner:", defaultUser.username);
  mongoose.connection.close();
};

initDB();
