import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaFileInvoiceDollar, FaMoneyBillWave, FaQuoteRight, FaUser, 
  FaBuilding, FaClipboardList, FaTags, FaBox, FaThList, FaFileAlt, 
  FaFileInvoice, FaChartPie, FaCog
} from "react-icons/fa";
import "./navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">ERP</h2>
      </div>

      <ul className="nav-links">
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/" className="nav-item">
            <FaTachometerAlt size={18} /> Dashboard
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
        <li className={location.pathname === "/quotes-for-customers" ? "active" : ""}>
          <Link to="/quotes-for-customers" className="nav-item">
            <FaQuoteRight size={18} /> Quotes For Customers
          </Link>
        </li>
        <li className={location.pathname === "/customers" ? "active" : ""}>
          <Link to="/customers" className="nav-item">
            <FaUser size={18} /> Customers
          </Link>
        </li>
        <li className={location.pathname === "/peoples" ? "active" : ""}>
          <Link to="/peoples" className="nav-item">
            <FaUser size={18} /> Peoples
          </Link>
        </li>
        <li className={location.pathname === "/companies" ? "active" : ""}>
          <Link to="/companies" className="nav-item">
            <FaBuilding size={18} /> Companies
          </Link>
        </li>
        <li className={location.pathname === "/leads" ? "active" : ""}>
          <Link to="/leads" className="nav-item">
            <FaClipboardList size={18} /> Leads
          </Link>
        </li>
        <li className={location.pathname === "/quotes-for-leads" ? "active" : ""}>
          <Link to="/quotes-for-leads" className="nav-item">
            <FaFileAlt size={18} /> Quotes For Leads
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
        <li className={location.pathname === "/expenses" ? "active" : ""}>
          <Link to="/expenses" className="nav-item">
            <FaFileInvoice size={18} /> Expenses
          </Link>
        </li>
        <li className={location.pathname === "/expenses-category" ? "active" : ""}>
          <Link to="/expenses-category" className="nav-item">
            <FaThList size={18} /> Expenses Category
          </Link>
        </li>
        <li className={location.pathname === "/report" ? "active" : ""}>
          <Link to="/report" className="nav-item">
            <FaChartPie size={18} /> Report
          </Link>
        </li>
        <li className={location.pathname === "/settings" ? "active" : ""}>
          <Link to="/settings" className="nav-item">
            <FaCog size={18} /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
