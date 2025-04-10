import React, { useState, useEffect, useContext } from 'react';
import { FiDollarSign, FiUsers, FiFileText, FiClock } from 'react-icons/fi';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { DarkModeContext } from './DarkModeContext';
import './Dashboard.css';

const InvoiceCard = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [invoiceData, setInvoiceData] = useState({
    count: 0,
    totalAmount: 0,
    loading: true,
    statusCounts: {
      paid: 0,
      pending: 0,
      draft: 0
    }
  });

  const [leadsData, setLeadsData] = useState({
    count: 0,
    loading: true
  });

  const [customersData, setCustomersData] = useState({
    count: 0,
    loading: true
  });
  
  const [customLeadsData, setCustomLeadsData] = useState({
    onProcess: 0,
    complete: 0,
    cancelled: 0,
    loading: true
  });

  // Fetch custom leads data
  useEffect(() => {
    const fetchCustomLeads = () => {
      const customLeadsRef = ref(db, 'custom_leads');
      const unsubscribe = onValue(customLeadsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const leadsList = Object.values(data);
          setCustomLeadsData({
            onProcess: leadsList.filter(lead => 
              lead.leadstatus && lead.leadstatus.toLowerCase().includes('process')
            ).length,
            complete: leadsList.filter(lead => 
              lead.leadstatus && lead.leadstatus.toLowerCase() === 'complete'
            ).length,
            cancelled: leadsList.filter(lead => 
              lead.leadstatus && lead.leadstatus.toLowerCase() === 'cancelled'
            ).length,
            loading: false
          });
        } else {
          setCustomLeadsData({
            onProcess: 0,
            complete: 0,
            cancelled: 0,
            loading: false
          });
        }
      });
      return () => unsubscribe();
    };
    fetchCustomLeads();
  }, []);

  // Fetch invoices and calculate status counts
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
          
          const statusCounts = {
            paid: invoiceList.filter(invoice => invoice.status === 'Paid').length,
            pending: invoiceList.filter(invoice => invoice.status === 'Pending').length,
            draft: invoiceList.filter(invoice => invoice.status === 'Draft').length
          };
  
          setInvoiceData({
            count: invoiceList.length,
            totalAmount: total,
            loading: false,
            statusCounts
          });
        } else {
          setInvoiceData({
            count: 0,
            totalAmount: 0,
            loading: false,
            statusCounts: {
              paid: 0,
              pending: 0,
              draft: 0
            }
          });
        }
      });
    };
    fetchInvoices();
  }, []);

  // Fetch leads
  useEffect(() => {
    const fetchLeads = () => {
      const leadsRef = ref(db, 'leads');
      onValue(leadsRef, (snapshot) => {
        const data = snapshot.val();
        setLeadsData({
          count: data ? Object.keys(data).length : 0,
          loading: false
        });
      });
    };
    fetchLeads();
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = () => {
      const customersRef = ref(db, 'customers');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        setCustomersData({
          count: data ? Object.keys(data).length : 0,
          loading: false
        });
      });
    };
    fetchCustomers();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Card Grid Section */}
      <div className="card-grid">
        {/* Invoice Count Card */}
        <div className={`dashboard-card ${darkMode ? 'dark-card' : ''}`}>
          <div className="card-header">
            <span className={`card-title ${darkMode ? 'text-light' : ''}`}>Total Invoices</span>
            <div className="card-icon" style={{ 
              color: darkMode ? '#a78bfa' : 'var(--primary)', 
              backgroundColor: darkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(66, 42, 251, 0.1)' 
            }}>
              <FiUsers size={18} />
            </div>
          </div>
          <div className={`card-value ${darkMode ? 'text-light' : ''}`}>
            {invoiceData.loading ? '...' : invoiceData.count}
          </div>
          <div className={`card-footer ${darkMode ? 'text-light' : ''}`}>
            <BsArrowUpRight className="trend-up" />
            <span style={{ marginLeft: 4 }}>This Month</span>
          </div>
        </div>

        {/* Invoice Total Card */}
        <div className={`dashboard-card ${darkMode ? 'dark-card' : ''}`}>
          <div className="card-header">
            <span className={`card-title ${darkMode ? 'text-light' : ''}`}>Total Invoices ⟨₹⟩</span>
            <div className="card-icon" style={{ 
              color: darkMode ? '#c084fc' : '#6A00F4', 
              backgroundColor: darkMode ? 'rgba(192, 132, 252, 0.1)' : 'rgba(106, 0, 244, 0.1)' 
            }}>
              <FiUsers size={18} />
            </div>
          </div>
          <div className={`card-value ${darkMode ? 'text-light' : ''}`}>
            {invoiceData.loading ? '...' : (
              <span>
                ₹{invoiceData.totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            )}
          </div>
          <div className={`card-footer ${darkMode ? 'text-light' : ''}`}>
            <BsArrowUpRight className="trend-up" />
            <span style={{ marginLeft: 4 }}>This Month</span>
          </div>
        </div>

        {/* Leads Count Card */}
        <div className={`dashboard-card ${darkMode ? 'dark-card' : ''}`}>
          <div className="card-header">
            <span className={`card-title ${darkMode ? 'text-light' : ''}`}>Total Leads</span>
            <div className="card-icon" style={{ 
              color: darkMode ? '#6ee7b7' : 'var(--success)', 
              backgroundColor: darkMode ? 'rgba(110, 231, 183, 0.1)' : 'rgba(5, 205, 153, 0.1)' 
            }}>
              <FiFileText size={18} />
            </div>
          </div>
          <div className={`card-value ${darkMode ? 'text-light' : ''}`}>
            {leadsData.loading ? '...' : leadsData.count}
          </div>
          <div className={`card-footer ${darkMode ? 'text-light' : ''}`}>
            <BsArrowDownRight className="trend-down" />
            <span style={{ marginLeft: 4 }}>This Month</span>
          </div>
        </div>

        {/* Customers Count Card */}
        <div className={`dashboard-card ${darkMode ? 'dark-card' : ''}`}>
          <div className="card-header">
            <span className={`card-title ${darkMode ? 'text-light' : ''}`}>Total Clients</span>
            <div className="card-icon" style={{ 
              color: darkMode ? '#fca5a5' : 'var(--danger)', 
              backgroundColor: darkMode ? 'rgba(252, 165, 165, 0.1)' : 'rgba(255, 84, 112, 0.1)' 
            }}>
              <FiUsers size={18} />
            </div>
          </div>
          <div className={`card-value ${darkMode ? 'text-light' : ''}`}>
            {customersData.loading ? '...' : customersData.count}
          </div>
          <div className={`card-footer ${darkMode ? 'text-light' : ''}`}>
            <BsArrowUpRight className="trend-up" />
            <span style={{ marginLeft: 4 }}>Active</span>
          </div>
        </div>
      </div>

      {/* Table Section with Real-time Invoice Status */}
      <div className={`table-section ${darkMode ? 'dark-section' : ''}`}>
        <h3 className={`section-title ${darkMode ? 'text-light' : ''}`}>Quotes Overview</h3>
        <table className={`data-table ${darkMode ? 'dark-table' : ''}`}>
          <thead>
            <tr>
              <th className={darkMode ? 'text-light' : ''}>Invoices</th>
              <th className={darkMode ? 'text-light' : ''}>Custom Leads</th>
              <th className={darkMode ? 'text-light' : ''}>Lead Quotes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(66, 42, 251, 0.1)', 
                  color: darkMode ? '#a78bfa' : 'var(--primary)'
                }}>
                  Draft ({invoiceData.statusCounts.draft})
                </span>
              </td>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(66, 42, 251, 0.1)', 
                  color: darkMode ? '#a78bfa' : 'var(--primary)'
                }}>
                  On Process ({customLeadsData.onProcess || 0})
                </span>
              </td>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(66, 42, 251, 0.1)', 
                  color: darkMode ? '#a78bfa' : 'var(--primary)'
                }}>
                  Draft (0)
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(253, 230, 138, 0.1)' : 'rgba(255, 212, 102, 0.1)', 
                  color: darkMode ? '#fcd34d' : 'var(--warning)'
                }}>
                  Pending ({invoiceData.statusCounts.pending})
                </span>
              </td>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(110, 231, 183, 0.1)' : 'rgba(5, 205, 153, 0.1)', 
                  color: darkMode ? '#6ee7b7' : 'var(--success)'
                }}>
                  Complete ({customLeadsData.complete || 0})
                </span>
              </td>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(253, 230, 138, 0.1)' : 'rgba(255, 212, 102, 0.1)', 
                  color: darkMode ? '#fcd34d' : 'var(--warning)'
                }}>
                  Pending (0)
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(110, 231, 183, 0.1)' : 'rgba(5, 205, 153, 0.1)', 
                  color: darkMode ? '#6ee7b7' : 'var(--success)'
                }}>
                  Paid ({invoiceData.statusCounts.paid})
                </span>
              </td>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(252, 165, 165, 0.1)' : 'rgba(255, 84, 112, 0.1)', 
                  color: darkMode ? '#fca5a5' : 'var(--danger)'
                }}>
                  Cancelled ({customLeadsData.cancelled || 0})
                </span>
              </td>
              <td>
                <span className={`status-badge ${darkMode ? 'dark-badge' : ''}`} style={{ 
                  background: darkMode ? 'rgba(110, 231, 183, 0.1)' : 'rgba(5, 205, 153, 0.1)', 
                  color: darkMode ? '#6ee7b7' : 'var(--success)'
                }}>
                  Accepted (0)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Section */}
      <div className={`progress-section ${darkMode ? 'dark-section' : ''}`}>
        <h3 className={`section-title ${darkMode ? 'text-light' : ''}`}>Clients Analytics</h3>
        <div className="progress-container">
          <div className="circular-progress">
            <svg className="progress-circle" viewBox="0 0 100 100">
              <circle className={`progress-bg ${darkMode ? 'dark-progress-bg' : ''}`} cx="50" cy="50" r="45" />
              <circle className={`progress-fill ${darkMode ? 'dark-progress-fill' : ''}`} cx="50" cy="50" r="45" strokeDasharray="450" strokeDashoffset="300" />
            </svg>
            <div className={`progress-text ${darkMode ? 'text-light' : ''}`}>50%</div>
          </div>
          <p className={`progress-label ${darkMode ? 'text-light' : ''}`}>New Clients This Month</p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
            <div className="stats-item">
              <div className={`stats-value ${darkMode ? 'text-light' : ''}`}>
                {customersData.loading ? '...' : customersData.count}
              </div>
              <div className={`stats-label ${darkMode ? 'text-light' : ''}`}>Total Clients</div>
            </div>
            <div className="stats-item">
              <div className={`stats-value ${darkMode ? 'text-light' : ''}`}>50%</div>
              <div className={`stats-label ${darkMode ? 'text-light' : ''}`}>Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;