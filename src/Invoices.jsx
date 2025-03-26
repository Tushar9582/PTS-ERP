import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import NewInvoiceForm from "./NewInvoiceForm";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase"; // Ensure the correct import path

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState({});
  const [customerOptions, setCustomerOptions] = useState([]);
  const [products, setProducts] = useState({});
  const [productOptions, setProductOptions] = useState([]);
  const [companies, setCompanies] = useState({});
  const [companyOptions, setCompanyOptions] = useState([]);

  // Fetch customers from Firebase
  useEffect(() => {
    const customersRef = ref(db, "customers");
    onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCustomers(data);
        const options = Object.keys(data).map((id) => ({
          value: id,
          label: data[id].name || "Unknown Customer",
        }));
        setCustomerOptions(options);
      } else {
        setCustomers({});
        setCustomerOptions([]);
      }
    });
  }, []);

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(data);
        const options = Object.keys(data).map((id) => ({
          value: id,
          label: data[id].name || "Unknown Product",
        }));
        setProductOptions(options);
      } else {
        setProducts({});
        setProductOptions([]);
      }
    });
  }, []);

  // Fetch companies from Firebase
  useEffect(() => {
    const companiesRef = ref(db, "companies");
    onValue(companiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCompanies(data);
        const options = Object.keys(data).map((id) => ({
          value: id,
          label: data[id].name || "Unknown Company",
        }));
        setCompanyOptions(options);
      } else {
        setCompanies({});
        setCompanyOptions([]);
      }
    });
  }, []);

  // Fetch invoices from Firebase
  useEffect(() => {
    const invoicesRef = ref(db, "invoices");
    onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const invoiceList = Object.keys(data).map((key) => ({
          id: key,
          clientId: data[key].clientId || "Unknown",
          client: customers[data[key].clientId]?.name || "Unknown Client",
          companyId: data[key].companyId || "Unknown",
          company: companies[data[key].companyId]?.name || "Unknown Company",
          productId: data[key].productId || "Unknown",
          product: products[data[key].productId]?.name || "Unknown Product",
          ...data[key],
        }));
        setInvoices(invoiceList);
        setFilteredInvoices(invoiceList);
      } else {
        setInvoices([]);
        setFilteredInvoices([]);
      }
    });
  }, [customers, products, companies]);

  // Handle search functionality
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    if (value === "") {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.client.toLowerCase().includes(value) ||
          invoice.product.toLowerCase().includes(value) ||
          invoice.company.toLowerCase().includes(value)
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
    { title: "Company", dataIndex: "company", key: "company" },
    { title: "Product", dataIndex: "product", key: "product" },
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
            placeholder="Search by Client, Company, or Product"
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
          />
          <Button type="primary" onClick={onAddNewInvoice}>
            + Add New Invoice
          </Button>
        </div>
      </div>

      <Table columns={columns} dataSource={filteredInvoices} rowKey="id" locale={{ emptyText: "No data" }} />

      <Modal title="New Invoice" open={isModalOpen} onCancel={handleClose} footer={null} width={800}>
        <NewInvoiceForm
          onSave={() => {}}
          onClose={handleClose}
          customers={customerOptions}
          products={productOptions}
          companies={companyOptions}
        />
      </Modal>
    </div>
  );
};

export default InvoiceList;
