import React, { useState } from 'react';
import { getRelationshipService } from '../../services/relationship-service';
import './RelationshipCreator.css';

export interface RelationshipCreatorProps {
  sourceEntityId?: string;
  sourceEntityLabel?: string;
  onSuccess?: (relationshipId: string) => void;
  onCancel?: () => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'RELATED_TO', label: 'Related To', description: 'General relationship' },
  { value: 'CAUSES', label: 'Causes', description: 'One entity causes another' },
  { value: 'INFLUENCED_BY', label: 'Influenced By', description: 'One entity influences another' },
  { value: 'OCCURS_WITH', label: 'Occurs With', description: 'Entities occur together' },
  { value: 'PRECEDED_BY', label: 'Preceded By', description: 'Temporal sequence' },
  { value: 'FOLLOWED_BY', label: 'Followed By', description: 'Temporal sequence' },
  { value: 'PART_OF', label: 'Part Of', description: 'Hierarchical relationship' },
  { value: 'SIMILAR_TO', label: 'Similar To', description: 'Similarity relationship' }
];

export const RelationshipCreator: React.FC<RelationshipCreatorProps> = ({
  sourceEntityId,
  sourceEntityLabel,
  onSuccess,
  onCancel
}) => {
  const [targetEntityId, setTargetEntityId] = useState('');
  const [relationshipType, setRelationshipType] = useState('RELATED_TO');
  const [strength, setStrength] = useState(0.5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const service = getRelationshipService();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const apiUrl = window.api?.store?.get('apiUrl') || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/entities/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (err) {
      console.error('[RelationshipCreator] Search failed:', err);
      setError('Failed to search entities');
    }
  };

  const handleSelectEntity = (entityId: string, label: string) => {
    setTargetEntityId(entityId);
    setSearchQuery(label);
    setSearchResults([]);
  };

  const handleCreate = async () => {
    if (!sourceEntityId || !targetEntityId) {
      setError('Both source and target entities are required');
      return;
    }

    if (sourceEntityId === targetEntityId) {
      setError('Cannot create a relationship between the same entity');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const relationship = await service.createRelationship(
        sourceEntityId,
        targetEntityId,
        relationshipType,
        {
          strength,
          notes: notes.trim() || undefined,
          manual: true
        }
      );

      if (onSuccess) {
        onSuccess(relationship.id);
      }
    } catch (err) {
      console.error('[RelationshipCreator] Failed to create relationship:', err);
      setError('Failed to create relationship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relationship-creator">
      <div className="creator-header">
        <h3>Create Relationship</h3>
        {onCancel && (
          <button className="close-button" onClick={onCancel}>
            ✕
          </button>
        )}
      </div>

      <div className="creator-content">
        {/* Source Entity */}
        <div className="form-section">
          <label className="form-label">From Entity</label>
          <div className="entity-display">
            {sourceEntityLabel || sourceEntityId || 'No entity selected'}
          </div>
        </div>

        {/* Relationship Type */}
        <div className="form-section">
          <label className="form-label">Relationship Type</label>
          <select
            className="form-select"
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
          >
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* Target Entity Search */}
        <div className="form-section">
          <label className="form-label">To Entity</label>
          <div className="search-container">
            <input
              type="text"
              className="form-input"
              placeholder="Search for entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(result => (
                <div
                  key={result.id}
                  className="search-result-item"
                  onClick={() => handleSelectEntity(result.id, result.label)}
                >
                  <span className="result-label">{result.label}</span>
                  <span className="result-type">{result.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strength */}
        <div className="form-section">
          <label className="form-label">Relationship Strength</label>
          <div className="strength-input">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
            />
            <span className="strength-value">{(strength * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Notes */}
        <div className="form-section">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Add any notes about this relationship..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="creator-actions">
        {onCancel && (
          <button className="action-button secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button
          className="action-button primary"
          onClick={handleCreate}
          disabled={loading || !sourceEntityId || !targetEntityId}
        >
          {loading ? 'Creating...' : 'Create Relationship'}
        </button>
      </div>
    </div>
  );
};
