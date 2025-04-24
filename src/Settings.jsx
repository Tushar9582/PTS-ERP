import React, { useState, useContext } from "react";
import { Table, Button, Checkbox, Input, Space } from "antd";
import { MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import Swal from "sweetalert2";
import { DarkModeContext } from "./DarkModeContext";
import "./AdminList.css";

const AdminList = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [data, setData] = useState([
    {
      key: "1",
      firstName: "Rahul",
      lastName: "Pawar",
      email: "Rahul@example.com",
      role: "Founder",
      branch: "Main Branch",
      enabled: true,
    },
    {
      key: "2",
      firstName: "Swapnil",
      lastName: "Gunake",
      email: "Swapnil@example.com",
      role: "Manager",
      branch: "Main Branch",
      enabled: true,
    },
    {
      key: "3",
      firstName: "Rayhan",
      lastName: "Shaikh",
      email: "Rayhan@example.com",
      role: "Project Manager",
      branch: "Main Branch",
      enabled: true,
    },
  ]);

  const isMobile = window.innerWidth <= 768;

  const columns = isMobile
    ? [
        {
          title: "Admin",
          dataIndex: "admin",
          render: (_, record) => (
            <div className={`mobile-admin-card ${darkMode ? "dark-mobile-card" : ""}`}>
              <div className="mobile-admin-row">
                <span className="mobile-label">Name:</span>
                <span>
                  {record.firstName} {record.lastName}
                </span>
              </div>
              <div className="mobile-admin-row">
                <span className="mobile-label">Email:</span>
                <span>{record.email}</span>
              </div>
              <div className="mobile-admin-row">
                <span className="mobile-label">Role:</span>
                <span>{record.role}</span>
              </div>
              <div className="mobile-admin-row">
                <span className="mobile-label">Branch:</span>
                <span>{record.branch}</span>
              </div>
              <div className="mobile-admin-row">
                <span className="mobile-label">Enabled:</span>
                <Checkbox checked={record.enabled} className={darkMode ? "dark-checkbox" : ""} />
              </div>
              <div className="mobile-admin-actions">
                <Button
                  icon={<MoreOutlined />}
                  type="primary"
                  shape="circle"
                  className={darkMode ? "dark-action-btn" : ""}
                />
              </div>
            </div>
          ),
        },
      ]
    : [
        {
          title: "Name",
          dataIndex: "name",
          render: (_, record) => (
            <span className={darkMode ? "dark-table-text" : ""}>
              {record.firstName} {record.lastName}
            </span>
          ),
          width: 150,
        },
        {
          title: "Email",
          dataIndex: "email",
          className: darkMode ? "dark-table-text" : "",
          width: 200,
        },
        {
          title: "Role",
          dataIndex: "role",
          className: darkMode ? "dark-table-text" : "",
          width: 150,
        },
        {
          title: "Branch",
          dataIndex: "branch",
          className: darkMode ? "dark-table-text" : "",
          width: 150,
        },
        {
          title: "Enabled",
          dataIndex: "enabled",
          render: (enabled) => (
            <Checkbox checked={enabled} className={darkMode ? "dark-checkbox" : ""} />
          ),
          width: 100,
        },
        {
          title: "Actions",
          dataIndex: "actions",
          render: () => (
            <Button
              icon={<MoreOutlined />}
              type="primary"
              shape="circle"
              className={darkMode ? "dark-action-btn" : ""}
            />
          ),
          width: 100,
        },
      ];

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
      background: darkMode ? "#2a2a3a" : "#ffffff",
      color: darkMode ? "#e0e0e0" : "#000000",
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire({
              title: "Logged out!",
              text: "You have been logged out.",
              icon: "success",
              background: darkMode ? "#2a2a3a" : "#ffffff",
              color: darkMode ? "#e0e0e0" : "#000000",
            });
          })
          .catch((error) => {
            Swal.fire({
              title: "Error!",
              text: error.message,
              icon: "error",
              background: darkMode ? "#2a2a3a" : "#ffffff",
              color: darkMode ? "#e0e0e0" : "#000000",
            });
          });
      }
    });
  };

  return (
    <div className={`admin-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="desktop-header-container">
        <h2 className={darkMode ? "dark-text" : ""}>Admin List</h2>
        <Button
          type="primary"
          danger
          onClick={handleLogout}
          className={`logout-btn ${darkMode ? "dark-logout-btn" : ""}`}
        >
          Logout
        </Button>
      </div>

      <div className={`admin-header ${isMobile ? "mobile-header" : ""}`}>
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className={darkMode ? "dark-icon" : ""} />}
          className={`search-bar ${darkMode ? "dark-search" : ""} ${isMobile ? "mobile-search" : ""}`}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        className={`${darkMode ? "dark-table" : ""} ${isMobile ? "mobile-table" : ""}`}
        pagination={{
          className: darkMode ? "dark-pagination" : "",
          simple: isMobile,
        }}
      />
    </div>
  );
};

export default AdminList;