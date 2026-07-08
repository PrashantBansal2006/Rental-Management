import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const addressObj = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode
      };

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        address: [addressObj]
      };

      const data = await register(payload);
      if (data.success) {
        navigate('/verify-email');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-zinc-400">Join us to start renting</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Password *</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Role *</label>
              <select
                name="role"
                required
                className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium text-white mb-3">Address Details</h3>
              <div className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    name="street"
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    name="city"
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <input 
                    type="text" 
                    name="state"
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="State/Province"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    name="country"
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                  <input 
                    type="text" 
                    name="zipCode"
                    className="w-full bg-[#111111] border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="Zip/Postal Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-gray-200 transition-colors mt-6 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
