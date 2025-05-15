import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import OrderModal from "./OrderModal";
import Swal from "sweetalert2";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  const [todayOrders, setTodayOrders] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const ordersRef = ref(db, "orders");

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedOrders = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          lastUpdatedBy: value.lastUpdatedBy || "System" // Add last updated by field
        }));
        
        // Check for new orders today
        const newTodayOrders = loadedOrders.filter(order => {
          const orderDate = new Date(order.timestamp);
          const today = new Date();
          return (
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          );
        });
        
        if (newTodayOrders.length > todayOrders.length) {
          showNewOrderNotification(newTodayOrders.length);
        }
        
        setTodayOrders(newTodayOrders);
        setOrders(loadedOrders);
      }
    });
  }, []);

  const showNewOrderNotification = (count) => {
    Swal.fire({
      title: 'New Order!',
      text: `You have ${count} new order(s) today!`,
      icon: 'success',
      confirmButtonText: 'View Orders',
      timer: 3000,
      timerProgressBar: true,
      toast: true,
    //   position: 'top-end',
      showConfirmButton: true
    });
  };

  const filteredOrders = orders
    .filter(order => {
      if (filter === "all") return true;
      return order.status === filter;
    })
    .filter(order => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.shipping.firstName.toLowerCase().includes(searchLower) ||
        order.shipping.lastName.toLowerCase().includes(searchLower) ||
        order.shipping.email.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = order.orderSummary?.total || 0;
    return sum + orderTotal;
  }, 0);

  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const shippedOrders = orders.filter(order => order.status === "shipped").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;

  const handleStatusChange = async (orderId, newStatus) => {
    const { value: person } = await Swal.fire({
      title: 'Update Status',
      text: 'Enter your name to record who changed this status:',
      input: 'text',
      inputPlaceholder: 'Your name',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter your name!';
        }
      }
    });

    if (person) {
      const db = getDatabase();
      const orderRef = ref(db, `orders/${orderId}`);
      update(orderRef, { 
        status: newStatus,
        lastUpdatedBy: person,
        lastUpdatedAt: new Date().toISOString()
      });

      Swal.fire({
        title: 'Status Updated!',
        text: `Order status changed to ${newStatus} by ${person}`,
        icon: 'success',
        timer: 3000,
        toast: true,
        position: 'top-end'
      });
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FFC107";
      case "shipped": return "#2196F3";
      case "delivered": return "#4CAF50";
      default: return "#9E9E9E";
    }
  };

  return (
    <div className="orders-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <span>📦</span> Orders
            </li>
            <li>
              <span>📊</span> Analytics
            </li>
            <li>
              <span>👥</span> Customers
            </li>
            <li>
              <span>⚙️</span> Settings
            </li>
          </ul>
        </nav>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Order Management</h1>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button>🔍</button>
            </div>
            <button className="notification-btn">🔔</button>
            <div className="user-profile">
              <div className="avatar">AD</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p>${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card total">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Orders</h3>
                <p>{orders.length}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p>{pendingOrders}</p>
              </div>
            </div>
            <div className="stat-card shipped">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>Shipped</h3>
                <p>{shippedOrders}</p>
              </div>
            </div>
            <div className="stat-card delivered">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Delivered</h3>
                <p>{deliveredOrders}</p>
              </div>
            </div>
          </div>

          <div className="orders-controls">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Orders
              </button>
              <button
                className={`filter-tab ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>
              <button
                className={`filter-tab ${filter === "shipped" ? "active" : ""}`}
                onClick={() => setFilter("shipped")}
              >
                Shipped
              </button>
              <button
                className={`filter-tab ${filter === "delivered" ? "active" : ""}`}
                onClick={() => setFilter("delivered")}
              >
                Delivered
              </button>
              <button>SHOW STATUS 💹📈 </button>
            </div>
            <div className="sort-controls">
              <select
                value={sortConfig.key}
                onChange={(e) => requestSort(e.target.value)}
                className="sort-select"
              >
                <option value="timestamp">Order Date</option>
                <option value="orderSummary.total">Total Amount</option>
                <option value="shipping.firstName">Customer Name</option>
              </select>
              <button
                onClick={() => requestSort(sortConfig.key)}
                className="sort-direction"
              >
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort("id")}>Order ID</th>
                  <th onClick={() => requestSort("shipping.firstName")}>Customer</th>
                  <th onClick={() => requestSort("timestamp")}>Date</th>
                  <th onClick={() => requestSort("orderSummary.total")}>Amount</th>
                  <th>Status</th>
                  <th>Updated By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id.slice(0, 8)}</td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {order.shipping.firstName.charAt(0)}
                          {order.shipping.lastName.charAt(0)}
                        </div>
                        <div className="customer-info">
                          <div className="customer-name">
                            {order.shipping.firstName} {order.shipping.lastName}
                          </div>
                          <div className="customer-email">{order.shipping.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {new Date(order.timestamp || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="order-amount">
                      ${order.orderSummary?.total?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      <div className="status-cell">
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: getStatusColor(order.status || "pending") }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                        </select>
                      </div>
                    </td>
                    <td className="updated-by">
                      <div className="person-badge">
                        <span className="person-icon">👤</span>
                        {order.lastUpdatedBy}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="view-details-btn"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}






/**
 * 
 * 
 * 
 * import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import OrderModal from "./OrderModal";
import Swal from "sweetalert2";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  const [todayOrders, setTodayOrders] = useState([]);
  const [hasShownTodayAlert, setHasShownTodayAlert] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const ordersRef = ref(db, "orders");

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedOrders = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          lastUpdatedBy: value.lastUpdatedBy || "System",
          lastUpdatedAt: value.lastUpdatedAt || value.timestamp || new Date().toISOString()
        }));
        
        // Filter today's orders
        const today = new Date();
        const newTodayOrders = loadedOrders.filter(order => {
          const orderDate = new Date(order.timestamp);
          return (
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          );
        });
        
        setTodayOrders(newTodayOrders);
        setOrders(loadedOrders);

        // Show alert if there are today's orders and alert hasn't been shown yet
        if (newTodayOrders.length > 0 && !hasShownTodayAlert) {
          showTodayOrdersAlert(newTodayOrders);
          setHasShownTodayAlert(true);
        }
      }
    });
  }, [hasShownTodayAlert]);

  const showTodayOrdersAlert = (orders) => {
    const orderList = orders.map(order => `
      <div class="today-order-item">
        <div class="order-id-badge">#${order.id.slice(0, 8)}</div>
        <div class="order-customer">${order.shipping.firstName} ${order.shipping.lastName}</div>
        <div class="order-amount">$${order.orderSummary?.total?.toFixed(2) || '0.00'}</div>
        <div class="order-status" style="background-color: ${getStatusColor(order.status)}">
          ${order.status}
        </div>
      </div>
    `).join('');

    Swal.fire({
      title: `📦 Today's Orders (${orders.length})`,
      html: `
        <div class="today-orders-container">
          ${orderList}
        </div>
        <div class="todays-total">
          <span>Total Revenue:</span>
          <strong>$${orders.reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0).toFixed(2)}</strong>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Got it!',
      width: '650px',
      background: '#ffffff',
      backdrop: `
        rgba(0,0,123,0.4)
        url("/images/confetti.gif")
        center top
        no-repeat
      `,
      customClass: {
        popup: 'today-orders-popup',
        title: 'today-orders-title',
        htmlContainer: 'today-orders-html',
        confirmButton: 'today-orders-confirm-btn'
      },
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'View All Orders',
      focusConfirm: false,
      allowOutsideClick: false
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        setFilter("all");
      }
    });
  };

  const filteredOrders = orders
    .filter(order => {
      if (filter === "all") return true;
      return order.status === filter;
    })
    .filter(order => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.shipping.firstName.toLowerCase().includes(searchLower) ||
        order.shipping.lastName.toLowerCase().includes(searchLower) ||
        order.shipping.email.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = order.orderSummary?.total || 0;
    return sum + orderTotal;
  }, 0);

  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const shippedOrders = orders.filter(order => order.status === "shipped").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;

  const handleStatusChange = async (orderId, newStatus) => {
    const { value: person } = await Swal.fire({
      title: 'Update Order Status',
      text: 'Enter your name to record this change:',
      input: 'text',
      inputPlaceholder: 'Your name',
      inputAttributes: {
        autocapitalize: 'on'
      },
      showCancelButton: true,
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter your name!';
        }
      }
    });

    if (person) {
      const db = getDatabase();
      const orderRef = ref(db, `orders/${orderId}`);
      update(orderRef, { 
        status: newStatus,
        lastUpdatedBy: person,
        lastUpdatedAt: new Date().toISOString()
      });

      Swal.fire({
        title: 'Status Updated!',
        text: `Order #${orderId.slice(0, 8)} is now ${newStatus}`,
        icon: 'success',
        timer: 3000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FFC107";
      case "shipped": return "#2196F3";
      case "delivered": return "#4CAF50";
      default: return "#9E9E9E";
    }
  };

  return (
    <div className="orders-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <span>📦</span> Orders
            </li>
            <li>
              <span>📊</span> Analytics
            </li>
            <li>
              <span>👥</span> Customers
            </li>
            <li>
              <span>⚙️</span> Settings
            </li>
          </ul>
        </nav>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Order Management</h1>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button>🔍</button>
            </div>
            <button 
              className="notification-btn"
              onClick={() => showTodayOrdersAlert(todayOrders)}
            >
              🔔
              {todayOrders.length > 0 && (
                <span className="notification-badge">{todayOrders.length}</span>
              )}
            </button>
            <div className="user-profile">
              <div className="avatar">AD</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p>${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card total">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Orders</h3>
                <p>{orders.length}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p>{pendingOrders}</p>
              </div>
            </div>
            <div className="stat-card shipped">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>Shipped</h3>
                <p>{shippedOrders}</p>
              </div>
            </div>
            <div className="stat-card delivered">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Delivered</h3>
                <p>{deliveredOrders}</p>
              </div>
            </div>
          </div>

          <div className="orders-controls">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Orders
              </button>
              <button
                className={`filter-tab ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>
              <button
                className={`filter-tab ${filter === "shipped" ? "active" : ""}`}
                onClick={() => setFilter("shipped")}
              >
                Shipped
              </button>
              <button
                className={`filter-tab ${filter === "delivered" ? "active" : ""}`}
                onClick={() => setFilter("delivered")}
              >
                Delivered
              </button>
              <button
                className={`filter-tab ${filter === "delivered" ? "active" : ""}`}
                onClick={() => setFilter("delivered")}
              >
              CHECK  ORDERS 📦
              </button>
            </div>
            <div className="sort-controls">
              <select
                value={sortConfig.key}
                onChange={(e) => requestSort(e.target.value)}
                className="sort-select"
              >
                <option value="timestamp">Order Date</option>
                <option value="orderSummary.total">Total Amount</option>
                <option value="shipping.firstName">Customer Name</option>
              </select>
              <button
                onClick={() => requestSort(sortConfig.key)}
                className="sort-direction"
              >
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort("id")}>Order ID</th>
                  <th onClick={() => requestSort("shipping.firstName")}>Customer</th>
                  <th onClick={() => requestSort("timestamp")}>Date</th>
                  <th onClick={() => requestSort("orderSummary.total")}>Amount</th>
                  <th>Status</th>
                  <th>Updated By</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id.slice(0, 8)}</td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {order.shipping.firstName.charAt(0)}
                          {order.shipping.lastName.charAt(0)}
                        </div>
                        <div className="customer-info">
                          <div className="customer-name">
                            {order.shipping.firstName} {order.shipping.lastName}
                          </div>
                          <div className="customer-email">{order.shipping.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {new Date(order.timestamp).toLocaleDateString()}
                    </td>
                    <td className="order-amount">
                      ${order.orderSummary?.total?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      <div className="status-cell">
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: getStatusColor(order.status || "pending") }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                        </select>
                      </div>
                    </td>
                    <td className="updated-by">
                      <div className="person-badge">
                        <span className="person-icon">👤</span>
                        {order.lastUpdatedBy}
                      </div>
                    </td>
                    <td className="last-updated">
                      {new Date(order.lastUpdatedAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="view-details-btn"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
 */