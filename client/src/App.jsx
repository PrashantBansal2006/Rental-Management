import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CreateQuotation from './pages/CreateQuotation'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Default /home route rendering the Home page */}
        <Route path="/home" element={<Home />} />

        <Route path="/createQuotation" element={<CreateQuotation/>}/>
        <Route path="/mybookings" element={<MyBookings/>}/>
        <Route path="/adminDashboard" element={<AdminDashboard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;