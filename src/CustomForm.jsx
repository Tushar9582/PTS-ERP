import { useState } from "react";
import { db } from "./firebase";
import { ref, push } from "firebase/database";
import Swal from "sweetalert2";
import './custom.css'
const availableFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "vmodel", label: "Vehicle Model", type: "text" },
  { name: "regno", label: "Registration Number", type: "text" },
  { name: "policystart", label: "Policy Start Date", type: "date" },
  { name: "policyend", label: "Policy End Date", type: "date" },
];

const CustomForm = ({ onClose }) => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [formData, setFormData] = useState({});

  const handleAddField = (field) => {
    if (!selectedFields.find((f) => f.name === field.name)) {
      setSelectedFields([...selectedFields, field]);
      setFormData({ ...formData, [field.name]: "" });
    }
  };

  const handleRemoveField = (fieldName) => {
    setSelectedFields(selectedFields.filter((field) => field.name !== fieldName));
    const newFormData = { ...formData };
    delete newFormData[fieldName];
    setFormData(newFormData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await push(ref(db, "custom_leads"), formData);
      Swal.fire("Success!", "Custom Lead added successfully!", "success");
      onClose();
    } catch (error) {
      Swal.fire("Error!", "Failed to add custom lead.", "error");
      console.error("Error adding custom lead:", error);
    }
  };

  return (
    <div className="custom-form-container">
      <h2 className="fs-4 fw-bold mb-3">Custom Form</h2>

      {/* Available Fields */}
      <div className="mb-3">
        <label className="form-label">Add Fields</label>
        <div className="d-flex flex-wrap gap-2">
          {availableFields.map((field) => (
            <button
              key={field.name}
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleAddField(field)}
              type="button"
            >
              {field.label} +
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Form */}
      <div className="form-scroll-container">
        <form onSubmit={handleSubmit} className="form-content">
          {selectedFields.map((field) => (
            <div key={field.name} className="field-container">
              <label className="form-label">{field.label}</label>
              <div className="input-group">
                <input
                  type={field.type}
                  name={field.name}
                  className="form-control"
                  onChange={handleChange}
                  required
                  style={{border:'1px solid black', }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm remove-btn"
                  onClick={() => handleRemoveField(field.name)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          {selectedFields.length > 0 && (
            <button type="submit" className="btn btn-success w-100 mt-3">
              Submit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomForm;
