import React from "react";
import { useNavigate } from "react-router-dom";

const Payments = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh", marginLeftLeft: "230px", }}>
      <button 
        style={{ marginBottom: "10px", cursor: "pointer", border: "none", background: "none", color: "#007bff", marginLeft: "260px",  }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2>Payment List</h2>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px",marginLeft: "230px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <input 
            type="text" 
            placeholder="Search"
            style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ddd", width: "200px" }}
          />
          <button style={{ padding: "5px 10px", backgroundColor: "#ddd", borderRadius: "5px", border: "none", cursor: "pointer" }}>
            🔄 Refresh
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f1f1" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Number</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Client</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Amount</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Year</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Payment Mode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                <div>
                  <span style={{ fontSize: "40px" }}>📂</span>
                  <br />
                  No data
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;