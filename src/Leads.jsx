import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import "./Leads.css";

const Leads = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    branch: "",
    type: "",
    name: "",
    email: "",
  });
  const [excelLoading, setExcelLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await push(ref(db, "leads"), formData);
      Swal.fire("Success!", "Lead added successfully!", "success");
      setIsFormOpen(false);
      setFormData({ branch: "", type: "", name: "", email: "" });
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

      const headers = ["No.", "Name", "Email", "Branch", "Type"];
      const data = leads.map((lead, index) => ({
        "No.": index + 1,
        "Name": lead.name || 'N/A',
        "Email": lead.email || 'N/A',
        "Branch": lead.branch || 'N/A',
        "Type": lead.type || 'N/A'
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

        // Validate and format the data
        const formattedData = jsonData.map((item, index) => ({
          id: index,
          name: item["Name"] || item["name"] || "",
          email: item["Email"] || item["email"] || "",
          branch: item["Branch"] || item["branch"] || "",
          type: item["Type"] || item["type"] || ""
        }));

        setPreviewData(formattedData);
        setIsPreviewOpen(true);
      } catch (error) {
        console.error("Upload Error:", error);
        Swal.fire("Error!", "Failed to read Excel file", "error");
      } finally {
        setUploadLoading(false);
        e.target.value = ""; // Reset file input
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmUpload = async () => {
    try {
      setUploadLoading(true);
      setIsPreviewOpen(false);
      
      // Upload to Firebase
      const uploadPromises = previewData.map(lead => 
        push(ref(db, "leads"), lead)
      );

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

  return (
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: "200px" }}>
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Lead List</h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setIsFormOpen(true)}
              >
                Add New Lead
              </button>
              
              <button
                className="btn btn-success"
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
              
              <div className="btn btn-primary position-relative">
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
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={lead.id}>
                    <td>{index + 1}</td>
                    <td>{lead.name || '-'}</td>
                    <td>{lead.email || '-'}</td>
                    <td>{lead.branch || '-'}</td>
                    <td>{lead.type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Lead Form */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="btn-close"
              onClick={() => setIsFormOpen(false)}
            ></button>
            <h2>Add New Lead</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Name</label>
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
                <label>Email</label>
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
                <label>Branch</label>
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
                <label>Type</label>
                <input
                  type="text"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Excel Preview Modal */}
      {isPreviewOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <button
              className="btn-close"
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewData([]);
              }}
            ></button>
            <h2>Preview Excel Data</h2>
            <p className="text-muted mb-3">Please review the data before uploading</p>
            
            <div className="table-responsive mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table table-bordered">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.name || '-'}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.branch || '-'}</td>
                      <td>{item.type || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsPreviewOpen(false);
                  setPreviewData([]);
                }}
                disabled={uploadLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmUpload}
                disabled={uploadLoading}
              >
                {uploadLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  "Confirm Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;