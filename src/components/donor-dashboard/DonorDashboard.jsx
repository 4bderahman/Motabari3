import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Edit, Activity, Calendar, User, Clock } from "lucide-react";
import PropTypes from "prop-types";
import QRCodeCard from "./QRCodeCard";
import DonationCalendar from "./DonationCalendar";
import DonationHistory from "./DonationHistory";
import { BASE_URL } from "../../utility-functions/base-url";
import HeaderComponent from "../sections/header/header-component";
import EditProfile from "./EditProfile";
import LetterAvatar from "./LetterAvatar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-lg">
          <Icon className="w-6 h-6 text-dark_red" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {trend && (
        <span
          className={`text-sm ${trend > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
  </motion.div>
);

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number,
};

function DonorDashboard() {
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.token) {
          navigate("/login");
          return;
        }

        if (userData.userType !== "donor") {
          navigate("/login");
          return;
        }

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${userData.token}`;

        const [profileRes, donationsRes, appointmentsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/donor/profile`),
          axios.get(`${BASE_URL}/api/donor/donations`),
          axios.get(`${BASE_URL}/api/donor/appointments`),
        ]);

        if (profileRes.data.status === "success") {
          setDonorData({
            ...profileRes.data.data,
            token: userData.token,
          });

          // Log the raw donations data
          console.log("Raw donations response:", donationsRes.data);

          const donations = donationsRes.data.data || [];
          console.log("Processed donations:", donations);

          setDonationHistory(donations);
          setAppointments(appointmentsRes.data.data || []);
        }
      } catch (err) {
        console.error("Dashboard error details:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Error loading dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [navigate]);

  const handleProfileUpdate = (updatedData) => {
    setDonorData(updatedData);
  };

  const handleAppointmentScheduled = async () => {
    try {
      const appointmentsRes = await axios.get(
        `${BASE_URL}/api/donor/appointments`
      );
      if (appointmentsRes.data.status === "success") {
        setAppointments(appointmentsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderComponent />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark_red"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderComponent />
        <div className="flex justify-center items-center min-h-screen text-red-600">
          Error: {error}
        </div>
      </>
    );
  }

  // Calculate stats
  const completedDonations = donationHistory.filter(
    (donation) => donation.donated === true
  );

  const scheduledDonations = appointments.filter(
    (appointment) => appointment.status === "not_yet"
  );

  const totalDonations = completedDonations.length;
  const totalScheduled = scheduledDonations.length;

  // Get the most recent donation date
  const sortedDonations = [...donationHistory]
    .filter((donation) => donation.donated === true)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const lastDonationDate =
    sortedDonations.length > 0
      ? new Date(sortedDonations[0].date).toLocaleDateString()
      : "No donations yet";

  console.log("Final stats:", {
    totalDonations,
    totalScheduled,
    lastDonationDate,
    sortedDonationsLength: sortedDonations.length,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderComponent />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 sm:px-6 lg:px-8 py-8 mt-16"
      >
        {/* Profile Header */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-dark_red to-red rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="bg-white p-1 rounded-xl shadow-md">
                <LetterAvatar
                  name={donorData?.name || "User"}
                  size="lg"
                  className="bg-gradient-to-br from-red-100 to-red-200 text-dark_red"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">
                  {donorData?.name || "Donor Name"}
                </h1>
                <p className="text-red-100">{donorData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-red-700/20 text-white">
                <Bell className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-white text-dark_red px-6 py-2 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Activity}
            label="Total Donations"
            value={totalDonations}
            trend={10}
          />
          <StatCard
            icon={Calendar}
            label="Scheduled Donations"
            value={totalScheduled}
          />
          <StatCard
            icon={Clock}
            label="Last Donation"
            value={lastDonationDate}
          />
          <StatCard
            icon={User}
            label="Blood Type"
            value={donorData?.bloodType || "N/A"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <DonationHistory
                history={donationHistory}
                appointments={appointments}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <DonationCalendar
                lastDonation={donorData?.lastDonation}
                onAppointmentScheduled={handleAppointmentScheduled}
              />
            </motion.div>
          </div>
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <QRCodeCard donorId={donorData?._id} donorData={donorData} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-dark_red to-red">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Name
                      </h3>
                      <p className="text-lg font-medium text-gray-900">
                        {donorData?.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Blood Type
                      </h3>
                      <p className="text-lg font-medium text-dark_red">
                        {donorData?.bloodType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Phone
                      </h3>
                      <p className="text-lg font-medium text-gray-900">
                        {donorData?.phone}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Last Donation
                      </h3>
                      <p className="text-lg font-medium text-gray-900">
                        {lastDonationDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showEditModal && (
          <EditProfile
            onClose={() => setShowEditModal(false)}
            onUpdate={handleProfileUpdate}
            currentUserData={donorData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default DonorDashboard;
