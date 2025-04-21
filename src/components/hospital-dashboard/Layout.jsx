import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LetterAvatar from "../donor-dashboard/LetterAvatar";
import axios from "axios";
import HeaderComponent from "../sections/header/header-component";

const Layout = ({ children, hospitalData }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all possible storage locations
    localStorage.clear(); // Clear all localStorage
    sessionStorage.clear(); // Clear all sessionStorage

    // Clear authorization header
    delete axios.defaults.headers.common["Authorization"];

    // Force a complete page reload and redirect
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-off_white">
      <HeaderComponent textColor="text-gray-900" />

      {/* User Profile Section */}
      <div className="bg-dark_red text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <LetterAvatar name={hospitalData?.name || "Hospital"} />
              <div>
                <h2 className="text-xl font-semibold">{hospitalData?.name}</h2>
                <p className="text-sm opacity-80">{hospitalData?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
