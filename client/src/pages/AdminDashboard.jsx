import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Package, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, productsRes] = await Promise.all([
          fetch("http://localhost:5000/api/bookings/admin/metrics", {
            credentials: "include"
          }),
          fetch("http://localhost:5000/api/products/my-products", {
            credentials: "include"
          })
        ]);

        const metricsData = await metricsRes.json();
        const productsData = await productsRes.json();

        if (metricsRes.ok) setMetrics(metricsData.data || metricsData);
        if (productsRes.ok) setMyProducts(productsData.products || []);
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 flex font-sans">
      
      {/* Sidebar / Navbar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-500" />
            Staff Panel
          </h2>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <Link 
            to="/add-product" 
            className="w-full mb-6 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>

          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
            My Listed Products
          </h3>
          <div className="space-y-1">
            {myProducts.length === 0 ? (
              <p className="text-zinc-500 text-sm px-2 italic">No products listed yet.</p>
            ) : (
              myProducts.map(prod => (
                <div key={prod._id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm text-zinc-300 transition-colors">
                  <Package className="w-4 h-4 text-zinc-500" />
                  <span className="truncate">{prod.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors px-2 py-2 w-full text-left text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-zinc-700 text-sm text-white"
            />
          </div>
          <select className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>All time</option>
          </select>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <h3 className="text-zinc-400 font-medium mb-2">Quotations</h3>
            <p className="text-3xl font-semibold text-white">{metrics?.quotations || 0}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <h3 className="text-zinc-400 font-medium mb-2">Rentals</h3>
            <p className="text-3xl font-semibold text-white">{metrics?.rentals || 0}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <h3 className="text-zinc-400 font-medium mb-2">Revenue</h3>
            <p className="text-3xl font-semibold text-white">Rs. {metrics?.revenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Product Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Product Categories</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium text-zinc-400">Category</th>
                    <th className="px-6 py-4 font-medium text-zinc-400 text-right">Ordered</th>
                    <th className="px-6 py-4 font-medium text-zinc-400 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {metrics?.topCategories?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30">
                      <td className="px-6 py-4 text-zinc-300">{item.category}</td>
                      <td className="px-6 py-4 text-right text-zinc-400">{item.ordered}</td>
                      <td className="px-6 py-4 text-right font-medium text-white">{item.revenue}</td>
                    </tr>
                  ))}
                  {(!metrics?.topCategories || metrics.topCategories.length === 0) && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500 italic">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium text-zinc-400">Product</th>
                    <th className="px-6 py-4 font-medium text-zinc-400 text-right">Ordered</th>
                    <th className="px-6 py-4 font-medium text-zinc-400 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {metrics?.topProducts?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30">
                      <td className="px-6 py-4 text-zinc-300">{item.product}</td>
                      <td className="px-6 py-4 text-right text-zinc-400">{item.ordered}</td>
                      <td className="px-6 py-4 text-right font-medium text-white">{item.revenue}</td>
                    </tr>
                  ))}
                  {(!metrics?.topProducts || metrics.topProducts.length === 0) && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500 italic">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customer */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Customer</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium text-zinc-400">Customer</th>
                    <th className="px-6 py-4 font-medium text-zinc-400 text-right">Ordered</th>
                    <th className="px-6 py-4 font-medium text-zinc-400 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {metrics?.topCustomers?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30">
                      <td className="px-6 py-4 text-zinc-300">{item.customer}</td>
                      <td className="px-6 py-4 text-right text-zinc-400">{item.ordered}</td>
                      <td className="px-6 py-4 text-right font-medium text-white">{item.revenue}</td>
                    </tr>
                  ))}
                  {(!metrics?.topCustomers || metrics.topCustomers.length === 0) && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500 italic">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}