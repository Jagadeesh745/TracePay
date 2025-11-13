import Transaction from "../models/Transaction.js";

/**
 * Add a new transaction for the logged-in user
 * POST /api/transactions
 */
export const addTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, date, note } = req.body;

    // Create a new transaction in the database
    const transaction = await Transaction.create({
      user: req.user.id, // set the user from the authenticated request
      type, // income or expense
      category, // category of transaction
      amount, // amount of money
      date, // transaction date
      note, // optional note
    });

    // Respond with the created transaction
    res.status(201).json(transaction);
  } catch (error) {
    // Pass errors to global error handler
    next(error);
  }
};

/**
 * Get all transactions for the logged-in user
 * GET /api/transactions?page=&limit=
 */
export const getTransactions = async (req, res, next) => {
  try {
    // Fetch all transactions for this user, newest first
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1, // sort by creation date descending
    });

    // Send the list of transactions as JSON
    res.json(transactions);
  } catch (error) {
    next(error); // pass errors to global error handler
  }
};

/**
 * Delete a specific transaction by ID
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    // Find and delete the transaction belonging to this user
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // ensure user can only delete their own transactions
    });

    // If no transaction was found, return 404
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Respond with success message
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    next(error); // pass errors to global error handler
  }
};
