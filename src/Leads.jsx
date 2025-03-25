import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import Swal from "sweetalert2";
import "./Leads.css";


const Leads = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    branch: "",
    type: "",
    name: "",
    email: "",
  });

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
    } catch (error) {
      Swal.fire("Error!", "Failed to add lead.", "error");
      console.error("Error adding lead:", error);
    }
  };

  return (
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: "200px" }}>
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Lead List</h2>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control2"
                placeholder="Search..."
                 style={{ width:'200px'}}
              />
              <button className="btn btn-outline-secondary">Refresh</button>
              <button
                className="btn btn-primary"
                onClick={() => setIsFormOpen(true)}
              >
                Add New Lead
              </button>
              <button
                className="btn btn-success"
                onClick={() => setIsCustomFormOpen(true)}
              >
                Custom Form
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Branch", "Type", "Name", "Email"].map((heading) => (
                    <th key={heading} className="text-center">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="text-center">{lead.branch}</td>
                      <td className="text-center">{lead.type}</td>
                      <td className="text-center">{lead.name}</td>
                      <td className="text-center">{lead.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center" colSpan="4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add New Lead Form */}
      {isFormOpen && (
        <div
          className="position-fixed top-0 end-0 vh-100 bg-white shadow p-4"
          style={{
            width: "350px",
            marginRight: "20px",
            transform: "translateX(0)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <button
            className="btn-close position-absolute top-2 end-2"
            onClick={() => setIsFormOpen(false)}
          ></button>
          <h2 className="fs-3 fw-bold mb-3">Add New Lead</h2>

          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-12">
              <label className="form-label">Branch</label>
              <input
                type="text"
                name="branch"
                className="form-control"
                onChange={handleChange}
                required
                style={{border:'1px solid black'}}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Type</label>
              <input
                type="text"
                name="type"
                className="form-control"
                onChange={handleChange}
                required
                style={{border:'1px solid black'}}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                onChange={handleChange}
                required
                style={{border:'1px solid black'}}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                onChange={handleChange}
                required
                style={{border:'1px solid black'}}
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

     
     
    </div>
  );
};

export default Leads;
