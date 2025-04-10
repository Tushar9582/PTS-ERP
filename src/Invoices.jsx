import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Dropdown, Menu, Card } from "antd";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NewInvoiceForm from "./NewInvoiceForm";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import "./invoice-list.css"; // Make sure this file exists

const InvoiceList = () => {
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
    { title: "Number", dataIndex: "number", key: "number" },
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Company", dataIndex: "company", key: "company" },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      render: (products) => (
        <Dropdown
          overlay={
            <Menu>
              {products.map((product, index) => (
                <Menu.Item key={index}>{product}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>{products.length > 1 ? "Multiple Products" : products[0]} <DownOutlined /></Button>
        </Dropdown>
      ),
    },
    { title: "Person", dataIndex: "person", key: "person" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Invoice Date", dataIndex: "expireDate", key: "expireDate" },
    { title: "Total", dataIndex: "total", key: "total" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Created By", dataIndex: "createdBy", key: "createdBy" },
  ];

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h2>Invoice List</h2>
        <div className="invoice-controls">
          <Input
            placeholder="Search by Client, Company, Product, or Person"
            allowClear
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
          />
          <Button type="primary" onClick={generatePDF}>
            Export to PDF
          </Button>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            + Add New Invoice
          </Button>
        </div>
      </div>

      <div className="invoice-table-wrapper">
        {/* For mobile, we will render as cards */}
        {filteredInvoices.map((invoice) => (
          <div className="invoice-card" key={invoice.id}>
            <Card title={`Invoice #${invoice.number}`}>
              <p><strong>Client:</strong> {invoice.client}</p>
              <p><strong>Company:</strong> {invoice.company}</p>
              <p><strong>Products:</strong> {invoice.products.join(", ")}</p>
              <p><strong>Person:</strong> {invoice.person}</p>
              <p><strong>Date:</strong> {invoice.date}</p>
              <p><strong>Invoice Date:</strong> {invoice.expireDate}</p>
              <p><strong>Total:</strong> {invoice.total}</p>
              <p><strong>Status:</strong> {invoice.status}</p>
              <p><strong>Created By:</strong> {invoice.createdBy}</p>
            </Card>
          </div>
        ))}

        {/* For larger screens, render the table */}
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          locale={{ emptyText: "No data" }}
          scroll={{ x: true }}
          className="desktop-table"
        />
      </div>

      <Modal
        title="New Invoice"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <NewInvoiceForm
          onSave={() => {}}
          onClose={() => setIsModalOpen(false)}
          customers={customerOptions}
          companies={companyOptions}
          people={peopleOptions}
        />
      </Modal>
    </div>
  );
};

export default InvoiceList;
