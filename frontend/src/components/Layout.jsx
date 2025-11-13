import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, ListOrdered, FileUp, PieChart, LogOut } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:1112/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(
          "❌ Error fetching profile:",
          err.response?.data || err.message
        );
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const linkClasses = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      location.pathname === path
        ? "bg-gray-200 text-gray-900"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar - fixed */}
      <aside className="w-64 bg-white border-r flex flex-col fixed top-0 left-0 bottom-0">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 font-serif">
            Personal Finance Assistant
          </h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className={linkClasses("/dashboard")}>
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link to="/transactions" className={linkClasses("/transactions")}>
            <ListOrdered size={18} /> Transactions
          </Link>
          <Link to="/reports" className={linkClasses("/reports")}>
            <PieChart size={18} /> Reports
          </Link>
          <Link to="/upload" className={linkClasses("/upload")}>
            <FileUp size={18} /> Upload
          </Link>
        </nav>

        <div className="p-4 border-t">
          {user && (
            <p className="text-sm font-medium text-gray-700 mb-2">
              👤 {user.name}
            </p>
          )}
          <button
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content (scrollable) */}
      <div className="flex-1 ml-64 flex flex-col h-screen">
        {/* Header - fixed */}

        {/* Scrollable children */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
