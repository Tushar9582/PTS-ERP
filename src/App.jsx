import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './Dashboard'
import Navbar from './navbar'
import Orders from "./Orders";
import Products from "./Products";
import Reports from "./Reports";
import Settings from "./Settings";



function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Navbar /> {/* Sidebar Navbar */}
        <div style={{ flexGrow: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
