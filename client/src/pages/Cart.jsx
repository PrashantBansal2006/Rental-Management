import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trash2, ShoppingCart, Loader2, Package } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/cart", {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCartItems(data.cart);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCartItems(data.cart);
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const calculateGrandTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleProceedToCheckout = () => {
    localStorage.setItem("checkoutItems", JSON.stringify(cartItems));
    navigate("/createQuotation");
  };

  return (
    <div className="cart-container">
      <Navbar />
      
      <main className="cart-main">
        <h1 className="cart-title">Your Cart</h1>
        
        {loading ? (
          <div className="cart-loading">
            <Loader2 className="cart-loading-icon" />
            <p>Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart className="cart-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/" className="cart-btn-primary">Start Browsing</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-image-wrapper">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="cart-item-image" />
                    ) : (
                      <div className="cart-item-placeholder">
                        <Package className="cart-placeholder-icon" />
                      </div>
                    )}
                  </div>
                  
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.product?.name || "Unknown Product"}</h3>
                    <div className="cart-item-meta">
                      <span className="cart-meta-pill">Quantity: {item.quantity}</span>
                      <span className="cart-meta-pill">Duration: {item.duration} {item.durationType}(s)</span>
                    </div>
                  </div>
                  
                  <div className="cart-item-price-section">
                    <span className="cart-item-price">₹{item.totalPrice}</span>
                    <button 
                      className="cart-btn-remove"
                      onClick={() => handleRemove(item._id)}
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{calculateGrandTotal()}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Taxes</span>
                <span className="summary-value">Calculated at checkout</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row summary-total">
                <span className="summary-label">Estimated Total</span>
                <span className="summary-value">₹{calculateGrandTotal()}</span>
              </div>
              
              <button onClick={handleProceedToCheckout} className="cart-btn-checkout">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;