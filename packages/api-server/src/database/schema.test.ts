import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchemaManager, BASE_SCHEMA } from './schema';

// Mock the Neo4j connection
const mockConnection = {
  executeQuery: vi.fn().mockResolvedValue({ records: [] })
};

vi.mock('./neo4j', () => ({
  getNeo4jConnection: vi.fn(() => mockConnection)
}));

describe('Schema Management', () => {
  let schemaManager: SchemaManager;

  beforeEach(() => {
    vi.clearAllMocks();
    schemaManager = new SchemaManager();
  });

  describe('BASE_SCHEMA', () => {
    it('should contain all required node types', () => {
      const expectedTypes = [
        'Entity', 'Person', 'Location', 'Topic', 'Date',
        'Transaction', 'Account', 'Task', 'Event', 'Meal', 'Workout'
      ];

      const schemaNames = BASE_SCHEMA.map(schema => schema.name);
      expectedTypes.forEach(type => {
        expect(schemaNames).toContain(type);
      });
    });

    it('should have constraints for all schemas', () => {
      BASE_SCHEMA.forEach(schema => {
        expect(schema.constraints).toBeDefined();
        expect(schema.constraints.length).toBeGreaterThan(0);
        expect(schema.description).toBeDefined();
        expect(schema.description.length).toBeGreaterThan(0);
      });
    });

    it('should have indexes for all schemas', () => {
      BASE_SCHEMA.forEach(schema => {
        expect(schema.indexes).toBeDefined();
        expect(schema.indexes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SchemaManager', () => {
    it('should initialize schema successfully', async () => {
      mockConnection.executeQuery.mockResolvedValue({ records: [] });

      await schemaManager.initializeSchema();

      // Verify that executeQuery was called for each constraint and index
      const totalQueries = BASE_SCHEMA.reduce((total, schema) => 
        total + schema.constraints.length + schema.indexes.length, 0
      );
      
      expect(mockConnection.executeQuery).toHaveBeenCalledTimes(totalQueries);
    });

    it('should handle existing constraints gracefully', async () => {
      const existsError = new Error('already exists');
      mockConnection.executeQuery
        .mockRejectedValueOnce(existsError)
        .mockResolvedValue({ records: [] });

      // The schema manager catches "already exists" errors, so this should not throw
      await expect(schemaManager.initializeSchema()).resolves.toBeUndefined();
    });

    it('should create full-text search index', async () => {
      mockConnection.executeQuery.mockResolvedValue({ records: [] });

      await schemaManager.createFullTextSearchIndex();

      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE FULLTEXT INDEX unified_search_index')
      );
    });

    it('should get schema information', async () => {
      const mockRecords = [
        {
          get: vi.fn()
            .mockReturnValueOnce(['Entity', 'Person'])
            .mockReturnValueOnce(['KNOWS', 'OWNS'])
        }
      ];
      mockConnection.executeQuery.mockResolvedValue({ records: mockRecords });

      const result = await schemaManager.getSchemaInfo();

      expect(result).toHaveLength(1);
      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('CALL db.schema.visualization()')
      );
    });

    it('should get constraints', async () => {
      const mockRecords = [
        { toObject: vi.fn().mockReturnValue({ name: 'entity_id_unique' }) }
      ];
      mockConnection.executeQuery.mockResolvedValue({ records: mockRecords });

      const result = await schemaManager.getConstraints();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'entity_id_unique' });
      expect(mockConnection.executeQuery).toHaveBeenCalledWith('SHOW CONSTRAINTS');
    });

    it('should get indexes', async () => {
      const mockRecords = [
        { toObject: vi.fn().mockReturnValue({ name: 'entity_type_idx' }) }
      ];
      mockConnection.executeQuery.mockResolvedValue({ records: mockRecords });

      const result = await schemaManager.getIndexes();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'entity_type_idx' });
      expect(mockConnection.executeQuery).toHaveBeenCalledWith('SHOW INDEXES');
    });
  });
});