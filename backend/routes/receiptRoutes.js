import express from "express";
import multer from "multer";
import {
  uploadReceipt,
  getReceipts,
} from "../controllers/receiptController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage: set destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

// Multer config: accept only images or PDFs
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed!"), false);
    }
  },
});

// POST /api/receipts → upload a single receipt file
router.post("/", protect, upload.single("file"), uploadReceipt);

// GET /api/receipts → fetch all receipts for logged-in user
router.get("/", protect, getReceipts);

export default router;
