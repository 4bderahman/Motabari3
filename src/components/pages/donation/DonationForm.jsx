import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BASE_URL } from "../../utility-functions/base-url";

const DonationForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState("month");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const presetAmounts = [
    { value: 25, impact: "Supports basic needs for 1 day" },
    { value: 50, impact: "Funds educational materials", recommended: true },
    { value: 100, impact: "Sustains long-term programs" },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

      if (stripeError) {
        throw stripeError;
      }

      // Send to backend
      const response = await fetch(
        `${BASE_URL}/api/donations/create-donation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")).token
                : ""
            }`,
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to cents
            paymentMethodId: paymentMethod.id,
            isRecurring,
            interval,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Handle the client secret
      const { clientSecret } = result;
      const { error: confirmError } = await stripe.confirmCardPayment(
        clientSecret
      );

      if (confirmError) {
        throw confirmError;
      }

      // Success!
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Amount</h3>
        <div className="grid grid-cols-3 gap-4">
          {presetAmounts.map(({ value, impact, recommended }) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(value)}
              className={`relative p-4 rounded-lg border-2 ${
                amount === value
                  ? "border-[#500000] bg-[#500000] text-white"
                  : "border-gray-200 hover:border-[#500000]"
              } transition-all duration-200`}
            >
              <div className="text-xl font-bold">€{value}</div>
              <div className="text-sm mt-1">{impact}</div>
              {recommended && (
                <div className="absolute -top-0 -right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Custom Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(Number(e.target.value));
              }}
              className="focus:ring-[#500000] focus:border-[#500000] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter amount"
            />
          </div>
        </div>
      </div>

      {/* Recurring Donation */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="form-checkbox h-4 w-4 text-[#500000]"
            />
            <span className="ml-2">Make this a recurring donation</span>
          </label>
        </div>

        {isRecurring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-4"
          >
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#500000] focus:border-[#500000] sm:text-sm rounded-md"
            >
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </motion.div>
        )}
      </div>

      {/* Card Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        <div className="p-4 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#500000] hover:bg-[#400000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#500000] transition-colors duration-200 ${
          loading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Processing..." : `Donate €${amount}`}
      </motion.button>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-md ${
              success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {success
              ? "Thank you for your generous donation!"
              : `Error: ${error}`}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default DonationForm;
