import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, ChevronDown, LayoutGrid, List, Package, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState("");
  const [priceType, setPriceType] = useState("daily");
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // New States for top filter bar
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cartAddedState, setCartAddedState] = useState({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'hourly': return '/ hour';
      case 'weekly': return '/ week';
      case 'monthly': return '/ month';
      case 'daily':
      default: return '/ day';
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
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
          quantity: 1,
          duration: 1,
          durationType: priceType,
          totalPrice: product.pricing?.[priceType] || 0
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCartAddedState(prev => ({ ...prev, [product._id]: true }));
        setTimeout(() => {
          setCartAddedState(prev => ({ ...prev, [product._id]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const handleWishlist = async (e, product) => {
    e.preventDefault();
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
        setWishlistIds(data.wishlist);
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
          setWishlistIds(data.wishlist.map(p => p._id));
        }
      } catch (error) { console.error(error); }
    };
    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = "http://localhost:5000/api/products?";
        if (priceType) url += `type=${priceType}&`;
        if (priceRange) {
          const [min, max] = priceRange.split("-");
          url += `min=${min}&`;
          if (max) {
            url += `max=${max}&`;
          }
        }

        if (debouncedSearch) {
          url += `search=${encodeURIComponent(debouncedSearch)}&`;
        }
        if (sortOption) {
          url += `sort=${sortOption}&`;
        }

        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [priceRange, priceType, debouncedSearch, sortOption]);

  return (
    <div className="home-container">
      <Navbar />
      
      {/* Main Layout */}
      <div className="home-layout">
        
        {/* Sidebar */}
        <aside className="home-sidebar">
          <h2 className="sidebar-title">Filters</h2>
          
          <div className="sidebar-filters-grid">
            {/* Value Set Column */}
            <div className="filter-group">
              <h3 className="sidebar-subtitle">Price</h3>
              <ul className="sidebar-list">
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="price" className="filter-radio" value="" onChange={(e) => setPriceRange(e.target.value)} defaultChecked /> Any
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="price" className="filter-radio" value="0-50" onChange={(e) => setPriceRange(e.target.value)} /> &lt; ₹50
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="price" className="filter-radio" value="50-200" onChange={(e) => setPriceRange(e.target.value)} /> ₹50 - 200
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="price" className="filter-radio" value="200-500" onChange={(e) => setPriceRange(e.target.value)} /> ₹200 - 500
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="price" className="filter-radio" value="500-" onChange={(e) => setPriceRange(e.target.value)} /> &gt; ₹500
                  </label>
                </li>
              </ul>
            </div>

            {/* Type Column */}
            <div className="filter-group">
              <h3 className="sidebar-subtitle">Type</h3>
              <ul className="sidebar-list">
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="type" className="filter-radio" value="hourly" onChange={(e) => setPriceType(e.target.value)} /> Hourly
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="type" className="filter-radio" value="daily" onChange={(e) => setPriceType(e.target.value)} defaultChecked /> Daily
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="type" className="filter-radio" value="weekly" onChange={(e) => setPriceType(e.target.value)} /> Weekly
                  </label>
                </li>
                <li>
                  <label className="filter-radio-label">
                    <input type="radio" name="type" className="filter-radio" value="monthly" onChange={(e) => setPriceType(e.target.value)} /> Monthly
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="home-main">
          {/* Top Filter Bar */}
          <div className="filter-bar">
            {/* Search Bar */}
            <div className="search-container">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort & View Toggles */}
            <div className="view-toggles">
              <select 
                className="select-filter"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              
              <div className="view-toggle-group">
                <button 
                  className={viewMode === 'grid' ? "btn-view-active" : "btn-view"}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  className={viewMode === 'list' ? "btn-view-active" : "btn-view"}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid / List */}
          <div className={viewMode === 'list' ? 'product-list-view' : 'product-grid'}>
            
            {loading ? (
              <div className="loading-state">
                <Loader2 className="loading-icon" />
                <p className="state-text">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <Package className="empty-icon" />
                <h3 className="empty-title">No products found</h3>
                <p className="state-text">We don't have any products available right now.</p>
              </div>
            ) : (
              products.map((product) => (
                <Link to={`/product/${product._id}`} key={product._id} className="product-card group" style={{ textDecoration: 'none' }}>
                  <div className="product-image-container">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="product-image"
                      />
                    ) : (
                      <div className="product-placeholder">
                        <Package className="product-placeholder-icon" />
                      </div>
                    )}
                  </div>
                  <div className="product-info-wrapper">
                    <h3 className="product-title" title={product.name}>{product.name}</h3>
                    <p className="product-price">₹{product.pricing?.[priceType] || 0} {getTypeLabel(priceType)}</p>
                    <div className="product-actions">
                      <button 
                        className={cartAddedState[product._id] ? "btn-add-cart added" : "btn-add-cart"} 
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {cartAddedState[product._id] ? "Added!" : "Add to Cart"}
                      </button>
                      <button 
                        className="btn-wishlist" 
                        onClick={(e) => handleWishlist(e, product)}
                        style={{ color: wishlistIds.includes(product._id) ? '#ec4899' : '#a1a1aa' }}
                      >
                        <Heart className="w-4 h-4" fill={wishlistIds.includes(product._id) ? '#ec4899' : 'none'} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
