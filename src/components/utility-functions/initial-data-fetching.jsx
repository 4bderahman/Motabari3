import React from "react";
import axios from "axios";
import { BASE_URL } from "./base-url";

const InitialDataFetching = async ({ source, setData }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/api/${source}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "success") {
      setData(response.data.data);
    } else {
      console.error("Error fetching data:", response.data.message);
    }
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data?.message || error.message
    );
  }
};

export default InitialDataFetching;
