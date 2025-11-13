import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Base() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      //if token which is present in localstorage is vaild then direct to /dashboard
      const res = await axios.get("http://localhost:1112/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log("✅ Profile:", res.data);
      navigate("/dashboard");
    } catch (err) {
      //token not valid redirect to /login to generate token
      //console.error("❌ Not authorized:", err.response?.data || err.message);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6">
      <div className="max-w-4xl text-center p-10 bg-white shadow-2xl rounded-3xl border border-gray-100">
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-sm">
          Personal Finance Assistant 💰
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg mb-10 leading-relaxed">
          Take control of your money with smart tracking, clear reports, and
          effortless receipt management.
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              📥 Manage Income & Expenses
            </h3>
            <p className="text-gray-600 text-sm">
              Easily add and track your daily income and expenses with
              categories and notes.
            </p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl border border-green-100 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              📅 Filter by Date
            </h3>
            <p className="text-gray-600 text-sm">
              View transactions across any custom date range to analyze spending
              patterns.
            </p>
          </div>
          <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-purple-700 mb-2">
              📊 Graphs & Reports
            </h3>
            <p className="text-gray-600 text-sm">
              Visualize your financial activity with charts by category, time,
              and trends.
            </p>
          </div>
          <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">
              🧾 Upload Receipts
            </h3>
            <p className="text-gray-600 text-sm">
              Extract expense details directly from uploaded receipts
              (image/PDF).
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={handleLogin} // login button
          >
            Login
          </button>
          <button
            className="px-8 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium shadow-md hover:shadow-lg hover:bg-gray-200 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => navigate("/register")} // Register button
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
