import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderStats from "../../sections/header-stats/header_stats";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import FilterableComponent from "../../sections/filterable/filterable-component";
import { BASE_URL } from "../../utility-functions/base-url";

export default function AdminNeedHelp() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("name");
  const [status, setStatus] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    phone: "",
    reason: "",
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/need-help`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          const transformedData = response.data.data.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            reason: item.reason || "",
            message: item.message || "",
            done: item.answered || false,
            date: new Date(item.createdAt || Date.now()).toLocaleDateString(),
            createdAt: item.createdAt || Date.now(),
          }));
          
          // Sort data by createdAt in descending order (most recent first)
          const sortedData = [...transformedData].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          setData(sortedData);
        } else {
          console.error("Error in response:", response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching need help data:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const selectedItem = data.find((item) => item.id === selectedId);
    if (selectedItem) {
      setUpdatedData({
        name: selectedItem.name,
        phone: selectedItem.phone,
        reason: selectedItem.reason,
        message: selectedItem.message,
      });
    }
  }, [selectedId, data]);

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
        if (selectedOpt === "done") {
          return item.done;
        }
        return true;
      }

      // Handle "all" option with search text
      if (selectedOpt === "all") {
        return Object.entries(item).some(([key, value]) => {
          // Only search through specific fields
          const searchableFields = ["name", "email", "phone", "message"];
          if (!searchableFields.includes(key)) return false;
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      }

      // Handle "done" option
      if (selectedOpt === "done") {
        return item.done.toString().toLowerCase() === searchLower;
      }

      // Handle specific field search
      return (
        item[selectedOpt] &&
        item[selectedOpt].toString().toLowerCase().includes(searchLower)
      );
    });
  };

  const handleStatusChange = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const item = data.find((item) => item.id === id);
      const status = !item.done;

      const response = await axios.put(
        `${BASE_URL}/api/need-help/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData(response.data.data);
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
        `${BASE_URL}/api/need-help/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setStatus("success");
        setData(response.data.data);
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
        `${BASE_URL}/api/need-help/update/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setStatus("success");
        setData(response.data.data);
        setSelectedId(null);
        setUpdatedData({
          name: "",
          phone: "",
          reason: "",
          message: "",
        });
      }
    } catch (error) {
      console.error(
        "Error updating record:",
        error.response?.data?.message || error.message
      );
      setStatus("error");
    }
  };

  const optionsData = [
    { id: 1, name: "All", value: "all" },
    { id: 2, name: "Name", value: "name" },
    { id: 3, name: "Phone", value: "phone" },
    { id: 4, name: "Email", value: "email" },
    { id: 5, name: "Message", value: "message" },
    { id: 6, name: "Reason", value: "reason" },
    { id: 7, name: "Done", value: "done" },
  ];

  const tableHeader = ["Name", "Email", "Phone", "Reason", "Message", "Date", "Done", "Actions"];

  return (
    <>
      <HeaderStats heading="Help Needing Users" />
      <div className="p-10 m-10 -mt-20 bg-white rounded-rsm">
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
            type="need-help"
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
