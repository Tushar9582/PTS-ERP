import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import './Reports.css'
const data = [
  { name: "Jan", payment: 0, expense: 0 },
  { name: "Feb", payment: 0, expense: 0 },
  { name: "Mar", payment: 110000000, expense: 0 },
  { name: "Apr", payment: 0, expense: 0 },
  { name: "May", payment: 0, expense: 0 },
  { name: "Jun", payment: 0, expense: 0 },
  { name: "Jul", payment: 0, expense: 0 },
  { name: "Aug", payment: 0, expense: 0 },
  { name: "Sep", payment: 0, expense: 0 },
  { name: "Oct", payment: 0, expense: 0 },
  { name: "Nov", payment: 0, expense: 0 },
  { name: "Dec", payment: 0, expense: 0 },
];

const Reports = () => {
  return (
    <div className="main-container">
      <div className="report-container">
        {/* Invoice Summary Cards */}
        <div className="row mb-4">
          {[
            { title: "Paid Invoice", amount: "$00.00", color: "success" },
            { title: "Unpaid Invoice", amount: "$00.00", color: "danger" },
            { title: "Proforma Invoice", amount: "$00.00", color: "primary" },
            { title: "Offer", amount: "$00.00", color: "dark" },
          ].map((item, index) => (
            <div className="col-md-3" key={index}>
              <div className="card shadow text-center p-3">
                <h6 className="fw-bold">{item.title}</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Last Month 📅</span>
                  <span className={`badge bg-${item.color}`} style={{ fontSize: "14px" }}>
                    {item.amount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="card shadow p-4">
          <h5 className="fw-bold mb-3">2025</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="payment" fill="#007bff" />
              <Bar dataKey="expense" fill="#00c6d7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
