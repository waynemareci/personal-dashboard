import React, { useEffect, useState } from 'react';
import { getRelationshipService } from '../../services/relationship-service';
import './ConnectionInsights.css';

export interface Insight {
  id: string;
  type: 'pattern' | 'correlation' | 'suggestion';
  title: string;
  description: string;
  entities: Array<{ id: string; label: string; subdomain: string }>;
  strength: number;
  frequency?: number;
  timeframe?: string;
}

export interface ConnectionInsightsProps {
  subdomain: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const ConnectionInsights: React.FC<ConnectionInsightsProps> = ({
  subdomain,
  dateRange
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [subdomain, dateRange]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const service = getRelationshipService();
      const endDate = dateRange?.end || new Date();
      const startDate = dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

      const rawInsights = await service.getInsights(subdomain, startDate, endDate);

      // Transform raw insights into UI-friendly format
      const transformedInsights = transformInsights(rawInsights, subdomain);
      setInsights(transformedInsights);
    } catch (err) {
      console.error('[ConnectionInsights] Failed to load insights:', err);
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const transformInsights = (rawInsights: any[], subdomain: string): Insight[] => {
    // Transform Neo4j insights into UI insights
    return rawInsights.slice(0, 10).map((insight, index) => {
      const strength = insight.avgStrength || 0.5;
      const frequency = insight.frequency || 0;

      return {
        id: `insight-${index}`,
        type: strength > 0.7 ? 'pattern' : 'correlation',
        title: `${insight.relType} connections to ${insight.targetSubdomain}`,
        description: `Found ${frequency} ${insight.relType.toLowerCase()} relationships between ${subdomain} and ${insight.targetSubdomain} entities`,
        entities: [],
        strength,
        frequency,
        timeframe: 'last 7 days'
      };
    });
  };

  const getInsightIcon = (type: Insight['type']): string => {
    switch (type) {
      case 'pattern':
        return '🔍';
      case 'correlation':
        return '📊';
      case 'suggestion':
        return '💡';
      default:
        return '📌';
    }
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 0.7) {
      return <span className="strength-badge strong">Strong</span>;
    }
    if (strength >= 0.4) {
      return <span className="strength-badge medium">Medium</span>;
    }
    return <span className="strength-badge weak">Weak</span>;
  };

  if (loading) {
    return (
      <div className="connection-insights">
        <div className="insights-header">
          <h3>Connection Insights</h3>
        </div>
        <div className="insights-loading">
          <div className="loading-spinner"></div>
          <span>Analyzing relationships...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="connection-insights">
        <div className="insights-header">
          <h3>Connection Insights</h3>
        </div>
        <div className="insights-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="connection-insights">
      <div className="insights-header">
        <h3>Connection Insights</h3>
        <span className="insights-count">{insights.length} insights</span>
      </div>

      {insights.length === 0 ? (
        <div className="insights-empty">
          <span className="empty-icon">🔍</span>
          <p>No insights found for this period</p>
          <span className="empty-hint">
            Try adjusting the date range or exploring other subdomains
          </span>
        </div>
      ) : (
        <div className="insights-list">
          {insights.map(insight => (
            <div key={insight.id} className={`insight-item ${insight.type}`}>
              <div className="insight-header">
                <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                <div className="insight-title-section">
                  <h4>{insight.title}</h4>
                  <div className="insight-meta">
                    {getStrengthBadge(insight.strength)}
                    {insight.frequency && (
                      <span className="frequency-badge">
                        {insight.frequency} connections
                      </span>
                    )}
                    {insight.timeframe && (
                      <span className="timeframe-badge">{insight.timeframe}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="insight-description">{insight.description}</p>

              {insight.entities && insight.entities.length > 0 && (
                <div className="insight-entities">
                  <span className="entities-label">Related:</span>
                  <div className="entities-list">
                    {insight.entities.slice(0, 3).map(entity => (
                      <span
                        key={entity.id}
                        className={`entity-chip ${entity.subdomain}`}
                      >
                        {entity.label}
                      </span>
                    ))}
                    {insight.entities.length > 3 && (
                      <span className="entity-chip more">
                        +{insight.entities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Daily/Weekly Patterns Section */}
      <div className="patterns-section">
        <h4>Temporal Patterns</h4>
        <div className="pattern-cards">
          <div className="pattern-card">
            <div className="pattern-icon">📅</div>
            <div className="pattern-content">
              <span className="pattern-label">Most Active Day</span>
              <span className="pattern-value">Tuesday</span>
            </div>
          </div>
          <div className="pattern-card">
            <div className="pattern-icon">⏰</div>
            <div className="pattern-content">
              <span className="pattern-label">Peak Activity</span>
              <span className="pattern-value">2-4 PM</span>
            </div>
          </div>
          <div className="pattern-card">
            <div className="pattern-icon">🔗</div>
            <div className="pattern-content">
              <span className="pattern-label">Avg Connections</span>
              <span className="pattern-value">12/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
