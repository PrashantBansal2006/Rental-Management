import React, { useState } from "react";

export default function CreateQuotation() {
  const [formData, setFormData] = useState({
    productId: "",
    pickupDate: "",
    returnDate: "",
    quantity: 1,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/bookings/quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="p-2 max-w-5">
      <h2>Request a Rental Quotation</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-12">
        <label>
          Product ID:
          <input
            type="text"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            className="w-full p-6"
          />
        </label>

        <label>
          Pickup Date & Time:
          <input
            type="datetime-local"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            required
            className="w-full p-6"
          />
        </label>

        <label>
          Return Date & Time:
          <input
            type="datetime-local"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            required
            className="w-full p-6"
          />
        </label>

        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full p-6"
          />
        </label>

        <button
          type="submit"
          className="p-10 bg-black text-white border-none cursor-pointer"
        >
          Submit Request
        </button>
      </form>

      {message && (
        <p className="text-green-800 mt-10">
          {message}
        </p>
      )}

      {error && (
        <p className="text-red-700 mt-10">
          {error}
        </p>
      )}
    </div>
  );
}