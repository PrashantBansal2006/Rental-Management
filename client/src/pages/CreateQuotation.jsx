import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  CalendarDays, 
  ShieldAlert, 
  Wallet, 
  Tag, 
  Info,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const estimateItemPricing = (pricing, days, quantity) => {
  if (!pricing) {
    return null;
  }

  let ratePerUnit = 0;
  let unitLabel = "";
  let units = 0;

  if (days >= 30 && pricing.monthly) {
    unitLabel = "monthly";
    ratePerUnit = pricing.monthly;
    units = Math.ceil(days / 30);
  } else if (days >= 7 && pricing.weekly) {
    unitLabel = "weekly";
    ratePerUnit = pricing.weekly;
    units = Math.ceil(days / 7);
  } else if (days >= 1 && pricing.daily) {
    unitLabel = "daily";
    ratePerUnit = pricing.daily;
    units = Math.ceil(days);
  } else if (pricing.hourly) {
    unitLabel = "hourly";
    ratePerUnit = pricing.hourly;
    units = days * 24;
  } else {
    return null;
  }

  const rentAmount = ratePerUnit * units * quantity;

  return { unitLabel, ratePerUnit, units, rentAmount };
};

export default function CreateQuotation() {
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [datesConfig, setDatesConfig] = useState({});
  const [livePrices, setLivePrices] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [itemResults, setItemResults] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedItems = localStorage.getItem("checkoutItems");
    if (storedItems) {
      const items = JSON.parse(storedItems);
      setCheckoutItems(items);

      const initialDates = {};
      items.forEach((item) => {
        initialDates[item._id] = {
          pickupDate: "",
          returnDate: "",
        };
      });
      setDatesConfig(initialDates);
    }
  }, []);

  const handleDateChange = (itemId, field, value) => {
    setDatesConfig((prev) => {
      const updated = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: value,
        },
      };

      const item = checkoutItems.find((i) => i._id === itemId);
      const itemDates = updated[itemId];

      if (item && itemDates?.pickupDate && itemDates?.returnDate) {
        const pDate = new Date(itemDates.pickupDate);
        const rDate = new Date(itemDates.returnDate);

        if (rDate > pDate) {
          const days = Math.ceil((rDate - pDate) / (1000 * 60 * 60 * 24));
          const pricing = item.product?.pricing || item.pricing || null;
          const quantity = Number(item.quantity) || 1;
          const estimate = estimateItemPricing(pricing, days, quantity);
          const security = item.product?.securityDeposit ?? item.securityDeposit ?? 0;

          if (estimate) {
            setLivePrices((prevPrices) => ({
              ...prevPrices,
              [itemId]: {
                days,
                unitLabel: estimate.unitLabel,
                ratePerUnit: estimate.ratePerUnit,
                units: estimate.units,
                rentAmount: estimate.rentAmount,
                securityDeposit: security,
                totalAmount: estimate.rentAmount + security,
              },
            }));
          } else {
            setLivePrices((prevPrices) => ({
              ...prevPrices,
              [itemId]: { error: "No applicable pricing found for this duration" },
            }));
          }
        } else {
          setLivePrices((prevPrices) => ({ ...prevPrices, [itemId]: null }));
        }
      }

      return updated;
    });
  };

  const calculateGrandTotalPayable = () => {
    let grandTotal = 0;
    checkoutItems.forEach((item) => {
      const priceData = livePrices[item._id];
      if (priceData && !priceData.error && priceData.totalAmount) {
        grandTotal += priceData.totalAmount;
      }
    });
    return grandTotal;
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault(); // Default form reload stop karne ke liye
    setError("");
    setMessage("");
    setItemResults({});

    const unconfigured = checkoutItems.some((item) => {
      const dates = datesConfig[item._id];
      return (
        !dates?.pickupDate ||
        !dates?.returnDate ||
        new Date(dates.returnDate) <= new Date(dates.pickupDate)
      );
    });

    if (unconfigured) {
      setError("Please select valid pickup and return dates for all products.");
      return;
    }

    setSubmitting(true);
    const results = {};

    try {
      let successCount = 0;

      for (const item of checkoutItems) {
        const dates = datesConfig[item._id];

        let finalProductId = null;
        if (item.product && typeof item.product === "object" && item.product._id) {
          finalProductId = item.product._id;
        } else if (item.product && typeof item.product === "string") {
          finalProductId = item.product;
        } else if (item._id) {
          finalProductId = item._id;
        }

        const productName = item.product?.name || item.name || "Product";

        if (!finalProductId) {
          results[item._id] = { success: false, message: "Could not resolve product for this item" };
          continue;
        }

        try {
          const response = await fetch("http://localhost:5000/api/bookings/quotation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              productId: finalProductId,
              pickupDate: dates.pickupDate,
              returnDate: dates.returnDate,
              quantity: Number(item.quantity),
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (response.ok) {
            successCount++;
            results[item._id] = { success: true, message: data.message || "Quotation requested successfully!" };
          } else {
            results[item._id] = {
              success: false,
              message: data.message || `Request failed for ${productName}`,
            };
          }
        } catch (itemErr) {
          results[item._id] = { success: false, message: `Network error for ${productName}` };
        }
      }

      setItemResults(results);

      if (successCount === checkoutItems.length) {
        setMessage("All quotation requests sent successfully! Waiting for admin approval.");
        localStorage.removeItem("checkoutItems");
        setTimeout(() => navigate("/"), 3000);
      } else if (successCount === 0) {
        setError("None of the quotation requests could be sent. See details below.");
      } else {
        setError(`Sent ${successCount} out of ${checkoutItems.length} requests successfully. See details below.`);
      }
    } catch (err) {
      setError("An error occurred while submitting quotation requests.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <Package className="w-12 h-12 text-zinc-600 mb-3 animate-pulse" />
        <p className="text-zinc-400 mb-4 font-medium">No items selected for quotation checkout.</p>
        <button 
          onClick={() => navigate("/")} 
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go To Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Complete Checkout Quotation</h1>
        </div>

        <form onSubmit={handleSubmitAll} className="space-y-6">
          {checkoutItems.map((item) => {
            const itemDates = datesConfig[item._id] || { pickupDate: "", returnDate: "" };
            const priceInfo = livePrices[item._id];
            const result = itemResults[item._id];

            const productDetails = item.product || item;
            const itemImage = productDetails.images?.[0];
            const imageUrl = itemImage ? (itemImage.startsWith("http") ? itemImage : `${BACKEND_URL}${itemImage}`) : null;
            const pricingTiers = productDetails.pricing || {};

            return (
              <div key={item._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-5 transition-all hover:border-zinc-700/60">
                
                {/* Product Details Header */}
                <div className="flex flex-col sm:flex-row gap-5 pb-4 border-b border-zinc-800/60">
                  <div className="w-full sm:w-32 h-32 shrink-0 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative group">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={productDetails.name || "Product"} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-zinc-700" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100 tracking-wide">
                          {productDetails.name || "Product Item"}
                        </h3>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">Log ID: {item._id}</p>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1.5 bg-zinc-950 text-blue-400 border border-zinc-800 rounded-xl shrink-0">
                        Units Logged: {item.quantity}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                      {productDetails.description || "No description provided for this item."}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold text-zinc-400">
                      {pricingTiers.hourly && <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800/80">₹{pricingTiers.hourly}/hr</span>}
                      {pricingTiers.daily && <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800/80">₹{pricingTiers.daily}/day</span>}
                      {pricingTiers.weekly && <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800/80">₹{pricingTiers.weekly}/wk</span>}
                      {pricingTiers.monthly && <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800/80">₹{pricingTiers.monthly}/mo</span>}
                    </div>
                  </div>
                </div>

                {/* Date Inputs - Added onKeyDown listener to stop auto-submit reloads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={itemDates.pickupDate}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      onChange={(e) => handleDateChange(item._id, "pickupDate", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white scheme-dark cursor-pointer transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={itemDates.returnDate}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      onChange={(e) => handleDateChange(item._id, "returnDate", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white scheme-dark cursor-pointer transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Pricing Info Area */}
                {priceInfo?.error ? (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {priceInfo.error}
                  </div>
                ) : priceInfo ? (
                  <div className="bg-zinc-950 rounded-xl p-4 text-xs space-y-2.5 border border-zinc-800/60">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Rental Duration:</span>
                      <span className="font-semibold text-zinc-200 bg-zinc-900 px-2.5 py-0.5 border border-zinc-800 rounded-md">{priceInfo.days} Days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Rate Applied:</span>
                      <span className="font-medium text-zinc-300">
                        ₹{priceInfo.ratePerUnit} x {priceInfo.units} ({priceInfo.unitLabel})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Security Deposit:</span>
                      <span className="font-semibold text-emerald-400">₹{priceInfo.securityDeposit}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-800/80 pt-2.5 font-bold">
                      <span className="text-zinc-300 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Item Estimated Total:</span>
                      <span className="text-blue-400 text-sm">₹{priceInfo.totalAmount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-500 text-xs text-center py-3 border border-dashed border-zinc-800/80 rounded-xl flex items-center justify-center gap-1.5 bg-zinc-950/40">
                    <Info className="w-3.5 h-3.5 text-zinc-600" />
                    Select valid segment duration dates to dynamically calculate estimations.
                  </div>
                )}

                {result && (
                  <div
                    className={`text-xs rounded-xl p-3 border flex items-center gap-2 ${
                      result.success
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/5 border-red-500/20 text-red-400"
                    }`}
                  >
                    {result.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    {result.message}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Total Segment */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-5">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Grand Value Bill Payable</p>
              <h2 className="text-2xl font-black text-blue-400">₹{calculateGrandTotalPayable()}</h2>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Requests...
                </>
              ) : (
                "Request Instant Quotations"
              )}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="mt-5 rounded-xl bg-red-500/5 border border-red-500/20 p-4 text-red-400 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}