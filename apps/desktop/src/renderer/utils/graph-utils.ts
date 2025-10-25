/**
 * Graph Data Transformation Utilities
 *
 * Utilities for transforming Neo4j data into vis-network compatible format
 * and performing graph analysis operations.
 */

import type { GraphData, Entity, Relationship } from '../services/neo4j-queries';

export interface VisNode {
  id: string;
  label: string;
  title?: string;
  group?: string;
  color?: string | { background: string; border: string; highlight: { background: string; border: string } };
  shape?: 'dot' | 'circle' | 'database' | 'box' | 'diamond' | 'star' | 'triangle';
  size?: number;
  font?: { size: number; color: string };
  borderWidth?: number;
  borderWidthSelected?: number;
  shadow?: boolean;
  x?: number;
  y?: number;
  fixed?: boolean | { x: boolean; y: boolean };
}

export interface VisEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  title?: string;
  color?: string | { color: string; highlight: string; hover: string };
  width?: number;
  arrows?: string | { to: boolean; from: boolean };
  dashes?: boolean;
  smooth?: boolean | { type: string };
  font?: { size: number; align: string };
}

export interface GraphTheme {
  financial: { color: string; shape: string };
  health: { color: string; shape: string };
  schedule: { color: string; shape: string };
  relationships: { color: string; shape: string };
  default: { color: string; shape: string };
}

/**
 * Default color scheme for subdomains
 */
export const DEFAULT_THEME: GraphTheme = {
  financial: { color: '#10b981', shape: 'circle' },
  health: { color: '#ef4444', shape: 'diamond' },
  schedule: { color: '#3b82f6', shape: 'box' },
  relationships: { color: '#8b5cf6', shape: 'star' },
  default: { color: '#6b7280', shape: 'dot' }
};

/**
 * Transform GraphData to vis-network format
 */
export function transformToVisNetwork(
  graphData: GraphData,
  theme: GraphTheme = DEFAULT_THEME,
  options?: {
    showLabels?: boolean;
    showStrength?: boolean;
    nodeSize?: number;
  }
): { nodes: VisNode[]; edges: VisEdge[] } {
  const { showLabels = true, showStrength = true, nodeSize = 25 } = options || {};

  // Transform nodes
  const nodes: VisNode[] = graphData.nodes.map(node => {
    const subdomainTheme = theme[node.subdomain as keyof GraphTheme] || theme.default;

    return {
      id: node.id,
      label: showLabels ? node.label : '',
      title: createNodeTooltip(node),
      group: node.subdomain,
      color: {
        background: subdomainTheme.color,
        border: darkenColor(subdomainTheme.color, 20),
        highlight: {
          background: lightenColor(subdomainTheme.color, 20),
          border: subdomainTheme.color
        }
      },
      shape: subdomainTheme.shape as any,
      size: nodeSize,
      font: { size: 14, color: '#ffffff' },
      borderWidth: 2,
      borderWidthSelected: 4,
      shadow: true
    };
  });

  // Transform edges
  const edges: VisEdge[] = graphData.edges.map(edge => {
    const strength = edge.strength || 0.5;
    const width = 1 + (strength * 4); // Scale width based on strength

    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: showStrength && edge.label ? `${edge.label} (${(strength * 100).toFixed(0)}%)` : edge.label,
      title: createEdgeTooltip(edge),
      color: {
        color: getStrengthColor(strength),
        highlight: lightenColor(getStrengthColor(strength), 30),
        hover: lightenColor(getStrengthColor(strength), 20)
      },
      width,
      arrows: 'to',
      smooth: { type: 'continuous' },
      font: { size: 12, align: 'middle' }
    };
  });

  return { nodes, edges };
}

/**
 * Create HTML tooltip for node hover
 */
function createNodeTooltip(node: GraphData['nodes'][0]): string {
  const props = Object.entries(node.properties || {})
    .slice(0, 5) // Limit to 5 properties
    .map(([key, value]) => `<b>${key}:</b> ${formatValue(value)}`)
    .join('<br>');

  return `
    <div style="padding: 8px;">
      <b>${node.label}</b><br>
      <span style="color: #888;">Type: ${node.type}</span><br>
      <span style="color: #888;">Domain: ${node.subdomain}</span><br>
      ${props ? `<hr style="margin: 4px 0;">${props}` : ''}
    </div>
  `;
}

/**
 * Create HTML tooltip for edge hover
 */
function createEdgeTooltip(edge: GraphData['edges'][0]): string {
  const strength = edge.strength || 0.5;
  return `
    <div style="padding: 8px;">
      <b>${edge.type}</b><br>
      <span style="color: #888;">Strength: ${(strength * 100).toFixed(0)}%</span>
    </div>
  `;
}

/**
 * Format value for display in tooltip
 */
function formatValue(value: any): string {
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 47) + '...';
  }
  return String(value);
}

/**
 * Get color based on relationship strength
 */
export function getStrengthColor(strength: number): string {
  if (strength >= 0.8) return '#10b981'; // Strong - green
  if (strength >= 0.6) return '#3b82f6'; // Medium - blue
  if (strength >= 0.4) return '#f59e0b'; // Weak - orange
  return '#ef4444'; // Very weak - red
}

