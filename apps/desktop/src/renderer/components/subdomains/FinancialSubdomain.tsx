import React from 'react';
import './Subdomain.css';

export const FinancialSubdomain: React.FC = () => {
  return (
    <div className="subdomain-container" data-subdomain="financial">
      <div className="subdomain-header">
        <div className="subdomain-title-section">
          <h1 className="subdomain-title">
            <span className="subdomain-icon">💰</span>
            Financial Dashboard
          </h1>
          <p className="subdomain-description">
            Track your income, expenses, and financial goals
          </p>
        </div>
        <div className="subdomain-actions">
          <button className="subdomain-button primary">
            Add Transaction
          </button>
          <button className="subdomain-button secondary">
            View Reports
          </button>
        </div>
      </div>

      <div className="subdomain-content">
        <div className="subdomain-grid">
          {/* Summary Cards */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Monthly Overview</h3>
              <span className="card-badge success">+12%</span>
            </div>
            <div className="card-content">
              <div className="stat-row">
                <span className="stat-label">Income</span>
                <span className="stat-value">$5,240.00</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Expenses</span>
                <span className="stat-value">$3,890.50</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Net Savings</span>
                <span className="stat-value highlight">$1,349.50</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Recent Transactions</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="card-content">
              <div className="transaction-list">
                <div className="transaction-item">
                  <div className="transaction-icon expense">📤</div>
                  <div className="transaction-details">
                    <span className="transaction-name">Grocery Store</span>
                    <span className="transaction-date">Today, 2:30 PM</span>
                  </div>
                  <span className="transaction-amount expense">-$87.42</span>
                </div>
                <div className="transaction-item">
                  <div className="transaction-icon income">📥</div>
                  <div className="transaction-details">
                    <span className="transaction-name">Salary Deposit</span>
                    <span className="transaction-date">Dec 1</span>
                  </div>
                  <span className="transaction-amount income">+$3,500.00</span>
                </div>
                <div className="transaction-item">
                  <div className="transaction-icon expense">📤</div>
                  <div className="transaction-details">
                    <span className="transaction-name">Electric Bill</span>
                    <span className="transaction-date">Nov 28</span>
                  </div>
                  <span className="transaction-amount expense">-$125.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Budget Categories</h3>
            </div>
            <div className="card-content">
              <div className="budget-category">
                <div className="budget-header">
                  <span className="budget-name">Food & Dining</span>
                  <span className="budget-amount">$420 / $500</span>
                </div>
                <div className="budget-progress">
                  <div className="budget-bar" style={{ width: '84%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
              <div className="budget-category">
                <div className="budget-header">
                  <span className="budget-name">Transportation</span>
                  <span className="budget-amount">$285 / $300</span>
                </div>
                <div className="budget-progress">
                  <div className="budget-bar" style={{ width: '95%', backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
              <div className="budget-category">
                <div className="budget-header">
                  <span className="budget-name">Entertainment</span>
                  <span className="budget-amount">$95 / $200</span>
                </div>
                <div className="budget-progress">
                  <div className="budget-bar" style={{ width: '47.5%', backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
