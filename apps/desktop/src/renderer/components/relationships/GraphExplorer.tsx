import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getRelationshipService } from '../../services/relationship-service';
import type { GraphData } from '../../services/neo4j-queries';
import { transformToVisNetwork, calculateGraphStats, filterByStrength, getSubgraph } from '../../utils/graph-utils';
import { RelationshipFilter, FilterOptions } from './RelationshipFilter';
import './GraphExplorer.css';

// Type definitions for vis-network (to be installed)
declare global {
  interface Window {
    vis?: any;
  }
}

export interface GraphExplorerProps {
  entityId?: string;
  initialDepth?: number;
  onNodeSelect?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  entityId,
  initialDepth = 2,
  onNodeSelect,
  onNodeDoubleClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [filteredData, setFilteredData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    subdomains: ['financial', 'health', 'schedule'],
    relationshipTypes: [],
    minStrength: 0,
    dateRange: { start: null, end: null },
    depth: initialDepth
  });

  const service = getRelationshipService();

  // Load graph data
  useEffect(() => {
    if (entityId) {
      loadGraphData();
    }
  }, [entityId, filters.depth]);

  // Initialize vis-network
  useEffect(() => {
    if (filteredData && containerRef.current && window.vis) {
      initializeNetwork();
    }
  }, [filteredData]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      if (entityId) {
        loadGraphData();
      }
    };

    service.on('relationship_update', handleUpdate);
    service.on('entity_update', handleUpdate);

    return () => {
      service.off('relationship_update', handleUpdate);
      service.off('entity_update', handleUpdate);
    };
  }, [entityId]);

  const loadGraphData = async () => {
    if (!entityId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getGraphData(
        entityId,
        filters.depth,
        filters.relationshipTypes.length > 0 ? filters.relationshipTypes : undefined
      );

      setGraphData(data);
      applyFilters(data);

      // Calculate stats
      const graphStats = calculateGraphStats(data);
      setStats(graphStats);
    } catch (err) {
      console.error('[GraphExplorer] Failed to load graph data:', err);
      setError('Failed to load graph visualization');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: GraphData) => {
    let filtered = data;

    // Apply strength filter
    if (filters.minStrength > 0) {
      filtered = filterByStrength(filtered, filters.minStrength);
    }

    // TODO: Apply subdomain and date range filters

    setFilteredData(filtered);
  };

  const initializeNetwork = () => {
    if (!containerRef.current || !filteredData || !window.vis) return;

    // Transform data to vis-network format
    const { nodes, edges } = transformToVisNetwork(filteredData);

    // Configure vis-network options
    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          size: 14,
          color: '#ffffff',
          face: 'Arial'
        },
        borderWidth: 2,
        borderWidthSelected: 4
      },
      edges: {
        width: 2,
        color: { inherit: false },
        smooth: {
          type: 'continuous',
          roundness: 0.5
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5
          }
        }
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.95,
          avoidOverlap: 0.5
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        navigationButtons: true,
        keyboard: true,
        zoomView: true,
        dragView: true
      }
    };

    // Destroy existing network
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    // Create new network
    networkRef.current = new window.vis.Network(
      containerRef.current,
      { nodes, edges },
      options
    );

    // Set up event listeners
    networkRef.current.on('selectNode', (params: any) => {
      const nodeId = params.nodes[0];
      setSelectedNode(nodeId);
      if (onNodeSelect) {
        onNodeSelect(nodeId);
      }
    });

    networkRef.current.on('deselectNode', () => {
      setSelectedNode(null);
    });

    networkRef.current.on('doubleClick', (params: any) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        if (onNodeDoubleClick) {
          onNodeDoubleClick(nodeId);
        }
      }
    });

    networkRef.current.on('stabilizationIterationsDone', () => {
      networkRef.current.setOptions({ physics: false });
    });
  };

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    if (graphData) {
      applyFilters(graphData);
    }
  }, [graphData]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale / 1.2 });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: true });
    }
  };

  const handleTogglePhysics = () => {
    if (networkRef.current) {
      const current = networkRef.current.physics.options.enabled;
      networkRef.current.setOptions({ physics: { enabled: !current } });
    }
  };

  const handleFocusNode = (nodeId: string) => {
    if (networkRef.current && graphData) {
      // Get subgraph around the node
      const subgraph = getSubgraph(graphData, nodeId, 1);
      const nodeIds = subgraph.nodes.map(n => n.id);
      networkRef.current.selectNodes([nodeId]);
      networkRef.current.focus(nodeId, {
        scale: 1.5,
        animation: true
      });
    }
  };

  if (!window.vis) {
    return (
      <div className="graph-explorer">
        <div className="graph-error">
          <span className="error-icon">⚠️</span>
          <h3>Visualization Library Not Loaded</h3>
          <p>The vis-network library is required for graph visualization.</p>
          <p className="error-hint">Please install vis-network to enable this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-explorer">
      {/* Controls Bar */}
      <div className="graph-controls">
        <div className="control-group">
          <button
            className="control-button"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <span className="control-icon">+</span>
          </button>
          <button
            className="control-button"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <span className="control-icon">−</span>
          </button>
          <button
            className="control-button"
            onClick={handleFit}
            title="Fit to View"
          >
            <span className="control-icon">⊡</span>
          </button>
          <button
            className="control-button"
            onClick={handleTogglePhysics}
            title="Toggle Physics"
          >
            <span className="control-icon">⚡</span>
          </button>
        </div>

        <div className="control-group">
          <button
            className="control-button"
            onClick={() => setShowStats(!showStats)}
            title="Toggle Stats"
          >
            <span className="control-icon">📊</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="graph-filter-panel">
        <RelationshipFilter
          onFilterChange={handleFilterChange}
          availableTypes={stats?.edgesByType ? Object.keys(stats.edgesByType) : []}
          initialFilters={filters}
        />
      </div>

      {/* Graph Container */}
      <div className="graph-container-wrapper">
        {loading && (
          <div className="graph-loading">
            <div className="loading-spinner"></div>
            <span>Loading graph...</span>
          </div>
        )}

        {error && !loading && (
          <div className="graph-error">
            <span className="error-icon">⚠️</span>
            <h3>Failed to Load Graph</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={loadGraphData}>
              Retry
            </button>
          </div>
        )}

        {!entityId && !loading && !error && (
          <div className="graph-empty">
            <span className="empty-icon">🌐</span>
            <h3>No Entity Selected</h3>
            <p>Select an entity to visualize its relationship graph</p>
          </div>
        )}

        <div ref={containerRef} className="graph-container" />
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <div className="graph-stats-panel">
          <h4>Graph Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Nodes</span>
              <span className="stat-value">{stats.nodeCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Connections</span>
              <span className="stat-value">{stats.edgeCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Strength</span>
              <span className="stat-value">{(stats.averageStrength * 100).toFixed(0)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Density</span>
              <span className="stat-value">{(stats.density * 100).toFixed(1)}%</span>
            </div>
          </div>

          {stats.mostConnectedNodes && stats.mostConnectedNodes.length > 0 && (
            <div className="top-nodes">
              <h5>Most Connected</h5>
              {stats.mostConnectedNodes.slice(0, 3).map((node: any) => (
                <div
                  key={node.id}
                  className="top-node-item"
                  onClick={() => handleFocusNode(node.id)}
                >
                  <span className="node-label">{node.label}</span>
                  <span className="node-degree">{node.degree}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
