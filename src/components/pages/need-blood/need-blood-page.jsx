import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroComponent from "../../sections/hero/hero-component";
import ThreeStepProcessComponent from "../../sections/three-step-process/three-step-process-component";
import QuoteComponent from "../../sections/quote/quote-component";
import CriteriaComponent from "../../sections/criteria/criteria-component";
import FormComponent from "../../sections/form/form-component";
import SearchBloodStockComponent from "../../sections/search-blood-stock/search-blood-stock-component";
import HeaderComponent from "../../sections/header/header-component";
import BeforeFooterCTA from "../../sections/before-footer-cta/before-footer-cta-components";
import FooterComponent from "../../sections/footer/footer-component";
import { getUser } from "../../../utility-functions/auth-utils.js";
import Toast from "../../ui/Toast";

import Axios from "axios";
import newUsersInsertRequest from "../../utility-functions/new-users-insert-request.jsx";

const NeedBloodPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodType: "",
    message: "",
    units: 1, // Default to 1 unit
    urgency: "normal", // Default urgency level
  });
  const [status, setStatus] = useState("Pending");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const user = getUser();
    console.log("User from getUser:", user);

    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }

    if (user && user.token) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bloodType: user.bloodType || "",
        units: 1, // Default to 1 unit
        urgency: "normal", // Default urgency level
      });
    } else {
      console.log("No token found, redirecting to login");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.phone || !formData.bloodType || !formData.units) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Validate units is a positive number
    if (formData.units < 1) {
      showToast("Units must be at least 1", "error");
      return;
    }
    
    // Get user and token
    const user = getUser();
    if (!user || !user.token) {
      showToast("Authentication error. Please log in again.", "error");
      return;
    }

    setStatus("Submited");

    console.log(formData);

    Axios.post("http://localhost:3001/create-need-blood", {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bloodType: formData.bloodType,
      message: formData.message,
      units: parseInt(formData.units, 10), // Ensure units is sent as a number
      urgency: formData.urgency, // Include urgency in the request
    }, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
      .then((response) => {
        console.log("success");
        console.log(response.data);
        showToast("Blood request submitted successfully!", "success");
      })
      .catch((error) => {
        console.log(error);
        showToast("Error submitting request. Please try again.", "error");
      });

    newUsersInsertRequest(formData, "need-blood");

    setFormData({
      name: "",
      email: "",
      phone: "",
      bloodType: "",
      message: "",
      units: 1,
      urgency: "normal",
    });
  };

  const NeedBloodPageDetails = {
    quote: {
      classHint: "quote need-blood-quote",
      quoteText: `Facing a blood emergency?\n 
            Request a callback and let us help you!`,
      buttonText: "Call Now",
      buttonLink: "tel:+212772183479",
      buttonHave: true,
    },
    tips_for_managing_blood_loss: {
      subheadingText: "",
      headingText: "Tips for Managing Blood Loss",
      classHint: "tips-for-managing-blood-loss",
      paraText: [
        `Stay calm and avoid any strenuous activity.`,
        `Elevate the affected area if possible to reduce blood flow.`,
        `Apply pressure to the wound to slow down or stop the bleeding.`,
        `Drink fluids such as water or sports drinks to help replenish lost fluids.`,
        `Consume foods that are high in iron and protein, such as spinach, beans, and lean meats to help replenish lost nutrients.`,
        `Consider taking iron supplements if recommended by your doctor.`,
        `Keep a record of any symptoms and changes in condition to share with medical professionals.`,
      ],
      imageUrl: "../../../assets/images/blood-donation(1).jpg",
      buttonHave: false,
    },
    hero: {
      subheadingText: "Need blood?",
      headingText: "Your blood needs are our priority.",
      classHint: "hero need-blood-page-hero",
    },
    stepsText: {
      subheadingText: "Collecting Blood",
      headingText: "From start to finish, here's what to expect.",
    },
    bloodStock: {
      subheadingText: "When you need it",
      headingText: "Find Available Blood Stock",
      classHint: "search-blood-stock",
    },
  };

  const stepDetails = [
    {
      key: "registration",
      stepNumber: "01",
      stepName: "Registration",
      stepDescription:
        "You will be asked to fill out a form with your personal information and medical history.",
    },
    {
      key: "screening",
      stepNumber: "02",
      stepName: "Screening",
      stepDescription:
        "A medical professional will check your vitals and ask you a series of questions to ensure you are eligible to donate.",
    },
    {
      key: "donation",
      stepNumber: "03",
      stepName: "Donation",
      stepDescription:
        "A sterile needle will be inserted into your arm to collect your blood, which will then be stored and used for transfusions.",
    },
  ];

  const fields = [
    {
      key: "name",
      name: "name",
      type: "text",
      placeholder: "Name",
      required: true,
    },
    {
      key: "email",
      name: "email",
      type: "email",
      placeholder: "Email",
      required: true,
    },
    {
      key: "phone",
      name: "phone",
      type: "tel",
      placeholder: "Phone",
      required: true,
    },
    {
      key: "bloodType",
      name: "bloodType",
      type: "select", // Changed to select for dropdown
      placeholder: "Blood Type",
      required: true,
      options: [
        { value: "", label: "Select Blood Type" },
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" },
      ],
    },
    {
      key: "urgency",
      name: "urgency",
      type: "select",
      placeholder: "Urgency Level",
      required: true,
      options: [
        { value: "normal", label: "Normal - Within a few days" },
        { value: "urgent", label: "Urgent - Within 24 hours" },
        { value: "critical", label: "Critical - Immediate need" },
      ],
    },
    {
      key: "units",
      name: "units",
      type: "number",
      placeholder: "Units Needed",
      required: true,
      min: 1,
      max: 10,
    },
    {
      key: "message",
      name: "message",
      type: "textarea",
      placeholder: "Additional notes or requirements",
      required: false,
    },
  ];

  return (
    <>
      <HeaderComponent />

      <HeroComponent {...NeedBloodPageDetails.hero} />
      <FormComponent
        fields={fields}
        heading={"Request for emergency blood"}
        buttonText={"Request blood"}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        status={status}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <QuoteComponent {...NeedBloodPageDetails.quote} />
      <SearchBloodStockComponent {...NeedBloodPageDetails.bloodStock} />
      <ThreeStepProcessComponent
        stepsText={NeedBloodPageDetails.stepsText}
        stepDetails={stepDetails}
      />
      <CriteriaComponent
        {...NeedBloodPageDetails.tips_for_managing_blood_loss}
      />
      <BeforeFooterCTA />
      <FooterComponent />
    </>
  );
};

export default NeedBloodPage;
