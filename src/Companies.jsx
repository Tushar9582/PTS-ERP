import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CompanyForm from "./CompanyForm";
import { db } from "./firebase"; // Ensure correct Firebase import
import { ref, push, onValue } from "firebase/database";

const CompanyList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Companies from Firebase
  useEffect(() => {
    const companiesRef = ref(db, "companies");
    onValue(companiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const companyList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCompanies(companyList);
      } else {
        setCompanies([]);
      }
    });
  }, []);

  // Add new company to Firebase
  const addCompany = (companyData) => {
    const companiesRef = ref(db, "companies");
    push(companiesRef, companyData); // Push new company to Firebase
    setIsModalOpen(false);
  };

  // Search Filter
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Country", dataIndex: "country", key: "country" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Website", dataIndex: "website", key: "website" },
  ];

  return (
    <div style={{ padding: "24px", marginLeft: "250px", maxWidth: "1100px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2>Company List</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            placeholder="Search by Name"
            allowClear
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="primary" onClick={() => setIsModalOpen(true)}>+ Add New Company</Button>
        </div>
      </div>

      {/* Ant Design Table */}
      <Table 
        columns={columns} 
        dataSource={filteredCompanies} 
        rowKey="id" 
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
