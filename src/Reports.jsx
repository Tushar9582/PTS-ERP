import React from "react";

const Reports = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 Reports Dashboard</h2>

      {/* Top Cards Row */}
      <div style={styles.row}>
        <ReportCard title="Total Sales" value="₹27,00,000" percentage="+12%" color="#3498db" icon="💰" />
        <ReportCard title="Total Expenses" value="₹10,00,000" percentage="-5%" color="#e74c3c" icon="💸" />
        <ReportCard title="Net Profit" value="₹17,00,000" percentage="+8%" color="#2ecc71" icon="📈" />
        <ReportCard title="Orders Processed" value="1255" percentage="+10%" color="#f39c12" icon="📦" />
      </div>

      {/* Graph Section */}
      <div style={styles.chartContainer}>
        <h3>📉 Monthly Performance Graph</h3>
        <div style={styles.chartPlaceholder}>Graph will be here</div>
      </div>

      {/* Recent Reports Table */}
      <div style={styles.tableContainer}>
        <h3>📋 Recent Reports</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Report Type</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>04 Mar 2025</td>
              <td>Sales Report</td>
              <td style={{ color: "green" }}>Completed</td>
              <td>₹5,00,000</td>
            </tr>
            <tr>
              <td>02 Mar 2025</td>
              <td>Expense Report</td>
              <td style={{ color: "red" }}>Pending</td>
              <td>₹1,00,000</td>
            </tr>
            <tr>
              <td>28 Feb 2025</td>
              <td>Profit Analysis</td>
              <td style={{ color: "green" }}>Completed</td>
              <td>₹4,50,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reusable Report Card Component
function ReportCard({ title, value, percentage, color, icon }) {
  return (
    <div style={{ ...styles.card, borderLeft: `5px solid ${color}` }}>
      <h5>{title}</h5>
      <h2 style={{ color }}>{icon} {value}</h2>
      <p style={{ color }}>{percentage}</p>
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: "20px",
    marginLeft: "80px", // Adjust this based on sidebar width
    backgroundColor: "#f5f7fa",
  },
  heading: {
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "23%",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  chartPlaceholder: {
    height: "200px",
    backgroundColor: "#ddd",
    borderRadius: "10px",
    marginTop: "10px",
  },
  tableContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  tableHeader: {
    backgroundColor: "#007bff",
    color: "white",
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
  },
};

export default Reports;
