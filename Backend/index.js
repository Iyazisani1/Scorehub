import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import userRoute from "./route/Userroute.js";
import footballRoute from "./route/footballroute.js";
import preferenceRoute from "./route/preferenceRoute.js";
import matchRoute from "./route/matchRoute.js";
import "./Scraper/cronJob.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 4001;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

app.use("/api/user", userRoute);
app.use("/api/football", footballRoute);
app.use("/api/preferences", preferenceRoute);
app.use("/api/match", matchRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});
