import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaBars, FaTachometerAlt, FaFileInvoiceDollar, FaMoneyBillWave, 
  FaClipboardList, FaBuilding, FaTags, FaBox, FaChartPie, FaCog 
} from "react-icons/fa";
import "./navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Close sidebar when resizing to desktop if open
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close sidebar when clicking on a nav link (mobile only)
  const handleNavLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger Menu for Mobile */}
      {isMobile && (
        <div 
          className="hamburger" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">ERP</h2>
        </div>

        <ul className="nav-links">
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link 
              to="/" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaTachometerAlt size={18} /> Dashboard
            </Link>
          </li>
          <li className={location.pathname === "/leads" ? "active" : ""}>
            <Link 
              to="/leads" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaClipboardList size={18} /> Leads
            </Link>
          </li>
          <li className={location.pathname === "/customform" ? "active" : ""}>
            <Link 
              to="/customform" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaCog size={18} /> Custom Leads 
            </Link>
          </li>
          <li className={location.pathname === "/invoices" ? "active" : ""}>
            <Link 
              to="/invoices" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaFileInvoiceDollar size={18} /> Invoices
            </Link>
          </li>
          <li className={location.pathname === "/customers" ? "active" : ""}>
            <Link 
              to="/customers" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaCog size={18} />Clients 
            </Link>
          </li>
          <li className={location.pathname === "/peoples" ? "active" : ""}>
            <Link 
              to="/peoples" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaCog size={18} />Peoples 
            </Link>
          </li>
          <li className={location.pathname === "/payments" ? "active" : ""}>
            <Link 
              to="/payments" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaMoneyBillWave size={18} /> Payments
            </Link>
          </li>
          <li className={location.pathname === "/companies" ? "active" : ""}>
            <Link 
              to="/companies" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaBuilding size={18} /> Companies
            </Link>
          </li>
          <li className={location.pathname === "/products" ? "active" : ""}>
            <Link 
              to="/products" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaBox size={18} /> Products
            </Link>
          </li>
          <li className={location.pathname === "/products-category" ? "active" : ""}>
            <Link 
              to="/products-category" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaTags size={18} /> Products Category
            </Link>
          </li>
          <li className={location.pathname === "/report" ? "active" : ""}>
            <Link 
              to="/reports" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaChartPie size={18} /> Report
            </Link>
          </li>
          <li className={location.pathname === "/settings" ? "active" : ""}>
            <Link 
              to="/settings" 
              className="nav-item"
              onClick={handleNavLinkClick}
            >
              <FaCog size={18} /> Settings
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;