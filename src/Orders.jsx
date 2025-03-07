import React, { useState } from "react";
import { Table, Input, Button, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import NewInvoiceForm from "./NewInvoiceForm"; // Import the form

const { Search } = Input;

const columns = [
  { title: "Number", dataIndex: "number" },
  { title: "Client", dataIndex: "client" },
  { title: "Date", dataIndex: "date" },
  { title: "Expired Date", dataIndex: "expiredDate" },
  { title: "Total", dataIndex: "total" },
  { title: "Paid", dataIndex: "paid" },
  { title: "Status", dataIndex: "status" },
  { title: "Payment", dataIndex: "payment" },
  { title: "Created By", dataIndex: "createdBy" },
];

const dataSource = [];

function InvoiceList() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const onSearch = (value) => {
    console.log("Search value:", value);
  };

  const onRefresh = () => {
    console.log("Refresh clicked");
  };

  const onAddNewInvoice = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0 }}>Invoice List</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Search
            placeholder="search"
            onSearch={onSearch}
            style={{ width: 200 }}
            allowClear
            enterButton={<SearchOutlined />}
          />
          <Button onClick={onRefresh}>Refresh</Button>
          <Button type="primary" onClick={onAddNewInvoice}>
            + Add New Invoice
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(record, index) => index}
        locale={{ emptyText: "No data" }}
      />

      {/* Modal for New Invoice Form */}
      <Modal
        title="New Invoice"
        open={isModalOpen}
        onCancel={handleClose}
        footer={null} // No default footer
        width={800}
      >
        <NewInvoiceForm />
      </Modal>
    </div>
  );
}

export default InvoiceList;
