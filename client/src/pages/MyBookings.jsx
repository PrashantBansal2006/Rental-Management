import React, { useEffect, useState } from "react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings/myBookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) setBookings(data.data || data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirm = async (id) => {
    try {
      const response = await fetch(`/api/bookings/${id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Booking Confirmed! Contract generated.");
        if (data.data.payment?.paymentUrl) {
          window.open(data.data.payment.paymentUrl, "_blank");
        }
        fetchBookings();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        alert("Booking cancelled");
        fetchBookings();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  // Status Badges Component for cleaner code
  const getApprovalBadge = (status) => {
    const styles = {
      pending_admin_review: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      approved: "bg-green-500/10 text-green-400 border-green-500/30",
      rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || "bg-zinc-800 text-zinc-300"}`}>
        {status?.replace(/_/g, " ")}
      </span>
    );
  };

  const getStageBadge = (stage) => {
    const styles = {
      quotation: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      order: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      cancelled: "bg-zinc-800 text-zinc-500 border-zinc-700",
      completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[stage] || "bg-zinc-800 text-zinc-300"}`}>
        {stage}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg animate-pulse">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">My Rental Bookings</h2>
          <p className="mt-2 text-sm text-zinc-400">Track your ongoing quotations, rental orders, and agreement documents.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 text-lg">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 text-sm font-semibold text-zinc-300">Product</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300">Quantity</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300">Total Amount</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300">Admin Approval</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300">Stage</th>
                  <th className="p-4 text-sm font-semibold text-zinc-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-800/30 transition duration-150">
                    <td className="p-4 text-sm font-medium text-white">
                      {b.product?.name || <span className="text-zinc-500">N/A</span>}
                    </td>
                    <td className="p-4 text-sm text-zinc-300">{b.quantity}</td>
                    <td className="p-4 text-sm font-semibold text-blue-400">Rs. {b.totalAmount}</td>
                    <td className="p-4 text-sm">{getApprovalBadge(b.approvalStatus)}</td>
                    <td className="p-4 text-sm">{getStageBadge(b.stage)}</td>
                    <td className="p-4 text-sm text-right">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        {/* Confirm Button */}
                        {b.approvalStatus === "approved" && b.stage === "quotation" && (
                          <button
                            onClick={() => handleConfirm(b._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition duration-150 shadow-md shadow-blue-600/10"
                          >
                            Confirm & Pay
                          </button>
                        )}

                        {/* Contract Link */}
                        {b.contract?.isGenerated && (
                          <a
                            href={`http://localhost:5000${b.contract.documentUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition duration-150"
                          >
                            Download Contract
                          </a>
                        )}

                        {/* Cancel Button */}
                        {b.stage !== "cancelled" && b.stage !== "completed" && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            className="text-red-400 hover:text-white hover:bg-red-600/20 border border-red-500/20 hover:border-red-500 font-medium text-xs px-3 py-1.5 rounded-lg transition duration-150"
                          >
                            Cancel
                          </button>
                        )}
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