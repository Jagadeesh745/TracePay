import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const check = async () => {
      try {
        await axios.get("http://localhost:1112/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        navigate("/login");
      }
    };
    check();
  }, [token]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("http://localhost:1112/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data || []);
        setFiltered(res.data || []);
      } catch (err) {
        console.error("Error fetching transactions", err);
      }
    };
    fetchTransactions();
  }, [token]);

  // Apply filters
  useEffect(() => {
    let data = [...transactions];
    if (filters.type) data = data.filter((t) => t.type === filters.type);
    if (filters.category)
      data = data.filter((t) => t.category === filters.category);
    if (filters.startDate)
      data = data.filter(
        (t) => new Date(t.date) >= new Date(filters.startDate)
      );
    if (filters.endDate)
      data = data.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    setFiltered(data);
  }, [filters, transactions]);

  // Categories list
  const categories = [...new Set(transactions.map((t) => t.category))];

  // Delete a transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      await axios.delete(`http://localhost:1112/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove deleted transaction from state
      const updated = transactions.filter((t) => t._id !== id);
      setTransactions(updated);
      setFiltered(updated);
    } catch (err) {
      console.error("Error deleting transaction", err);
      alert("Failed to delete transaction.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border rounded-lg p-2"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border rounded-lg p-2"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="border rounded-lg p-2"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border rounded-lg p-2"
        />

        <button
          onClick={() =>
            setFilters({ type: "", category: "", startDate: "", endDate: "" })
          }
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="pb-2">Date</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Note</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <tr key={t._id} className="border-b last:border-0">
                  <td className="py-2">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td
                    className={`py-2 font-medium ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type}
                  </td>
                  <td className="py-2">{t.category}</td>
                  <td
                    className={`py-2 font-medium ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${t.amount}
                  </td>
                  <td className="py-2">{t.note || "-"}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
