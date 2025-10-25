import React from 'react';
import './Subdomain.css';

export const HealthSubdomain: React.FC = () => {
  return (
    <div className="subdomain-container" data-subdomain="health">
      <div className="subdomain-header">
        <div className="subdomain-title-section">
          <h1 className="subdomain-title">
            <span className="subdomain-icon">🏃</span>
            Health & Fitness
          </h1>
          <p className="subdomain-description">
            Monitor your workouts, nutrition, and wellness goals
          </p>
        </div>
        <div className="subdomain-actions">
          <button className="subdomain-button primary">
            Log Workout
          </button>
          <button className="subdomain-button secondary">
            Add Meal
          </button>
        </div>
      </div>

      <div className="subdomain-content">
        <div className="subdomain-grid">
          {/* Daily Stats */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Today's Activity</h3>
              <span className="card-badge success">On Track</span>
            </div>
            <div className="card-content">
              <div className="stat-row">
                <span className="stat-label">Steps</span>
                <span className="stat-value">8,432 / 10,000</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Calories Burned</span>
                <span className="stat-value">487 kcal</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Active Minutes</span>
                <span className="stat-value highlight">45 min</span>
              </div>
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Recent Workouts</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="card-content">
              <div className="workout-list">
                <div className="workout-item">
                  <div className="workout-icon">💪</div>
                  <div className="workout-details">
                    <span className="workout-name">Upper Body Strength</span>
                    <span className="workout-meta">45 min • 320 kcal</span>
                  </div>
                  <span className="workout-time">Today</span>
                </div>
                <div className="workout-item">
                  <div className="workout-icon">🏃</div>
                  <div className="workout-details">
                    <span className="workout-name">Morning Run</span>
                    <span className="workout-meta">30 min • 285 kcal</span>
                  </div>
                  <span className="workout-time">Yesterday</span>
                </div>
                <div className="workout-item">
                  <div className="workout-icon">🧘</div>
                  <div className="workout-details">
                    <span className="workout-name">Yoga Session</span>
                    <span className="workout-meta">25 min • 95 kcal</span>
                  </div>
                  <span className="workout-time">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Tracking */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Nutrition Goals</h3>
            </div>
            <div className="card-content">
              <div className="nutrition-macro">
                <div className="macro-header">
                  <span className="macro-name">Protein</span>
                  <span className="macro-amount">125g / 150g</span>
                </div>
                <div className="macro-progress">
                  <div className="macro-bar" style={{ width: '83%', backgroundColor: '#ef4444' }}></div>
                </div>
              </div>
              <div className="nutrition-macro">
                <div className="macro-header">
                  <span className="macro-name">Carbs</span>
                  <span className="macro-amount">185g / 200g</span>
                </div>
                <div className="macro-progress">
                  <div className="macro-bar" style={{ width: '92.5%', backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
              <div className="nutrition-macro">
                <div className="macro-header">
                  <span className="macro-name">Fats</span>
                  <span className="macro-amount">48g / 65g</span>
                </div>
                <div className="macro-progress">
                  <div className="macro-bar" style={{ width: '74%', backgroundColor: '#8b5cf6' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Goal Progress */}
          <div className="subdomain-card">
            <div className="card-header">
              <h3 className="card-title">Weekly Goals</h3>
            </div>
            <div className="card-content">
              <div className="goal-item">
                <div className="goal-info">
                  <span className="goal-name">Workout 5 times</span>
                  <span className="goal-progress-text">3 / 5 completed</span>
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-bar-fill" style={{ width: '60%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
              <div className="goal-item">
                <div className="goal-info">
                  <span className="goal-name">70,000 steps</span>
                  <span className="goal-progress-text">42,150 / 70,000</span>
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-bar-fill" style={{ width: '60%', backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
