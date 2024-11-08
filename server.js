const express = require("express");
const dotenv = require("dotenv");
// Router oruulj ireh
const categoriesRoutes = require("./routes/categories");
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
const path = require("path");
const colors = require("colors");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
const rfs = require("rotating-file-stream");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });
app = express();

const accessLogStream = rfs.createStream("access.log", {
   interval: "1d",
   path: path.join(__dirname, "log"),
});

connectDB();
// body parser
app.use(express.json());
app.use(fileUpload());
// app.use(logger);
app.use(morgan("dev", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/users", usersRoutes);

app.use(errorHandler);
// appiin tohirgoog process.env ruu achaallah
const server = app.listen(
   process.env.PORT,
   console.log(
      "Express server ".cyan.bold +
         process.env.PORT +
         " port deer aslaa...".cyan.bold,
   ),
);

process.on(`unhandledRejection`, (err, promise) => {
   console.log(`Error : ${err.message}`.red.underline.bold);
   server.close(() => {
      process.exit(1);
   });
});
