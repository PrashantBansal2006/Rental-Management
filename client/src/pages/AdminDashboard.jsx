import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const response = await fetch("/api/bookings/admin/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) setPending(data.data || data);
    } catch (err) {
      console.error("Error fetching pending approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/bookings/admin/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        alert("Request Approved Successfully!");
        fetchPending();
      }
    } catch (err) {
      alert("Approval failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter reason for rejection:");
    if (reason === null) return;

    try {
      const response = await fetch(`/api/bookings/admin/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        alert("Request Rejected.");
        fetchPending();
      }
    } catch (err) {
      alert("Rejection failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg animate-pulse">Loading Admin Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-5">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Review and manage incoming customer rental quotation requests.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {pending.length} Pending Actions
            </span>
          </div>
        </div>

        {/* Content Section */}
        {pending.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
            <svg
              className="mx-auto h-12 w-12 text-zinc-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-zinc-400 text-lg font-medium">All caught up!</p>
            <p className="text-zinc-500 text-sm mt-1">No pending requests to review right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Amount</th>
                  <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {pending.map((req) => (
                  <tr key={req._id} className="hover:bg-zinc-800/30 transition duration-150">
                    {/* Customer Details */}
                    <td className="p-4">
                      <div className="font-medium text-white">{req.customer?.name || "Unknown"}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{req.customer?.email}</div>
                    </td>
                    
                    {/* Product Name */}
                    <td className="p-4 text-sm font-medium text-zinc-200">
                      {req.product?.name || <span className="text-zinc-600 italic">N/A</span>}
                    </td>
                    
                    {/* Quantity */}
                    <td className="p-4 text-sm text-zinc-300">
                      <span className="bg-zinc-800 px-2 py-1 rounded text-xs font-mono border border-zinc-700">
                        {req.quantity}
                      </span>
                    </td>
                    
                    {/* Amount */}
                    <td className="p-4 text-sm font-semibold text-blue-400">
                      Rs. {req.totalAmount}
                    </td>
                    
                    {/* Action Buttons */}
                    <td className="p-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition duration-150 shadow-md shadow-emerald-950/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-800 text-zinc-300 hover:text-red-400 font-medium text-xs px-3 py-1.5 rounded-lg transition duration-150"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}