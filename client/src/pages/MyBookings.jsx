import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  Wallet,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/bookings";
const BACKEND_URL = "http://localhost:5000";

const STAGE_TABS = [
  { label: "All", value: "" },
  { label: "Quotations", value: "quotation" },
  { label: "Orders", value: "order" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDurationDays = (pickupDate, returnDate) => {
  const days = Math.ceil(
    (new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
  );
  return days > 0 ? days : 0;
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [pageError, setPageError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState({});

  const fetchBookings = useCallback(async (stageValue) => {
    setLoading(true);
    setPageError("");
    try {
      const url = stageValue ? `${API_BASE}/myBookings?stage=${stageValue}` : `${API_BASE}/myBookings`;
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();

      if (response.ok && data.success) {
        setBookings(data.data || []);
      } else {
        setPageError(data.message || "Failed to fetch bookings");
      }
    } catch (err) {
      setPageError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab, fetchBookings]);

  const handleTabChange = (val) => {
    setActiveTab(val);
  };

  const handleConfirm = async (id) => {
    setActionLoadingId(id);
    setActionError((prev) => ({ ...prev, [id]: "" }));
    try {
      const response = await fetch(`${API_BASE}/${id}/confirm`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        await fetchBookings(activeTab);
      } else {
        setActionError((prev) => ({ ...prev, [id]: data.message || "Confirmation failed" }));
      }
    } catch (err) {
      setActionError((prev) => ({ ...prev, [id]: "Network error occurred" }));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    setActionLoadingId(id);
    setActionError((prev) => ({ ...prev, [id]: "" }));
    try {
      const response = await fetch(`${API_BASE}/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        await fetchBookings(activeTab);
      } else {
        setActionError((prev) => ({ ...prev, [id]: data.message || "Cancellation failed" }));
      }
    } catch (err) {
      setActionError((prev) => ({ ...prev, [id]: "Network error occurred" }));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-extrabold text-zinc-100 mb-6">My Rentals logs</h1>

        <div className="flex border-b border-zinc-800 pb-px mb-8 overflow-x-auto gap-2">
          {STAGE_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.value)}
              className={`pb-3 text-sm font-semibold transition-all px-2 border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.value
                  ? "border-white text-white font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
            <p>Fetching your rental items...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
            <Package className="w-10 h-10 mb-3 text-zinc-700" />
            <p className="text-base font-semibold">No bookings found</p>
            <p className="text-xs text-zinc-600 max-w-xs mt-1">
              You haven't requested any items or there are no logs for this segment yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isActing = actionLoadingId === booking._id;
              const duration = getDurationDays(booking.pickupDate, booking.returnDate);
              const rentAmount = booking.rentalAmount || (booking.totalAmount - (booking.securityDeposit || 0));

              const isPendingAdmin = booking.approvalStatus === "pending_admin_review";
              const isApproved = booking.approvalStatus === "approved";
              const isRejected = booking.approvalStatus === "rejected";

              const canConfirm = booking.stage === "quotation" && isApproved;
              const canCancel = booking.stage === "quotation" || booking.stage === "order";

              return (
                <div key={booking._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <Package className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-100">
                          {booking.product?.name || "Product Item"}
                        </h3>
                        <p className="text-xs text-zinc-500">Log ID: {booking._id}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                        {booking.stage}
                      </span>

                      {isApproved && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved By Admin
                        </span>
                      )}
                      {isPendingAdmin && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending Admin Review
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {isRejected && booking.adminReview?.rejectionReason && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-xs text-red-400">
                      <span className="font-bold">Rejection Reason:</span> {booking.adminReview.rejectionReason}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-zinc-600 shrink-0" />
                      <div>
                        <p className="text-zinc-500 mb-0.5">Duration Segment</p>
                        <p className="font-semibold text-zinc-300">
                          {formatDate(booking.pickupDate)} - {formatDate(booking.returnDate)} ({duration} days)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-zinc-600 shrink-0" />
                      <div>
                        <p className="text-zinc-500 mb-0.5">Quantity Ordered</p>
                        <p className="font-semibold text-zinc-300">{booking.quantity} Unit(s)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-zinc-600 shrink-0" />
                      <div>
                        <p className="text-zinc-500 mb-0.5">Refundable Security</p>
                        <p className="font-semibold text-emerald-400">₹{booking.securityDeposit || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-zinc-600 shrink-0" />
                      <div>
                        <p className="text-zinc-500 mb-0.5">Grand Value</p>
                        <p className="font-extrabold text-blue-400 text-sm">₹{booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-800/80 pt-4 gap-3">
                    <div className="text-xs text-zinc-500">
                      <span>Rental Fee: ₹{rentAmount}</span>
                      <span className="mx-2">·</span>
                      <span>Status: <span className="text-zinc-400 font-semibold">{booking.bookingStatus}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.contract?.isGenerated && booking.contract?.documentUrl && (
                        <a
                          href={`${BACKEND_URL}${booking.contract.documentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          View Contract
                        </a>
                      )}

                      {canConfirm && (
                        <button
                          onClick={() => handleConfirm(booking._id)}
                          disabled={isActing}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-all duration-150"
                        >
                          {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Confirm Order
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={isActing}
                          className="bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-semibold px-5 py-2 rounded-xl disabled:opacity-50 cursor-pointer transition-all duration-150"
                        >
                          {booking.stage === "order" ? "Cancel Booking" : "Cancel Request"}
                        </button>
                      )}
                    </div>
                  </div>

                  {actionError[booking._id] && (
                    <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {actionError[booking._id]}
                    </div>
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