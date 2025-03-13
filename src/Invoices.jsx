import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import NewInvoiceForm from "./NewInvoiceForm";
import { ref, onValue } from "firebase/database";
import { db } from './firebase'; // Ensure the correct import path

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]); // New state for search results
  const [searchText, setSearchText] = useState(""); // Search input state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch invoices
  const fetchInvoices = () => {
    const invoicesRef = ref(db, "invoices");
    onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const invoiceList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setInvoices(invoiceList);
        setFilteredInvoices(invoiceList); // Initialize filtered invoices
      } else {
        setInvoices([]);
        setFilteredInvoices([]);
      }
    });
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Function to handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase(); // Convert input to lowercase for case-insensitive search
    setSearchText(value);

    if (value === "") {
      setFilteredInvoices(invoices); // Reset to full list when input is cleared
    } else {
      const filtered = invoices.filter((invoice) =>
        invoice.client.toLowerCase().includes(value)
      );
      setFilteredInvoices(filtered);
    }
  };

  const onAddNewInvoice = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const columns = [
    { title: "Number", dataIndex: "number", key: "number" },
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Expire Date", dataIndex: "expireDate", key: "expireDate" },
    { title: "Total", dataIndex: "total", key: "total" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Created By", dataIndex: "createdBy", key: "createdBy" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", marginLeft: "260px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2>Invoice List</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            placeholder="Search by Client"
            allowClear
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch} // Call handleSearch on input change
          />
          <Button type="primary" onClick={onAddNewInvoice}>+ Add New Invoice</Button>
        </div>
      </div>

      <Table columns={columns} dataSource={filteredInvoices} rowKey="id" locale={{ emptyText: "No data" }} />

      <Modal title="New Invoice" open={isModalOpen} onCancel={handleClose} footer={null} width={800}>
        <NewInvoiceForm onSave={fetchInvoices} onClose={handleClose} />
      </Modal>
    </div>
  );
};

export default InvoiceList;
