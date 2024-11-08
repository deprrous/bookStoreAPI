const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categories");
const { getCategoryBooks } = require("../controller/books");

// api/v1/categories/:catID/books
router.route("/:categoryid/books").get(getCategoryBooks);

// const booksRouter = require("./books");
// router.use("/:categoryid/books", booksRouter);

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin", "operator"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);
module.exports = router;
