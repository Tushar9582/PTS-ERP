import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from "firebase/database";
import { db } from './firebase'; // Firebase config
import './People.css';

const Peoples = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: '',
    company: '',
    country: '',
    phone: '',
    email: ''
  });

  // Fetch people from Firebase
  useEffect(() => {
    const peopleRef = ref(db, 'people');
    onValue(peopleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const peopleList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPeople(peopleList);
      } else {
        setPeople([]);
      }
    });
  }, []);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson({ ...newPerson, [name]: value });
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const peopleRef = ref(db, 'people');
    push(peopleRef, newPerson)
      .then(() => {
        console.log("Person saved to Firebase!");
        setNewPerson({ name: '', company: '', country: '', phone: '', email: '' });
        setIsFormOpen(false);
      })
      .catch((error) => {
        console.error("Error saving person: ", error);
      });
  };

  return (
    <div className="container-fluid bg-light py-2 px-1 px-md-3">
      <main className="main-content">
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">People List</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ maxWidth: "250px" }}
              />
              <button className="btn btn-outline-secondary">Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Person
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  {["Name", "Company", "Country", "Phone", "Email"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.length > 0 ? (
                  people.map((person) => (
                    <tr key={person.id}>
                      <td className="text-center">{person.name}</td>
                      <td className="text-center">{person.company}</td>
                      <td className="text-center">{person.country}</td>
                      <td className="text-center">{person.phone}</td>
                      <td className="text-center">{person.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center" colSpan="5">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CRM-Style Add New Person Panel */}
      {isFormOpen && (
        <div
          className="position-fixed top-0 end-0 vh-100 bg-white shadow p-4"
          style={{
            width: "350px",
            zIndex: 1050,
            transition: "transform 0.3s ease-in-out",
            transform: isFormOpen ? "translateX(0)" : "translateX(100%)"
          }}
        >
          <button
            className="btn-close position-absolute top-0 end-0 m-3"
            onClick={() => setIsFormOpen(false)}
          ></button>
          <h2 className="fs-3 fw-bold mb-3 mt-4">Add New Person</h2>

          <form className="row g-3" onSubmit={handleSubmit}>
            {[
              { label: "Name", name: "name", type: "text", placeholder: "Enter Name" },
              { label: "Company", name: "company", type: "text", placeholder: "Enter Company" },
              { label: "Country", name: "country", type: "text", placeholder: "Enter Country" },
              { label: "Phone", name: "phone", type: "text", placeholder: "Enter Phone" },
              { label: "Email", name: "email", type: "email", placeholder: "Enter Email" },
            ].map(({ label, name, type, placeholder }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  className="form-control"
                  value={newPerson[name]}
                  onChange={handleInputChange}
                  required={name === "name"}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100 py-2">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Peoples;
