import React from "react";
import PropTypes from "prop-types";
import HomePage from "./components/pages/home/home-page";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import DonateBloodPage from "./components/pages/donate-blood/donate-blood-page";
import HostBloodDrivePage from "./components/pages/host-blood-drive/host-blood-drive";
import NeedBloodPage from "./components/pages/need-blood/need-blood-page";
import ContactPage from "./components/pages/contact/contact-page";
import Admin from "./components/layouts/admin";
import Dashboard from "../src/components/views/admin/dashboard";
import AdminDonateBlood from "../src/components/views/admin/admin-donate-blood";
import AdminNeedBlood from "../src/components/views/admin/admin-need-blood";
import AdminHostBloodDrive from "../src/components/views/admin/admin-host-blood-drive";
import AdminNeedHelp from "../src/components/views/admin/admin-need-help";
import QRScannerPage from "./components/qr-scanner/QRScannerPage";
import LoginPage from "./components/pages/auth/login-page";
import SignupPage from "./components/pages/auth/signup-page";
import AdminLogin from "./components/pages/auth/admin-login";
import ForgotPassword from "./components/pages/auth/forgot-password";
import ResetPassword from "./components/pages/auth/reset-password";
import HeaderComponent from "./components/sections/header/header-component";
import DonorDashboard from "./components/donor-dashboard/DonorDashboard";
import HospitalDashboard from "./components/hospital-dashboard/HospitalDashboard";
import { getUser } from "./utility-functions/auth-utils";
import axios from "axios";
import DonationPage from "./components/pages/donation/DonationPage";

// Protected Route Component for specific user types
const ProtectedRoute = ({ children, userType }) => {
  const user = getUser();
  const location = useLocation();

  console.log("=== Protected Route Check ===", {
    path: location.pathname,
    requiredType: userType || "any",
    hasUser: !!user,
    userType: user?.userType,
    hasToken: !!user?.token,
    token: user?.token,
  });

  if (!user || !user.token) {
    console.log("Protection failed: No user or token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userType && user.userType !== userType) {
    console.log("Protection failed: User type mismatch", {
      required: userType,
      actual: user.userType,
    });
    return <Navigate to="/" replace />;
  }

  console.log("Protection passed: Rendering protected content");
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  userType: PropTypes.string,
};

// Auth Route Component - redirects to home if already logged in
const AuthRoute = ({ children }) => {
  const user = getUser();
  const location = useLocation();
  const isAdminLogin = location.pathname === "/admin/login";

  if (user) {
    // If it's admin login page and user is not admin, allow access
    if (isAdminLogin && user.userType !== "admin") {
      return children;
    }
    // If user is admin and trying to access admin login, redirect to admin dashboard
    if (isAdminLogin && user.userType === "admin") {
      return <Navigate to="/admin" replace />;
    }
    // For other auth routes, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

AuthRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Layout wrapper component
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isDonorDashboard = location.pathname.startsWith("/donor-dashboard");
  const isHospitalDashboard = location.pathname.startsWith(
    "/hospital-dashboard"
  );
  const shouldShowHeader =
    !isAdminRoute && !isDonorDashboard && !isHospitalDashboard;

  return (
    <>
      {shouldShowHeader && <HeaderComponent />}
      {children}
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes - accessible without login */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Auth Routes - for login/signup */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <AuthRoute>
              <AdminLogin />
            </AuthRoute>
          }
        />

        {/* Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/donation" element={<DonationPage />} />

        {/* Protected Routes - require authentication */}
        <Route
          path="/host-blood-drive"
          element={
            <ProtectedRoute>
              <HostBloodDrivePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/need-blood"
          element={
            <ProtectedRoute>
              <NeedBloodPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          }
        />

        {/* Only show donate blood for non-hospital users */}
        <Route
          path="/donate-blood"
          element={
            <ProtectedRoute userType="donor">
              <DonateBloodPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute userType="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="donate-blood" element={<AdminDonateBlood />} />
          <Route path="need-blood" element={<AdminNeedBlood />} />
          <Route path="host-blood-drive" element={<AdminHostBloodDrive />} />
          <Route path="need-help" element={<AdminNeedHelp />} />
          <Route path="qr-scanner" element={<QRScannerPage />} />
        </Route>

        {/* Dashboard routes */}
        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute userType="donor">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-dashboard"
          element={
            <ProtectedRoute userType="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default App;
