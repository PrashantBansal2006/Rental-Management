import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Mail, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    const data = await sendResetOtp(email);
    setIsLoading(false);
    
    if (data.success) {
      setSuccess(data.message || 'OTP sent successfully to your email');
      setStep(2);
    } else {
      setError(data.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    const data = await resetPassword(email, otp, newPassword);
    setIsLoading(false);
    
    if (data.success) {
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(data.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          
          <Link to="/login" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-zinc-400">
              {step === 1 ? "Enter your email to receive an OTP" : "Enter the OTP and your new password"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="email" 
                    required
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">OTP (6 Digits)</label>
                <input 
                  type="text" 
                  required
                  maxLength="6"
                  className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 tracking-[0.5em] text-center text-lg transition-colors"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    minLength="6"
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold rounded-xl px-4 py-3 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
