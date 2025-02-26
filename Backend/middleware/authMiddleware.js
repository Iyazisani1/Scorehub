import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
        error:
          "No token provided or incorrect format (Expected: Bearer <token>)",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
        error: "Token is missing after Bearer",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid token payload",
        error: "userId not found in token",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Handle specific JWT errors
    let errorMessage = "Invalid or expired token";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token has expired";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token format";
    }

    console.error("Auth middleware error:", error); // Log for debugging
    return res.status(401).json({
      message: errorMessage,
      error: error.message,
    });
  }
};