/**
 * Darken a hex color by percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Lighten a hex color by percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Calculate graph statistics
 */
export function calculateGraphStats(graphData: GraphData) {
  const nodeCount = graphData.nodes.length;
  const edgeCount = graphData.edges.length;

  // Count nodes by subdomain
  const nodesBySubdomain = graphData.nodes.reduce((acc, node) => {
    acc[node.subdomain] = (acc[node.subdomain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count edges by type
  const edgesByType = graphData.edges.reduce((acc, edge) => {
    acc[edge.type] = (acc[edge.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average strength
  const averageStrength = graphData.edges.length > 0
    ? graphData.edges.reduce((sum, edge) => sum + (edge.strength || 0), 0) / graphData.edges.length
    : 0;

  // Find most connected nodes
  const nodeDegrees = new Map<string, number>();
  graphData.edges.forEach(edge => {
    nodeDegrees.set(edge.from, (nodeDegrees.get(edge.from) || 0) + 1);
    nodeDegrees.set(edge.to, (nodeDegrees.get(edge.to) || 0) + 1);
  });

  const mostConnectedNodes = Array.from(nodeDegrees.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, degree]) => {
      const node = graphData.nodes.find(n => n.id === id);
      return { id, label: node?.label || id, degree };
    });

  return {
    nodeCount,
    edgeCount,
    nodesBySubdomain,
    edgesByType,
    averageStrength,
    mostConnectedNodes,
    density: nodeCount > 1 ? edgeCount / (nodeCount * (nodeCount - 1) / 2) : 0
  };
}

/**
 * Filter graph data by date range
 */
export function filterByDateRange(
  graphData: GraphData,
  startDate: Date,
  endDate: Date
): GraphData {
  const filteredNodes = graphData.nodes.filter(node => {
    const nodeDate = node.properties?.timestamp
      ? new Date(node.properties.timestamp)
      : null;

    return !nodeDate || (nodeDate >= startDate && nodeDate <= endDate);
  });

  const nodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = graphData.edges.filter(
    edge => nodeIds.has(edge.from) && nodeIds.has(edge.to)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Filter graph data by subdomain
 */
export function filterBySubdomain(
  graphData: GraphData,
  subdomains: string[]
): GraphData {
  const filteredNodes = graphData.nodes.filter(node =>
    subdomains.includes(node.subdomain)
  );

  const nodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = graphData.edges.filter(
    edge => nodeIds.has(edge.from) && nodeIds.has(edge.to)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Filter graph data by relationship type
 */
export function filterByRelationshipType(
  graphData: GraphData,
  types: string[]
): GraphData {
  const filteredEdges = graphData.edges.filter(edge =>
    types.includes(edge.type)
  );

  // Keep only nodes that are connected by filtered edges
  const connectedNodeIds = new Set<string>();
  filteredEdges.forEach(edge => {
    connectedNodeIds.add(edge.from);
    connectedNodeIds.add(edge.to);
  });

  const filteredNodes = graphData.nodes.filter(node =>
    connectedNodeIds.has(node.id)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Filter graph data by minimum strength
 */
export function filterByStrength(
  graphData: GraphData,
  minStrength: number
): GraphData {
  const filteredEdges = graphData.edges.filter(
    edge => (edge.strength || 0) >= minStrength
  );

  // Keep only nodes that are connected by filtered edges
  const connectedNodeIds = new Set<string>();
  filteredEdges.forEach(edge => {
    connectedNodeIds.add(edge.from);
    connectedNodeIds.add(edge.to);
  });

  const filteredNodes = graphData.nodes.filter(node =>
    connectedNodeIds.has(node.id)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Find path between two nodes
 */
export function findPath(
  graphData: GraphData,
  sourceId: string,
  targetId: string
): string[] | null {
  // Simple BFS to find shortest path
  const visited = new Set<string>();
  const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  graphData.edges.forEach(edge => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from)!.push(edge.to);
    adjacency.get(edge.to)!.push(edge.from); // Undirected
  });

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    if (id === targetId) {
      return path;
    }

    if (visited.has(id)) continue;
    visited.add(id);

    const neighbors = adjacency.get(id) || [];
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, path: [...path, neighborId] });
      }
    });
  }

  return null; // No path found
}

/**
 * Get subgraph around a node
 */
export function getSubgraph(
  graphData: GraphData,
  centerId: string,
  depth: number
): GraphData {
  const includedNodes = new Set<string>([centerId]);
  const includedEdges: GraphData['edges'] = [];

  // BFS to find nodes within depth
  let currentLevel = new Set([centerId]);
  for (let d = 0; d < depth; d++) {
    const nextLevel = new Set<string>();
    graphData.edges.forEach(edge => {
      if (currentLevel.has(edge.from)) {
        nextLevel.add(edge.to);
        includedNodes.add(edge.to);
        includedEdges.push(edge);
      }
      if (currentLevel.has(edge.to)) {
        nextLevel.add(edge.from);
        includedNodes.add(edge.from);
        includedEdges.push(edge);
      }
    });
    currentLevel = nextLevel;
  }

  return {
    nodes: graphData.nodes.filter(n => includedNodes.has(n.id)),
    edges: includedEdges
  };
}
