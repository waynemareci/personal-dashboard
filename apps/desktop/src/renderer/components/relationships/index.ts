/**
 * Relationship Discovery Components
 *
 * A comprehensive system for discovering, visualizing, and managing
 * cross-domain relationships powered by Neo4j.
 *
 * Features:
 * - Interactive graph visualization with vis-network
 * - Real-time relationship updates via WebSocket
 * - Advanced filtering and search capabilities
 * - Connection insights and pattern analysis
 * - Manual relationship creation
 * - Entity preview on hover
 *
 * Usage:
 * ```tsx
 * import { RelationshipSidebar, GraphExplorer } from './components/relationships';
 *
 * <RelationshipSidebar
 *   contextEntityId="entity-123"
 *   onNavigate={(entityId) => console.log('Navigate to:', entityId)}
 * />
 *
 * <GraphExplorer
 *   entityId="entity-123"
 *   initialDepth={2}
 *   onNodeSelect={(nodeId) => console.log('Selected:', nodeId)}
 * />
 * ```
 */

// Main Components
export { RelationshipSidebar } from './RelationshipSidebar';
export type { RelationshipSidebarProps } from './RelationshipSidebar';

export { GraphExplorer } from './GraphExplorer';
export type { GraphExplorerProps } from './GraphExplorer';

export { ConnectionInsights } from './ConnectionInsights';
export type { ConnectionInsightsProps, Insight } from './ConnectionInsights';

export { RelationshipCreator } from './RelationshipCreator';
export type { RelationshipCreatorProps } from './RelationshipCreator';

// Sub-components
export { EntityPreview } from './EntityPreview';
export type { EntityPreviewProps } from './EntityPreview';

export { RelationshipFilter } from './RelationshipFilter';
export type { RelationshipFilterProps, FilterOptions } from './RelationshipFilter';

// Services and Utilities
export { getRelationshipService, useRelationshipService } from '../../services/relationship-service';
export { RelationshipQueries } from '../../services/neo4j-queries';
export * from '../../utils/graph-utils';

// CSS imports
import './EntityPreview.css';
import './RelationshipFilter.css';
import './ConnectionInsights.css';
import './RelationshipSidebar.css';
import './GraphExplorer.css';
import './RelationshipCreator.css';
