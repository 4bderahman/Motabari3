import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderComponent from "../../sections/header/header-component";
import FooterComponent from "../../sections/footer/footer-component";
import Toast from "../../ui/Toast";
import { BASE_URL } from "../../utility-functions/base-url";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Sending reset request to:", `${BASE_URL}/forgot-password`);
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        email,
      });

      if (response.data.status === "success") {
        showToast(
          "Password reset instructions have been sent to help.motabari3@gmail.com. Please check this email for the reset link.",
          "success"
        );
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      showToast(
        error.response?.data?.message || "Error sending reset instructions",
        "error"
      );
    } finally {
      setIsLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Reset Password
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Enter your email address and we&apos;ll send you instructions to
            reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#500000] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#500000] hover:bg-[#700000] text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-[#500000] hover:text-[#700000] font-medium transition-colors"
              >
                Back to Login
              </a>
            </p>
          </form>
        </div>
      </div>
      <FooterComponent />
    </>
  );
};

export default ForgotPassword;
