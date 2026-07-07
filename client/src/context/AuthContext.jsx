import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/is-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Backend doesn't return full user object in is-auth currently, so we set a default object or fetch user
        setUser(data.user || { id: 'authenticated' });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await response.json();
    if (data.success) {
      await checkAuth();
    }
    return data;
  };

  const register = async (userData) => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    const data = await response.json();
    if (data.success) {
      await checkAuth();
    }
    return data;
  };

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUser(null);
      }
      return data;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'An error occurred during logout' };
    }
  };

  const sendResetOtp = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to reset password' };
    }
  };

  const sendVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to send verification OTP' };
    }
  };

  const verifyEmail = async (otp) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUser(prev => ({ ...prev, isVerified: true }));
      }
      return data;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to verify email' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sendResetOtp, resetPassword, sendVerifyOtp, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
