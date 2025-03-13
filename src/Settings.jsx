import React, { useState } from "react";
import { Table, Button, Checkbox, Input } from "antd";
import { MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import Swal from "sweetalert2";
import "./AdminList.css"; // Ensure this file properly styles your layout

const AdminList = () => {
  const [data, setData] = useState([]); // Initially empty table

  const columns = [
    { title: "First Name", dataIndex: "firstName" },
    { title: "Last Name", dataIndex: "lastName" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    { title: "Branch", dataIndex: "branch" },
    {
      title: "Enabled",
      dataIndex: "enabled",
      render: (enabled) => <Checkbox checked={enabled} />,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: () => (
        <Button icon={<MoreOutlined />} type="primary" shape="circle" />
      ),
    },
  ];

  // Logout Function with Swal confirmation
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
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire("Logged out!", "You have been logged out.", "success");
          })
          .catch((error) => {
            Swal.fire("Error!", error.message, "error");
          });
      }
    });
  };

  return (
    <div className="admin-container">
      <h2>Admin List</h2>

      <div className="admin-header">
        <Input placeholder="Search" prefix={<SearchOutlined />} className="search-bar" />
        {/* Logout Button */}
        <Button type="primary" danger onClick={handleLogout} style={{ marginLeft: "10px" }}>
          Logout
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="key" />
    </div>
  );
};

export default AdminList;
