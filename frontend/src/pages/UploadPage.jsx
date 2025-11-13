import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("http://localhost:1112/api/receipts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      alert(
        "Successfully uploaded, you can view the changes in Transaction section"
      );
      //fetchHistory(); // refresh history after upload
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Upload form */}
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>
      <form onSubmit={handleUpload} className="flex items-center gap-4 mb-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
