import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import Swal from "sweetalert2";

const Customers = ({ onSelectCustomer }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });

  useEffect(() => {
    const customersRef = ref(db, "customers");
    onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customersList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCustomers(customersList);
      } else {
        setCustomers([]);
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent empty name submission
    if (!formData.name.trim()) {
      Swal.fire("Error!", "Customer name is required!", "error");
      return;
    }

    try {
      await push(ref(db, "customers"), formData);
      Swal.fire("Success!", "Customer added successfully!", "success");
      setFormData({ name: "", email: "", phone: "", address: "", company: "" });
      setIsFormOpen(false);
    } catch (error) {
      Swal.fire("Error!", "Failed to add customer.", "error");
      console.error("Error adding customer:", error);
    }
  };

  return (
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: "200px" }}>
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Clients List</h2>
            <button
              className="btn btn-primary"
              onClick={() => setIsFormOpen(true)}
            >
              Add Clients
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Name", "Email", "Phone", "Address", "Company"].map(
                    (heading) => (
                      <th key={heading} className="text-center">
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="text-center">{customer.name || "No Name"}</td>
                      <td className="text-center">{customer.email || "N/A"}</td>
                      <td className="text-center">{customer.phone || "N/A"}</td>
                      <td className="text-center">{customer.address || "N/A"}</td>
                      <td className="text-center">{customer.company || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center" colSpan="5">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div
          className="position-fixed top-0 end-0 vh-100 bg-white shadow p-4"
          style={{ width: "350px", marginRight: "20px" }}
        >
          <button
            className="btn-close position-absolute top-2 end-2"
            onClick={() => setIsFormOpen(false)}
          ></button>
          <h2 className="fs-3 fw-bold mb-3">Add New Clients</h2>

          <form className="row g-3" onSubmit={handleSubmit}>
            {[
              { label: "Name", name: "name" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone", name: "phone" },
              { label: "Address", name: "address" },
              { label: "Company", name: "company" },
            ].map(({ label, name, type = "text" }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  className="form-control"
                  value={formData[name]} // Controlled input
                  onChange={handleChange}
                  required
                  style={{ border: "1px solid black" }}
                />
              </div>
            ))}
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

export default Customers;
