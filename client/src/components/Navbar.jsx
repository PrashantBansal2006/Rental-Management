import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User, Menu, X, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ cartCount = 0, wishlistCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper for NavLink styling
  const navLinkClass = ({ isActive }) => 
    `text-sm transition-colors ${isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 px-6 py-5 bg-[#111111] text-gray-200 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/home" className="text-xl font-medium tracking-wide text-white">
          Rental<span className="font-bold">App</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/home" className={navLinkClass}>Home</NavLink>
          <NavLink to="/shop" className={navLinkClass}>Shop</NavLink>
          <NavLink to="/myBookings" className={navLinkClass}>My Bookings</NavLink>
        </nav>

        {/* Right Elements Group */}
        <div className="flex items-center gap-6">
          
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="relative text-zinc-400 hover:text-white transition-colors">
            <Heart className="w-5 h-5 stroke-[2]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-[#111111]">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative text-zinc-400 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-[#111111]">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative">
            {user ? (
              <>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 stroke-[2]" />
                  <span className="font-medium">{user.name || 'Account'}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 shadow-lg rounded py-2 z-50 animate-fade-in">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-gray-200">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-gray-200">Settings</Link>
                    <button 
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        navigate('/login');
                      }} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-800 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-medium hover:text-white transition-colors cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-4">
          <NavLink to="/home" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>Shop</NavLink>
          <NavLink to="/myBookings" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>My Bookings</NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;