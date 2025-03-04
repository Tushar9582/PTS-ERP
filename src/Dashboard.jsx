import React from "react";

function Dashboard() {
  return (
    <div style={styles.container}>
      {/* Cards Row */}
      <div style={styles.row}>
        <DashboardCard title="Daily Sales" value="10000" color="#17d4fc" percentage="70%" icon="⬆" />
        <DashboardCard title="Monthly Sales" value="250600" color="#9b8ef5" percentage="85%" icon="⬇" />
        <DashboardCard title="Yearly Sales" value="2706000" color="#3498db" percentage="70%" icon="⬆" />
      </div>

      <div style={styles.row}>
        <DashboardCard title="Purchase Yearly" value="3000600" color="#3498db" percentage="100%" icon="⬆" />
        <DashboardCard title="Expense Monthly" value="100600" color="#3498db" percentage="90%" icon="⬆" />
        <DashboardCard title="Products" value="10000" color="#9b8ef5" percentage="85%" icon="🛒" />
      </div>

      {/* Weekly Sales Section */}
      <div style={styles.weeklySalesCard}>
        <h3>Weekly Sales Total</h3>
        <h2 style={{ color: "#2ecc71" }}>⬆ 90708</h2>
        <input type="range" min="0" max="100000" value="90708" style={styles.range} />
      </div>

      {/* Total Sales */}
      <div style={styles.totalSalesCard}>
        <h3>🏪 255</h3>
        <p>Total Sales</p>
      </div>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, value, color, percentage, icon }) {
  return (
    <div style={styles.card}>
      <h5>{title}</h5>
      <h2 style={{ color: color }}>
        {icon} {value}
      </h2>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: percentage, backgroundColor: color }}></div>
      </div>
      <p>{percentage}</p>
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f5f7fa",
    marginLeft: "80px",  // ADDED THIS TO SHIFT CONTENT RIGHT
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
    width: "30%",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  progressBar: {
    width: "100%",
    height: "5px",
    backgroundColor: "#ddd",
    borderRadius: "5px",
    marginTop: "10px",
  },
  progressFill: {
    height: "5px",
    borderRadius: "5px",
  },
  weeklySalesCard: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "20px",
  },
  range: {
    width: "100%",
  },
  totalSalesCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
};

export default Dashboard;
