import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Grid } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CompanyForm from "./CompanyForm";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";

const { useBreakpoint } = Grid;

const CompanyList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const screens = useBreakpoint();

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
    push(companiesRef, companyData);
    setIsModalOpen(false);
  };

  // Search Filter
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Responsive columns configuration
  const getColumns = () => {
    if (screens.xs) {
      return [
        {
          title: "Company",
          dataIndex: "name",
          key: "name",
          render: (text, record) => (
            <div>
              <div><strong>{text}</strong></div>
              <div>{record.contact}</div>
              <div>{record.phone}</div>
              <div>{record.email}</div>
            </div>
          ),
        },
      ];
    }
    return [
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Contact", dataIndex: "contact", key: "contact" },
      { title: "Country", dataIndex: "country", key: "country" },
      { title: "Phone", dataIndex: "phone", key: "phone" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Website", dataIndex: "website", key: "website", responsive: ['md'] },
    ];
  };

  return (
    <div style={{ 
      padding: screens.xs ? "12px" : "24px", 
      marginLeft: screens.xs ? "0" : "250px", 
      maxWidth: "1100px",
      width: "100%"
    }}>
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        flexDirection: screens.xs ? "column" : "row", 
        justifyContent: "space-between", 
        marginBottom: "16px",
        gap: screens.xs ? "12px" : "8px"
      }}>
        <h2 style={{ margin: screens.xs ? "0 0 8px 0" : "0" }}>Company List</h2>
        <div style={{ display: "flex", gap: "8px", flexDirection: screens.xs ? "column" : "row" }}>
          <Input
            placeholder="Search by Name"
            allowClear
            style={{ width: screens.xs ? "100%" : "200px" }}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            type="primary" 
            onClick={() => setIsModalOpen(true)}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            + Add New Company
          </Button>
        </div>
      </div>

      {/* Ant Design Table */}
      <Table 
        columns={getColumns()} 
        dataSource={filteredCompanies} 
        rowKey="id" 
        locale={{ emptyText: "No companies found" }} 
        style={{ 
          background: "white", 
          borderRadius: "8px", 
          padding: screens.xs ? "8px" : "12px",
          width: "100%"
        }}
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
      />

      {/* Ant Design Modal for Company Form */}
      <Modal 
        title="New Company" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        width={screens.xs ? "90%" : "800px"}
        style={{ top: screens.xs ? "16px" : "50px" }}
      >
        <CompanyForm onSave={addCompany} />
      </Modal>
    </div>
  );
};

export default CompanyList;