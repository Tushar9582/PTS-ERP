import "bootstrap/dist/css/bootstrap.min.css";
import { onValue, push, ref, remove } from "firebase/database";
import { useContext, useEffect, useState } from "react";
import { FaTrash, FaWhatsapp } from "react-icons/fa";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { DarkModeContext } from "./DarkModeContext";
import { db } from "./firebase";
import "./Leads.css";

const Leads = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    branch: "", 
    type: "", 
    phone: "" 
  });
  const [excelLoading, setExcelLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Fetch leads from Firebase under user's path
  useEffect(() => {
    if (!userId) return;

    const userLeadsRef = ref(db, `users/${userId}/leads`);
    const unsubscribe = onValue(userLeadsRef, (snapshot) => {
      const data = snapshot.val();
      const leadsList = data ? Object.keys(data).map(key => ({ 
        id: key, 
        ...data[key] 
      })) : [];
      setLeads(leadsList);
    });
    return () => unsubscribe();
  }, [userId]);

  // Handle select all toggle
  useEffect(() => {
    setSelectedLeads(selectAll ? leads.map(lead => lead.id) : []);
  }, [selectAll, leads]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      Swal.fire("Error", "User not authenticated. Please log in again.", "error");
      return;
    }

    try {
      await push(ref(db, `users/${userId}/leads`), formData);
      Swal.fire("Success", "Lead added successfully", "success");
      setFormData({ name: "", email: "", branch: "", type: "", phone: "" });
      setIsFormOpen(false);
    } catch (error) {
      Swal.fire("Error", "Failed to add lead", "error");
    }
  };

  const exportToExcel = () => {
    if (!leads.length) {
      Swal.fire("Info", "No leads to export", "info");
      return;
    }

    setExcelLoading(true);
    try {
      const data = leads.map((lead, index) => ({
        "No.": index + 1,
        Name: lead.name,
        Email: lead.email,
        Branch: lead.branch,
        Type: lead.type,
        Phone: lead.phone,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, `leads_${new Date().toISOString()}.xlsx`);
    } catch (error) {
      Swal.fire("Error", "Failed to export data", "error");
    } finally {
      setExcelLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData.length) {
      Swal.fire("Error", "Excel file is empty", "error");
      return;
    }

    const mappedData = jsonData.map((row, i) => ({
      id: `temp-${i}`,
      name: row.Name || row.name || "",
      email: row.Email || row.email || "",
      branch: row.Branch || row.branch || "",
      type: row.Type || row.type || "",
      phone: String(row.Phone || row.phone || "")
    }));

    setPreviewData(mappedData);
    setIsPreviewOpen(true);
  } catch (error) {
    Swal.fire("Error", "Invalid Excel file format", "error");
  } finally {
    setUploadLoading(false);
  }
};

reader.onerror = () => {
  Swal.fire("Error", "Failed to read file", "error");
  setUploadLoading(false);
};

reader.readAsArrayBuffer(file);
  };

  const confirmUpload = async () => {
    if (!previewData.length || !userId) return;

    setUploadLoading(true);
    try {
      const validLeads = previewData.filter(lead => 
        lead.name && lead.email && lead.branch && lead.type && lead.phone
      );

      if (!validLeads.length) {
        Swal.fire("Error", "No valid leads to upload", "error");
        return;
      }

      await Promise.all(
        validLeads.map(lead => {
          const { name, email, branch, type, phone } = lead;
          return push(ref(db, `users/${userId}/leads`), { name, email, branch, type, phone });
        })
      );

      Swal.fire("Success", `${validLeads.length} leads uploaded`, "success");
      setIsPreviewOpen(false);
      setPreviewData([]);
    } catch (error) {
      Swal.fire("Error", "Upload failed", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!userId) return;

    const result = await Swal.fire({
      title: "Confirm Delete",
      text: "Are you sure you want to delete this lead?",
      icon: "warning",
      showCancelButton: true
    });

    if (result.isConfirmed) {
      try {
        await remove(ref(db, `users/${userId}/leads/${id}`));
        Swal.fire("Deleted", "Lead removed successfully", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete lead", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedLeads.length || !userId) return;

    const result = await Swal.fire({
      title: `Delete ${selectedLeads.length} leads?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedLeads.map(id => remove(ref(db, `users/${userId}/leads/${id}`)))
        );
        setSelectedLeads([]);
        setSelectAll(false);
        Swal.fire("Deleted", "Selected leads removed", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete leads", "error");
      }
    }
  };

  const handleDeleteAllLeads = async () => {
    if (!leads.length || !userId) {
      Swal.fire("Info", "No leads to delete", "info");
      return;
    }

    const result = await Swal.fire({
      title: `Delete all ${leads.length} leads?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true
    });

    if (result.isConfirmed) {
      try {
        await remove(ref(db, `users/${userId}/leads`));
        Swal.fire("Deleted", "All leads removed successfully", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete leads", "error");
      }
    }
  };

  const handleWhatsAppClick = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    }
  };

  const toggleSelect = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) 
        ? prev.filter(leadId => leadId !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className={`responsive-container ${darkMode ? "dark-mode" : ""}`}>
      <div className={`card ${darkMode ? "bg-dark" : "bg-white"}`}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Leads Management</h2>
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className="btn btn-primary"
              onClick={() => setIsFormOpen(true)}
              style={{backgroundColor: '#007bff', borderColor: '#007bff'}}
            >
              Add Lead
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDeleteAllLeads}
              disabled={!leads.length}
              style={{backgroundColor: '#dc3545', borderColor: '#dc3545'}}
            >
              Delete All
            </button>
            <button
              className="btn btn-success"
              onClick={exportToExcel}
              disabled={excelLoading}
              style={{backgroundColor: '#007bff', borderColor: '#007bff'}}
            >
              {excelLoading ? "Exporting..." : "Export Excel"}
            </button>
            <label className="btn btn-success mb-0 position-relative" style={{backgroundColor: '#28a745', borderColor: '#28a745'}}>
              {uploadLoading ? "Processing..." : "Import Excel"}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                disabled={uploadLoading}
              />
            </label>
          </div>
        </div>

        <div className="card-body table-container">
          <table className={`table table-hover ${darkMode ? "table-dark" : ""}`}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll && leads.length > 0}
                    onChange={() => setSelectAll(!selectAll)}
                  />
                </th>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead, index) => (
                  <tr key={lead.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.branch}</td>
                    <td>{lead.type}</td>
                    <td>{lead.phone}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => handleWhatsAppClick(lead.phone)}
                        disabled={!lead.phone}
                        style={{backgroundColor: '#28a745', borderColor: '#28a745'}}
                      >
                        <FaWhatsapp />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteLead(lead.id)}
                        style={{backgroundColor: '#dc3545', borderColor: '#dc3545'}}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? "bg-dark" : ""}`}>
            <div className="modal-header1 d-flex justify-content-between align-items-center">
              <h5 className="modal-title">Add New Lead</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close"
                style={{color: '#000', backgroundColor: 'transparent', border: 'none', fontSize: '1.5rem', marginLeft: 'auto'}}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {['name', 'email', 'branch', 'type', 'phone'].map(field => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      className={`form-control ${darkMode ? "bg-dark text-light" : ""}`}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary w-100" style={{backgroundColor: '#007bff', borderColor: '#007bff'}}>
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Excel Preview Modal */}
      {isPreviewOpen && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? "bg-dark" : ""}`}>
            <div className="modal-header">
              <h5 className="modal-title">
                Preview Data ({previewData.length} records)
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Close"
              />
            </div>
            <div className="modal-body table-container">
              <table className={`table ${darkMode ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>Type</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((lead, index) => (
                    <tr key={lead.id}>
                      <td>{index + 1}</td>
                      <td className={!lead.name ? "text-danger" : ""}>
                        {lead.name || "Missing"}
                      </td>
                      <td className={!lead.email ? "text-danger" : ""}>
                        {lead.email || "Missing"}
                      </td>
                      <td className={!lead.branch ? "text-danger" : ""}>
                        {lead.branch || "Missing"}
                      </td>
                      <td className={!lead.type ? "text-danger" : ""}>
                        {lead.type || "Missing"}
                      </td>
                      <td className={!lead.phone ? "text-danger" : ""}>
                        {lead.phone || "Missing"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsPreviewOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={confirmUpload}
                disabled={uploadLoading}
                style={{backgroundColor: '#28a745', borderColor: '#28a745'}}
              >
                {uploadLoading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;