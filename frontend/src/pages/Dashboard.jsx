import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1"];

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  //Auth check
  useEffect(() => {
    const check = async () => {
      try {
        await axios.get("http://localhost:1112/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        //console.error("❌ Not authorized:", err.response?.data || err.message);
        navigate("/login");
      }
    };
    check();
  }, [token, navigate]);

  //Fetch transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:1112/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("Transactions response:", res.data);

        //res will contain {id:...,user:....,type:...,expense:...};
        const txns = res.data || [];

        setTransactions(txns);

        // calculate totals
        const income = txns
          .filter((t) => t.type === "income")
          .reduce((acc, t) => acc + t.amount, 0);
        // calculate expense
        const expense = txns
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);

        setTotals({ income, expense, balance: income - expense });
      } catch (err) {
        console.error("Error fetching transactions", err); //error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Group expenses by category
  const expenseData = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return []; //make sure array is not empty
    //calculate total expense based on groups
    const grouped = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = acc[t.category] || { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
        return acc;
      }, {});
    return Object.values(grouped);
  }, [transactions]);
  //Loading Screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">DashBoard</h1>
      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totals.income.toFixed(2)}
            {/* fixed to two decimals*/}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${totals.expense.toFixed(2)}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Balance</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${totals.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Buttons */}
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          onClick={() => {
            navigate("/add-income"); //redirect to /add-income
          }}
        >
          Add Income
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
          onClick={() => {
            navigate("/add-expense"); //redirect to /add-expense
          }}
        >
          Add Expense
        </button>
      </div>

      {/* Transactions + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          {/* Recent Transactions */}
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Transactions
          </h3>

          {/* attributes */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-sm">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/*last five transactions*/}
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {t.note || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {t.category}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold text-right ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500 text-sm italic"
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No expenses yet.</p>
          )}
        </div>
      </div>
      {/* Heatmap */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
        <CalendarHeatmap
          startDate={lastYear}
          endDate={today}
          values={transactions.map((t) => ({
            date: new Date(t.date).toISOString().split("T")[0],
            count: t.amount, // you could also use 1 to just mark presence
          }))}
          classForValue={(value) => {
            if (!value) return "color-empty";
            if (value.count > 10000) return "color-scale-4";
            if (value.count > 5000) return "color-scale-3";
            if (value.count > 1000) return "color-scale-2";
            return "color-scale-1";
          }}
          tooltipDataAttrs={(value) => ({
            "data-tip": `${value.date}: ₹${value.count || 0}`,
          })}
          showWeekdayLabels
        />
      </div>
    </div>
  );
};

export default Dashboard;
