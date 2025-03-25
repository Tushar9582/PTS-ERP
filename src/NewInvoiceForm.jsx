import React, { useState } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "./firebase";
import Swal from "sweetalert2";
import "./NewInvoiceForm.css";

const NewInvoiceForm = ({ onSave, onClose, customers = [] }) => {
  const [invoice, setInvoice] = useState({
    number: "",
    clientId: "", // Ensure we use clientId, not client
    date: "",
    expireDate: "",
    total: "",
    status: "Draft",
    createdBy: "",
  });

  const handleChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (
      !invoice.number.trim() ||
      !invoice.clientId.trim() || // Fixed: Use clientId instead of client
      !invoice.date.trim() ||
      !invoice.expireDate.trim() ||
      !invoice.total.trim() ||
      !invoice.createdBy.trim()
    ) {
      Swal.fire("Error!", "All fields are required!", "error");
      return;
    }

    // Convert total to a number if necessary
    const totalValue = parseFloat(invoice.total);
    if (isNaN(totalValue) || totalValue <= 0) {
      Swal.fire("Error!", "Total must be a valid number!", "error");
      return;
    }

    // Ensure date format is valid (YYYY-MM-DD)
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
          {customers.length > 0 ? (
            customers.map((customer) => (
              <option key={customer.value} value={customer.value}>
                {customer.label || "Unnamed Client"} {/* Fixed: Correctly mapping name */}
              </option>
            ))
          ) : (
            <option disabled>No clients available</option>
          )}
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
