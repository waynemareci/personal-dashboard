import React, { useState } from 'react';
import './RelationshipFilter.css';

export interface FilterOptions {
  subdomains: string[];
  relationshipTypes: string[];
  minStrength: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  depth: number;
}

export interface RelationshipFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableTypes?: string[];
  initialFilters?: Partial<FilterOptions>;
}

const DEFAULT_FILTERS: FilterOptions = {
  subdomains: ['financial', 'health', 'schedule'],
  relationshipTypes: [],
  minStrength: 0,
  dateRange: { start: null, end: null },
  depth: 2
};

export const RelationshipFilter: React.FC<RelationshipFilterProps> = ({
  onFilterChange,
  availableTypes = [],
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubdomainToggle = (subdomain: string) => {
    const newSubdomains = filters.subdomains.includes(subdomain)
      ? filters.subdomains.filter(s => s !== subdomain)
      : [...filters.subdomains, subdomain];

    const newFilters = { ...filters, subdomains: newSubdomains };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.relationshipTypes.includes(type)
      ? filters.relationshipTypes.filter(t => t !== type)
      : [...filters.relationshipTypes, type];

    const newFilters = { ...filters, relationshipTypes: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStrengthChange = (value: number) => {
    const newFilters = { ...filters, minStrength: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDepthChange = (value: number) => {
    const newFilters = { ...filters, depth: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    const newFilters = {
      ...filters,
      dateRange: { ...filters.dateRange, [field]: date }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="relationship-filter">
      <div className="filter-header">
        <h3>Filters</h3>
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Subdomain Filter */}
          <div className="filter-section">
            <h4>Subdomains</h4>
            <div className="filter-options">
              {['financial', 'health', 'schedule', 'relationships'].map(subdomain => (
                <label key={subdomain} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.subdomains.includes(subdomain)}
                    onChange={() => handleSubdomainToggle(subdomain)}
                  />
                  <span className={`subdomain-label ${subdomain}`}>
                    {subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Relationship Type Filter */}
          {availableTypes.length > 0 && (
            <div className="filter-section">
              <h4>Relationship Types</h4>
              <div className="filter-options">
                {availableTypes.map(type => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.relationshipTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                    />
                    <span className="type-label">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Strength Filter */}
          <div className="filter-section">
            <h4>Minimum Strength</h4>
            <div className="filter-slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.minStrength}
                onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
              />
              <span className="slider-value">{(filters.minStrength * 100).toFixed(0)}%</span>
            </div>
            <div className="strength-legend">
              <span className="legend-item weak">Weak</span>
              <span className="legend-item medium">Medium</span>
              <span className="legend-item strong">Strong</span>
            </div>
          </div>

          {/* Depth Filter */}
          <div className="filter-section">
            <h4>Graph Depth</h4>
            <div className="filter-slider">
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={filters.depth}
                onChange={(e) => handleDepthChange(parseInt(e.target.value))}
              />
              <span className="slider-value">{filters.depth} {filters.depth === 1 ? 'hop' : 'hops'}</span>
            </div>
            <p className="filter-hint">
              Higher depth shows more distant relationships but may be slower
            </p>
          </div>

          {/* Date Range Filter */}
          <div className="filter-section">
            <h4>Date Range</h4>
            <div className="date-inputs">
              <div className="date-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formatDate(filters.dateRange.start)}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                />
              </div>
              <div className="date-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={formatDate(filters.dateRange.end)}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                />
              </div>
            </div>
            <button
              className="date-preset-button"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                const newFilters = {
                  ...filters,
                  dateRange: { start, end }
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
              }}
            >
              Last 7 Days
            </button>
            <button
              className="date-preset-button"
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                const newFilters = {
                  ...filters,
                  dateRange: { start, end }
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
              }}
            >
              Last 30 Days
            </button>
          </div>

          {/* Reset Button */}
          <div className="filter-actions">
            <button className="reset-button" onClick={handleReset}>
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
