const mongoose = require("mongoose");
const { tr, slugify } = require("transliteration");
const Category = require("./Category");

const BookSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Номны нэрийг оруулна уу!"],
         unique: true,
         trim: true,
         maxlength: [
            150,
            "Номын нэрний урт дээд тал нь 150-н тэмдэгт байх ёстой",
         ],
      },
      author: {
         type: String,
         required: [true, "Зохиолчын нэрийг оруулна уу!"],
         trim: true,
         maxlength: [
            100,
            "Зохиолчын нэрний урт дээд тал нь 150-н тэмдэгт байх ёстой",
         ],
      },
      photo: {
         type: String,
         default: "no-photo.png",
      },
      slug: String,
      createdAt: {
         type: Date,
         defualt: Date.now(),
      },
      rating: {
         type: Number,
         min: [1, "rating bagadaa 1 baih ystoi "],
         max: [10, "rating ihdee 10 baih ystoi "],
      },
      price: {
         type: Number,
         required: [true, "Номны үнийг оруулна уу!"],
         min: [1000, "nomnii une bagadaa 1000 baih ystoi "],
         max: [200000, "nomnii une ihdee 200000 baih ystoi "],
      },
      balance: Number,
      createdAt: {
         type: Date,
         defualt: Date.now(),
      },
      content: {
         type: String,
         required: [true, "Nomiin tailbariig oruulna uu"],
         trim: true,
         maxlength: [
            5000,
            "Номын тайлбарын урт дээд тал нь 5000-н тэмдэгт байх ёстой",
         ],
      },
      bestseller: {
         type: Boolean,
         default: false,
      },
      available: [String],
      category: {
         type: mongoose.Schema.ObjectId,
         ref: "Category",
         required: true,
      },
      createdUser: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
      },
      updatedUser: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
      },
      uploadPhotoUser: {
         type: mongoose.Schema.ObjectId,
         ref: "User",
      },
   },
   { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

BookSchema.statics.computeCategoryAveragePrice = async function (catId) {
   const obj = await this.aggregate([
      {
         $match: { category: catId },
      },
      {
         $group: { _id: "$category", avgPrice: { $avg: "$price" } },
      },
   ]);

   const obj2 = await this.aggregate([
      {
         $match: { category: catId },
      },
      {
         $group: { _id: "$category", avgRating: { $avg: "$rating" } },
      },
   ]);

   let avgPrice = null;
   let avgRating = null;

   if (obj.length > 0) avgPrice = obj[0].avgPrice;
   if (obj2.length > 0) avgRating = obj2[0].avgRating;

   await this.model("Category").findByIdAndUpdate(catId, {
      averagePrice: avgPrice,
      averageRating: avgRating,
   });

   return [avgPrice, avgRating];
};

BookSchema.post("save", async function () {
   await this.constructor.computeCategoryAveragePrice(this.category);
});

BookSchema.pre(
   "deleteOne",
   { document: true, query: false },
   async function (next) {
      const categoryId = this.category; // Get the category ID from the query
      console.log(this.category);
      console.log(`Preparing to delete book from category: ${categoryId}`);

      // Call the average price computation
      this.model("Book").computeCategoryAveragePrice(categoryId);
      next();

      next(); // Call the next middleware or proceed with deletion
   },
);

BookSchema.virtual("virtualTestljin").get(function () {
   if (this.author) {
      let toks = this.author.split(" ");
      if (toks.length === 1) toks = this.author.split(".");
      if (toks.length === 2) return toks[1];
      return toks;
   }
   return null;
});

BookSchema.pre("save", function (next) {
   this.slug = slugify(this.name);
   next();
});

module.exports = mongoose.model("Book", BookSchema);
