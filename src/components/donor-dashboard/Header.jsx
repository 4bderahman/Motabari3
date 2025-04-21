import React from "react";
import { Bell, LogOut, Edit2 } from "lucide-react";

function Header({ name, onLogout }) {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-dark_red">
          Welcome, {name}
        </h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-dark_red text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
