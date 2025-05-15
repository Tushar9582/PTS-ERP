import React from "react";
import "./OrderModel.css";

export default function OrderModal({ order, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="modal-close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        
        <div className="modal-header">
          <h2>Order Details</h2>
          {/* <div className="order-id">Order #{order.id.slice(0, 8)}</div> */}
        </div>
        
        <div className="modal-content">
          <div className="customer-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.shipping.firstName} {order.shipping.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{order.shipping.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{order.shipping.phone || 'N/A'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Address:</span>
                <span className="info-value">
                  {order.shipping.address}, {order.shipping.city}, {order.shipping.state} - {order.shipping.zipCode}
                </span>
              </div>
            </div>
          </div>
          
          <div className="order-section">
            <h3>Order Summary</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">
                  {new Date(order.timestamp || Date.now()).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment:</span>
                <span className="info-value">{order.paymentMethod}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="button" style={{ 
                  backgroundColor: 
                    order.status === 'pending' ? '#FFC107' :
                    order.status === 'shipped' ? '#2196F3' :
                    order.status === 'delivered' ? '#4CAF50' : '#9E9E9E'
                }}>
                  {order.status || 'pending'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total:</span>
                <span className="info-value total-amount">
                  ${order.orderSummary?.total || '0.00'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="items-section">
            <h3>Order Items ({order.cart.length})</h3>
            <div className="items-list">
              {order.cart.map((item, i) => (
                <div key={i} className="item-card">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="image-placeholder"></div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <div className="item-meta">
                      <span>Qty: {item.quantity}</span>
                      <span>${item.price} each</span>
                      <span>${(item.price * item.quantity)} total</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}