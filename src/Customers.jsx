import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Grid } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";

const { useBreakpoint } = Grid;

const Customers = ({ onSelectCustomer }) => {
  const screens = useBreakpoint();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });

  // Fetch from Firebase
  useEffect(() => {
    const customersRef = ref(db, "customers");
    onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setCustomers(list);
      setFilteredCustomers(list);
    });
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = customers.filter((cust) =>
      cust.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      await push(ref(db, "customers"), formData);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        company: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

 // Responsive Columns
const getColumns = () => {
  if (screens.xs) {
    return [
      {
        title: "Client Details",
        dataIndex: "name",
        key: "name",
        render: (_, record) => (
          <div onClick={() => onSelectCustomer(record)}>
            <strong>{record.name}</strong><br />
            📞 {record.phone}<br />
            ✉️ {record.email}<br />
            🏢 {record.company}<br />
            📍 {record.address}
          </div>
        ),
      },
    ];
  }

  return [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Company", dataIndex: "company", key: "company" },
  ];
};


  return (
    <div
      style={{
        padding: screens.xs ? "12px" : "24px",
        marginLeft: screens.xs ? "0" : "250px",
        maxWidth: "1100px",
        width: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: screens.xs ? "column" : "row",
          justifyContent: "space-between",
          marginBottom: "16px",
          gap: screens.xs ? "12px" : "8px",
        }}
      >
        <h2 style={{ margin: screens.xs ? "0 0 8px 0" : "0" }}>Clients List</h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: screens.xs ? "column" : "row",
          }}
        >
          <Input
            placeholder="Search by Name"
            allowClear
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: screens.xs ? "100%" : "200px" }}
          />
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            + Add Client
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={getColumns()}
        dataSource={filteredCustomers}
        rowKey="id"
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        style={{
          background: "white",
          borderRadius: "8px",
          padding: screens.xs ? "8px" : "12px",
        }}
        locale={{ emptyText: "No clients found" }}
        onRow={(record) => ({
          onClick: () => onSelectCustomer?.(record),
          style: { cursor: "pointer" },
        })}
      />

      {/* Modal */}
      <Modal
        title="Add New Client"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Submit"
        cancelText="Cancel"
        width={screens.xs ? "90%" : 700}
        style={{ top: screens.xs ? "16px" : "50px" }}
      >
        <div className="row g-3">
          {[
            { label: "Name", name: "name" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone" },
            { label: "Address", name: "address" },
            { label: "Company", name: "company" },
          ].map(({ label, name, type = "text" }) => (
            <div className="col-12" key={name}>
              <label className="form-label">{label}</label>
              <Input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
