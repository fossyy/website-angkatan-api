export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (process.env.NODE_ENV === "development") {
    res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};