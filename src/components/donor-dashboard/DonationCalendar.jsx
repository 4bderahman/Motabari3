import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Toast from "../ui/Toast";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react";
import { BASE_URL } from "../../utility-functions/base-url";

function DonationCalendar({ lastDonation, onAppointmentScheduled }) {
  const [date, setDate] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleDateChange = (newDate) => {
    if (!lastDonation || lastDonation === "No donation recorded") {
      if (newDate >= new Date()) {
        setSelectedDate(newDate);
        setShowConfirmation(true);
      }
    } else {
      const lastDonationDate = new Date(lastDonation);
      const nextEligibleDate = new Date(
        lastDonationDate.setMonth(lastDonationDate.getMonth() + 3)
      );

      if (newDate >= nextEligibleDate) {
        setSelectedDate(newDate);
        setShowConfirmation(true);
      }
    }
    setDate(newDate);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData || !userData.token) {
        setToastMessage("Please login again");
        setToastType("error");
        setShowToast(true);
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/donor/schedule-donation`,
        {
          date: selectedDate,
          status: "not_yet",
          units: 450,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setToastMessage("Donation appointment scheduled successfully!");
        setToastType("success");
        setShowToast(true);
        if (onAppointmentScheduled) {
          onAppointmentScheduled();
        }
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      setToastMessage(
        error.response?.data?.message || "Failed to schedule appointment"
      );
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 bg-gradient-to-r from-dark_red to-red">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Schedule Donation
        </h2>
      </div>

      <div className="p-6">
        <Calendar
          onChange={handleDateChange}
          value={date}
          className="border-0 w-full rounded-lg shadow-sm"
          minDate={new Date()}
          tileClassName={({ date, view }) => {
            if (view === "month") {
              const today = new Date();
              const isEligible =
                !lastDonation || lastDonation === "No donation recorded"
                  ? date >= today
                  : date >=
                    new Date(
                      new Date(lastDonation).setMonth(
                        new Date(lastDonation).getMonth() + 3
                      )
                    );

              return isEligible
                ? "text-dark_red hover:bg-red-50 transition-colors font-medium"
                : "text-gray-400 cursor-not-allowed";
            }
            return null;
          }}
          tileDisabled={({ date }) => {
            const today = new Date();
            if (!lastDonation || lastDonation === "No donation recorded") {
              return date < today;
            }
            const nextEligibleDate = new Date(
              new Date(lastDonation).setMonth(
                new Date(lastDonation).getMonth() + 3
              )
            );
            return date < nextEligibleDate;
          }}
        />

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {lastDonation && lastDonation !== "No donation recorded"
              ? `Next eligible date: ${new Date(
                  new Date(lastDonation).setMonth(
                    new Date(lastDonation).getMonth() + 3
                  )
                ).toLocaleDateString()}`
              : "You can schedule your first donation now"}
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Donation
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Schedule your donation for{" "}
              <span className="font-medium text-dark_red">
                {selectedDate?.toLocaleDateString()}
              </span>
              . Your commitment could help save up to three lives.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-dark_red text-white rounded-lg hover:bg-red transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Scheduling..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  );
}

DonationCalendar.propTypes = {
  lastDonation: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  onAppointmentScheduled: PropTypes.func,
};

export default DonationCalendar;
