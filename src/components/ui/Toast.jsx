import { useEffect } from "react";
import PropTypes from "prop-types";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose, message]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-500 text-emerald-800";
      case "error":
        return "bg-blood-50 border-blood-500 text-blood-800";
      case "warning":
        return "bg-amber-50 border-amber-500 text-amber-800";
      default:
        return "bg-blood-50 border-blood-500 text-blood-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-blood-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blood-500" />;
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border ${getToastStyles()} animate-slide-in-right`}
      style={{
        minWidth: "300px",
        maxWidth: "400px",
        zIndex: 9999,
      }}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black/5 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
