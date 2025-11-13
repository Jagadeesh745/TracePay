import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Upload from "./pages/UploadPage";
import Base from "./pages/Base";
import Register from "./pages/Register";
import AddIncome from "./pages/AddIncome";
import AddExpense from "./pages/AddExpense";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes inside Layout */}
      <Route path="/" element={<Base />} />
      <Route
        path="/add-income"
        element={
          <Layout>
            <AddIncome />
          </Layout>
        }
      />
      <Route
        path="/add-expense"
        element={
          <Layout>
            <AddExpense />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/transactions"
        element={
          <Layout>
            <Transactions />
          </Layout>
        }
      />
      <Route
        path="/reports"
        element={
          <Layout>
            <Reports />
          </Layout>
        }
      />
      <Route
        path="/upload"
        element={
          <Layout>
            <Upload />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
