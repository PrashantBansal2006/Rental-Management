// Dummy authorizeRoles middleware to prevent server crash during structure fix
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Add actual role authorization logic here later
    next();
  };
};
