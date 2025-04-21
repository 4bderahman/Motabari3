import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-lg px-4 py-3 shadow-md ${
        type === 'success' 
          ? 'bg-green-50 border border-green-200 text-green-700' 
          : 'bg-red-50 border border-red-200 text-red-700'
      }`}>
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-sm font-medium focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 