import { useState, useEffect, useContext } from "react";
import { db } from "./firebase";
import { ref, push, onValue, remove, set } from "firebase/database";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaWhatsapp, FaTrash } from "react-icons/fa";
import { DarkModeContext } from "./DarkModeContext";
import "./Leads.css";

const Leads = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", branch: "", type: "", phone: "" });
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
        const leadsList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setLeads(leadsList);
      } else {
        setLeads([]);
      }
    });
  }, []);

  useEffect(() => {
    setSelectedLeads(selectAll ? leads.map((l) => l.id) : []);
  }, [selectAll, leads]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await push(ref(db, "leads"), formData);
    Swal.fire("Success", "Lead added successfully", "success");
    setFormData({ name: "", email: "", branch: "", type: "", phone: "" });
    setIsFormOpen(false);
  };

  const exportToExcel = () => {
    if (!leads.length) return Swal.fire("No Data", "No leads to export", "info");

    setExcelLoading(true);
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
    XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
    setExcelLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData(jsonData.map((row, i) => ({ ...row, id: `temp-${i}` })));
      setIsPreviewOpen(true);
      setUploadLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmUpload = async () => {
    setUploadLoading(true);
    await Promise.all(previewData.map((lead) => {
      const newRef = push(ref(db, "leads"));
      return set(newRef, lead);
    }));
    Swal.fire("Success", "Excel data uploaded", "success");
    setUploadLoading(false);
    setPreviewData([]);
    setIsPreviewOpen(false);
  };

  const handleDeleteLead = async (id) => {
    const confirm = await Swal.fire({ title: "Delete?", showCancelButton: true, confirmButtonText: "Yes" });
    if (confirm.isConfirmed) {
      await remove(ref(db, `leads/${id}`));
      Swal.fire("Deleted!", "Lead removed", "success");
    }
  };

  const handleBulkDelete = async () => {
    const confirm = await Swal.fire({ title: `Delete ${selectedLeads.length} leads?`, showCancelButton: true });
    if (confirm.isConfirmed) {
      await Promise.all(selectedLeads.map((id) => remove(ref(db, `leads/${id}`))));
      setSelectedLeads([]);
      setSelectAll(false);
      Swal.fire("Deleted!", "Selected leads removed", "success");
    }
  };

  const handleWhatsAppClick = (phone) => {
    const clean = phone.replace(/^\+|^00/, "").replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  return (
    <div className={`responsive-container ${darkMode ? "dark-mode" : ""}`}>
      <main className="flex-grow-1 p-md-4">
        <div className={`p-3 p-md-4 shadow rounded ${darkMode ? "bg-dark text-light" : "bg-white"}`}>
          <div className="d-flex justify-content-between mb-3">
            <h2>Lead List</h2>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>Add New Lead</button>
              <button className="btn btn-danger" onClick={handleBulkDelete} disabled={!selectedLeads.length}>Delete Selected</button>
              <button className="btn btn-success" onClick={exportToExcel}>
                {excelLoading ? "Exporting..." : "Export to Excel"}
              </button>
              <div className="btn btn-primary position-relative">
                {uploadLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Upload Excel
                    <input type="file" accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0" />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className={`table table-bordered ${darkMode ? "table-dark" : "table-light"}`}>
              <thead className={darkMode ? "table-secondary" : "table-light"}>
                <tr>
                  <th><input type="checkbox" checked={selectAll} onChange={() => setSelectAll(!selectAll)} /></th>
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
                    <td><input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleSelect(lead.id)} /></td>
                    <td>{index + 1}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.branch}</td>
                    <td>{lead.type}</td>
                    <td>{lead.phone}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleWhatsAppClick(lead.phone)}><FaWhatsapp /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLead(lead.id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal for adding lead */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? "bg-dark text-light" : ""}`}>
            <button className="btn-close position-absolute top-0 end-0 m-2" onClick={() => setIsFormOpen(false)}></button>
            <h2>Add New Lead</h2>
            <form onSubmit={handleSubmit}>
              {["name", "email", "branch", "type", "phone"].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label">{field}</label>
                  <input
                    className={`form-control ${darkMode ? "bg-dark text-light border-secondary" : ""}`}
                    name={field}
                    type="text"
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <button className="btn btn-primary w-100">Add Lead</button>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? "bg-dark text-light" : ""}`}>
            <button className="btn-close position-absolute top-0 end-0 m-2" onClick={() => setIsPreviewOpen(false)}></button>
            <h2>Preview Excel Data</h2>
            <table className={`table ${darkMode ? "table-dark" : "table-light"}`}>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Branch</th><th>Type</th><th>Phone</th></tr></thead>
              <tbody>
                {previewData.map((lead, index) => (
                  <tr key={index}><td>{index + 1}</td><td>{lead.name}</td><td>{lead.email}</td><td>{lead.branch}</td><td>{lead.type}</td><td>{lead.phone}</td></tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-success w-100 mt-3" onClick={confirmUpload} disabled={uploadLoading}>
              {uploadLoading ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
