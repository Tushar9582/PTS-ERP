import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import Swal from "sweetalert2";
import "./custom.css";

const availableFields = [
  { name: "name", label: "Name", type: "text", icon: "user" },
  { name: "phone", label: "Phone", type: "tel", icon: "phone" },
  { name: "email", label: "Email", type: "email", icon: "envelope" },
  { name: "address", label: "Address", type: "text", icon: "map-marker" },
  { name: "pincode", label: "Pincode", type: "text", icon: "map-pin" },
  { name: "city", label: "City", type: "text", icon: "building" },
  { name: "id", label: "ID", type: "text", icon: "id-card" },
  { name: "leadstatus", label: "Lead Status", type: "dropdown", 
    options: ["On Process", "Complete", "Cancelled"], icon: "chart-line" }
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
      {/* Left Side - Enhanced Form */}
      <div className="form-container">
        <h2 className="form-title">
          <i className="fas fa-pencil-alt me-2"></i>
          Custom Lead Form
        </h2>
        
        <div className="mb-4">
          <label className="form-section-label">
            <i className="fas fa-plus-circle me-2"></i>
            Add Fields
          </label>
          <div className="d-flex flex-wrap gap-2">
            {availableFields.map((field) => (
              <button
                key={field.name}
                className="btn btn-add-field"
                onClick={() => handleAddField(field)}
                type="button"
              >
                <i className={`fas fa-${field.icon} me-2`}></i>
                {field.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-scroll-container">
          <form onSubmit={handleSubmit} className="form-content">
            <div className="form-group">
              {selectedFields.map((field, index) => (
                <div key={field.name} className="field-container">
                  <label className="input-label">
                    <i className={`fas fa-${field.icon} me-2`}></i>
                    {field.label}
                  </label>
                  <div className="input-group">
                    {field.type === "dropdown" ? (
                      <select
                        name={field.name}
                        className="form-input"
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
                        className="form-input"
                        onChange={handleChange}
                        required
                      />
                    )}
                    <button
                      type="button"
                      className="btn-remove-field"
                      onClick={() => handleRemoveField(field.name)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedFields.length > 0 && (
              <button type="submit" className="btn-submit">
                <i className="fas fa-paper-plane me-2"></i>
                Submit Lead
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