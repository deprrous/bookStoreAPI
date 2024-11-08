const errorHandler = (err, req, res, next) => {
  console.log(err.stack.cyan);
  const error = { ...err };
  error.message = err.message;
  if (error.name === "CastError") {
    error.message = "Энэ ID буруу бүтэцтэй байна!";
    error.statusCode = 400;
  }
  if (error.code === 11000) {
    error.message = "Талбарын утгыг давхардуулж өгч болохгүй!";
    error.statusCode = 400;
  }
  res.status(err.statusCode || 500).json({
    success: false,
    error: error,
  });
};
module.exports = errorHandler;
