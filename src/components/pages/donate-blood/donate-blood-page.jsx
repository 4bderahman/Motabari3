import { useState, useEffect } from "react";
import HeroComponent from "../../sections/hero/hero-component";
import ThreeStepProcessComponent from "../../sections/three-step-process/three-step-process-component";
import SideBySideComponent from "../../sections/side-by-side/side-by-side-component";
import QuoteComponent from "../../sections/quote/quote-component";
import CriteriaComponent from "../../sections/criteria/criteria-component";
import FormComponent from "../../sections/form/form-component";
import HeaderComponent from "../../sections/header/header-component";
import BeforeFooterCTA from "../../sections/before-footer-cta/before-footer-cta-components";
import FooterComponent from "../../sections/footer/footer-component";
import { getUser } from "../../../utility-functions/auth-utils.js";
import Toast from "../../ui/Toast";

import Axios from "axios";
import { useNavigate } from "react-router-dom";

const DonateBloodPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodType: "",
    message: "",
  });
  const [status, setStatus] = useState("Pending");
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    // Try to get user data directly from localStorage first
    let userData = null;
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        userData = JSON.parse(userStr);
        console.log("User data from localStorage:", userData);
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
      }
    }

    // If we couldn't get data from localStorage, try getUser()
    if (!userData) {
      userData = getUser();
      console.log("User data from getUser():", userData);
    }

    if (!userData) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }

    // Log all user properties
    console.log("User properties:", {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      bloodType: userData.bloodType,
      id: userData._id || userData.id,
      userType: userData.userType,
    });

    // Set the current user
    setCurrentUser(userData);

    // Set form data directly
    const newFormData = {
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      bloodType: userData.bloodType || "",
      message: "",
    };

    console.log("Setting form data:", newFormData);
    setFormData(newFormData);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      console.log("No user found");
      showToast("Please log in to submit a donation request", "error");
      return;
    }

    try {
      const response = await Axios.post(
        "http://localhost:3001/create-donate-blood",
        {
          ...formData,
          donorId: currentUser._id,
          date: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setStatus("Submitted");
        showToast("Donation request submitted successfully!", "success");
        setFormData((prev) => ({
          ...prev,
          message: "",
        }));
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      setStatus("Error");
      showToast(
        error.response?.data?.message ||
          "Error submitting donation request. Please try again.",
        "error"
      );
    }
  };

  const DonateBloodPageDetails = {
    quote: {
      classHint: "quote",
      quoteText: `"By donating money, you provide nourishment. By donating blood, you give the gift of life. Join us in this noble cause today!"`,
    },
    why_donate_blood: {
      subheadingText: "Donate blood today",
      headingText: "Why should you donate blood?",
      classHint: "side-col-image why-donate-blood",
      paraText: `Donating blood is a selfless act that has the power to save lives. Here are a few reasons why you should consider donating blood:
			\n― You could help save up to three lives with just one donation.
			― Blood is always needed in emergency situations, such as natural disasters and accidents.
			― Blood is needed for patients undergoing surgeries, cancer treatment, and other medical procedures.
			― Blood cannot be manufactured, which means that the only source of blood is through donations from volunteers.
			― Donating blood can also have health benefits for the donor, such as reducing the risk of heart disease and cancer.`,
      imageUrl: "../../../assets/images/blood-donation(1).jpg",
      buttonText: "Donate Now",
      buttonLink: "/donate-blood",
      buttonHave: true,
    },
    eligiblity_criteria: {
      subheadingText: "Are you ready?",
      headingText: "Eligibility Criteria",
      classHint: "side-col-image eligibility-criteria",
      paraText: [
        `18-50 years, above 50 Kg.`,
        `Normal temperature, pulse and blood pressure.`,
        `No Respiratory Diseases`,
        `Above 12.5 g/dL Hemoglobin`,
        `No skin disease, puncture or scars`,
        `No history of transmissible disease`,
      ],
      imageUrl: "../../../assets/images/blood-donation(1).jpg",
      buttonText: "Donate Now",
      buttonLink: "/donate-blood",
      buttonHave: false,
    },
    hero: {
      subheadingText: "Donate Blood",
      headingText: "Save life by donating blood today",
      classHint: "donate-blood-page-hero",
    },
    stepsText: {
      subheadingText: "Donation Process",
      headingText: "Step-by-Step Guide to Donating Blood",
    },
  };

  const stepDetails = [
    {
      key: "check-eligibility",
      stepNumber: "01",
      stepName: "Check your eligibility",
      stepDescription:
        "Confirm you meet the eligibility requirements to donate blood, such as age, weight, and overall health.",
    },
    {
      key: "schedule-an-appointment",
      stepNumber: "02",
      stepName: "Schedule an appointment",
      stepDescription:
        "Schedule an appointment at a blood bank or blood drive near you.",
    },
    {
      key: "donate-blood",
      stepNumber: "03",
      stepName: "Donate Blood",
      stepDescription:
        "Arrive at the appointment, fill out a questionnaire, and donate blood. The process takes about 10-15 minutes.",
    },
  ];

  const fields = [
    {
      key: "name",
      name: "name",
      type: "text",
      placeholder: "Name",
      required: true,
      disabled: true,
    },
    {
      key: "email",
      name: "email",
      type: "email",
      placeholder: "Email",
      required: true,
      disabled: true,
    },
    {
      key: "phone",
      name: "phone",
      type: "tel",
      placeholder: "Phone",
      required: true,
      disabled: true,
    },
    {
      key: "bloodType",
      name: "bloodType",
      type: "text",
      placeholder: "Blood Type",
      required: true,
      disabled: true,
    },
    {
      key: "message",
      name: "message",
      type: "textarea",
      placeholder:
        "Any additional notes or medical conditions we should know about?",
      required: false,
      disabled: false,
    },
  ];

  return (
    <>
      <HeaderComponent />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <HeroComponent {...DonateBloodPageDetails.hero} />
      <FormComponent
        fields={fields}
        heading="Donate Blood"
        buttonText="Submit Donation"
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        status={status}
      />
      <ThreeStepProcessComponent
        stepsText={DonateBloodPageDetails.stepsText}
        stepDetails={stepDetails}
      />
      <CriteriaComponent {...DonateBloodPageDetails.eligiblity_criteria} />
      <SideBySideComponent {...DonateBloodPageDetails.why_donate_blood} />
      <QuoteComponent {...DonateBloodPageDetails.quote} />
      <BeforeFooterCTA />
      <FooterComponent />
    </>
  );
};

export default DonateBloodPage;
