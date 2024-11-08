const User = require("../models/User");
const myError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const path = require("path");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

dotenv.config({ path: "./config/config.env" });

exports.register = asyncHandler(async (req, res, next) => {
   const user = await User.create(req.body);
   const token = user.getJWT();

   res.status(200).json({
      succes: true,
      token: token,
      data: user,
   });
});

// login hiine
exports.login = asyncHandler(async (req, res, next) => {
   // check inputs
   const { email, password } = req.body;
   if (!(email || password)) {
      throw new myError("Нууц үг эсвэл И-мэйл талбар хоосон байна", 400);
   }
   const user = await User.findOne({ email: email }).select("+password");

   if (!user) {
      throw new myError("Нууц үг эсвэл И-мэйл буруу байна", 401);
   }
   const match = await user.checkPassword(password);

   if (!match) {
      throw new myError("Нууц үг эсвэл И-мэйл буруу байна", 401);
   }

   res.status(200).json({
      succes: true,
      token: user.getJWT(),
      data: user,
   });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
   const sort = req.query.sort;
   const select = req.query.select;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 50;
   ["sort", "select", "page", "limit"].forEach((el) => delete req.query[el]);

   // Pagination
   const pagination = await paginate(User, page, limit);

   const users = await User.find(req.query, select)
      .sort(sort)
      .skip(pagination.start - 1)
      .limit(pagination.limit);

   res.status(200).json({
      succes: true,
      data: users,
      pagination: pagination,
   });
});
exports.getUser = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) {
      throw new myError(`not found that user id with ${req.params.id}`, 400);
   }
   res.status(200).json({
      succes: true,
      data: user,
   });
});

exports.createUser = asyncHandler(async (req, res, next) => {
   const user = await User.create(req.body);
   res.status(200).json({
      succes: true,
      data: user,
   });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
   const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });
   if (!user) {
      throw new myError(`not found that user id with ${req.params.id}`, 400);
   }
   res.status(200).json({
      succes: true,
      data: user,
   });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) {
      throw new myError(`Not found that user id with ${req.params.id}`, 400);
   }

   await user.deleteOne();

   res.status(200).json({
      success: true,
      data: user,
   });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
   const email = req.body.email;
   if (!email) {
      throw new myError(`И-мэйл хаягaa илгээнэ үү.`, 403);
   }
   const user = await User.findOne({ email: email });
   if (!user) {
      throw new myError(`Бүртгэлгүй имэйл хаяг байна.`, 403);
   }

   const resetPasswordToken = await user.generatePasswordResetToken();

   user.save({ validateBeforeSave: false });
   // Send mail
   const link = `https://amazon.mn/changepassword/${resetPasswordToken}`;
   const message = `Hello dear, <br><br> You have sent reset password request.<br>Click the link below for reset your password. <br><br> ${link} <br><br> Wish you a nice day!`;
   const info = await sendEmail({
      email: req.body.email,
      subject: "Amazon site-ийн нууц үг өөрчлөх",
   });
   console.log("Message sent: %s", info.messageId);

   res.status(200).json({
      succes: true,
      resetPasswordToken,
      message,
   });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
   const resetToken = req.body.resetToken;
   if (!resetToken || !req.body.password)
      throw new myError(`И-мэйл хаягaa илгээнэ үү.`, 403);

   const encrypted = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

   const user = await User.findOne({
      resetPasswordToken: encrypted,
      resetPasswordExpire: { $gt: Date.now() },
   });

   if (!user) throw new myError("Токэн хүчингүй байна.", 402);
   user.password = req.body.password;
   user.resetPasswordExpire = undefined;
   user.resetPasswordToken = undefined;
   await user.save({ validateBeforeSave: false });

   const token = user.getJWT();

   res.status(200).json({
      succes: true,
      token,
      data: user,
   });
});
