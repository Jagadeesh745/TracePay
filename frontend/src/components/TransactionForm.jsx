import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function TransactionForm({ type, onSuccess }) {
  //common for both income and expense
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // check local storage for token
  //all categories
  const categories =
    type === "income"
      ? ["Salary", "Bonus", "Freelance", "Investment", "Gift", "Other"]
      : [
          "Groceries",
          "Transport",
          "Dining",
          "Entertainment",
          "Bills",
          "Shopping",
          "Healthcare",
          "Other",
        ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:1112/api/transactions",
        { type, category, amount: Number(amount), date, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onSuccess) onSuccess(res.data);

      setCategory("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error adding transaction:", err.response?.data || err);
      alert("Failed to add transaction");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            Add {type === "income" ? "Income" : "Expense"}
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Category --</option>
              {categories.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white font-medium shadow-md transition hover:opacity-90 ${
              type === "income" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            Add {type === "income" ? "Income" : "Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
