import { useState, useEffect } from "react";
import axios from "axios";
import HeaderStats from "../../sections/header-stats/header_stats";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import FilterableComponent from "../../sections/filterable/filterable-component";
import { BASE_URL } from "../../utility-functions/base-url";

export default function AdminNeedBlood() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("name");
  const [status, setStatus] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    bloodType: "",
    units: "",
    urgency: "",
    status: "",
  });

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
          setData(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching blood needs:",
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
        bloodType: selectedItem.bloodType,
        units: selectedItem.units,
        urgency: selectedItem.urgency,
        status: selectedItem.status,
      });
    }
  }, [selectedId, data]);

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${BASE_URL}/api/blood-request/${id}/status`,
        { status },
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

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${BASE_URL}/api/blood-request/${id}`,
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
      const response = await axios.patch(
        `${BASE_URL}/api/blood-request/${id}`,
        {
          bloodType: updatedData.bloodType,
          units: updatedData.units,
          urgency: updatedData.urgency,
          status: updatedData.status,
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
    setSelectedOpt(e.target.value);
  };

  const filterData = (search) => {
    return data.filter((item) => {
      if (!search) return true;

      const searchLower = search.toLowerCase();

      // Handle "all" option
      if (selectedOpt === "all") {
        return Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(searchLower)
        );
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
    { id: 2, name: "Hospital", value: "name" },
    { id: 3, name: "Blood Type", value: "bloodType" },
    { id: 4, name: "Units", value: "units" },
    { id: 5, name: "Urgency", value: "urgency" },
    { id: 6, name: "Status", value: "status" },
  ];

  const tableHeader = [
    "Hospital",
    "Blood Type",
    "Units",
    "Urgency",
    "Status",
    "Date",
    "Actions",
  ];

  return (
    <>
      <HeaderStats heading="Blood Need Requests" />
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
