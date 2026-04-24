export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error("Unhandled error:", err);
  res.status(statusCode);
  res.json({
    message:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred."
        : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
