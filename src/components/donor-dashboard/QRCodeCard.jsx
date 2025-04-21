import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, QrCode, AlertCircle } from "lucide-react";
import { BASE_URL } from "../../utility-functions/base-url";

function QRCodeCard({ donorId, donorData }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQRCode = async () => {
    if (!donorData) {
      setError("Donor data not available");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/donor/generate-qr`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === "success" && response.data?.data) {
        setQrCode(response.data.data);
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error generating QR code";

      if (error.response?.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Convert base64 to blob
      const base64Data = qrCode.qrImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donor-qr-${donorId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // For base64 image data
        const base64Data = qrCode.qrImage.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });
        const file = new File([blob], "donor-qr-code.png", {
          type: "image/png",
        });

        try {
          // Try sharing with file first
          await navigator.share({
            title: "My Blood Donor QR Code",
            text: "Here's my blood donor verification QR code",
            files: [file],
          });
        } catch (fileShareError) {
          // If file sharing fails, fallback to sharing just the text and URL
          await navigator.share({
            title: "My Blood Donor QR Code",
            text: "My blood donor verification QR code",
            url: window.location.href,
          });
        }
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 bg-gradient-to-r from-dark_red to-red">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Donor QR Code
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateQRCode}
            disabled={loading}
            className="px-4 py-2 bg-white text-dark_red rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-dark_red border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate QR Code"
            )}
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 min-h-[300px]"
            >
              <div className="w-12 h-12 border-4 border-dark_red border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Generating your QR code...</p>
            </motion.div>
          )}

          {qrCode && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center bg-white"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-scan" />
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={qrCode.qrImage}
                  alt="Donor QR Code"
                  className="w-64 h-64 bg-white rounded-lg shadow-sm p-2"
                />
              </div>

              <div className="mt-6 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-dark_red hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </motion.button>
                {navigator.share && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-dark_red hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-lg font-medium text-dark_red mb-1">
                  Code: {qrCode.code}
                </p>
                <p className="text-sm text-gray-600">
                  Expires: {new Date(qrCode.expiry).toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

QRCodeCard.propTypes = {
  donorId: PropTypes.string,
  donorData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    bloodType: PropTypes.string,
  }),
};

export default QRCodeCard;
