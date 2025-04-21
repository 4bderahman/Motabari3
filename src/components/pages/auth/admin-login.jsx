import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderComponent from "../../sections/header/header-component";
import FooterComponent from "../../sections/footer/footer-component";
import Toast from "../../ui/Toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/admin/login",
        formData
      );

      if (response.data.status === "success") {
        const { token, id, email, userType } = response.data;

        // Store token and user data separately
        localStorage.setItem("token", token);
        localStorage.setItem(
          "userData",
          JSON.stringify({ id, email, userType })
        );

        // Set default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        showToast("Login successful! Redirecting...", "success");
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        showToast(response.data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderComponent />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
        <div className="w-full max-w-[400px] bg-white rounded-xl p-8 shadow-lg mt-24 mb-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Admin Login
          </h2>

          {/* Error Message */}
          {/* {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )} */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#500000] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="admin@motabari3.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#500000] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="motabari3.."
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#500000] hover:bg-[#700000] text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
      <FooterComponent />
    </>
  );
};

export default AdminLogin;
