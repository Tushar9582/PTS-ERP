import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Input, Dropdown, Menu, Card } from "antd";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NewInvoiceForm from "./NewInvoiceForm";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { DarkModeContext } from "./DarkModeContext";
import "./invoice-list.css";

const InvoiceList = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState({});
  const [customerOptions, setCustomerOptions] = useState([]);
  const [products, setProducts] = useState({});
  const [companies, setCompanies] = useState({});
  const [companyOptions, setCompanyOptions] = useState([]);
  const [people, setPeople] = useState({});
  const [peopleOptions, setPeopleOptions] = useState([]);

  useEffect(() => {
    const fetchData = (path, setState, setOptions, labelField = "name") => {
      const dataRef = ref(db, path);
      onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setState(data);
          setOptions(
            Object.keys(data).map((id) => ({
              value: id,
              label: data[id][labelField] || `Unknown ${path}`,
            }))
          );
        } else {
          setState({});
          setOptions([]);
        }
      });
    };

    fetchData("customers", setCustomers, setCustomerOptions);
    fetchData("products", setProducts, () => {});
    fetchData("companies", setCompanies, setCompanyOptions);
    fetchData("people", setPeople, setPeopleOptions);
  }, []);

  useEffect(() => {
    const invoicesRef = ref(db, "invoices");
    onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const invoiceList = Object.keys(data).map((key) => ({
          id: key,
          client: customers[data[key].clientId]?.name || "Unknown Client",
          company: companies[data[key].companyId]?.name || "Unknown Company",
          products: data[key].productIds?.map((id) => products[id]?.name || "Unknown Product") || ["Unknown Product"],
          person: people[data[key].personId]?.name || "Unknown Person",
          ...data[key],
        }));
        setInvoices(invoiceList);
        setFilteredInvoices(invoiceList);
      } else {
        setInvoices([]);
        setFilteredInvoices([]);
      }
    });
  }, [customers, products, companies, people]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    setFilteredInvoices(
      value
        ? invoices.filter(
            (invoice) =>
              invoice.client.toLowerCase().includes(value) ||
              invoice.products.some((product) => product.toLowerCase().includes(value)) ||
              invoice.company.toLowerCase().includes(value) ||
              invoice.person.toLowerCase().includes(value)
          )
        : invoices
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Invoice List", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Number", "Client", "Company", "Products", "Person", "Date", "Invoice Date", "Total", "Status", "Created By"]],
      body: filteredInvoices.map((invoice) => [
        invoice.number,
        invoice.client,
        invoice.company,
        invoice.products.join(", "),
        invoice.person,
        invoice.date,
        invoice.expireDate,
        invoice.total,
        invoice.status,
        invoice.createdBy,
      ]),
    });
    doc.save("invoices.pdf");
  };

  const columns = [
    { 
      title: "Number", 
      dataIndex: "number", 
      key: "number",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Client", 
      dataIndex: "client", 
      key: "client",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Company", 
      dataIndex: "company", 
      key: "company",
      className: darkMode ? "dark-table-text" : ""
    },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      render: (products) => (
        <Dropdown
          overlay={
            <Menu className={darkMode ? "dark-dropdown-menu" : ""}>
              {products.map((product, index) => (
                <Menu.Item 
                  key={index}
                  className={darkMode ? "dark-menu-item" : ""}
                >
                  {product}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button className={darkMode ? "dark-dropdown-btn" : ""}>
            {products.length > 1 ? "Multiple Products" : products[0]} 
            <DownOutlined className={darkMode ? "dark-dropdown-icon" : ""} />
          </Button>
        </Dropdown>
      ),
    },
    { 
      title: "Person", 
      dataIndex: "person", 
      key: "person",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Date", 
      dataIndex: "date", 
      key: "date",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Invoice Date", 
      dataIndex: "expireDate", 
      key: "expireDate",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Total", 
      dataIndex: "total", 
      key: "total",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      className: darkMode ? "dark-table-text" : ""
    },
    { 
      title: "Created By", 
      dataIndex: "createdBy", 
      key: "createdBy",
      className: darkMode ? "dark-table-text" : ""
    },
  ];

  return (
    <div className={`invoice-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="invoice-header">
        <h2 className={darkMode ? "dark-text" : ""}>Invoice List</h2>
        <div className="invoice-controls">
          <Input
            placeholder="Search by Client, Company, Product, or Person"
            allowClear
            prefix={<SearchOutlined className={darkMode ? "dark-search-icon" : ""} />}
            value={searchText}
            onChange={handleSearch}
            className={darkMode ? "dark-search-input" : ""}
          />
          <Button 
            type="primary" 
            onClick={generatePDF}
            className={darkMode ? "dark-export-btn" : ""}
          >
            Export to PDF
          </Button>
          <Button 
            type="primary" 
            onClick={() => setIsModalOpen(true)}
            className={darkMode ? "dark-add-btn" : ""}
          >
            + Add New Invoice
          </Button>
        </div>
      </div>

      <div className="invoice-table-wrapper">
        {/* Mobile cards */}
        {filteredInvoices.map((invoice) => (
          <div className={`invoice-card ${darkMode ? 'dark-card' : ''}`} key={invoice.id}>
            <Card 
              title={`Invoice #${invoice.number}`}
              className={darkMode ? "dark-card-inner" : ""}
            >
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Client:</strong> {invoice.client}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Company:</strong> {invoice.company}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Products:</strong> {invoice.products.join(", ")}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Person:</strong> {invoice.person}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Date:</strong> {invoice.date}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Invoice Date:</strong> {invoice.expireDate}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Total:</strong> {invoice.total}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Status:</strong> {invoice.status}
              </p>
              <p className={darkMode ? "dark-card-text" : ""}>
                <strong className={darkMode ? "dark-card-label" : ""}>Created By:</strong> {invoice.createdBy}
              </p>
            </Card>
          </div>
        ))}

        {/* Desktop table */}
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          locale={{ emptyText: "No data" }}
          scroll={{ x: true }}
          className={`desktop-table ${darkMode ? 'dark-table' : ''}`}
        />
      </div>

      <Modal
        title="New Invoice"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        className={darkMode ? "dark-modal" : ""}
      >
        <NewInvoiceForm
          onSave={() => {}}
          onClose={() => setIsModalOpen(false)}
          customers={customerOptions}
          companies={companyOptions}
          people={peopleOptions}
          darkMode={darkMode}
        />
      </Modal>
    </div>
  );
};

export default InvoiceList;