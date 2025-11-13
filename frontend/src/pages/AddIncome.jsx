import TransactionForm from "../components/TransactionForm";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
export default function AddIncome() {
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
  return (
    <div className="p-6">
      <TransactionForm type="income" />
    </div>
  );
}
