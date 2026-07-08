import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
<<<<<<< HEAD
import CreateQuotation from './pages/CreateQuotation'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
=======
import ProductDetail from './components/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
>>>>>>> 94e865757840b5fca1b1b35dccfb5aa4d3835de1

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Default /home route rendering the Home page */}
        <Route path="/home" element={<Home />} />
<<<<<<< HEAD

        <Route path="/createQuotation" element={<CreateQuotation/>}/>
        <Route path="/mybookings" element={<MyBookings/>}/>
        <Route path="/adminDashboard" element={<AdminDashboard/>}/>
=======
        
        {/* Auth pages (Only accessible if NOT logged in) */}
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        } />
        
        {/* Product Details page */}
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Verification Route */}
        <Route path="/verify-email" element={
          <ProtectedRoute requireVerification={false}>
            <VerifyEmail />
          </ProtectedRoute>
        } />
        
        {/* Protected pages */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
>>>>>>> 94e865757840b5fca1b1b35dccfb5aa4d3835de1
      </Routes>
    </BrowserRouter>
  )
}

export default App;