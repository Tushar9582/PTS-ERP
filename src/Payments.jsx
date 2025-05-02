import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Grid, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ref, push, onValue } from "firebase/database";
import { db } from "./firebase";

const { useBreakpoint } = Grid;

const Payments = ({ onSelectPayment }) => {
  const screens = useBreakpoint();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    client: "",
    amount: "",
    date: "",
    year: "",
    paymentMode: "",
  });

  // Fetch from Firebase
  useEffect(() => {
    const paymentsRef = ref(db, "payments");
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setPayments(list);
      setFilteredPayments(list);
    });
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = payments.filter(
      (payment) =>
        payment.number?.includes(searchTerm) ||
        payment.client?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.number.trim()) return;
    try {
      await push(ref(db, "payments"), formData);
      setFormData({
        number: "",
        client: "",
        amount: "",
        date: "",
        year: "",
        paymentMode: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  // Responsive Columns
  const getColumns = () => {
    if (screens.xs) {
      return [
        {
          title: "Payment Details",
          dataIndex: "number",
          key: "number",
          render: (_, record) => (
            <div onClick={() => onSelectPayment?.(record)}>
              <strong>#{record.number}</strong><br />
              💼 {record.client}<br />
              💰 {record.amount}<br />
              📅 {record.date} ({record.year})<br />
              💳 {record.paymentMode}
            </div>
          ),
        },
      ];
    }

    return [
      { title: "Number", dataIndex: "number", key: "number" },
      { title: "Client", dataIndex: "client", key: "client" },
      { 
        title: "Amount", 
        dataIndex: "amount", 
        key: "amount",
        render: (amount) => `$${amount}`
      },
      { title: "Date", dataIndex: "date", key: "date" },
      { title: "Year", dataIndex: "year", key: "year" },
      { title: "Payment Mode", dataIndex: "paymentMode", key: "paymentMode" },
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
        <h2 style={{ margin: screens.xs ? "0 0 8px 0" : "0" }}>Payments List</h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: screens.xs ? "column" : "row",
          }}
        >
          <Input
            placeholder="Search by number or client"
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
            + Add Payment
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={getColumns()}
        dataSource={filteredPayments}
        rowKey="id"
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        style={{
          background: "white",
          borderRadius: "8px",
          padding: screens.xs ? "8px" : "12px",
        }}
        locale={{ emptyText: "No payments found" }}
        onRow={(record) => ({
          onClick: () => onSelectPayment?.(record),
          style: { cursor: "pointer" },
        })}
      />

      {/* Modal */}
      <Modal
        title="Add New Payment"
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
            { label: "Number", name: "number" },
            { label: "Client", name: "client" },
            { label: "Amount", name: "amount", type: "number" },
            { label: "Date", name: "date", type: "date" },
            { label: "Year", name: "year", type: "number" },
          ].map(({ label, name, type = "text" }) => (
            <div className="col-12" key={name}>
              <label className="form-label">{label}</label>
              <Input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          
          <div className="col-12">
            <label className="form-label">Payment Mode</label>
            <Select
              style={{ width: '100%' }}
              value={formData.paymentMode}
              onChange={(value) => setFormData({...formData, paymentMode: value})}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Credit Card', label: 'Credit Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
              ]}
              placeholder="Select payment mode"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;