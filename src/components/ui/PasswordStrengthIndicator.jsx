import React, { useEffect, useState } from "react";

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState({
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    // Check password strength
    const validateStrength = () => {
      const newCriteria = {
        length: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
      };

      setCriteria(newCriteria);

      // Calculate strength score (0 to 5)
      const score = Object.values(newCriteria).filter(Boolean).length;
      setStrength(score);
    };

    validateStrength();
  }, [password]);

  // Determine text label and color based on strength
  const getStrengthLabel = () => {
    if (strength === 0) return { label: "Very Weak", color: "bg-red-700" };
    if (strength === 1) return { label: "Weak", color: "bg-red-500" };
    if (strength === 2) return { label: "Fair", color: "bg-orange-500" };
    if (strength === 3) return { label: "Good", color: "bg-yellow-500" };
    if (strength === 4) return { label: "Strong", color: "bg-green-500" };
    return { label: "Very Strong", color: "bg-green-700" };
  };

  const { label, color } = getStrengthLabel();

  // Text color classes based on strength
  const getTextColorClass = () => {
    if (strength <= 1) return "text-red-600";
    if (strength === 2) return "text-orange-600";
    if (strength === 3) return "text-yellow-600";
    if (strength === 4) return "text-green-600";
    return "text-green-700";
  };

  return (
    <div className="w-full mt-1 mb-2">
      {/* Strength Bar */}
      <div className="mb-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300 ease-in-out`} 
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      
      {/* Strength Indicator Text */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-600">Strength:</span>
        <span className={`text-xs font-medium ${getTextColorClass()}`}>
          {label}
        </span>
      </div>

      {/* Criteria List */}
      <ul className="text-xs text-gray-600 space-y-1 mt-1">
        <li className={`flex items-center ${criteria.length ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{criteria.length ? '✓' : '○'}</span>
          At least 8 characters
        </li>
        <li className={`flex items-center ${criteria.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{criteria.hasUppercase ? '✓' : '○'}</span>
          Contains uppercase letter
        </li>
        <li className={`flex items-center ${criteria.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{criteria.hasLowercase ? '✓' : '○'}</span>
          Contains lowercase letter
        </li>
        <li className={`flex items-center ${criteria.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{criteria.hasNumber ? '✓' : '○'}</span>
          Contains number
        </li>
        <li className={`flex items-center ${criteria.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{criteria.hasSpecial ? '✓' : '○'}</span>
          Contains special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator; 