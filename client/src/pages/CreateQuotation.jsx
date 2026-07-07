import React, { useState, useEffect } from "react";

export default function CreateQuotation() {
  const [products, setProducts] = useState([]); // Sabhi products store karne ke liye
  const [selectedProduct, setSelectedProduct] = useState(null); // Clicked product details ke liye
  const [formData, setFormData] = useState({
    productId: "",
    pickupDate: "",
    returnDate: "",
    quantity: 1,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 1. Fetch all available products on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/v1/products"); // Apne actual product fetch endpoint se replace karein
        const data = await response.json();
        if (response.ok) {
          // Sirf available products filter karke set karenge
          setProducts(data.data || data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // 2. Jb user kisi product list/card par click karega
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      productId: product._id, // Automate setting the ID
      quantity: 1, // Reset quantity on product change
    }));
    setMessage("");
    setError("");
  };

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
    <div className="min-h-screen bg-zinc-950 text-white p-6 lg:p-10 flex flex-col lg:flex-row gap-8 justify-center items-start">
      
      {/* LEFT SIDE: Simple Product Selection Grid */}
      <div className="w-full lg:w-1/3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-zinc-200">Select a Product</h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {products.map((prod) => (
            <div
              key={prod._id}
              onClick={() => handleProductSelect(prod)}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center gap-4 ${
                formData.productId === prod._id
                  ? "bg-blue-600/10 border-blue-500"
                  : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {prod.images && prod.images[0] && (
                <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{prod.name}</h4>
                <p className="text-xs text-zinc-400">Available: {prod.availableQuantity}</p>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-zinc-500 text-sm">No products available.</p>}
        </div>
      </div>

      {/* RIGHT SIDE: Selected Product Detail & Quotation Form */}
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Rental Quotation</h2>
        <p className="text-zinc-400 text-center mb-6">Fill in the details to request a quotation.</p>

        {/* Dynamic Product Detail Card */}
        {selectedProduct && (
          <div className="mb-6 bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
            {selectedProduct.images && selectedProduct.images[0] && (
              <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-20 h-20 rounded-lg object-cover" />
            )}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-blue-400">{selectedProduct.name}</h3>
              <p className="text-sm text-zinc-300 mt-1">
                Daily Rate: <span className="text-white font-medium">Rs. {selectedProduct.pricing?.daily || "N/A"}</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Stock Status: {selectedProduct.availableQuantity} units left
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hidden or read-only Product ID Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Product ID</label>
            <input
              type="text"
              name="productId"
              value={formData.productId}
              readOnly
              required
              placeholder="Click a product from the left list"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-3 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Pickup Date & Time</label>
            <input
              type="datetime-local"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Return Date & Time</label>
            <input
              type="datetime-local"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              max={selectedProduct ? selectedProduct.availableQuantity : undefined} // Front-end validation boundary
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!formData.productId}
            className={`w-full font-semibold py-3 rounded-lg transition duration-200 ${
              formData.productId
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Submit Request
          </button>
        </form>

        {message && (
          <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}