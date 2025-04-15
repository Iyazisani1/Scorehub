import express from "express";
import {
  placeBet,
  getBettingHistory,
  getUserBalance,
  resolveBets,
} from "../controller/Betting.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/place", authMiddleware, placeBet);
router.get("/history", authMiddleware, getBettingHistory);
router.get("/balance", authMiddleware, getUserBalance);
router.post("/resolve", authMiddleware, resolveBets);

export default router;
