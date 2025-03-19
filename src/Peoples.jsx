import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from "firebase/database";
import { db } from './firebase'; // Import Firebase db

const Peoples = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    firstname: '',
    lastname: '',
    company: '',
    country: '',
    phone: '',
    email: ''
  });

  // Fetch people data from Firebase on component mount
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

  // Handle input changes for the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson({ ...newPerson, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const peopleRef = ref(db, 'people');
    push(peopleRef, newPerson)
      .then(() => {
        console.log("Person saved to Firebase!");
        setNewPerson({ firstname: '', lastname: '', company: '', country: '', phone: '', email: '' });
        setIsFormOpen(false);
      })
      .catch((error) => {
        console.error("Error saving person: ", error);
      });
  };

  return (
    <div className="d-flex vh-100 bg-light" style={{ marginLeft: '200px' }}>
      <main className="flex-grow-1 ms-5 p-4" style={{ marginLeft: "270px" }}>
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">People List</h2>
            <div className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Search..." style={{ width: "200px" }} />
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
                  {["Firstname", "Lastname", "Company", "Country", "Phone", "Email"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.length > 0 ? (
                  people.map((person) => (
                    <tr key={person.id}>
                      <td className="text-center">{person.firstname}</td>
                      <td className="text-center">{person.lastname}</td>
                      <td className="text-center">{person.company}</td>
                      <td className="text-center">{person.country}</td>
                      <td className="text-center">{person.phone}</td>
                      <td className="text-center">{person.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center" colSpan="6">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add New Person Form */}
      <div
        className={"position-fixed top-0 end-0 bg-white shadow p-4 " + (isFormOpen ? "translate-0" : "translate-100")}
        style={{
          width: "350px",
          height: "100vh", // Ensure the form takes the full height of the viewport
          overflowY: "auto", // Add scroll if the content exceeds the height
          marginRight: "20px",
          transform: isFormOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <button className="btn-close position-absolute top-2 end-2" onClick={() => setIsFormOpen(false)}></button>
        <h2 className="fs-3 fw-bold mb-3">Add New Person</h2>

        <form className="row g-3" onSubmit={handleSubmit}>
          {/* Firstname */}
          <div className="col-12">
            <label className="form-label">Firstname *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Firstname"
              name="firstname"
              value={newPerson.firstname}
              onChange={handleInputChange}
              required
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            />
          </div>

          {/* Lastname */}
          <div className="col-12">
            <label className="form-label">Lastname *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Lastname"
              name="lastname"
              value={newPerson.lastname}
              onChange={handleInputChange}
              required
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            />
          </div>

          {/* Company */}
          <div className="col-12">
            <label className="form-label">Company</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Company"
              name="company"
              value={newPerson.company}
              onChange={handleInputChange}
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            />
          </div>

          {/* Country */}
          <div className="col-12">
            <label className="form-label">Country</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Country"
              name="country"
              value={newPerson.country}
              onChange={handleInputChange}
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            />
          </div>

          {/* Phone */}
          <div className="col-12">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Phone"
              name="phone"
              value={newPerson.phone}
              onChange={handleInputChange}
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            />
          </div>

          {/* Email */}
          <div className="col-12">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter Email"
              name="email"
              value={newPerson.email}
              onChange={handleInputChange}
              style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            />
          </div>

          {/* Submit Button */}
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100" style={{ padding: '10px', borderRadius: '4px' }}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Peoples;