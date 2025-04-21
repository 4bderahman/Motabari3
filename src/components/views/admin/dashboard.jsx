import { useState, useEffect } from "react";
import CardStats from "../../sections/cta-card/cta-card-component";
import HeaderStats from "../../sections/header-stats/header_stats";
import { Link } from "react-router-dom";
import axios from "axios";

import { BiDonateBlood, BiHelpCircle } from "react-icons/bi";
import { MdOutlineBloodtype, MdOutlineVolunteerActivism } from "react-icons/md";
import FilterableComponent from "../../sections/filterable/filterable-component";
import DisplayTableComponent from "../../sections/display-table/display-table-component";
import { BASE_URL } from "../../utility-functions/base-url";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("name");
  const [status, setStatus] = useState("normal");
  const [selectedId, setSelectedId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [stats, setStats] = useState({
    current: {
      donateBlood: 0,
      needBlood: 0,
      hostDrive: 0,
      needHelp: 0,
    },
    percentageChanges: {
      donateBlood: 0,
      needBlood: 0,
      hostDrive: 0,
      needHelp: 0,
    },
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setData(response.data.data);
      }
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data?.message || error.message
      );
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setStats({
          current: response.data.current,
          percentageChanges: response.data.percentageChanges,
        });
      }
    } catch (error) {
      console.error(
        "Error fetching stats:",
        error.response?.data?.message || error.message
      );
      // Set default values on error
      setStats({
        current: {
          donateBlood: 0,
          needBlood: 0,
          hostDrive: 0,
          needHelp: 0,
        },
        percentageChanges: {
          donateBlood: 0,
          needBlood: 0,
          hostDrive: 0,
          needHelp: 0,
        },
      });
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
    // Refresh data and stats every 30 seconds
    const interval = setInterval(() => {
      fetchData();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckedChange = async (id) => {
    try {
      const item = data.find((item) => item.id === id);
      const status = !item.checked;
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/new-users/checked`,
        { status, id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, checked: status } : item
          )
        );
        setStatus("success");
        // Refetch stats after successful update
        fetchStats();
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
      const response = await axios.delete(`${BASE_URL}/api/dashboard/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setData(response.data.data);
        setStatus("success");
        // Refetch stats after successful deletion
        fetchStats();
      }
    } catch (error) {
      console.error(
        "Error deleting record:",
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

  const handleUpdateClick = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/new-users/${id}`,
        {
          name: updatedData.name,
          phone: updatedData.phone,
          email: updatedData.email,
          source: updatedData.source,
        },
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
        setUpdatedData({});
        // Refetch stats after successful update
        fetchStats();
      }
    } catch (error) {
      console.error(
        "Error updating record:",
        error.response?.data?.message || error.message
      );
      setStatus("error");
    }
  };

  const cardData = [
    {
      key: 111,
      statSubtitle: "DONATE BLOOD",
      statTitle: String(stats.current.donateBlood || 0).padStart(6, "0"),
      statArrow:
        (stats.percentageChanges.donateBlood || 0) >= 0 ? "up" : "down",
      statPercent: Math.abs(stats.percentageChanges.donateBlood || 0),
      statIconName: <BiDonateBlood />,
      to: "/admin/donate-blood",
    },
    {
      key: 222,
      statSubtitle: "NEED BLOOD",
      statTitle: String(stats.current.needBlood || 0).padStart(6, "0"),
      statArrow: (stats.percentageChanges.needBlood || 0) >= 0 ? "up" : "down",
      statPercent: Math.abs(stats.percentageChanges.needBlood || 0),
      statIconName: <MdOutlineBloodtype />,
      to: "/admin/need-blood",
    },
    {
      key: 333,
      statSubtitle: "HOST DRIVE",
      statTitle: String(stats.current.hostDrive || 0).padStart(6, "0"),
      statArrow: (stats.percentageChanges.hostDrive || 0) >= 0 ? "up" : "down",
      statPercent: Math.abs(stats.percentageChanges.hostDrive || 0),
      statIconName: <MdOutlineVolunteerActivism />,
      to: "/admin/host-blood-drive",
    },
    {
      key: 444,
      statSubtitle: "NEED HELP",
      statTitle: String(stats.current.needHelp || 0).padStart(6, "0"),
      statArrow: (stats.percentageChanges.needHelp || 0) >= 0 ? "up" : "down",
      statPercent: Math.abs(stats.percentageChanges.needHelp || 0),
      statIconName: <BiHelpCircle />,
      to: "/admin/need-help",
    },
  ];

  const filterData = (search) => {
    return data.filter((item) => {
      if (!search) return true;

      const searchLower = search.toLowerCase();
      if (selectedOpt === "all") {
        return Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(searchLower)
        );
      }

      if (selectedOpt === "checked") {
        return item.checked.toString().toLowerCase().includes(searchLower);
      }

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
    { id: 5, name: "Source", value: "source" },
  ];

  const tableHeader = ["Name", "Email", "Phone", "Date", "Source", "Actions"];

  return (
    <>
      <HeaderStats />
      <div className="p-10 m-10 -mt-20 bg-white rounded-rsm">
        <div className="flex flex-wrap">
          {cardData.map((item) => (
            <Link
              to={item.to}
              className="w-full px-4 lg:w-6/12 xl:w-3/12"
              key={item.key}
            >
              <CardStats
                key={item.key}
                statSubtitle={item.statSubtitle}
                statTitle={item.statTitle}
                statArrow={item.statArrow}
                statPercent={item.statPercent}
                statIconName={item.statIconName}
                statIconColor="bg-dark_red"
              />
            </Link>
          ))}
        </div>
        {/* <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
					<CardLineChart />
				</div> */}

        <h2 className="text-dark_red font-semibold mt-10 mb-5 text-[35px]">
          New User Submissions
        </h2>

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
            type="new-users"
            handleDelete={handleDelete}
            handleCheckboxChange={handleCheckedChange}
            status={status}
            setStatus={setStatus}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updatedData={updatedData}
            setUpdatedData={setUpdatedData}
            handleUpdateClick={handleUpdateClick}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
