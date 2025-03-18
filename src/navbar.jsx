import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaBars, FaTachometerAlt, FaFileInvoiceDollar, FaMoneyBillWave, 
  FaClipboardList, FaBuilding, FaTags, FaBox, FaChartPie, FaCog 
} from "react-icons/fa";
import "./navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Hamburger Menu for Mobile */}
      <div className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <FaBars />
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">ERP</h2>
        </div>

        <ul className="nav-links">
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/" className="nav-item">
              <FaTachometerAlt size={18} /> Dashboard
            </Link>
          </li>
          <li className={location.pathname === "/leads" ? "active" : ""}>
            <Link to="/leads" className="nav-item">
              <FaClipboardList size={18} /> Leads
            </Link>
          </li>
          <li className={location.pathname === "/invoices" ? "active" : ""}>
            <Link to="/invoices" className="nav-item">
              <FaFileInvoiceDollar size={18} /> Invoices
            </Link>
          </li>
          <li className={location.pathname === "/payments" ? "active" : ""}>
            <Link to="/payments" className="nav-item">
              <FaMoneyBillWave size={18} /> Payments
            </Link>
          </li>
          <li className={location.pathname === "/companies" ? "active" : ""}>
            <Link to="/companies" className="nav-item">
              <FaBuilding size={18} /> Companies
            </Link>
          </li>
          <li className={location.pathname === "/products" ? "active" : ""}>
            <Link to="/products" className="nav-item">
              <FaBox size={18} /> Products
            </Link>
          </li>
          <li className={location.pathname === "/products-category" ? "active" : ""}>
            <Link to="/products-category" className="nav-item">
              <FaTags size={18} /> Products Category
            </Link>
          </li>
          <li className={location.pathname === "/report" ? "active" : ""}>
            <Link to="/reports" className="nav-item">
              <FaChartPie size={18} /> Report
            </Link>
          </li>
          <li className={location.pathname === "/settings" ? "active" : ""}>
            <Link to="/settings" className="nav-item">
              <FaCog size={18} /> Settings
            </Link>
          </li>
          <li className={location.pathname === "/customform" ? "active" : ""}>
            <Link to="/customform" className="nav-item">
              <FaCog size={18} /> Custom Form 
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
