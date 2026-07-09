import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (user) {
    if (!user.isVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    // If the user is already logged in and verified, redirect them to home
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default GuestRoute;
