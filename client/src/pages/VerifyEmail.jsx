import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, MailCheck } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  
  const { user, sendVerifyOtp, verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically send OTP when component mounts, but only once
    const initSendOtp = async () => {
      if (user && !user.isVerified && !hasSent) {
        setIsLoading(true);
        const data = await sendVerifyOtp();
        setIsLoading(false);
        if (data.success) {
          setSuccess('A verification code has been sent to your email.');
          setHasSent(true);
        } else {
          setError(data.message || 'Failed to send verification code.');
        }
      }
    };
    initSendOtp();
  }, [user, hasSent, sendVerifyOtp]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const data = await verifyEmail(otp);
    setIsLoading(false);
    
    if (data.success) {
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } else {
      setError(data.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    const data = await sendVerifyOtp();
    setIsLoading(false);
    if (data.success) {
      setSuccess('A new verification code has been sent!');
    } else {
      setError(data.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/10 p-4 rounded-full">
            <MailCheck className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-zinc-400 mb-8">
          We've sent a 6-digit verification code to <span className="text-white font-medium">{user?.email}</span>.
        </p>

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

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input 
              type="text" 
              required
              maxLength="6"
              className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 tracking-[0.5em] text-center text-xl font-medium transition-colors"
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-blue-600 text-white font-semibold rounded-xl px-4 py-3 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Account'}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-zinc-400">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResend}
              disabled={isLoading}
              className="text-blue-500 hover:text-blue-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
