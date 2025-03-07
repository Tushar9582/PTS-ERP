import React from 'react';
import './Dashboard.css';  // Import the CSS file

const InvoiceCard = () => {
  return (
    <div>
      {/* First Component */}
      <div className="invoice-card">
        <div className="whiteBox shadow">
          <div className="header">
            <h3>Invoices</h3>
          </div>
          <div className="divider"></div>
          <div className="content">
            <div className="row">
              <div className="label">This Month</div>
              <div className="vertical-divider"></div>
              <div className="value">
                <span className="tag">$ 00.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="whiteBox shadow">
          <div className="header">
            <h3>Quotes For Customers</h3>
          </div>
          <div className="divider"></div>
          <div className="content">
            <div className="row">
              <div className="label">This Month</div>
              <div className="vertical-divider"></div>
              <div className="value">
                <span className="tag" style={{ backgroundColor: '#722ed1' }}>$ 00.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="whiteBox shadow">
          <div className="header">
            <h3>Quotes For Leads</h3>
          </div>
          <div className="divider"></div>
          <div className="content">
            <div className="row">
              <div className="label">This Month</div>
              <div className="vertical-divider"></div>
              <div className="value">
                <span className="tag" style={{ backgroundColor: '#52c41a' }}>$ 00.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="whiteBox shadow">
          <div className="header">
            <h3>Unpaid</h3>
          </div>
          <div className="divider"></div>
          <div className="content">
            <div className="row">
              <div className="label">Not Paid</div>
              <div className="vertical-divider"></div>
              <div className="value">
                <span className="tag" style={{ backgroundColor: '#f5222d' }}>$ 00.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Component */}
      {/* <h1>Quotes For Leads</h1> */}
      <div className="seconddiv">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoices</th>
            <th>Quotes For Customers</th>
            <th>Quotes For Leads</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Draft 0%</td>
            <td>Draft 0%</td>
            <td>Draft 0%</td>
          </tr>
          <tr>
            <td>Pending 0%</td>
            <td>Pending 0%</td>
            <td>Pending 0%</td>
          </tr>
          <tr>
            <td>Unpaid 0%</td>
            <td>Sent 0%</td>
            <td>Sent 0%</td>
          </tr>
          <tr>
            <td>Overdue 0%</td>
            <td>Declined 0%</td>
            <td>Declined 0%</td>
          </tr>
          <tr>
            <td>Partially 0%</td>
            <td>Accepted 0%</td>
            <td>Accepted 0%</td>
          </tr>
          <tr>
            <td>Paid 0%</td>
            <td>Expired 0%</td>
            <td>Expired 0%</td>
          </tr>
        </tbody>
      </table>

      {/* third */}
      <div className="pad20">
      <h3 className="customers-heading">Customers</h3>
      <div className="progress-container">
        <div className="ant-progress-circle" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          <div className="ant-progress-inner">
            <svg className="ant-progress-circle-svg" viewBox="0 0 100 100" role="presentation">
              <circle className="ant-progress-circle-trail" r="47" cx="50" cy="50" />
              <circle className="ant-progress-circle-path" r="47" cx="50" cy="50" />
              <circle className="ant-progress-circle-path active" r="47" cx="50" cy="50" />
            </svg>
            <span className="ant-progress-text" title="0%">0%</span>
          </div>
        </div>
        <p className="progress-label">New Customer This Month</p>
        <div className="ant-divider" role="separator"></div>
        <div className="ant-statistic">
          <div className="ant-statistic-title">Active Customer</div>
          <div className="ant-statistic-content">
            <span className="ant-statistic-content-value">
              <span className="ant-statistic-content-value-int">0</span>
              <span className="ant-statistic-content-value-decimal">.00</span>
            </span>
            <span className="ant-statistic-content-suffix">%</span>
          </div>
        </div>
      </div>
    </div>
      </div>
      </div>
  );
};

export default InvoiceCard;
