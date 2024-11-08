const Book = require("../models/Book");
const myError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const dotenv = require("dotenv");
const path = require("path");
const paginate = require("../utils/paginate");
const User = require("../models/User");
dotenv.config({ path: "./config/config.env" });

// api/v1/books
exports.getBooks = asyncHandler(async (req, res, next) => {
  const sort = req.query.sort;
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  ["sort", "select", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(Book, page, limit);

  const books = await Book.find(req.query, select)
    .populate({
      path: "category",
      select: "name averagePrice averageRating",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    succes: true,
    total: books.length,
    data: books,
    pagination: pagination,
  });
});

// api/v1/categories/:catID/books
exports.getCategoryBooks = asyncHandler(async (req, res, next) => {
  const sort = req.query.sort;
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  ["sort", "select", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(Book, page, limit);

  const books = await Book.find(
    { ...req.query, category: req.params.categoryid },
    select
  )
    .populate("category")
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    succes: true,
    total: books.length,
    data: books,
    pagination: pagination,
  });
});

// api/v1/books/:id
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new myError(`not found that book id with ${req.params.id}`, 400);
  }

  const avg = await Book.computeCategoryAveragePrice(book.category);

  res.status(200).json({
    succes: true,
    avgPrice: avg[0],
    avgRating: avg[1],
    data: book,
  });
});

exports.createBook = asyncHandler(async (req, res, next) => {
  console.log("data: ", req.body);
  const category = await Category.findById(req.body.category);

  if (!category) {
    throw new myError(`not found that category id with ${req.params.id}`, 400);
  }

  req.body.createUser = req.userId;
  const book = await Book.create(req.body);
  res.status(200).json({
    succes: true,
    whoCreate: req.userId,
    data: book,
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new myError(
      `Уучлаарай ${req.params.id} ID-тай ном байхгүй байна.`,
      400
    );
  }
  if (book.createdUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new myError(
      `Уучлаарай та ${req.params.id} ID-тай номыг өөрчлөх эрхгүй байна.`,
      400
    );
  }
  req.body.updatedUser = req.userId;
  Object.keys(req.body).forEach((key) => {
    book[key] = req.body[key];
  });
  await book.save();
  res.status(200).json({
    whoUpdate: req.userId,
    success: true,
    data: book,
  });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new myError(`not found that book id with ${req.params.id}`, 400);
  }
  if (book.createdUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new myError(
      `Уучлаарай та ${req.params.id} ID-тай номыг өөрчлөх эрхгүй байна.`,
      400
    );
  }
  await book.deleteOne();
  res.status(200).json({
    succes: true,
    whoDeleted: req.userId,
    data: book,
  });
});

// PUT: api/v1/books/:id/photo
exports.uploadBookPhoto = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new myError(`not found that book id with ${req.params.id}`, 400);
  }
  console.log(req.files);
  const file = req.files.file;
  // image upload
  if (!file.mimetype.startsWith("image/"))
    throw new myError("you must opload image!!!", 400);
  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    console.log("." + process.env.MAX_UPLOAD_FILE_SIZE);
    throw new myError("image size must be lower than 3mb", 400);
  }
  const ext = file.name.split(".")[file.name.split(".").length - 1];
  // console.log("this is extension of file:  ", ext);
  file.name = `photo_${req.params.id}.${ext}`;

  console.log("file name: ", file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new myError(
        "Файлыг хуулж хадгалах явцад алдаа гарлаа. : ",
        err.message,
        400
      );
    }
  });

  book.photo = file.name;
  book["uploadPhotoUser"] = req.userId;
  book.save();

  res.status(200).json({
    success: true,
    uploadPhotoUserID: req.userId,
    data: file.name,
  });
});

exports.getOperatorBooks = asyncHandler(async (req, res, next) => {
  const sort = req.query.sort;
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  ["sort", "select", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(Book, page, limit);

  const books = await Book.find({ createdUser: req.params.ownerId }, select)
    .populate("category")
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    succes: true,
    total: books.length,
    data: books,
    pagination: pagination,
  });
});
