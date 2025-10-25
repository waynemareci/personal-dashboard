import React from 'react';
import './Subdomain.css';

export const ScheduleSubdomain: React.FC = () => {
  return (
    <div className="subdomain-container" data-subdomain="schedule">
      <div className="subdomain-header">
        <div className="subdomain-title-section">
          <h1 className="subdomain-title">
            <span className="subdomain-icon">📅</span>
            Schedule & Tasks
          </h1>
          <p className="subdomain-description">
            Manage your tasks, events, and productivity goals
          </p>
        </div>
        <div className="subdomain-actions">
          <button className="subdomain-button primary">
            Add Task
          </button>
          <button className="subdomain-button secondary">
            New Event
          </button>
        </div>
      </div>

      <div className="subdomain-content">
        <div className="subdomain-grid">
          {/* Today's Overview */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Today's Overview</h3>
              <span className="card-badge info">Dec 15, 2025</span>
            </div>
            <div className="card-content">
              <div className="stat-row">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-value">7 / 12</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Meetings Today</span>
                <span className="stat-value">3</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Focus Time</span>
                <span className="stat-value highlight">4.5 hours</span>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Upcoming Tasks</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="card-content">
              <div className="task-list">
                <div className="task-item priority-high">
                  <input type="checkbox" className="task-checkbox" />
                  <div className="task-details">
                    <span className="task-name">Review PR #234</span>
                    <span className="task-meta">
                      <span className="task-project">Development</span>
                      <span className="task-due">Due: 3:00 PM</span>
                    </span>
                  </div>
                  <span className="task-priority high">High</span>
                </div>
                <div className="task-item priority-medium">
                  <input type="checkbox" className="task-checkbox" />
                  <div className="task-details">
                    <span className="task-name">Prepare presentation slides</span>
                    <span className="task-meta">
                      <span className="task-project">Work</span>
                      <span className="task-due">Due: Tomorrow</span>
                    </span>
                  </div>
                  <span className="task-priority medium">Medium</span>
                </div>
                <div className="task-item priority-low">
                  <input type="checkbox" className="task-checkbox" checked />
                  <div className="task-details">
                    <span className="task-name completed">Update documentation</span>
                    <span className="task-meta">
                      <span className="task-project">Development</span>
                      <span className="task-due">Completed</span>
                    </span>
                  </div>
                  <span className="task-priority low">Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Events */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Today's Events</h3>
            </div>
            <div className="card-content">
              <div className="event-list">
                <div className="event-item">
                  <div className="event-time">
                    <span className="event-hour">9:00</span>
                    <span className="event-period">AM</span>
                  </div>
                  <div className="event-details">
                    <span className="event-name">Team Standup</span>
                    <span className="event-duration">30 minutes</span>
                  </div>
                  <div className="event-indicator" style={{ backgroundColor: '#3b82f6' }}></div>
                </div>
                <div className="event-item">
                  <div className="event-time">
                    <span className="event-hour">2:00</span>
                    <span className="event-period">PM</span>
                  </div>
                  <div className="event-details">
                    <span className="event-name">Client Meeting</span>
                    <span className="event-duration">1 hour</span>
                  </div>
                  <div className="event-indicator" style={{ backgroundColor: '#10b981' }}></div>
                </div>
                <div className="event-item">
                  <div className="event-time">
                    <span className="event-hour">4:30</span>
                    <span className="event-period">PM</span>
                  </div>
                  <div className="event-details">
                    <span className="event-name">Code Review Session</span>
                    <span className="event-duration">45 minutes</span>
                  </div>
                  <div className="event-indicator" style={{ backgroundColor: '#8b5cf6' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Active Projects</h3>
            </div>
            <div className="card-content">
              <div className="project-item">
                <div className="project-header">
                  <span className="project-name">Personal Dashboard</span>
                  <span className="project-percentage">65%</span>
                </div>
                <div className="project-progress">
                  <div className="project-bar" style={{ width: '65%', backgroundColor: '#3b82f6' }}></div>
                </div>
                <div className="project-stats">
                  <span className="project-stat">15 / 23 tasks</span>
                  <span className="project-stat">Due: Dec 31</span>
                </div>
              </div>
              <div className="project-item">
                <div className="project-header">
                  <span className="project-name">API Integration</span>
                  <span className="project-percentage">90%</span>
                </div>
                <div className="project-progress">
                  <div className="project-bar" style={{ width: '90%', backgroundColor: '#10b981' }}></div>
                </div>
                <div className="project-stats">
                  <span className="project-stat">9 / 10 tasks</span>
                  <span className="project-stat">Due: Dec 20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
