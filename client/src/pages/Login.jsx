import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await login(email, password);
      if (data.success) {
        const role = data.userData?.[3]; // Assuming role is at index 3 based on authController
        if (role === 'staff') {
          navigate('/adminDashboard');
        } else {
          navigate('/home');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-400">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-400">
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account? <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
