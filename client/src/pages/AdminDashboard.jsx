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
  AlertCircle,
  Ban,
  User,
  ShieldAlert
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/bookings";

const formatStatusText = (str) => {
  if (!str) return "Not Initiated";
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

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
    } else if (tab === "cancelled") {
      setFilteredBookings(list.filter((b) => 
        b.stage === "cancelled" || 
        b.bookingStatus === "cancelled" || 
        b.approvalStatus === "rejected"
      ));
    } else {
      setFilteredBookings(list.filter((b) => 
        b.approvalStatus === tab && 
        b.stage !== "cancelled" && 
        b.bookingStatus !== "cancelled"
      ));
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
        setPageError(data.message || "Failed to load bookings");
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

  const pendingRequests = allBookings.filter(b => b.approvalStatus === "pending_admin_review" && b.stage !== "cancelled" && b.bookingStatus !== "cancelled");
  const cancelledCount = allBookings.filter(b => b.stage === "cancelled" || b.bookingStatus === "cancelled" || b.approvalStatus === "rejected").length;
  const totalPendingValue = pendingRequests.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const uniqueCustomers = new Set(allBookings.map((b) => b.customer?._id || b.customer)).size;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-extrabold text-zinc-100 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Pending Review</span>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">{pendingRequests.length}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xs font-semibold">Pending Volume</span>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">₹{totalPendingValue}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <Ban className="w-4 h-4" />
              <span className="text-xs font-semibold">Cancelled / Rejected</span>
            </div>
            <p className="text-2xl font-extrabold text-red-500">{cancelledCount}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">Total Customers</span>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">{uniqueCustomers}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
          <h2 className="text-lg font-bold text-zinc-200">Recent Bookings</h2>
          
          <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({allBookings.length})
            </button>
            <button
              onClick={() => handleTabChange("pending_admin_review")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "pending_admin_review" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => handleTabChange("approved")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Approved ({allBookings.filter(b => b.approvalStatus === "approved" && b.stage !== "cancelled" && b.bookingStatus !== "cancelled").length})
            </button>
            <button
              onClick={() => handleTabChange("cancelled")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Cancelled ({cancelledCount})
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
            <p>Loading bookings data...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
            <ClipboardList className="w-9 h-9 mb-3 text-zinc-600" />
            <p>No bookings found in this section.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isActing = actionLoadingId === booking._id;
              
              const totalAmount = booking.totalAmount || booking.totalBill || 0;
              const securityDeposit = booking.securityDeposit || booking.deposit || 0;
              const rentAmount = totalAmount >= securityDeposit ? (totalAmount - securityDeposit) : totalAmount;

              const isAdminRejected = booking.approvalStatus === "rejected";
              const isCustomerCancelled = !isAdminRejected && (booking.stage === "cancelled" || booking.bookingStatus === "cancelled");
              const isCancelled = isCustomerCancelled || isAdminRejected;
              const isAdminApproved = booking.approvalStatus === "approved" && !isCancelled;

              return (
                <div 
                  key={booking._id} 
                  className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 transition-all duration-200 ${
                    isCancelled ? "border-red-900/50 bg-gradient-to-b from-zinc-900 to-red-950/10" : "border-zinc-800"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCancelled ? "bg-red-950/40 text-red-400" : "bg-zinc-800 text-zinc-500"}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-base font-bold ${isCancelled ? "text-red-200 line-through decoration-red-700" : "text-zinc-100"}`}>
                          {booking.product?.name || "Product Item"}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium">
                          Customer: {booking.customer?.name || "Unknown"} ({booking.customer?.email || "No Email Specified"})
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-wider mt-0.5">Booking ID: {booking._id}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isAdminRejected ? (
                        <span className="text-xs font-extrabold px-3 py-1.5 rounded-lg border bg-red-600/10 text-red-500 border-red-600/30 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" /> Rejected by Admin
                        </span>
                      ) : isCustomerCancelled ? (
                        <span className="text-xs font-extrabold px-3 py-1.5 rounded-lg border bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1.5 animate-pulse">
                          <User className="w-3.5 h-3.5" /> Cancelled by Customer
                        </span>
                      ) : isAdminApproved ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Admin
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Review
                        </span>
                      )}

                      <div className="text-right space-y-0.5 text-[11px] text-zinc-400">
                        <p>Current Stage: <span className={`font-bold ${isCancelled ? "text-red-400" : "text-zinc-200"}`}>{formatStatusText(booking.stage)}</span></p>
                        <p>Payment Status: <span className={`font-bold ${isCancelled ? "text-red-400" : "text-blue-400"}`}>{formatStatusText(booking.payment?.status)}</span></p>
                      </div>
                    </div>
                  </div>

                  {isCancelled && (
                    <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 text-xs text-red-400/90 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <div>
                        <span className="font-extrabold text-red-300">
                          {isAdminRejected ? "Notice: Administrator rejected this request." : "Notice: Customer initiated cancellation for this booking."}
                        </span>{" "}
                        Product allocation has been dropped and item inventory levels have been restored.
                        {booking.adminReview?.rejectionReason && isAdminRejected && (
                          <p className="mt-1 text-zinc-300"><span className="font-bold text-red-400">Reason for Rejection:</span> {booking.adminReview.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={`grid grid-cols-2 md:grid-cols-6 gap-3 rounded-xl p-4 border text-xs ${
                    isCancelled ? "bg-red-950/5 border-red-950/60" : "bg-zinc-950 border-zinc-800/50"
                  }`}>
                    <div>
                      <p className="text-zinc-500 mb-1">Pickup Date</p>
                      <p className="font-semibold text-zinc-300">{formatDate(booking.pickupDate)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Return Date</p>
                      <p className="font-semibold text-zinc-300">{formatDate(booking.returnDate)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Quantity</p>
                      <p className="font-semibold text-zinc-300">{booking.quantity || 1} Unit(s)</p>
                    </div>
                    
                    <div className="border-t border-zinc-800/50 pt-2 md:pt-0 md:border-t-0 md:border-l border-zinc-800/80 md:pl-3">
                      <p className="text-zinc-500 mb-1">Rental Cost</p>
                      <p className="font-semibold text-zinc-300">₹{rentAmount}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Security Deposit</p>
                      <p className="font-semibold text-emerald-400">₹{securityDeposit}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1 font-bold">Total Bill</p>
                      <p className={`font-extrabold text-sm ${isCancelled ? "text-zinc-400 line-through" : "text-blue-400"}`}>₹{totalAmount}</p>
                    </div>
                  </div>

                  {!isCancelled && !isAdminApproved ? (
                    rejectingId === booking._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Type the exact rejection reason to inform the customer..."
                          className="w-full bg-zinc-950 border border-red-900/40 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
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
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold px-5 py-2 rounded-xl"
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
                          Approve Booking
                        </button>
                        <button
                          onClick={() => setRejectingId(booking._id)}
                          disabled={isActing}
                          className="flex items-center gap-2 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-semibold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject Booking
                        </button>
                      </div>
                    )
                  ) : (
                    <p className={`text-xs italic bg-zinc-950/40 p-2.5 rounded-xl border inline-block ${
                      isAdminRejected ? "text-red-500/80 border-red-900/30 bg-red-950/5" : 
                      isCustomerCancelled ? "text-red-400/80 border-red-950/40 bg-red-950/5" : 
                      "text-emerald-500/80 border-emerald-950/30 bg-emerald-950/5"
                    }`}>
                      Current Flow State: {
                        isAdminRejected ? "Rejected by Administrator" : 
                        isCustomerCancelled ? "Cancelled by Customer" : "Approved and Live"
                      }
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