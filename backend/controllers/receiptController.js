import fs from "fs";
import Receipt from "../models/Receipt.js";
import Transaction from "../models/Transaction.js";
import { processReceipt } from "../services/ocrService.js";
import {
  parseReceiptText,
  categorizeExpense,
} from "../services/receiptParser.js";

export const uploadReceipt = async (req, res, next) => {
  try {
    // 1️⃣ Check if a file was uploaded
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    console.log("Processing file:", req.file.path);

    // 2️⃣ OCR: Extract text from PDF or image
    const rawText = await processReceipt(req.file.path);

    if (!rawText) {
      return res.status(400).json({ message: "Failed to extract text" });
    }

    console.log("OCR extracted text:\n", rawText);

    // 3️⃣ Parse the text to extract meaningful receipt data
    const extractedData = parseReceiptText(rawText);

    // 4️⃣ Save the receipt info in the database
    const receipt = await Receipt.create({
      user: req.user.id,
      filePath: req.file.path,
      extractedData,
    });

    // 5️⃣ If the receipt has a total, create a transaction automatically
    let transaction = null;
    if (extractedData.total != null) {
      // Categorize the expense based on store name or receipt lines
      const category = categorizeExpense(
        extractedData.storeName,
        extractedData.rawLines
      );

      // Create a new transaction record
      transaction = await Transaction.create({
        user: req.user.id,
        type: "expense",
        category,
        amount: extractedData.total,
        date: extractedData.date ? new Date(extractedData.date) : new Date(),
        note: `Auto from receipt: ${extractedData.storeName}`,
      });
    }

    console.log("Receipt processed:", {
      store: extractedData.storeName,
      total: extractedData.total,
      transactionCreated: transaction !== null,
    });

    // 6️⃣ Return the saved receipt and transaction (if any)
    res.status(201).json({ receipt, transaction });
  } catch (err) {
    console.error("Error uploading receipt:", err);
    next(err); // Pass error to global error handler
  }
};

export const getReceipts = async (req, res, next) => {
  try {
    // Fetch receipts from the database, newest first
    const receipts = await Receipt.find({ user: req.user.id }).sort({
      uploadedAt: -1,
    });

    // Return receipts as JSON
    res.json(receipts);
  } catch (err) {
    next(err); // Pass error to global error handler
  }
};
