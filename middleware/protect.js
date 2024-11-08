const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const myError = require("../utils/myError");
const User = require("../models/User");
exports.protect = asyncHandler(async (req, res, next) => {
   if (!req.headers.authorization) {
      throw new myError("Эрх зөвшөөрөгдөөгүй", 401);
   }

   const token = req.headers.authorization.split(" ")[1];

   if (!token) {
      throw new myError("Эрх зөвшөөрөгдөөгүй", 401);
   }

   const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
   req.userId = tokenObj.id;
   req.userRole = tokenObj.role;

   next();
});

exports.authorize = function (...roles) {
   return (req, res, next) => {
      if (!roles.includes(req.userRole)) {
         throw new myError(
            "Таны эрх [" +
               req.userRole +
               "] энэ үйлдлийг хийх боломжгүй. " +
               roles +
               " эдгээр эрхээр нэвтэрнэ үү.",
            403,
         );
      }
      next();
   };
};
