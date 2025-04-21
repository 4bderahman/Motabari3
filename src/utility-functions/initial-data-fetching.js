import axios from "axios";
import { BASE_URL } from "./base-url";

const InitialDataFetching = async ({ source, setData }) => {
  try {
    const token = localStorage.getItem("token");
    let endpoint = "";

    switch (source) {
      case "need-blood":
        endpoint = "/api/blood-request/all";
        break;
      default:
        console.error("Unknown source:", source);
        return;
    }

    console.log("Fetching from:", `${BASE_URL}${endpoint}`); // Debug log

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response:", response.data); // Debug log

    if (response.data.status === "success") {
      setData(response.data.data);
    } else {
      console.error("Error in response:", response.data);
    }
  } catch (error) {
    console.error("Fetch error:", error.response || error);
  }
};

export default InitialDataFetching;
