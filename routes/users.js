const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
   register,
   login,
   getUsers,
   getUser,
   updateUser,
   deleteUser,
   createUser,
   forgotPassword,
   resetPassword,
} = require("../controller/users");

const { getOperatorBooks } = require("../controller/books");
const router = express.Router();

// /api/v1/users
router
   .route("/")
   .post(protect, authorize("admin"), createUser)
   .get(protect, authorize("admin"), getUsers);
// /api/v1/users/:id
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router
   .route("/:id")
   .get(protect, authorize("admin"), getUser)
   .put(protect, authorize("admin"), updateUser)
   .delete(protect, authorize("admin"), deleteUser);

router
   .route("/:ownerId/books")
   .get(protect, authorize("admin", "operator", "user"), getOperatorBooks);
module.exports = router;
