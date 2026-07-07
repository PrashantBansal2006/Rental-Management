// Dummy verifyJWT middleware to prevent server crash during structure fix
export const verifyJWT = (req, res, next) => {
  // Add actual JWT verification logic here later
  next();
};
