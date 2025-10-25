import React, { useEffect, useState } from 'react';
import type { Entity } from '../../services/neo4j-queries';
import './EntityPreview.css';

export interface EntityPreviewProps {
  entityId: string;
  position?: { x: number; y: number };
  onNavigate?: (entityId: string) => void;
  onClose?: () => void;
}

export const EntityPreview: React.FC<EntityPreviewProps> = ({
  entityId,
  position,
  onNavigate,
  onClose
}) => {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntityDetails();
  }, [entityId]);

  const loadEntityDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = window.api?.store?.get('apiUrl') || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/entities/${entityId}`);

      if (!response.ok) {
        throw new Error('Failed to load entity details');
      }

      const data = await response.json();
      setEntity(data);
    } catch (err) {
      console.error('[EntityPreview] Failed to load entity:', err);
      setError('Failed to load entity details');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (onNavigate && entity) {
      onNavigate(entity.id);
    }
  };

  const formatPropertyValue = (value: any): string => {
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      return new Date(value).toLocaleString();
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
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

  if (loading) {
    return (
      <div
        className="entity-preview"
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        <div className="entity-preview-loading">
          <div className="loading-spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div
        className="entity-preview"
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        <div className="entity-preview-error">
          <span className="error-icon">⚠️</span>
          <span>{error || 'Entity not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="entity-preview"
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      {/* Header */}
      <div className="entity-preview-header">
        <div className="entity-preview-title">
          <span className="entity-icon">{getSubdomainIcon(entity.subdomain)}</span>
          <div>
            <h4>{entity.label}</h4>
            <span className="entity-type">{entity.type}</span>
          </div>
        </div>
        {onClose && (
          <button className="preview-close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Subdomain Badge */}
      <div className="entity-preview-subdomain">
        <span className={`subdomain-badge ${entity.subdomain}`}>
          {entity.subdomain}
        </span>
        {entity.timestamp && (
          <span className="entity-timestamp">
            {new Date(entity.timestamp).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Properties */}
      {entity.properties && Object.keys(entity.properties).length > 0 && (
        <div className="entity-preview-properties">
          <h5>Details</h5>
          <div className="properties-list">
            {Object.entries(entity.properties)
              .filter(([key]) => !['id', 'timestamp', 'createdAt', 'updatedAt'].includes(key))
              .slice(0, 6) // Limit to 6 properties
              .map(([key, value]) => (
                <div key={key} className="property-item">
                  <span className="property-key">{key}:</span>
                  <span className="property-value">{formatPropertyValue(value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="entity-preview-actions">
        {onNavigate && (
          <button className="preview-action-button primary" onClick={handleNavigate}>
            View Details
          </button>
        )}
        <button
          className="preview-action-button secondary"
          onClick={() => {
            navigator.clipboard.writeText(entity.id);
          }}
        >
          Copy ID
        </button>
      </div>
    </div>
  );
};
