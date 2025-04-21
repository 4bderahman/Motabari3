import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { BASE_URL } from "../../utility-functions/base-url";
import {
  ArrowRight,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";  
import Toast from "../ui/Toast";

// Create StatCard icons mapping
const RequestIcon = FileText;
const PendingIcon = Clock;
const ApprovedIcon = CheckCircle;
const RejectedIcon = XCircle;

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <Icon className="h-6 w-6 text-dark_red" />
    </div>
    <p className="text-3xl font-bold text-dark_red">{value}</p>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    approved: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    rejected: "bg-blood-100 text-blood-800",
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
        statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

const Dashboard = ({ hospitalData }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [requestData, setRequestData] = useState({
    bloodType: "",
    units: 1,
    urgency: "normal",
  });

  // Move fetchDashboardData outside useEffect so we can reuse it
  const fetchDashboardData = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/blood-request/stats`, {
          headers: { Authorization: `Bearer ${hospitalData.token}` },
        }),
        axios.get(`${BASE_URL}/api/blood-request/hospital`, {
          headers: { Authorization: `Bearer ${hospitalData.token}` },
        }),
      ]);

      if (statsRes.data.status === "success") {
        setStats(statsRes.data.data);
      }
      if (requestsRes.data.status === "success") {
        setRecentRequests(requestsRes.data.data);
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error fetching dashboard data",
        "error"
      );
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [hospitalData.token]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleRequestBlood = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/blood-request/create`,
        {
          bloodType: requestData.bloodType,
          units: parseInt(requestData.units),
          urgency: requestData.urgency,
        },
        {
          headers: {
            Authorization: `Bearer ${hospitalData.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        showToast("Blood request submitted successfully!", "success");
        setShowRequestForm(false);
        // Reset form
        setRequestData({
          bloodType: "",
          units: 1,
          urgency: "normal",
        });
        // Refresh dashboard data
        await fetchDashboardData();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error submitting request",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-24">
      <section className="bg-dark_red text-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Welcome, {hospitalData?.name || "Hospital"}
          </h1>
          <p className="mb-6">
            Manage blood requests and monitor your hospital's activity.
          </p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="bg-white text-dark_red px-6 py-3 rounded-lg font-semibold flex items-center transition-colors hover:bg-gray-100"
        >
          Request Blood
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </section>

      {/* Request Blood Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Request Blood</h2>
            <form onSubmit={handleRequestBlood}>
              <select
                value={requestData.bloodType}
                onChange={(e) =>
                  setRequestData({ ...requestData, bloodType: e.target.value })
                }
                className="w-full mb-4 p-2 border rounded"
                required
              >
                <option value="">Select Blood Type</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>

              <input
                type="number"
                min="1"
                value={requestData.units}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    units: parseInt(e.target.value),
                  })
                }
                className="w-full mb-4 p-2 border rounded"
                placeholder="Units needed"
                required
              />

              <select
                value={requestData.urgency}
                onChange={(e) =>
                  setRequestData({ ...requestData, urgency: e.target.value })
                }
                className="w-full mb-4 p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-dark_red text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={RequestIcon}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pending}
            icon={PendingIcon}
          />
          <StatCard
            title="Approved Requests"
            value={stats.approved}
            icon={ApprovedIcon}
          />
          <StatCard
            title="Rejected Requests"
            value={stats.rejected}
            icon={RejectedIcon}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Recent Activity
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{(request.id || "").toString().slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.bloodType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.units} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

Dashboard.propTypes = {
  hospitalData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
  }).isRequired,
};

export default Dashboard;
