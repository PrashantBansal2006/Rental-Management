import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Package, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rentalDuration, setRentalDuration] = useState(1);
  const [rentalType, setRentalType] = useState('daily');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCartAdded, setIsCartAdded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const calculateTotal = () => {
    if (!product || !product.pricing) return 0;
    const basePrice = product.pricing[rentalType] || 0;
    return basePrice * rentalDuration * quantity;
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          duration: rentalDuration,
          durationType: rentalType,
          totalPrice: calculateTotal()
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setIsCartAdded(true);
        setTimeout(() => setIsCartAdded(false), 2000);
      }
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setIsWishlisted(data.wishlist.includes(product._id));
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user/wishlist", {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setIsWishlisted(data.wishlist.some(p => p._id === id || p === id)); // handles both populated and unpopulated
        }
      } catch (error) { console.error(error); }
    };
    fetchWishlist();
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pd-container">
        <Navbar />
        <div className="pd-loading">
          <Loader2 className="pd-loading-icon" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-container">
        <Navbar />
        <div className="pd-empty">
          <Package className="pd-empty-icon" />
          <h2>Product not found</h2>
          <Link to="/home" className="pd-back-link">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-container">
      <Navbar />

      <main className="pd-main">
        <Link to="/home" className="pd-back-btn">
          <ArrowLeft className="pd-icon-sm" /> Back to listings
        </Link>

        <div className="pd-grid">
          {/* Left Column - Image */}
          <div className="pd-image-section">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="pd-main-image"
              />
            ) : (
              <div className="pd-image-placeholder">
                <Package className="pd-placeholder-icon" />
              </div>
            )}

            {/* Thumbnail Gallery (if more than 1 image) */}
            {product.images && product.images.length > 1 && (
              <div className="pd-thumbnails">
                {product.images.map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Thumbnail ${index}`} 
                    className={`pd-thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  />
                ))}
              </div>
            )}

            <div className="pd-actions" style={{ marginTop: '2rem' }}>
              <button
                className={isCartAdded ? "pd-btn-primary added" : "pd-btn-primary"}
                disabled={product.availableQuantity <= 0}
                onClick={handleAddToCart}
                style={isCartAdded ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
              >
                {isCartAdded ? "Added!" : "Add to Cart"}
              </button>
              <button
                className="pd-btn-secondary"
                onClick={handleWishlist}
                style={{ color: isWishlisted ? '#ec4899' : '#e5e7eb', borderColor: isWishlisted ? '#ec4899' : '#52525b' }}
              >
                <Heart className="pd-icon-sm" fill={isWishlisted ? '#ec4899' : 'none'} /> Wishlist
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="pd-details-section">
            {product.category && (
              <span className="pd-category">{product.category.name}</span>
            )}
            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-description-container">
              <p className="pd-description">
                {product.description 
                  ? (showFullDesc || product.description.length <= 150 
                      ? product.description 
                      : `${product.description.substring(0, 150)}...`)
                  : "No description provided for this product."}
              </p>
              {product.description && product.description.length > 150 && (
                <button 
                  className="pd-btn-readmore" 
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? "Read Less" : "Read More"}
                </button>
              )}
            </div>

            <div className="pd-divider"></div>

            <div className="pd-pricing-section">
              <h3 className="pd-section-title">Rental Pricing</h3>
              <div className="pd-pricing-grid">
                <div className="pd-price-card">
                  <span className="pd-price-label">Hourly</span>
                  <span className="pd-price-value">₹{product.pricing?.hourly || 0}</span>
                </div>
                <div className="pd-price-card">
                  <span className="pd-price-label">Daily</span>
                  <span className="pd-price-value">₹{product.pricing?.daily || 0}</span>
                </div>
                <div className="pd-price-card">
                  <span className="pd-price-label">Weekly</span>
                  <span className="pd-price-value">₹{product.pricing?.weekly || 0}</span>
                </div>
                <div className="pd-price-card">
                  <span className="pd-price-label">Monthly</span>
                  <span className="pd-price-value">₹{product.pricing?.monthly || 0}</span>
                </div>
              </div>
            </div>

            <div className="pd-info-grid">
              <div className="pd-info-item">
                <span className="pd-info-label">Security Deposit</span>
                <span className="pd-info-value">₹{product.securityDeposit || 0}</span>
              </div>
              <div className="pd-info-item">
                <span className="pd-info-label">Availability</span>
                <span className="pd-info-value">
                  {product.availableQuantity > 0 ? (
                    <span className="pd-status-in-stock">{product.availableQuantity} available</span>
                  ) : (
                    <span className="pd-status-out-stock">Out of stock</span>
                  )}
                </span>
              </div>
            </div>

            <div className="pd-calculator">
              <h3 className="pd-section-title">Calculate Rental Cost</h3>

              <div className="pd-calc-grid">
                <div className="pd-calc-row quantity-col">
                  <label className="pd-calc-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={product.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.availableQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="pd-calc-input"
                    disabled={product.availableQuantity <= 0}
                  />
                </div>

                <div className="pd-calc-row duration-col">
                  <label className="pd-calc-label">Duration</label>
                  <div className="pd-calc-controls">
                    <input
                      type="number"
                      min="1"
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="pd-calc-input duration-input"
                    />
                    <select
                      value={rentalType}
                      onChange={(e) => setRentalType(e.target.value)}
                      className="pd-calc-select"
                    >
                      <option value="hourly">Hours</option>
                      <option value="daily">Days</option>
                      <option value="weekly">Weeks</option>
                      <option value="monthly">Months</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pd-calc-total">
                <span className="pd-total-label">Total Estimated Price:</span>
                <span className="pd-total-amount">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
