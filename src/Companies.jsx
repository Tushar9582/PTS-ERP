import React, { useState } from "react";
import { Table, Button, Modal, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CompanyForm from "./CompanyForm";

const CompanyList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Function to add a new company
  const addCompany = (companyData) => {
    setCompanies([...companies, { ...companyData, key: companies.length + 1 }]);
    setIsModalOpen(false);
  };

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Contact", dataIndex: "contact" },
    { title: "Country", dataIndex: "country" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Website", dataIndex: "website" },
  ];

  return (
    <div style={{ padding: "24px", marginLeft: "250px", maxWidth: "1100px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2>Company List</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Input placeholder="Search" allowClear style={{ width: 200 }} prefix={<SearchOutlined />} />
          <Button type="primary" onClick={() => setIsModalOpen(true)}>+ Add New Company</Button>
        </div>
      </div>

      {/* Ant Design Table */}
      <Table 
        columns={columns} 
        dataSource={companies} 
        rowKey="key" 
        locale={{ emptyText: "No data" }} 
        style={{ background: "white", borderRadius: "8px", padding: "12px" }}
      />

      {/* Ant Design Modal for Company Form */}
      <Modal title="New Company" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={800}>
        <CompanyForm onSave={addCompany} />
      </Modal>
    </div>
  );
};

export default CompanyList;
