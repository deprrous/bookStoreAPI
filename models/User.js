const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const myError = require("../utils/myError");
const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "Хэрэглэгчийн нэрийг оруулна уу"],
   },
   email: {
      type: String,
      required: [true, "You must enter user email"],
      unique: true,
      match: [
         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
         "Email хаяг буруу байна.",
      ],
   },
   role: {
      type: String,
      required: [true, "Хэрэглэгчийн эрхийг оруулна уу"],
      enum: ["user", "operator", "admin"],
      default: "user",
   },
   password: {
      type: String,
      minlength: 4,
      required: [true, "Хэрэглэгчийн нууц үгийг оруулна уу"],
      select: false,
   },
   resetPasswordToken: String,
   resetPasswordExpire: Date,
   createdAt: {
      type: Date,
      default: Date.now(),
   },
});

UserSchema.pre("save", async function () {
   // Nuuts ug oorchlogdoogui bol daraachiin middleware luu shiljine
   if (!this.isModified(this.password)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
   }
});

UserSchema.methods.getJWT = function () {
   const token = jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.EXPIRESIN,
      },
   );
   return token;
};
UserSchema.methods.checkPassword = async function (enteredPassword) {
   let match;
   try {
      match = await bcrypt.compare(enteredPassword, this.password);
      console.log(match);
   } catch (err) {
      throw new myError("Email password not match!", 401);
   }
   return match;
};

UserSchema.methods.generatePasswordResetToken = async function () {
   const resetToken = crypto.randomBytes(30).toString("hex");
   this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
   return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
