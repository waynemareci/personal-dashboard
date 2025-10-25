import React, { useEffect, useState, useCallback } from 'react';
import { getRelationshipService } from '../../services/relationship-service';
import type { Entity, Relationship } from '../../services/neo4j-queries';
import { ConnectionInsights } from './ConnectionInsights';
import { EntityPreview } from './EntityPreview';
import './RelationshipSidebar.css';

export interface RelationshipSidebarProps {
  contextEntityId?: string | null;
  contextSubdomain?: string;
  onEntitySelect?: (entityId: string) => void;
  onNavigate?: (entityId: string) => void;
  onCreateRelationship?: (sourceId: string, targetId: string) => void;
}

interface RelatedItem {
  entity: Entity;
  relationship: Relationship;
  distance: number;
}

export const RelationshipSidebar: React.FC<RelationshipSidebarProps> = ({
  contextEntityId,
  contextSubdomain,
  onEntitySelect,
  onNavigate,
  onCreateRelationship
}) => {
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [groupBy, setGroupBy] = useState<'subdomain' | 'type' | 'strength'>('subdomain');

  const service = getRelationshipService();

  // Load related entities
  useEffect(() => {
    if (contextEntityId) {
      loadRelatedEntities();
    } else {
      setRelatedItems([]);
    }
  }, [contextEntityId]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      if (contextEntityId) {
        loadRelatedEntities();
      }
    };

    service.on('relationship_update', handleUpdate);
    service.on('entity_update', handleUpdate);

    return () => {
      service.off('relationship_update', handleUpdate);
      service.off('entity_update', handleUpdate);
    };
  }, [contextEntityId]);

  const loadRelatedEntities = async () => {
    if (!contextEntityId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await service.getRelatedEntities(contextEntityId, 2);

      const items: RelatedItem[] = result.relationships.map(r => ({
        entity: r.relatedEntity,
        relationship: r.relationship,
        distance: 1 // TODO: Calculate actual distance
      }));

      // Sort by relationship strength
      items.sort((a, b) => (b.relationship.strength || 0) - (a.relationship.strength || 0));

      setRelatedItems(items);
    } catch (err) {
      console.error('[RelationshipSidebar] Failed to load related entities:', err);
      setError('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  };

  const handleEntityClick = useCallback((entityId: string) => {
    setSelectedEntity(entityId);
    setShowPreview(true);
    if (onEntitySelect) {
      onEntitySelect(entityId);
    }
  }, [onEntitySelect]);

  const handleNavigate = useCallback((entityId: string) => {
    setShowPreview(false);
    if (onNavigate) {
      onNavigate(entityId);
    }
  }, [onNavigate]);

  const getGroupedItems = (): Record<string, RelatedItem[]> => {
    const grouped: Record<string, RelatedItem[]> = {};

    relatedItems.forEach(item => {
      let key: string;
      switch (groupBy) {
        case 'subdomain':
          key = item.entity.subdomain;
          break;
        case 'type':
          key = item.entity.type;
          break;
        case 'strength':
          const strength = item.relationship.strength || 0;
          key = strength >= 0.7 ? 'Strong' : strength >= 0.4 ? 'Medium' : 'Weak';
          break;
        default:
          key = 'Other';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  };

  const getSubdomainIcon = (subdomain: string): string => {
    switch (subdomain) {
      case 'financial':
        return '💰';
      case 'health':
        return '🏃';
      case 'schedule':
        return '📅';
      case 'relationships':
        return '🔗';
      default:
        return '📄';
    }
  };

  const getStrengthColor = (strength: number): string => {
    if (strength >= 0.7) return '#10b981';
    if (strength >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  if (isCollapsed) {
    return (
      <div className="relationship-sidebar collapsed">
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          <span className="toggle-icon">→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relationship-sidebar">
      <div className="sidebar-header">
        <h2>Relationships</h2>
        <div className="sidebar-actions">
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(true)}
            title="Collapse sidebar"
          >
            <span className="toggle-icon">←</span>
          </button>
        </div>
      </div>

      {!contextEntityId && !contextSubdomain ? (
        <div className="sidebar-empty">
          <span className="empty-icon">🔍</span>
          <p>Select an item to view relationships</p>
        </div>
      ) : (
        <>
          {/* Related Items Section */}
          {contextEntityId && (
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Related Items</h3>
                {relatedItems.length > 0 && (
                  <select
                    className="group-select"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                  >
                    <option value="subdomain">By Domain</option>
                    <option value="type">By Type</option>
                    <option value="strength">By Strength</option>
                  </select>
                )}
              </div>

              {loading ? (
                <div className="section-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading relationships...</span>
                </div>
              ) : error ? (
                <div className="section-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              ) : relatedItems.length === 0 ? (
                <div className="section-empty">
                  <p>No related items found</p>
                </div>
              ) : (
                <div className="related-items-list">
                  {Object.entries(getGroupedItems()).map(([group, items]) => (
                    <div key={group} className="related-group">
                      <h4 className="group-title">{group}</h4>
                      {items.map(item => (
                        <div
                          key={item.entity.id}
                          className="related-item"
                          onClick={() => handleEntityClick(item.entity.id)}
                        >
                          <div className="item-icon">
                            {getSubdomainIcon(item.entity.subdomain)}
                          </div>
                          <div className="item-content">
                            <div className="item-header">
                              <span className="item-label">{item.entity.label}</span>
                              <div
                                className="strength-indicator"
                                style={{
                                  backgroundColor: getStrengthColor(item.relationship.strength || 0)
                                }}
                                title={`Strength: ${((item.relationship.strength || 0) * 100).toFixed(0)}%`}
                              />
                            </div>
                            <div className="item-meta">
                              <span className="item-type">{item.entity.type}</span>
                              <span className="item-relationship">{item.relationship.type}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Insights Section */}
          {contextSubdomain && (
            <div className="sidebar-section">
              <ConnectionInsights
                subdomain={contextSubdomain}
                dateRange={{
                  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  end: new Date()
                }}
              />
            </div>
          )}

          {/* WebSocket Status */}
          <div className="sidebar-footer">
            <div className="connection-status">
              <div
                className={`status-indicator ${service.isWebSocketConnected() ? 'connected' : 'disconnected'}`}
              />
              <span className="status-text">
                {service.isWebSocketConnected() ? 'Live updates active' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Entity Preview Overlay */}
      {showPreview && selectedEntity && (
        <>
          <div className="preview-overlay" onClick={() => setShowPreview(false)} />
          <EntityPreview
            entityId={selectedEntity}
            onNavigate={handleNavigate}
            onClose={() => setShowPreview(false)}
          />
        </>
      )}
    </div>
  );
};
