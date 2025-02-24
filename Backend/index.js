import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import userRoute from "./route/Userroute.js";
import footballRoute from "./route/footballroute.js";
import preferenceRoute from "./route/preferenceRoute.js";
import matchRoute from "./route/matchRoute.js";
import "./Scraper/cronJob.js"; // Import the cron job to ensure it runs

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Environment variables
const PORT = process.env.PORT || 4001;
const MONGO_URL = process.env.MONGO_URL;

// MongoDB connection with better error handling
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }) // Ensure useNewUrlParser and useUnifiedTopology are set
  .then(() => {
    console.log("Connected to MongoDB");
    // Only start server after DB connection is established
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.use("/api/user", userRoute);
app.use("/api/football", footballRoute);
app.use("/api/preferences", preferenceRoute);
app.use("/api/match", matchRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});
