import React, { useState, useEffect } from "react";
import { ref, push, set, get } from "firebase/database";
import { db } from "./firebase";
import Swal from "sweetalert2";
import "./NewInvoiceForm.css";

const NewInvoiceForm = ({ onSave, onClose, customers = [] }) => {
  const [invoice, setInvoice] = useState({
    number: "",
    clientId: "",
    companyId: "", // New field for company selection
    productId: "", // New field for product selection
    date: "",
    expireDate: "",
    total: "",
    status: "Draft",
    createdBy: "",
  });

  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Fetch Products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await get(ref(db, "products"));
        if (snapshot.exists()) {
          const productData = snapshot.val();
          const productList = Object.keys(productData).map((key) => ({
            id: key,
            name: productData[key].name,
          }));
          setProducts(productList);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch Companies from Firebase
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snapshot = await get(ref(db, "companies"));
        if (snapshot.exists()) {
          const companyData = snapshot.val();
          const companyList = Object.keys(companyData).map((key) => ({
            id: key,
            name: companyData[key].name,
          }));
          setCompanies(companyList);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (
      !invoice.number.trim() ||
      !invoice.clientId.trim() ||
      !invoice.companyId.trim() || // Ensure company is selected
      !invoice.productId.trim() || // Ensure product is selected
      !invoice.date.trim() ||
      !invoice.expireDate.trim() ||
      !invoice.total.trim() ||
      !invoice.createdBy.trim()
    ) {
      Swal.fire("Error!", "All fields are required!", "error");
      return;
    }

    const totalValue = parseFloat(invoice.total);
    if (isNaN(totalValue) || totalValue <= 0) {
      Swal.fire("Error!", "Total must be a valid number!", "error");
      return;
    }

    const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!validDatePattern.test(invoice.date) || !validDatePattern.test(invoice.expireDate)) {
      Swal.fire("Error!", "Invalid date format. Please use YYYY-MM-DD.", "error");
      return;
    }

    // Save invoice to Firebase
    const newInvoiceRef = push(ref(db, "invoices"));
    set(newInvoiceRef, { ...invoice, total: totalValue })
      .then(() => {
        Swal.fire("Success!", "Invoice added successfully!", "success");
        onSave();
        onClose();
      })
      .catch((error) => {
        Swal.fire("Error!", "Failed to add invoice. Try again.", "error");
        console.error("Firebase Error:", error);
      });
  };

  return (
    <div className="invoice-form">
      <h2>New Invoice</h2>
      <div className="form-section">
        <label>Number *</label>
        <input type="text" name="number" value={invoice.number} onChange={handleChange} />

        <label>Client *</label>
        <select name="clientId" value={invoice.clientId} onChange={handleChange}>
          <option value="">Select Client</option>
          {customers.map((customer) => (
            <option key={customer.value} value={customer.value}>
              {customer.label || "Unnamed Client"}
            </option>
          ))}
        </select>

        <label>Company *</label>
        <select name="companyId" value={invoice.companyId} onChange={handleChange}>
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <label>Product *</label>
        <select name="productId" value={invoice.productId} onChange={handleChange}>
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <label>Date *</label>
        <input type="date" name="date" value={invoice.date} onChange={handleChange} />

        <label>Expire Date *</label>
        <input type="date" name="expireDate" value={invoice.expireDate} onChange={handleChange} />

        <label>Total *</label>
        <input type="text" name="total" value={invoice.total} onChange={handleChange} />

        <label>Status *</label>
        <select name="status" value={invoice.status} onChange={handleChange}>
          <option value="Draft">Draft</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <label>Created By *</label>
        <input type="text" name="createdBy" value={invoice.createdBy} onChange={handleChange} />
      </div>

      <button onClick={handleSave}>Save Invoice</button>
    </div>
  );
};

export default NewInvoiceForm;
