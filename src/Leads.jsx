import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "./firebase";
import { ref, push, onValue, remove, set } from "firebase/database";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import "./Leads.css";
import { FaWhatsapp, FaTrash } from "react-icons/fa";

const Leads = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    branch: "",
    type: "",
    name: "",
    email: "",
    phone: ""
  });
  const [excelLoading, setExcelLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const leadsRef = ref(db, "leads");
    onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leadsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLeads(leadsList);
      } else {
        setLeads([]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectAll) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  }, [selectAll, leads]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await push(ref(db, "leads"), formData);
      Swal.fire("Success!", "Lead added successfully!", "success");
      setIsFormOpen(false);
      setFormData({ branch: "", type: "", name: "", email: "", phone: "" });
    } catch (error) {
      Swal.fire("Error!", "Failed to add lead.", "error");
      console.error("Error adding lead:", error);
    }
  };

  const exportToExcel = () => {
    setExcelLoading(true);
    try {
      if (leads.length === 0) {
        Swal.fire("Info", "No leads to export", "info");
        return;
      }

      const headers = ["No.", "Name", "Email", "Branch", "Type", "Phone"];
      const data = leads.map((lead, index) => ({
        "No.": index + 1,
        "Name": lead.name || 'N/A',
        "Email": lead.email || 'N/A',
        "Branch": lead.branch || 'N/A',
        "Type": lead.type || 'N/A',
        "Phone": lead.phone || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
      XLSX.writeFile(workbook, `leads_export_${new Date().getTime()}.xlsx`);

      Swal.fire("Success!", "Excel file downloaded successfully", "success");
    } catch (error) {
      console.error("Excel Export Error:", error);
      Swal.fire("Error!", "Failed to generate Excel file", "error");
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

        const formattedData = jsonData.map((item, index) => ({
          id: `temp-${index}`, // Temporary ID for preview
          name: item["Name"] || item["name"] || "",
          email: item["Email"] || item["email"] || "",
          branch: item["Branch"] || item["branch"] || "",
          type: item["Type"] || item["type"] || "",
          phone: item["Phone"] || item["phone"] || ""
        }));

        setPreviewData(formattedData);
        setIsPreviewOpen(true);
      } catch (error) {
        console.error("Upload Error:", error);
        Swal.fire("Error!", "Failed to read Excel file", "error");
      } finally {
        setUploadLoading(false);
        e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmUpload = async () => {
    try {
      setUploadLoading(true);
      setIsPreviewOpen(false);
      
      // Create a new array with proper Firebase push IDs
      const uploadPromises = previewData.map(async (lead) => {
        const newLeadRef = push(ref(db, "leads"));
        await set(newLeadRef, {
          name: lead.name,
          email: lead.email,
          branch: lead.branch,
          type: lead.type,
          phone: lead.phone
        });
        return newLeadRef.key; // Return the generated ID
      });

      await Promise.all(uploadPromises);
      Swal.fire("Success!", "Excel data uploaded successfully", "success");
    } catch (error) {
      console.error("Upload Error:", error);
      Swal.fire("Error!", "Failed to upload data", "error");
    } finally {
      setUploadLoading(false);
      setPreviewData([]);
    }
  };

  const handleWhatsAppClick = (phoneNumber) => {
    if (!phoneNumber) {
      Swal.fire("Info", "No phone number available for this lead", "info");
      return;
    }
    const cleanNumber = phoneNumber.replace(/^\+|^00/, "").replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteLead = async (leadId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const leadRef = ref(db, `leads/${leadId}`);
        await remove(leadRef);
        Swal.fire('Deleted!', 'Lead has been deleted.', 'success');
      } catch (error) {
        console.error("Delete error:", {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        Swal.fire('Error!', 'Failed to delete lead. Check console for details.', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      Swal.fire('Info', 'Please select leads to delete', 'info');
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedLeads.length} leads?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!'
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedLeads.map(leadId => {
          const leadRef = ref(db, `leads/${leadId}`);
          return remove(leadRef);
        });

        await Promise.all(deletePromises);
        Swal.fire('Deleted!', 'Selected leads have been deleted.', 'success');
        setSelectedLeads([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire('Error!', 'Failed to delete selected leads.', 'error');
      }
    }
  };

  const toggleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  return (
    <div className="responsive-container bg-light">
      <main className="flex-grow-1 p-md-4">
        <div className="bg-white p-3 p-md-4 shadow rounded">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
            <h2 className="fs-3 fw-bold mb-0">Lead List</h2>
            <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
              <button
                className="btn btn-primary flex-grow-1 flex-md-grow-0"
                onClick={() => setIsFormOpen(true)}
              >
                Add New Lead
              </button>
              
              <button
                className="btn btn-danger flex-grow-1 flex-md-grow-0"
                onClick={handleBulkDelete}
                disabled={selectedLeads.length === 0}
              >
                Delete Selected
              </button>
              
              <button
                className="btn btn-success flex-grow-1 flex-md-grow-0"
                onClick={exportToExcel}
                disabled={leads.length === 0 || excelLoading}
              >
                {excelLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Exporting...
                  </>
                ) : (
                  "Export to Excel"
                )}
              </button>
              
              <div className="btn btn-primary position-relative flex-grow-1 flex-md-grow-0">
                {uploadLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    Upload Excel
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                      disabled={uploadLoading}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectAll}
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
                {leads.map((lead, index) => (
                  <tr key={lead.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>{lead.name || '-'}</td>
                    <td>{lead.email || '-'}</td>
                    <td>{lead.branch || '-'}</td>
                    <td>{lead.type || '-'}</td>
                    <td>{lead.phone || '-'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleWhatsAppClick(lead.phone)}
                          title="WhatsApp"
                        >
                          <FaWhatsapp />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="btn-close position-absolute top-0 end-0 m-2"
              onClick={() => setIsFormOpen(false)}
            ></button>
            <h2>Add New Lead</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  name="branch"
                  className="form-control"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <input
                  type="text"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Add Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="btn-close position-absolute top-0 end-0 m-2"
              onClick={() => setIsPreviewOpen(false)}
            ></button>
            <h2 className="mb-3">Preview Excel Data</h2>
            <div className="table-container">
              <table className="table table-bordered">
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
                      <td>{lead.name || 'N/A'}</td>
                      <td>{lead.email || 'N/A'}</td>
                      <td>{lead.branch || 'N/A'}</td>
                      <td>{lead.type || 'N/A'}</td>
                      <td>{lead.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="btn btn-success w-100 mt-3"
              onClick={confirmUpload}
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                'Confirm Upload'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;