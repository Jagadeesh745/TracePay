import express from "express";
import {
  addTransaction,
  getTransactions,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/transactions
router.post("/", protect, addTransaction);

// @route   GET /api/transactions
// supports pagination with ?page=&limit=
router.get("/", protect, getTransactions);

// @route   DELETE /api/transactions/:id
router.delete("/:id", protect, deleteTransaction);

export default router;
