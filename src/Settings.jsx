import React, { useState, useContext } from "react";
import { Table, Button, Checkbox, Input } from "antd";
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
      role: " Founder",
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

  const columns = [
    { 
      title: "First Name", 
      dataIndex: "firstName",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Last Name", 
      dataIndex: "lastName",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Email", 
      dataIndex: "email",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Role", 
      dataIndex: "role",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Branch", 
      dataIndex: "branch",
      className: darkMode ? "dark-table-text" : ""
    },
    {
      title: "Enabled",
      dataIndex: "enabled",
      render: (enabled) => (
        <Checkbox 
          checked={enabled} 
          className={darkMode ? "dark-checkbox" : ""}
        />
      ),
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
    <div className={`admin-container ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className={darkMode ? "dark-text" : ""}>Admin List</h2>

      <div className="admin-header">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className={darkMode ? "dark-icon" : ""} />}
          className={`search-bar ${darkMode ? 'dark-search' : ''}`}
        />
        <Button 
          type="primary" 
          danger 
          onClick={handleLogout} 
          className={darkMode ? "dark-logout-btn" : ""}
          style={{ marginLeft: "10px" }}
        >
          Logout
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="key"
        className={darkMode ? "dark-table" : ""}
        pagination={{
          className: darkMode ? "dark-pagination" : "",
        }}
      />
    </div>
  );
};

export default AdminList;