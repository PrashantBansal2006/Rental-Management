import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 1,
    securityDeposit: 0,
    dailyPrice: "",
    weeklyPrice: "",
    monthlyPrice: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching categories", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: Number(formData.quantity),
        securityDeposit: Number(formData.securityDeposit),
        pricing: {
          daily: Number(formData.dailyPrice),
          weekly: Number(formData.weeklyPrice),
          monthly: Number(formData.monthlyPrice)
        }
      };

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate("/adminDashboard");
      } else {
        setError(data.message || "Failed to add product");
      }
    } catch (err) {
      setError("An error occurred while adding the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-gray-200 p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Add New Product</h2>
            <p className="text-sm text-zinc-400 mt-1">Fill in the details to list a new item for rent.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Product Name</label>
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                placeholder="E.g., Sony A7III Camera"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
              <textarea 
                name="description" required value={formData.description} onChange={handleChange} rows="3"
                className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                placeholder="Product description and features..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
              <select 
                name="category" required value={formData.category} onChange={handleChange}
                className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity Available</label>
              <input 
                type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleChange}
                className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
              />
            </div>

            <div className="md:col-span-2 border-t border-zinc-800 pt-6 mt-2">
              <h3 className="text-lg font-medium text-white mb-4">Pricing & Deposit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Security Deposit (Rs.)</label>
                  <input 
                    type="number" name="securityDeposit" min="0" required value={formData.securityDeposit} onChange={handleChange}
                    className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Daily Price (Rs.)</label>
                  <input 
                    type="number" name="dailyPrice" min="0" required value={formData.dailyPrice} onChange={handleChange}
                    className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Weekly Price (Rs.) - Optional</label>
                  <input 
                    type="number" name="weeklyPrice" min="0" value={formData.weeklyPrice} onChange={handleChange}
                    className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Monthly Price (Rs.) - Optional</label>
                  <input 
                    type="number" name="monthlyPrice" min="0" value={formData.monthlyPrice} onChange={handleChange}
                    className="w-full bg-[#111111] border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition-colors"
                    placeholder="0"
                  />
                </div>

              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-4 py-3 transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'List Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
