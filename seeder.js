const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const Category = require("./models/Category");
const Book = require("./models/Book");
const User = require("./models/User");
const { json } = require("express");

dotenv.config({ path: "./config/config.env" });

mongoose
   .connect(process.env.MONGODB_URL, {})
   .then(() => console.log("MongoDB connected"))
   .catch((err) => console.log("MongoDB connection error: ", err));

const categories = JSON.parse(
   fs.readFileSync(__dirname + "/data/categories.json", "utf-8"),
);
const books = JSON.parse(
   fs.readFileSync(__dirname + "/data/book.json", "utf-8"),
);
const users = JSON.parse(
   fs.readFileSync(__dirname + "/data/user.json", "utf-8"),
);
const importData = async () => {
   try {
      await User.create(users);
      await Category.create(categories);
      await Book.create(books);
      console.log("өгөгдөлийг импортлолоо.".green);
   } catch (err) {
      console.log(err.red);
   }
};

const deleteData = async () => {
   try {
      await Book.deleteMany();
      await Category.deleteMany();
      await User.deleteMany();
      console.log("өгөгдөлийг бүгдийг устгалаа.".red);
   } catch (err) {
      console.log(err.red);
   }
};

if (process.argv[2] == "-i") {
   importData();
} else if (process.argv[2] == "-d") {
   deleteData();
}
