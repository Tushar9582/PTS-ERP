import React, { useState } from "react";
import { Table, Button, Modal, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import NewInvoiceForm from "./NewInvoiceForm";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]); // Store invoices
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onAddNewInvoice = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // Function to save new invoice
  const handleSaveInvoice = (newInvoice) => {
    setInvoices([...invoices, { ...newInvoice, key: invoices.length + 1 }]);
    setIsModalOpen(false);
  };

  const columns = [
    { title: "Number", dataIndex: "number" },
    { title: "Client", dataIndex: "client" },
    { title: "Date", dataIndex: "date" },
    { title: "Expire Date", dataIndex: "expireDate" },
    { title: "Total", dataIndex: "total" },
    { title: "Status", dataIndex: "status" },
    { title: "Created By", dataIndex: "createdBy" },
  ];

  return (
    <div 
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        marginLeft: "260px", // ✅ This shifts content away from sidebar
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2>Invoice List</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Input placeholder="Search" allowClear style={{ width: 200 }} prefix={<SearchOutlined />} />
          <Button type="primary" onClick={onAddNewInvoice}>+ Add New Invoice</Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={invoices} 
        rowKey="key" 
        locale={{ emptyText: "No data" }}
        style={{ background: "white", borderRadius: "8px", padding: "12px" }}
      />

      <Modal title="New Invoice" open={isModalOpen} onCancel={handleClose} footer={null} width={800}>
        <NewInvoiceForm onSave={handleSaveInvoice} />
      </Modal>
    </div>
  );
};

export default InvoiceList;
