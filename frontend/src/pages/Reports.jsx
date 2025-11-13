import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("token");
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  //auth check
  const navigate = useNavigate();
  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get("http://localhost:1112/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("❌ Not authorized:", err.response?.data || err.message);
        navigate("/login"); // redirect to login if no/invalid token
      }
    };
    check();
  }, [token]);
  //fetch transactions data from db
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("http://localhost:1112/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data || []);
      } catch (err) {
        console.error("Error fetching transactions", err);
      }
    };
    fetchTransactions();
  }, [token]);

  const totals = useMemo(() => {
    //total income
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    //total expense
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    //calculate average
    const days = new Set(transactions.map((t) => t.date.split("T")[0])).size;
    const avgDaily = days > 0 ? expense / days : 0;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return {
      income,
      expense,
      balance: income - expense,
      avgDaily,
      savingsRate,
    };
  }, [transactions]);

  // ✅ Pie chart: expenses by category
  const expenseByCategory = useMemo(() => {
    const grouped = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = acc[t.category] || { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
        return acc;
      }, {});
    return Object.values(grouped);
  }, [transactions]);

  // ✅ Top 5 categories
  const topExpenses = useMemo(() => {
    return [...expenseByCategory].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [expenseByCategory]);

  // ✅ Bar chart: monthly income vs expense
  const monthlyReport = useMemo(() => {
    const grouped = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!grouped[month]) {
        grouped[month] = { month, income: 0, expense: 0, balance: 0 };
      }
      if (t.type === "income") {
        grouped[month].income += t.amount;
      } else {
        grouped[month].expense += t.amount;
      }
      grouped[month].balance = grouped[month].income - grouped[month].expense;
    });
    return Object.values(grouped);
  }, [transactions]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totals.income.toFixed(2)}
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
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Avg Daily Spend</h3>
          <p className="text-2xl font-bold text-purple-600">
            ${totals.avgDaily.toFixed(2)}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="text-gray-600">Savings Rate</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {totals.savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category (Pie) */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {expenseByCategory.map((entry, index) => (
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
            <p className="text-gray-500 text-sm">No expense data yet.</p>
          )}
        </div>

        {/* Monthly Income vs Expense (Bar) */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Monthly Income vs Expense
          </h3>
          {monthlyReport.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10B981" />
                <Bar dataKey="expense" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No monthly data yet.</p>
          )}
        </div>
      </div>

      {/* Balance Trend (Line Chart) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Balance Trend</h3>
        {monthlyReport.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm">No balance trend yet.</p>
        )}
      </div>

      {/* Top Categories Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top 5 Expense Categories</h3>
        {topExpenses.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="pb-2">Category</th>
                <th className="pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {topExpenses.map((c, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-red-600 font-medium">${c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">No categories available.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
