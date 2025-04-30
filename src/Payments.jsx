import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, push, onValue } from "firebase/database";
import { db } from './firebase';

const Payments = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    number: '',
    client: '',
    amount: '',
    date: '',
    year: '',
    paymentMode: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const paymentsRef = ref(db, 'payments');
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPayments(paymentsList);
      } else {
        setPayments([]);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({ ...newPayment, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentsRef = ref(db, 'payments');
    push(paymentsRef, newPayment)
      .then(() => {
        console.log("Payment saved to Firebase!");
        setNewPayment({ number: '', client: '', amount: '', date: '', year: '', paymentMode: '' });
        setIsFormOpen(false);
      })
      .catch((error) => {
        console.error("Error saving payment: ", error);
      });
  };

  const filteredPayments = payments.filter(payment =>
    (payment.number && payment.number.includes(searchQuery)) ||
    (payment.client && payment.client.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container-fluid bg-light py-2 px-1 px-md-3">
      <main className="main-content">
        <div className="bg-white p-4 shadow rounded">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 fw-bold">Payments List</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Search by number or client..."
                style={{ maxWidth: "250px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>Refresh</button>
              <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                Add New Payment
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead className="table-light">
                <tr>
                  {["Number", "Client", "Amount", "Date", "Year", "Payment Mode"].map((heading) => (
                    <th key={heading} className="text-center">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="text-center font-monospace text-nowrap" style={{ overflow: 'visible' }}>
                        {payment.number}
                      </td>
                      <td className="text-center text-nowrap">{payment.client}</td>
                      <td className="text-center">{payment.amount}</td>
                      <td className="text-center">{payment.date}</td>
                      <td className="text-center">{payment.year}</td>
                      <td className="text-center">{payment.paymentMode}</td>
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
          <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setIsFormOpen(false)}></button>
          <h2 className="fs-3 fw-bold mb-3 mt-4">Add New Payment</h2>

          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-12">
              <label className="form-label">Number</label>
              <input
                type="text"
                name="number"
                placeholder="Enter complete number (e.g. +923001234567)"
                className="form-control font-monospace"
                value={newPayment.number}
                onChange={handleInputChange}
                required
              />
            </div>

            {[
              { label: "Client", name: "client", type: "text" },
              { label: "Amount", name: "amount", type: "number" },
              { label: "Date", name: "date", type: "date" },
              { label: "Year", name: "year", type: "number" }
            ].map(({ label, name, type }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="form-control"
                  value={newPayment[name]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}

            <div className="col-12">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                name="paymentMode"
                value={newPayment.paymentMode}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
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

export default Payments;