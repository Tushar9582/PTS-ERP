import React, { useState } from "react";
import "./NewInvoiceForm.css"; // Import the CSS

export default function NewInvoiceForm() {
  const [invoice, setInvoice] = useState({
    client: "",
    number: "1",
    year: "2025",
    currency: "USD",
    status: "Draft",
    date: "",
    expireDate: "",
    note: "",
    items: [{ name: "", description: "", quantity: 1, price: 0, total: 0 }],
    tax: 0,
  });

  const handleChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const newItems = [...invoice.items];
    newItems[index][e.target.name] = e.target.value;

    if (e.target.name === "quantity" || e.target.name === "price") {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }

    setInvoice({ ...invoice, items: newItems });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { name: "", description: "", quantity: 1, price: 0, total: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const calculateSubTotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = () => {
    console.log("Invoice Data:", invoice);
    alert("Invoice Saved!");
  };

  return (
    <div className="invoice-form">
      <h2>New Invoice</h2>

      <div className="form-section">
        <label>Client *</label>
        <input type="text" name="client" value={invoice.client} onChange={handleChange} placeholder="Search Client" />

        <label>Number *</label>
        <input type="text" name="number" value={invoice.number} readOnly />

        <label>Year *</label>
        <input type="text" name="year" value={invoice.year} readOnly />

        <label>Currency *</label>
        <select name="currency" value={invoice.currency} onChange={handleChange}>
          <option value="USD">US Dollar</option>
          <option value="EUR">Euro</option>
        </select>

        <label>Status</label>
        <select name="status" value={invoice.status} onChange={handleChange}>
          <option value="Draft">Draft</option>
          <option value="Paid">Paid</option>
        </select>

        <label>Date *</label>
        <input type="date" name="date" value={invoice.date} onChange={handleChange} />

        <label>Expire Date *</label>
        <input type="date" name="expireDate" value={invoice.expireDate} onChange={handleChange} />

        <label>Note</label>
        <input type="text" name="note" value={invoice.note} onChange={handleChange} />
      </div>

      <h3>Items</h3>
      {invoice.items.map((item, index) => (
        <div key={index} className="item-row">
          <input type="text" name="name" placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(index, e)} />
          <input type="text" name="description" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, e)} />
          <input type="number" name="quantity" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
          <input type="number" name="price" min="0" value={item.price} onChange={(e) => handleItemChange(index, e)} />
          <input type="text" name="total" value={`$ ${item.total.toFixed(2)}`} readOnly />
          <button onClick={() => removeItem(index)}>🗑</button>
        </div>
      ))}
      
      <button onClick={addItem}>+ Add Field</button>

      <h3>Summary</h3>
      <div className="summary">
        <label>Sub Total:</label> <input type="text" value={`$ ${calculateSubTotal().toFixed(2)}`} readOnly />
        <label>Tax:</label> <input type="number" name="tax" min="0" value={invoice.tax} onChange={handleChange} />
        <label>Total:</label> <input type="text" value={`$ ${(calculateSubTotal() + parseFloat(invoice.tax)).toFixed(2)}`} readOnly />
      </div>

      <div className="buttons">
        <button onClick={() => alert("Canceled")}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
