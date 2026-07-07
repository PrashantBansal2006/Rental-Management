import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import ProductDetail from './components/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Default /home route rendering the Home page */}
        <Route path="/home" element={<Home />} />
        
        {/* Product Details page */}
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Cart and Wishlist pages */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;