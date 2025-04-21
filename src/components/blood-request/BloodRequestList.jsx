import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utility-functions/base-url";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";
import Toast from "../ui/Toast";

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fulfilled":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BloodRequestList = ({ isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isAdmin ? "/all" : "/my-requests";

      const response = await axios.get(
        `${BASE_URL}/api/need-blood${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.response?.data?.message || "Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [isAdmin]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/need-blood/${requestId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setRequests(
          requests.map((req) =>
            req._id === requestId ? { ...req, status: newStatus } : req
          )
        );
        setToast({
          show: true,
          message: "Status updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      setToast({
        show: true,
        message: error.response?.data?.message || "Error updating status",
        type: "error",
      });
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark_red"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-dark_red">Blood Requests</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md p-1"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Blood Type</th>
              <th className="px-4 py-2 text-left">Units</th>
              <th className="px-4 py-2 text-left">Hospital</th>
              <th className="px-4 py-2 text-left">Status</th>
              {isAdmin && <th className="px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{request.patientName}</p>
                    <p className="text-sm text-gray-500">
                      {request.contactNumber}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-dark_red">
                    {request.bloodType}
                  </span>
                </td>
                <td className="px-4 py-3">{request.units} units</td>
                <td className="px-4 py-3">
                  <div>
                    <p>{request.hospital}</p>
                    <p className="text-sm text-gray-500">{request.location}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(request._id, "fulfilled")
                        }
                        disabled={request.status === "fulfilled"}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(request._id, "cancelled")
                        }
                        disabled={request.status === "cancelled"}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default BloodRequestList;
