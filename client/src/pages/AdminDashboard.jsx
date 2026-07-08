import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  IndianRupee,
  Users,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/bookings";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminDashboard() {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const applyFilter = useCallback((list, tab) => {
    if (tab === "all") {
      setFilteredBookings(list);
    } else {
      setFilteredBookings(list.filter((b) => b.approvalStatus === tab));
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const response = await fetch(`${API_BASE}/admin/all-bookings`, {
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const bookingsList = data.data || [];
        setAllBookings(bookingsList);
        applyFilter(bookingsList, activeTab);
      } else {
        setPageError(data.message || "Failed to load logs");
        setAllBookings([]);
        setFilteredBookings([]);
      }
    } catch (err) {
      setPageError("Could not connect to the server");
      setAllBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, applyFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    applyFilter(allBookings, tabName);
  };

  const handleApprove = async (bookingId) => {
    setActionLoadingId(bookingId);
    setPageError("");
    try {
      const response = await fetch(`${API_BASE}/admin/${bookingId}/approve`, {
        method: "PATCH",
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await fetchBookings();
      } else {
        setPageError(data.message || "Could not approve booking");
      }
    } catch (err) {
      setPageError("Network error while approving booking");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (bookingId) => {
    setActionLoadingId(bookingId);
    setPageError("");
    try {
      const response = await fetch(`${API_BASE}/admin/${bookingId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: rejectReason || "Not specified" }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRejectingId(null);
        setRejectReason("");
        await fetchBookings();
      } else {
        setPageError(data.message || "Could not reject booking");
      }
    } catch (err) {
      setPageError("Network error while rejecting booking");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = allBookings.filter(b => b.approvalStatus === "pending_admin_review" || !b.approvalStatus);
  const totalPendingValue = pendingRequests.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const uniqueCustomers = new Set(allBookings.map((b) => b.customer?._id || b.customer)).size;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-extrabold text-zinc-100 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Pending Requests</span>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">{pendingRequests.length}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xs font-semibold">Value Awaiting Approval</span>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">₹{totalPendingValue}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">Total Unique Customers</span>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">{uniqueCustomers}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
          <h2 className="text-lg font-bold text-zinc-200">Rental Requests Logs</h2>
          
          <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "all" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({allBookings.length})
            </button>
            <button
              onClick={() => handleTabChange("pending_admin_review")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "pending_admin_review" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => handleTabChange("approved")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Approved ({allBookings.filter(b => b.approvalStatus === "approved").length})
            </button>
            <button
              onClick={() => handleTabChange("rejected")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Rejected ({allBookings.filter(b => b.approvalStatus === "rejected").length})
            </button>
          </div>
        </div>

        {pageError && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {pageError}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin mb-3" />
            <p>Loading requests log...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
            <ClipboardList className="w-9 h-9 mb-3 text-zinc-600" />
            <p>No records found for this status segment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isActing = actionLoadingId === booking._id;
              const rentAmount = booking.rentalAmount || ((booking.totalAmount || 0) - (booking.securityDeposit || 0));

              return (
                <div key={booking._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <Package className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-100">
                          {booking.product?.name || "Product"}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {booking.customer?.name || "Customer"} · {booking.customer?.email || ""}
                        </p>
                      </div>
                    </div>

                    {booking.approvalStatus === "approved" ? (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : booking.approvalStatus === "rejected" ? (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Awaiting Review
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-zinc-950 rounded-xl p-4 border border-zinc-800/50 text-xs">
                    <div>
                      <p className="text-zinc-500 mb-1">Pickup</p>
                      <p className="font-semibold text-zinc-200">{formatDate(booking.pickupDate)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Return</p>
                      <p className="font-semibold text-zinc-200">{formatDate(booking.returnDate)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Quantity</p>
                      <p className="font-semibold text-zinc-200">{booking.quantity} Qty</p>
                    </div>
                    
                    <div className="border-t border-zinc-800/50 pt-2 md:pt-0 md:border-t-0 md:border-l border-zinc-800/80 md:pl-3">
                      <p className="text-zinc-500 mb-1">Rent Amount</p>
                      <p className="font-semibold text-zinc-300">₹{rentAmount}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Security Deposit</p>
                      <p className="font-semibold text-emerald-400">₹{booking.securityDeposit || 0}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1 font-bold text-zinc-400">Total Amount</p>
                      <p className="font-extrabold text-blue-400 text-sm">₹{booking.totalAmount}</p>
                    </div>
                  </div>

                  {(booking.approvalStatus === "pending_admin_review" || !booking.approvalStatus) ? (
                    rejectingId === booking._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectSubmit(booking._id)}
                            disabled={isActing}
                            className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold px-5 py-2 rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking._id)}
                          disabled={isActing}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
                        >
                          {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(booking._id)}
                          disabled={isActing}
                          className="flex items-center gap-2 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-semibold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-zinc-500 italic bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/30 inline-block">
                      Action performed. Archived under {booking.approvalStatus}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}