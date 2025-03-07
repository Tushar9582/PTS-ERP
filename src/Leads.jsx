import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

const Leads = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="d-flex vh-100 bg-light" style={{marginLeft:'200px'}}>
      {/* Sidebar */}
     
   
    

      {/* Main Content */}
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Lead List</h2>
            <div className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Search..." style={{ width: "200px" }} />
              <button className="btn btn-outline-secondary">Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Lead
              </button>
            </div>
          </div>

          {/* Lead Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Branch", "Type", "Name", "Status", "Source", "Country", "Phone", "Email"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center" colSpan="8">No data available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-in Form */}
      <div
        className={`position-fixed top-0 end-0 vh-100 bg-white shadow p-4 transition ${
          isFormOpen ? "translate-0" : "translate-100"
        }`}
        style={{
          width: "350px",
          marginRight: "20px",
          transform: isFormOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <button className="btn-close position-absolute top-2 end-2" onClick={() => setIsFormOpen(false)}></button>
        <h2 className="fs-3 fw-bold mb-3">Add New Lead</h2>

        {/* Bootstrap Form */}
        <form className="row g-3">
          <div className="col-12">
            <label className="form-label">Branch</label>
            <select className="form-select">
              <option>Select</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Type *</label>
            <select className="form-select">
              <option>Select</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" placeholder="Enter name" />
          </div>

          <div className="col-12">
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" placeholder="email@example.com" />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Leads;
