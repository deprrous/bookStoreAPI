const express = require("express");
const { protect, authorize } = require("../middleware/protect");
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadBookPhoto,
} = require("../controller/books");

const router = express.Router();

// /api/v1/books/dada
router
  .route("/")
  .get(getBooks)
  .post(protect, authorize("admin", "operator", "user"), createBook);

// api/v1/books/:id
router
  .route("/:id")
  .get(getBook)
  .put(protect, authorize("admin", "operator", "user"), updateBook)
  .delete(protect, authorize("operator", "user", "admin"), deleteBook);

// api/v1/books/:id/photo
router
  .route("/:id/photo")
  .put(protect, authorize("admin", "operator"), uploadBookPhoto);
module.exports = router;
