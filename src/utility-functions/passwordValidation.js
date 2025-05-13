/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Object containing validation results and error message
 */
export const validatePassword = (password) => {
  // Initialize validation criteria
  const criteria = {
    length: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  // Calculate strength (0-5)
  const score = Object.values(criteria).filter(Boolean).length;
  
  // Check if password meets minimum requirements
  const isStrong = score >= 3 && criteria.length;

  // Generate error message based on failing criteria
  let errorMessage = "";
  
  if (!isStrong) {
    errorMessage = "Password must:";
    
    if (!criteria.length) {
      errorMessage += " be at least 8 characters long;";
    }
    
    const missingCriteria = [];
    if (!criteria.hasUppercase) missingCriteria.push("an uppercase letter");
    if (!criteria.hasLowercase) missingCriteria.push("a lowercase letter");
    if (!criteria.hasNumber) missingCriteria.push("a number");
    if (!criteria.hasSpecial) missingCriteria.push("a special character");
    
    if (missingCriteria.length > 0) {
      errorMessage += ` include at least ${missingCriteria.length > 1 ? 
        `${missingCriteria.slice(0, -1).join(', ')} and ${missingCriteria.slice(-1)}` : 
        missingCriteria[0]};`;
    }
  }
  
  return {
    isValid: isStrong,
    score,
    criteria,
    errorMessage
  };
}; 