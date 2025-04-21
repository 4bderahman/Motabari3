import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderComponent from "../../sections/header/header-component";
import FooterComponent from "../../sections/footer/footer-component";
import Toast from "../../ui/Toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("donor");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Check for stored credentials from signup
  useEffect(() => {
    const pendingLogin = sessionStorage.getItem("pendingLogin");
    if (pendingLogin) {
      const { email, password, userType } = JSON.parse(pendingLogin);
      setFormData({ email, password });
      setLoginType(userType);
      // Clear stored credentials
      sessionStorage.removeItem("pendingLogin");
    }
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("=== Login Attempt ===", {
      email: formData.email,
      userType: loginType,
    });

    try {
      const response = await axios.post("http://localhost:3001/login-user", {
        email: formData.email,
        password: formData.password,
        userType: loginType,
      });

      console.log("Login response:", {
        status: response.data.status,
        hasToken: !!response.data.token,
        data: response.data,
      });

      if (response.data.status === "success") {
        // Store complete user data
        const userData = {
          token: response.data.token,
          _id: response.data.id,
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          bloodType: response.data.bloodType,
          userType: response.data.userType,
          age: response.data.age,
        };

        // Store in appropriate storage based on user type
        localStorage.setItem(
          userData.userType === "hospital" ? "hospital" : "user",
          JSON.stringify(userData)
        );

        // Set default authorization header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${userData.token}`;

        console.log("Login successful:", {
          userType: userData.userType,
          tokenPreview: userData.token.substring(0, 20) + "...",
          userData: userData,
        });

        showToast("Login successful! Redirecting...", "success");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.log("Login failed:", response.data.message);
        const errorMessage = response.data.message || "Login failed";
        showToast(errorMessage, "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message || "Invalid email or password";
      showToast(errorMessage, "error");
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
          {/* Toggle Buttons */}
          <div className="flex bg-gray-200 rounded-lg mb-6 p-1">
            <button
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginType === "donor"
                  ? "bg-[#500000] text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setLoginType("donor")}
            >
              Donor Login
            </button>
            <button
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginType === "hospital"
                  ? "bg-[#500000] text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setLoginType("hospital")}
            >
              Hospital Login
            </button>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Welcome Back
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

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
                placeholder="Enter your email"
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#500000] focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#500000] focus:ring-[#500000]"
                />
                <label className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-[#500000] hover:text-[#700000] transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#500000] hover:bg-[#700000] text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-[#500000] hover:text-[#700000] font-medium transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
      <FooterComponent />
    </>
  );
};

export default LoginPage;
