import { useState, useEffect } from "react";
import axios from "axios";
import HeaderStats from "../../sections/header-stats/header_stats";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import FilterableComponent from "../../sections/filterable/filterable-component";
import { BASE_URL } from "../../utility-functions/base-url";

export default function AdminNeedBlood() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("all");
  const [status, setStatus] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    bloodType: "",
    units: "",
    urgency: "",
    status: "",
  });

  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/blood-request/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          // API already sorts by date, but let's ensure it's in the correct order
          const sortedData = [...response.data.data].sort((a, b) => {
            // Use createdAt if available, otherwise use date field
            const dateA = new Date(a.createdAt || a.date || 0);
            const dateB = new Date(b.createdAt || b.date || 0);
            return dateB - dateA; // Descending order (most recent first)
          });
          setData(sortedData);
        }
      } catch (error) {
        console.error(
          "Error fetching blood needs:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchData();
    // Set up an interval to fetch data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const selectedItem = data.find((item) => item.id === selectedId);
    if (selectedItem) {
      setUpdatedData({
        name: selectedItem.name,
        bloodType: selectedItem.bloodType,
        units: selectedItem.units,
        urgency: selectedItem.urgency,
        status: selectedItem.status,
      });
    }
  }, [selectedId, data]);

  const handleStatusChange = async (id, status, collection) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/blood-request/${id}/status`,
        { 
          status,
          collection
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData((prevData) =>
          prevData.map((item) => (item.id === id ? { ...item, status } : item))
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

  const handleDelete = async (id, collection) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${BASE_URL}/api/blood-request/${id}?collection=${collection}`,
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
      const selectedItem = data.find(item => item.id === id);
      if (!selectedItem) {
        console.error("Item not found for update");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/blood-request/${id}`,
        {
          bloodType: updatedData.bloodType,
          units: updatedData.units,
          urgency: updatedData.urgency,
          status: updatedData.status,
          collection: selectedItem.collection
        },
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
    // When changing filter type, keep the same search text but apply the new filter type
    setSelectedOpt(e.target.value);
  };

  const handleSourceFilterChange = (source) => {
    setSourceFilter(source);
  };

  const filterData = (search) => {
    console.log("Filtering with:", { search, selectedOpt, sourceFilter });
    
    // First filter by source
    let filteredData = data.filter(item => {
      if (sourceFilter === "all") return true;
      return item.source === sourceFilter;
    });

    // Then filter by search text if provided
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      
      filteredData = filteredData.filter(item => {
        // If searching in all fields
        if (selectedOpt === "all") {
          // Check all searchable fields
          return (
            // Name field
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            // Blood type field
            (item.bloodType && item.bloodType.toLowerCase().includes(searchLower)) ||
            // Units field - convert to string for search
            (item.units && item.units.toString().toLowerCase().includes(searchLower)) ||
            // Urgency field
            (item.urgency && item.urgency.toLowerCase().includes(searchLower)) ||
            // Status field
            (item.status && item.status.toLowerCase().includes(searchLower))
          );
        }
        
        // If searching in a specific field
        if (!item[selectedOpt] && item[selectedOpt] !== 0) {
          return false;
        }
        
        // Convert the field value to string to handle numbers
        const fieldValue = item[selectedOpt].toString().toLowerCase();
        return fieldValue.includes(searchLower);
      });
    }
    
    console.log("Filtered data:", filteredData.length);
    return filteredData;
  };

  const optionsData = [
    { id: 1, name: "All", value: "all" },
    { id: 2, name: "Name", value: "name" },
    { id: 3, name: "Blood Type", value: "bloodType" },
    { id: 4, name: "Units", value: "units" },
    { id: 5, name: "Urgency", value: "urgency" },
    { id: 6, name: "Status", value: "status" },
  ];

  const tableHeader = [
    "Name",
    "Blood Type",
    "Units",
    "Urgency",
    "Status",
    "Source",
    "Date",
    "Actions",
  ];

  const donorCount = data.filter(item => item.source === "donor").length;
  const hospitalCount = data.filter(item => item.source === "hospital").length;
  const totalCount = data.length;

  return (
    <>
      <HeaderStats heading="Blood Need Requests" />
      <div className="p-10 m-10 -mt-20 bg-white rounded-rsm">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 items-center space-x-0 md:space-x-4 mb-6">
          <div className="flex items-center mb-2 md:mb-0">
            <span className="text-sm font-medium text-gray-700 mr-3">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                sourceFilter === "all" 
                  ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white" 
                  : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
              }`}
              onClick={() => handleSourceFilterChange("all")}
            >
              <div className="flex items-center">
                <span className="mr-2">All</span>
                <span className="flex items-center justify-center bg-white text-gray-800 text-xs font-bold rounded-full h-5 w-5 min-w-5">
                  {totalCount}
                </span>
              </div>
              {sourceFilter === "all" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-b-lg"></div>
              )}
            </button>
            <button
              className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                sourceFilter === "donor" 
                  ? "bg-gradient-to-r from-orange-500  to-orange-700 text-black" 
                  : "bg-white text-orange-700 hover:bg-orange-50 border border-orange-300"
              }`}
              onClick={() => handleSourceFilterChange("donor")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="mr-2">Donors</span>
                <span className={`flex items-center justify-center ${sourceFilter === "donor" ? "bg-white text-green-700" : "bg-green-100 text-green-800"} text-xs font-bold rounded-full h-5 w-5 min-w-5`}>
                  {donorCount}
                </span>
              </div>
              {sourceFilter === "donor" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-300 rounded-b-lg"></div>
              )}
            </button>
            <button
              className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                sourceFilter === "hospital" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white" 
                  : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-300"
              }`}
              onClick={() => handleSourceFilterChange("hospital")}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="mr-2">Hospitals</span>
                <span className={`flex items-center justify-center ${sourceFilter === "hospital" ? "bg-white text-blue-700" : "bg-blue-100 text-blue-800"} text-xs font-bold rounded-full h-5 w-5 min-w-5`}>
                  {hospitalCount}
                </span>
              </div>
              {sourceFilter === "hospital" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 rounded-b-lg"></div>
              )}
            </button>
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
            type="blood-request"
            handleCheckboxChange={handleStatusChange}
            handleDelete={handleDelete}
            handleUpdateClick={handleUpdateClick}
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
