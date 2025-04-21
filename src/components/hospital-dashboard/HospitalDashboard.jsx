import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import { BASE_URL } from "../../utility-functions/base-url";

function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        // Try both storage locations
        const userData =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(localStorage.getItem("hospital"));
        console.log("Hospital userData from storage:", userData);

        if (!userData || !userData.token) {
          console.log("No hospital data found, redirecting to login");
          navigate("/login");
          return;
        }

        if (userData.userType !== "hospital") {
          console.log("Invalid user type, redirecting to login");
          navigate("/login");
          return;
        }

        // Set authorization header
        const token = userData.token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log(
          "Set Authorization header:",
          axios.defaults.headers.common["Authorization"]
        );

        // Update the API endpoint to match your backend route
        const response = await axios.get(`${BASE_URL}/api/hospital/profile`);
        console.log("Hospital profile response:", response.data);

        if (response.data.status === "success") {
          const updatedHospitalData = {
            ...response.data.data,
            token: token,
            userType: "hospital",
          };

          // Update both storage locations to ensure consistency
          localStorage.setItem("user", JSON.stringify(updatedHospitalData));
          localStorage.setItem("hospital", JSON.stringify(updatedHospitalData));

          setHospitalData(updatedHospitalData);
        } else {
          throw new Error("Failed to fetch hospital data");
        }
      } catch (err) {
        console.error("Error fetching hospital data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("hospital");
          navigate("/login");
        } else {
          setError(err.message || "Error loading dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [navigate]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark_red"></div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-dark_red text-white rounded-md hover:bg-red"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Show dashboard if we have data
  if (!hospitalData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">No Data Available</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-dark_red text-white rounded-md hover:bg-red"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout hospitalData={hospitalData}>
      <Dashboard hospitalData={hospitalData} />
    </Layout>
  );
}

export default HospitalDashboard;
