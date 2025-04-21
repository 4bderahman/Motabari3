import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import HeaderStats from "../../sections/header-stats/header_stats";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import FilterableComponent from "../../sections/filterable/filterable-component";
import { BASE_URL } from "../../utility-functions/base-url";

export default function AdminDonateBlood() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("name");
  const [status, setStatus] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [bloodTypeStats, setBloodTypeStats] = useState([]);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    phone: "",
    bloodType: "",
    message: "",
  });

  // Calculate blood type statistics
  useEffect(() => {
    const calculateBloodTypeStats = () => {
      const stats = data.reduce((acc, donation) => {
        if (donation.bloodType) {
          acc[donation.bloodType] = (acc[donation.bloodType] || 0) + 1;
        }
        return acc;
      }, {});

      const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

      const formattedStats = bloodTypes.map((type) => ({
        bloodType: type,
        count: stats[type] || 0,
        color: getBloodTypeColor(type),
      }));

      setBloodTypeStats(formattedStats);
    };

    calculateBloodTypeStats();
  }, [data]);

  // Function to get color for each blood type
  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "A+": "#FF4136",
      "A-": "#FF725C",
      "B+": "#FF851B",
      "B-": "#FFB700",
      "AB+": "#19A974",
      "AB-": "#9EEBCF",
      "O+": "#357EDD",
      "O-": "#96CCFF",
    };
    return colors[bloodType] || "#999999";
  };

  // Fetch data with authentication
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/donate-blood`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          setData(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching donations:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const selectedItem = data.find((item) => item.id === selectedId);
    if (selectedItem) {
      setUpdatedData({
        name: selectedItem.name,
        phone: selectedItem.phone,
        bloodType: selectedItem.bloodType,
        message: selectedItem.message,
      });
    }
  }, [selectedId, data]);

  const handleStatusChange = async (id, donated) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/donate-blood/${id}/status`,
        { donated },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, donated: donated } : item
          )
        );
        setStatus("success");
      }
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data?.message || error.message
      );
      setStatus("error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${BASE_URL}/api/donate-blood/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setStatus("success");
      }
    } catch (error) {
      console.error(
        "Error deleting record:",
        error.response?.data?.message || error.message
      );
      setStatus("error");
    }
  };

  const handleUpdateClick = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/donate-blood/update/${id}`,
        { updatedData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, ...updatedData } : item
          )
        );
        setStatus("success");
        setSelectedId(null);
      }
    } catch (error) {
      console.error(
        "Error updating record:",
        error.response?.data?.message || error.message
      );
      setStatus("error");
    }
  };

  const handleSearchChange = (e) => {
    setFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    setSelectedOpt(e.target.value);
    // Re-apply current search with new filter option
    setFilter(filter);
  };

  const filterData = (search) => {
    return data.filter((item) => {
      // If no search text and no specific filter (or "all" selected), show everything
      if (!search && (selectedOpt === "all" || !selectedOpt)) return true;

      const searchLower = search.toLowerCase().trim();

      // If there's no search text but a specific filter is selected
      if (!searchLower && selectedOpt !== "all") {
        if (selectedOpt === "donated") {
          return item.donated;
        }
        return true;
      }

      // Handle "all" option with search text
      if (selectedOpt === "all") {
        return Object.entries(item).some(([key, value]) => {
          // Only search through specific fields
          const searchableFields = [
            "name",
            "email",
            "phone",
            "bloodType",
            "message",
          ];
          if (!searchableFields.includes(key)) return false;
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      }

      // Handle "donated" option
      if (selectedOpt === "donated") {
        return item.donated.toString().toLowerCase() === searchLower;
      }

      // Handle specific field search
      return (
        item[selectedOpt] &&
        item[selectedOpt].toString().toLowerCase().includes(searchLower)
      );
    });
  };

  const optionsData = [
    { id: 1, name: "All", value: "all" },
    { id: 2, name: "Name", value: "name" },
    { id: 3, name: "Phone", value: "phone" },
    { id: 4, name: "Email", value: "email" },
    { id: 5, name: "Blood Type", value: "bloodType" },
    { id: 6, name: "Donated", value: "donated" },
  ];

  const tableHeader = [
    "Name",
    "Email",
    "Phone",
    "BloodType",
    "Message",
    "Date",
    "Donated",
    "Actions",
  ];

  return (
    <>
      <HeaderStats heading="Blood Donating Users" />
      <div className="p-10 m-10 -mt-20 bg-white rounded-rsm">
        {/* Blood Type Statistics Chart */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-dark_red mb-4">
            Blood Type Distribution
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bloodTypeStats}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bloodType" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} Donations`]}
                  labelStyle={{ color: "#666" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Number of Donations"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                >
                  {bloodTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <FilterableComponent
          filter={filter}
          handleSearchChange={handleSearchChange}
          optionsData={optionsData}
          selectedOpt={selectedOpt}
          handleInputChange={handleInputChange}
        />

        <div className="overflow-x-scroll">
          <DisplayTableComponent
            tableHeader={tableHeader}
            filterData={filterData}
            filter={filter}
            handleCheckboxChange={handleStatusChange}
            type="donate-blood"
            handleUpdateClick={handleUpdateClick}
            handleDelete={handleDelete}
            status={status}
            setStatus={setStatus}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updatedData={updatedData}
            setUpdatedData={setUpdatedData}
          />
        </div>
      </div>
    </>
  );
}
