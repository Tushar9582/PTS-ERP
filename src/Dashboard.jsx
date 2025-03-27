import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FiDollarSign, FiUsers, FiFileText, FiClock } from 'react-icons/fi';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase'; // Make sure this path is correct

const InvoiceCard = () => {
  const [invoiceData, setInvoiceData] = useState({
    count: 0,
    totalAmount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchInvoices = () => {
      const invoicesRef = ref(db, 'invoices');
      onValue(invoicesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const invoiceList = Object.values(data);
          const total = invoiceList.reduce((sum, invoice) => {
            return sum + (parseFloat(invoice.total) || 0);
          }, 0);
          
          setInvoiceData({
            count: invoiceList.length,
            totalAmount: total,
            loading: false
          });
        } else {
          setInvoiceData({
            count: 0,
            totalAmount: 0,
            loading: false
          });
        }
      });
    };

    fetchInvoices();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      {/* Card Grid Section */}
      <div className="card-grid">
        {/* Invoice Count Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <span className="card-title"> Total Invoices</span>
            <div className="card-icon" style={{ color: 'var(--primary)', backgroundColor: 'rgba(66, 42, 251, 0.1)' }}>
            <FiUsers size={18} />
            </div>
          </div>
          <div className="card-value">
            {invoiceData.loading ? '...' : invoiceData.count}
          </div>
          <div className="card-footer">
            <BsArrowUpRight className="trend-up" />
            <span style={{ marginLeft: 4 }}>This Month</span>
          </div>
        </div>

        {/* Invoice Total Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <span className="card-title">TotalInvoices ⟨₹⟩ </span>
            <div className="card-icon" style={{ color: '#6A00F4', backgroundColor: 'rgba(106, 0, 244, 0.1)' }}>
              <FiUsers size={18} />
            </div>
          </div>
          <div className="card-value">
  {invoiceData.loading ? '...' : (
    <span>
      ₹{invoiceData.totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </span>
  )}
</div>
          <div className="card-footer">
            <BsArrowUpRight className="trend-up" />
            <span style={{ marginLeft: 4 }}>This Month</span>
          </div>
        </div>

        {/* Lead Quotes Card (unchanged) */}
        <div className="dashboard-card">
          <div className="card-header">
            <span className="card-title">Lead Quotes</span>
            <div className="card-icon" style={{ color: 'var(--success)', backgroundColor: 'rgba(5, 205, 153, 0.1)' }}>
              <FiFileText size={18} />
            </div>
          </div>
          <div className="card-value">$0.00</div>
          <div className="card-footer">
            <BsArrowDownRight className="trend-down" />
            <span style={{ marginLeft: 4 }}>This Month</span>
          </div>
        </div>

        {/* Unpaid Card (unchanged) */}
        <div className="dashboard-card">
          <div className="card-header">
            <span className="card-title">Unpaid</span>
            <div className="card-icon" style={{ color: 'var(--danger)', backgroundColor: 'rgba(255, 84, 112, 0.1)' }}>
              <FiClock size={18} />
            </div>
          </div>
          <div className="card-value">$0.00</div>
          <div className="card-footer">
            <BsArrowDownRight className="trend-down" />
            <span style={{ marginLeft: 4 }}>Not Paid</span>
          </div>
        </div>
      </div>

      {/* Table Section (unchanged) */}
      <div className="table-section">
        <h3 className="section-title">Quotes Overview</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoices</th>
              <th>Customer Quotes</th>
              <th>Lead Quotes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="status-badge" style={{ background: 'rgba(66, 42, 251, 0.1)', color: 'var(--primary)' }}>Draft 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(66, 42, 251, 0.1)', color: 'var(--primary)' }}>Draft 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(66, 42, 251, 0.1)', color: 'var(--primary)' }}>Draft 0%</span></td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'rgba(255, 212, 102, 0.1)', color: 'var(--warning)' }}>Pending 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(255, 212, 102, 0.1)', color: 'var(--warning)' }}>Pending 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(255, 212, 102, 0.1)', color: 'var(--warning)' }}>Pending 0%</span></td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'rgba(255, 84, 112, 0.1)', color: 'var(--danger)' }}>Unpaid 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(131, 217, 255, 0.1)', color: 'var(--secondary)' }}>Sent 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(131, 217, 255, 0.1)', color: 'var(--secondary)' }}>Sent 0%</span></td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'rgba(255, 84, 112, 0.1)', color: 'var(--danger)' }}>Overdue 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(255, 84, 112, 0.1)', color: 'var(--danger)' }}>Declined 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(255, 84, 112, 0.1)', color: 'var(--danger)' }}>Declined 0%</span></td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'rgba(5, 205, 153, 0.1)', color: 'var(--success)' }}>Partially 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(5, 205, 153, 0.1)', color: 'var(--success)' }}>Accepted 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(5, 205, 153, 0.1)', color: 'var(--success)' }}>Accepted 0%</span></td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'rgba(5, 205, 153, 0.1)', color: 'var(--success)' }}>Paid 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(163, 174, 208, 0.1)', color: 'var(--gray)' }}>Expired 0%</span></td>
              <td><span className="status-badge" style={{ background: 'rgba(163, 174, 208, 0.1)', color: 'var(--gray)' }}>Expired 0%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Section (unchanged) */}
      <div className="progress-section">
        <h3 className="section-title">Customer Analytics</h3>
        <div className="progress-container">
          <div className="circular-progress">
            <svg className="progress-circle" viewBox="0 0 100 100">
              <circle className="progress-bg" cx="50" cy="50" r="45" />
              <circle className="progress-fill" cx="50" cy="50" r="45" strokeDasharray="283" strokeDashoffset="283" />
            </svg>
            <div className="progress-text">0%</div>
          </div>
          <p className="progress-label">New Customers This Month</p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
            <div className="stats-item">
              <div className="stats-value">0</div>
              <div className="stats-label">Active Customers</div>
            </div>
            <div className="stats-item">
              <div className="stats-value">0%</div>
              <div className="stats-label">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;