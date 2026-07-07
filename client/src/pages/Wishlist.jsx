import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, Loader2, Package, Trash2 } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/wishlist");
      const data = await response.json();
      if (data.success) {
        // Assume backend returns populated products inside data.wishlist
        setWishlistItems(data.wishlist);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (e, productId) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/user/wishlist", {
        method: "POST", // toggle endpoint
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (data.success) {
        // Instead of re-fetching, just filter locally since we know it toggled off
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  return (
    <div className="wishlist-container">
      <Navbar />
      
      <main className="wishlist-main">
        <h1 className="wishlist-title">My Wishlist</h1>
        
        {loading ? (
          <div className="wishlist-loading">
            <Loader2 className="wishlist-loading-icon" />
            <p>Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <Heart className="wishlist-empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Save items you like here to review or rent later.</p>
            <Link to="/home" className="wishlist-btn-primary">Explore Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => (
              <Link to={`/product/${product._id}`} key={product._id} className="wishlist-card">
                <div className="wishlist-card-image-container">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="wishlist-card-image"
                    />
                  ) : (
                    <div className="wishlist-card-placeholder">
                      <Package className="wishlist-placeholder-icon" />
                    </div>
                  )}
                  
                  <button 
                    className="wishlist-btn-remove" 
                    onClick={(e) => handleRemove(e, product._id)}
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="wishlist-card-info">
                  <h3 className="wishlist-card-title">{product.name}</h3>
                  <div className="wishlist-card-footer">
                    <span className="wishlist-card-price">₹{product.pricing?.daily || 0} / day</span>
                    <button className="wishlist-btn-view">View Details</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
