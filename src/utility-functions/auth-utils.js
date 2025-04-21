import axios from "axios";

export const getUser = () => {
  try {
    console.log("=== getUser Check ===");
    // Check for admin user first
    const adminToken = localStorage.getItem("token");
    const adminDataStr = localStorage.getItem("userData");

    // Check for hospital and donor users
    const hospitalStr = localStorage.getItem("hospital");
    const userStr = localStorage.getItem("user");

    console.log("Storage state:", {
      hasAdminToken: !!adminToken,
      hasAdminData: !!adminDataStr,
      hasHospital: !!hospitalStr,
      hasUser: !!userStr,
    });

    // Handle admin user
    if (adminToken && adminDataStr) {
      const adminData = JSON.parse(adminDataStr);
      if (adminData.userType === "admin") {
        console.log("Found admin user");
        axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
        return { ...adminData, token: adminToken };
      }
    }

    // Handle hospital and donor users
    let user = null;

    if (hospitalStr) {
      user = JSON.parse(hospitalStr);
      console.log("Found hospital user:", {
        userType: user.userType,
        hasToken: !!user.token,
      });
    } else if (userStr) {
      user = JSON.parse(userStr);
      console.log("Found donor user:", {
        userType: user.userType,
        hasToken: !!user.token,
        userData: user,
      });
    }

    if (user) {
      const token = user.token || user.accessToken;
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Set Authorization header:", `Bearer ${token}`);

        const completeUser = {
          ...user,
          token,
          userType: user.userType || (hospitalStr ? "hospital" : "donor"),
        };

        // Log all user properties to debug
        console.log("Complete user data:", {
          id: completeUser._id || completeUser.id,
          name: completeUser.name,
          email: completeUser.email,
          phone: completeUser.phone,
          bloodType: completeUser.bloodType,
          userType: completeUser.userType,
          hasToken: !!completeUser.token,
        });

        console.log("Returning user:", {
          userType: completeUser.userType,
          hasToken: !!completeUser.token,
          email: completeUser.email,
        });
        return completeUser;
      }
    }

    console.log("No valid user found");
    delete axios.defaults.headers.common["Authorization"];
    return null;
  } catch (error) {
    console.error("Error in getUser:", error);
    delete axios.defaults.headers.common["Authorization"];
    return null;
  }
};

export const isAuthenticated = () => {
  console.log("=== isAuthenticated Check ===");
  const user = getUser();
  const isAuth = !!user && !!user.token;
  console.log("Authentication result:", { isAuth, userType: user?.userType });
  return isAuth;
};

export const getUserType = () => {
  const user = getUser();
  const type = user?.userType || null;
  console.log("getUserType result:", type);
  return type;
};

export const logout = () => {
  console.log("=== Logout ===");

  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();

  // Clear authorization header
  delete axios.defaults.headers.common["Authorization"];

  // Force a complete page reload to clear React state
  window.location.replace("/");
};
