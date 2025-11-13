import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  //const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    //generating the token and inserting data into db using api
    try {
      const res = await axios.post("http://localhost:1112/api/auth/register", {
        name,
        email,
        password,
      });
      const data = res.data;
      const token = data.token;
      if (token) {
        localStorage.setItem("token", token); //token is stored in localstorage
      }
      //console.log("✅ Registered:", res.data);
      alert("User registered successfully!");
      navigate("/dashboard"); //redirect to dashboard
    } catch (err) {
      // console.error("❌ Error:", err.response?.data || err.message);
      alert("Registration failed!"); //failed
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Create an Account
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Join the Personal Finance Assistant to manage your money smarter 🚀
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
            {/*loading phase*/}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
