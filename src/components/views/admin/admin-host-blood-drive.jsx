import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderStats from "../../sections/header-stats/header_stats";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import FilterableComponent from "../../sections/filterable/filterable-component";
import { BASE_URL } from "../../utility-functions/base-url";

export default function AdminHostBloodDrive() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("name");
  const [status, setStatus] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    phone: "",
    email: "",
    institute: "",
    designation: "",
    city: "",
    message: "",
  });

  // Fetch data with authentication
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/host-blood-drive`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          setData(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching blood drives:",
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
        email: selectedItem.email,
        institute: selectedItem.institute,
        designation: selectedItem.designation,
        city: selectedItem.city,
        message: selectedItem.message,
      });
    }
  }, [selectedId, data]);

  const handleStatusChange = async (id, done) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/host-blood-drive/${id}/status`,
        { done },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData((prevData) =>
          prevData.map((item) => (item.id === id ? { ...item, done } : item))
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
        `${BASE_URL}/api/host-blood-drive/delete/${id}`,
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
        `${BASE_URL}/api/host-blood-drive/update/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData(response.data.data);
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
        if (selectedOpt === "done") {
          return item.done;
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
            "institute",
            "designation",
            "city",
            "message",
          ];
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

  const optionsData = [
    { id: 1, name: "All", value: "all" },
    { id: 2, name: "Name", value: "name" },
    { id: 3, name: "City", value: "city" },
    { id: 4, name: "Institute", value: "institute" },
    { id: 5, name: "Done", value: "done" },
  ];

  const tableHeader = [
    "Name",
    "Email",
    "Phone",
    "Institute",
    "Designation",
    "City",
    "Message",
    "Done",
    "Actions",
  ];

  return (
    <>
      <HeaderStats heading="Blood Drive Hosting Users" />
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
            handleCheckboxChange={handleStatusChange}
            type="host-blood-drive"
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
