import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import { FaHome, FaBox, FaShoppingCart, FaChartBar, FaCog } from "react-icons/fa"; // Import icons

const Navbar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">ERP</h2>
      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-item"><FaHome size={24} /></Link>
        </li>
        <li>
          <Link to="/orders" className="nav-item"><FaBox size={24} /></Link>
        </li>
        <li>
          <Link to="/products" className="nav-item"><FaShoppingCart size={24} /></Link>
        </li>
        <li>
          <Link to="/reports" className="nav-item"><FaChartBar size={24} /></Link>
        </li>
        <li>
          <Link to="/settings" className="nav-item"><FaCog size={24} /></Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
