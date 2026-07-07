import User from '../models/user.model.js';

// Dummy verifyJWT middleware to bypass auth and inject a test user
export const verifyJWT = async (req, res, next) => {
  try {
    // Find a dummy user, or create one if none exists
    let user = await User.findOne({ email: 'testuser@example.com' });
    
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'customer'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in dummy auth middleware", error: error.message });
  }
};
