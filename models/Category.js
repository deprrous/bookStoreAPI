const mongoose = require("mongoose");
const { tr, slugify } = require("transliteration");

const CategorySchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Categoryiin neriig oruulna uu"],
         unique: true,
         trim: true,
         maxlength: [50, "too long it must be lower than 50"],
      },
      slug: String,
      description: {
         type: String,
         required: [true, "category-iin tailbar oruulah ystoi"],
         trim: true,
         maxlength: [500, "Ihdee 500 temdegt baih ystoi"],
      },
      photo: {
         type: String,
         default: "no-photo.png",
      },
      averageRating: {
         type: Number,
         min: [1, "bagadaa 1 baih ystoi "],
         max: [10, "ihdee 10 baih ystoi "],
      },
      averagePrice: Number,
      createdAt: {
         type: Date,
         defualt: Date.now(),
      },
   },
   { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

CategorySchema.virtual("books", {
   ref: "Book",
   localField: "_id",
   foreignField: "category",
   justOne: false,
});

CategorySchema.pre(
   "deleteOne",
   { document: true, query: false },
   async function (next) {
      await this.model("Book").deleteMany({ category: this._id });
      next();
   },
);
CategorySchema.pre("save", function (next) {
   this.slug = slugify(this.name);
   // this.averageRating = Math.floor(Math.random() * 10) + 1;
   // this.averagePrice = Math.floor(Math.random() * 100000) + 3000;
   next();
});

module.exports = mongoose.model("Category", CategorySchema);
