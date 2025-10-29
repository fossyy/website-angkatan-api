export function restrictInProd(req, res, next) {
  const env = process.env.NODE_ENV;
  if (env === "production" || env === "deployment") {
    return res.status(403).json({ error: "This route is not allowed in production." });
  }
  next();
}