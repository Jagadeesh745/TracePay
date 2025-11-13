import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes and ensure only authenticated users can access them
 */
export const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2️⃣ Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // 3️⃣ Verify token using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Find the user by ID encoded in the token, exclude password
      req.user = await User.findById(decoded.id).select("-password");

      // 5️⃣ If user not found, return 401
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 6️⃣ If all checks pass, call next() to continue to route handler
      next();
    } catch (error) {
      // 7️⃣ Token is invalid or expired
      console.error("Auth error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 8️⃣ If no token provided at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
