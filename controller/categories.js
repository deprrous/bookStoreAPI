const Category = require("../models/Category");
const myError = require("../utils/myError");
// const asyncHandler = require("../middleware/async/Handler");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
exports.getCategories = asyncHandler(async (req, res, next) => {
  const sort = req.query.sort;
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  ["sort", "select", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(Category, page, limit);

  console.log(req.query, select, sort, pagination.page, pagination.limit);
  const categories = await Category.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(pagination.limit)
    .populate("books");

  res.status(200).json({
    succes: true,
    data: categories,
    pagination: pagination,
  });
});
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate("books");
  if (!category) {
    throw new myError(`not found that category id with ${req.params.id}`, 400);
  }
  res.status(200).json({
    succes: true,
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  console.log("data: ", req.body);

  const category = await Category.create(req.body);
  res.status(200).json({
    succes: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new myError(`not found that category id with ${req.params.id}`, 400);
  }
  res.status(200).json({
    succes: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new myError(`Not found that category id with ${req.params.id}`, 400);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: category,
  });
});
