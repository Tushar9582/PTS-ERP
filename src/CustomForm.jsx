import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import Swal from "sweetalert2";
import "./custom.css";

const availableFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Address", type: "text" },
  { name: "pincode", label: "Pincode", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "id", label: "ID", type: "text" },
  { name: "leadstatus", label: "Lead Status", type: "dropdown", options: ["On Process", "Complete", "Cancelled"] }
];

const CustomForm = () => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [leads, setLeads] = useState([]);

  // Fetch data from Firebase on component mount
  useEffect(() => {
    const leadsRef = ref(db, "custom_leads");
    onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leadsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        setLeads(leadsArray);
      } else {
        setLeads([]);
      }
    });
  }, []);

  const handleAddField = (field) => {
    if (!selectedFields.some((f) => f.name === field.name)) {
      setSelectedFields((prevFields) => [...prevFields, field]);
      setFormData((prevData) => ({ ...prevData, [field.name]: "" }));
    }
  };

  const handleRemoveField = (fieldName) => {
    setSelectedFields((prevFields) => prevFields.filter((field) => field.name !== fieldName));
    setFormData((prevData) => {
      const newData = { ...prevData };
      delete newData[fieldName];
      return newData;
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await push(ref(db, "custom_leads"), formData);
      Swal.fire({
        title: "Success!",
        text: "Custom Lead added successfully!",
        icon: "success"
      });
      setFormData({}); // Clear form data after submission
    } catch (error) {
      Swal.fire("Error!", "Failed to add custom lead.", "error");
    }
  };

  return (
    <div className="content-container">
      {/* Left Side - Form */}
      <div className="form-container">
        <h2 className="fs-4 fw-bold mb-3">Custom Form</h2>
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

        <div className="form-scroll-container">
          <form onSubmit={handleSubmit} className="form-content">
            <div className="form-group">
              {selectedFields.map((field, index) => (
                <div key={field.name} className="field-container" style={{ order: index }}>
                  <label className="form-label">{field.label}</label>
                  <div className="input-group">
                    {field.type === "dropdown" ? (
                      <select
                        name={field.name}
                        className="form-control"
                        onChange={handleChange}
                        required
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        className="form-control"
                        onChange={handleChange}
                        required
                      />
                    )}
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
            </div>

            {selectedFields.length > 0 && (
              <button type="submit" className="btn btn-success w-100 mt-3">
                Submit
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Right Side - Fetched Data */}
      <div className="data-container">
        <h2 className="fs-4 fw-bold mb-3">Leads Data</h2>
        <div className="leads-list">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <div key={lead.id} className="lead-item">
                {Object.keys(lead).map((key) => (
                  <p key={key}>
                    <strong>{key}:</strong> {lead[key]}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p>No leads found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomForm;