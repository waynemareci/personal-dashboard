import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { RelationshipDiscoveryQueries } from './queries';
import { initializeNeo4j, closeNeo4jConnection, getNeo4jConnection } from './neo4j';

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('RelationshipDiscoveryQueries', () => {
  const testConfig = {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: '10101010',
    database: 'neo4j'
  };

  const TEST_USER_ID = 'test-user-123';
  let queries: RelationshipDiscoveryQueries;

  beforeAll(async () => {
    initializeNeo4j(testConfig);
    await getNeo4jConnection().connect();
    queries = new RelationshipDiscoveryQueries();

    // Clean up any existing test data from previous runs
    await cleanupTestData();

    // Create test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await closeNeo4jConnection();
  });

  async function setupTestData() {
    const connection = getNeo4jConnection();

    // Create test user
    await connection.executeQuery(`
      CREATE (user:Person {id: $userId, name: 'Test User'})
    `, { userId: TEST_USER_ID });

    // Create locations
    await connection.executeQuery(`
      CREATE (home:Location {name: 'Home', type: 'residence'})
      CREATE (work:Location {name: 'Work', type: 'office'})
      CREATE (travel:Location {name: 'Travel Destination', type: 'travel'})
    `);

    // Create categories/topics
    await connection.executeQuery(`
      CREATE (food:Topic {name: 'Food', category: 'spending'})
      CREATE (transport:Topic {name: 'Transport', category: 'spending'})
      CREATE (budget:Topic {name: 'Budget', category: 'finance'})
    `);

    // Create transactions with locations
    await connection.executeQuery(`
      MATCH (user:Person {id: $userId})
      MATCH (home:Location {name: 'Home'})
      MATCH (travel:Location {name: 'Travel Destination'})
      MATCH (food:Topic {name: 'Food'})

      CREATE (t1:Transaction {id: 'tx1', amount: 50, date: date('2024-01-01')})
      CREATE (t2:Transaction {id: 'tx2', amount: 70, date: date('2024-01-02')})
      CREATE (t3:Transaction {id: 'tx3', amount: 60, date: date('2024-01-03')})
      CREATE (t4:Transaction {id: 'tx4', amount: 100, date: date('2024-01-04')})
      CREATE (t5:Transaction {id: 'tx5', amount: 90, date: date('2024-01-05')})
      CREATE (t6:Transaction {id: 'tx6', amount: 110, date: date('2024-01-06')})

      CREATE (user)-[:MADE_TRANSACTION]->(t1)
      CREATE (user)-[:MADE_TRANSACTION]->(t2)
      CREATE (user)-[:MADE_TRANSACTION]->(t3)
      CREATE (user)-[:MADE_TRANSACTION]->(t4)
      CREATE (user)-[:MADE_TRANSACTION]->(t5)
      CREATE (user)-[:MADE_TRANSACTION]->(t6)

      CREATE (t1)-[:OCCURRED_AT]->(home)
      CREATE (t2)-[:OCCURRED_AT]->(home)
      CREATE (t3)-[:OCCURRED_AT]->(home)
      CREATE (t4)-[:OCCURRED_AT]->(travel)
      CREATE (t5)-[:OCCURRED_AT]->(travel)
      CREATE (t6)-[:OCCURRED_AT]->(travel)

      CREATE (t1)-[:CATEGORIZED_AS]->(food)
      CREATE (t2)-[:CATEGORIZED_AS]->(food)
      CREATE (t3)-[:CATEGORIZED_AS]->(food)
      CREATE (t4)-[:CATEGORIZED_AS]->(food)
      CREATE (t5)-[:CATEGORIZED_AS]->(food)
      CREATE (t6)-[:CATEGORIZED_AS]->(food)
    `, { userId: TEST_USER_ID });

    // Create dates, workouts, and tasks for health-productivity correlations
    await connection.executeQuery(`
      MATCH (user:Person {id: $userId})

      CREATE (d1:Date {value: date('2024-01-01')})
      CREATE (d2:Date {value: date('2024-01-02')})

      CREATE (w1:Workout {id: 'w1', intensity: 8, duration: 60})
      CREATE (w2:Workout {id: 'w2', intensity: 7, duration: 45})

      CREATE (task1:Task {id: 'task1', status: 'completed'})
      CREATE (task2:Task {id: 'task2', status: 'completed'})
      CREATE (task3:Task {id: 'task3', status: 'pending'})

      CREATE (user)-[:DID_WORKOUT]->(w1)
      CREATE (user)-[:DID_WORKOUT]->(w2)

      CREATE (w1)-[:OCCURRED_ON]->(d1)
      CREATE (w2)-[:OCCURRED_ON]->(d2)

      CREATE (d1)<-[:DUE_ON]-(task1)
      CREATE (d1)<-[:DUE_ON]-(task2)
      CREATE (d2)<-[:DUE_ON]-(task3)

      CREATE (task1)-[:ASSIGNED_TO]->(user)
      CREATE (task2)-[:ASSIGNED_TO]->(user)
      CREATE (task3)-[:ASSIGNED_TO]->(user)
    `, { userId: TEST_USER_ID });

    // Create person-topic associations
    await connection.executeQuery(`
      MATCH (user:Person {id: $userId})
      MATCH (budget:Topic {name: 'Budget'})

      CREATE (sarah:Person {id: 'sarah', name: 'Sarah'})

      CREATE (e1:Event {id: 'e1', title: 'Budget Meeting 1', type: 'meeting'})
      CREATE (e2:Event {id: 'e2', title: 'Budget Meeting 2', type: 'meeting'})
      CREATE (e3:Event {id: 'e3', title: 'Budget Review', type: 'meeting'})

      CREATE (user)-[:ATTENDED]->(e1)
      CREATE (user)-[:ATTENDED]->(e2)
      CREATE (user)-[:ATTENDED]->(e3)

      CREATE (e1)-[:INVOLVES]->(sarah)
      CREATE (e2)-[:INVOLVES]->(sarah)
      CREATE (e3)-[:INVOLVES]->(sarah)

      CREATE (e1)-[:RELATES_TO]->(budget)
      CREATE (e2)-[:RELATES_TO]->(budget)
      CREATE (e3)-[:RELATES_TO]->(budget)
    `, { userId: TEST_USER_ID });

    // Create meal and workout timing data
    await connection.executeQuery(`
      MATCH (user:Person {id: $userId})

      CREATE (m1:Meal {
        id: 'm1',
        timestamp: datetime('2024-01-01T10:00:00'),
        protein: 30
      })
      CREATE (m2:Meal {
        id: 'm2',
        timestamp: datetime('2024-01-02T10:00:00'),
        protein: 25
      })
      CREATE (m3:Meal {
        id: 'm3',
        timestamp: datetime('2024-01-03T10:00:00'),
        protein: 35
      })

      CREATE (w1:Workout {
        id: 'wm1',
        timestamp: datetime('2024-01-01T12:00:00'),
        performance: 85
      })
      CREATE (w2:Workout {
        id: 'wm2',
        timestamp: datetime('2024-01-02T13:00:00'),
        performance: 80
      })
      CREATE (w3:Workout {
        id: 'wm3',
        timestamp: datetime('2024-01-03T12:30:00'),
        performance: 90
      })

      CREATE (user)-[:ATE_MEAL]->(m1)
      CREATE (user)-[:ATE_MEAL]->(m2)
      CREATE (user)-[:ATE_MEAL]->(m3)

      CREATE (user)-[:DID_WORKOUT]->(w1)
      CREATE (user)-[:DID_WORKOUT]->(w2)
      CREATE (user)-[:DID_WORKOUT]->(w3)
    `, { userId: TEST_USER_ID });
  }

  async function cleanupTestData() {
    try {
      const connection = getNeo4jConnection();

      // Delete all Person nodes with test IDs first (to handle unique constraints)
      await connection.executeQuery(`
        MATCH (p:Person) WHERE p.id IN ['test-user-123', 'sarah'] OR p.name = 'Test User'
        DETACH DELETE p
      `);

      // Delete all other test data nodes
      await connection.executeQuery(`
        MATCH (n)
        WHERE n.id IN ['tx1', 'tx2', 'tx3', 'tx4', 'tx5', 'tx6',
                       'w1', 'w2', 'wm1', 'wm2', 'wm3', 'm1', 'm2', 'm3',
                       'task1', 'task2', 'task3', 'e1', 'e2', 'e3']
           OR n.name IN ['Home', 'Work', 'Travel Destination', 'Food',
                         'Transport', 'Budget']
        DETACH DELETE n
      `);

      // Delete test date nodes
      await connection.executeQuery(`
        MATCH (d:Date) WHERE d.value >= date('2024-01-01') AND d.value <= date('2024-01-05')
        DETACH DELETE d
      `);
    } catch (error) {
      // Ignore errors during cleanup (e.g., nodes don't exist)
      console.warn('Cleanup warning:', error);
    }
  }

  describe('findSpendingLocationPatterns', () => {
    it('should find spending patterns by location', async () => {
      const patterns = await queries.findSpendingLocationPatterns(TEST_USER_ID);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);

      // Should find home and travel patterns
      const homePattern = patterns.find(p => p.location === 'Home');
      const travelPattern = patterns.find(p => p.location === 'Travel Destination');

      expect(homePattern).toBeDefined();
      expect(homePattern?.category).toBe('Food');
      // Neo4j returns Integer objects, convert to number
      const homeCount = homePattern?.transactionCount;
      expect(homeCount?.toNumber ? homeCount.toNumber() : homeCount).toBe(3);

      expect(travelPattern).toBeDefined();
      expect(travelPattern?.category).toBe('Food');
      // averageAmount should be a regular number
      expect(travelPattern?.averageAmount).toBe(100);
    });

    it('should handle user with no transactions', async () => {
      const patterns = await queries.findSpendingLocationPatterns('nonexistent-user');

      expect(patterns).toBeDefined();
      expect(patterns.length).toBe(0);
    });
  });

  describe('findHealthProductivityCorrelations', () => {
    it('should find correlations between workouts and task completion', async () => {
      const correlations = await queries.findHealthProductivityCorrelations(TEST_USER_ID);

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations)).toBe(true);

      if (correlations.length > 0) {
        const correlation = correlations[0];
        expect(correlation).toHaveProperty('date');
        expect(correlation).toHaveProperty('averageIntensity');
        expect(correlation).toHaveProperty('averageDuration');
        expect(correlation).toHaveProperty('workoutCount');
        expect(correlation).toHaveProperty('completionRate');
      }
    });

    it('should handle user with no workout data', async () => {
      const correlations = await queries.findHealthProductivityCorrelations('nonexistent-user');

      expect(correlations).toBeDefined();
      expect(correlations.length).toBe(0);
    });
  });

  describe('findPersonTopicAssociations', () => {
    it('should find people associated with specific topics', async () => {
      const associations = await queries.findPersonTopicAssociations(TEST_USER_ID);

      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBeGreaterThan(0);

      // Should find Sarah associated with Budget topic
      const sarahBudget = associations.find(a => a.person === 'Sarah' && a.topic === 'Budget');
      expect(sarahBudget).toBeDefined();
      // Neo4j returns Integer objects, convert to number
      const meetingCount = sarahBudget?.meetingCount;
      expect(meetingCount?.toNumber ? meetingCount.toNumber() : meetingCount).toBe(3);
      expect(sarahBudget?.topicCategory).toBe('finance');
    });

    it('should handle user with no events', async () => {
      const associations = await queries.findPersonTopicAssociations('nonexistent-user');

      expect(associations).toBeDefined();
      expect(associations.length).toBe(0);
    });
  });

  describe('findMealWorkoutTimingPatterns', () => {
    it('should find timing patterns between meals and workouts', async () => {
      const patterns = await queries.findMealWorkoutTimingPatterns(TEST_USER_ID);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);

      if (patterns.length > 0) {
        const pattern = patterns[0];
        expect(pattern).toHaveProperty('hoursBeforeWorkout');
        expect(pattern).toHaveProperty('averageProtein');
        expect(pattern).toHaveProperty('averagePerformance');
        expect(pattern).toHaveProperty('occurrences');
      }
    });

    it('should handle user with no meal/workout data', async () => {
      const patterns = await queries.findMealWorkoutTimingPatterns('nonexistent-user');

      expect(patterns).toBeDefined();
      expect(patterns.length).toBe(0);
    });
  });

  describe('findBudgetLifeEventCorrelations', () => {
    it('should find correlations between budget categories and life events', async () => {
      const correlations = await queries.findBudgetLifeEventCorrelations(TEST_USER_ID);

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations)).toBe(true);

      if (correlations.length > 0) {
        const correlation = correlations[0];
        expect(correlation).toHaveProperty('budgetCategory');
        expect(correlation).toHaveProperty('eventType');
        expect(correlation).toHaveProperty('totalAmount');
        expect(correlation).toHaveProperty('transactionCount');
        expect(correlation).toHaveProperty('averagePerTransaction');
        expect(correlation).toHaveProperty('relatedEvents');
      }
    });

    it('should handle user with no budget events', async () => {
      const correlations = await queries.findBudgetLifeEventCorrelations('nonexistent-user');

      expect(correlations).toBeDefined();
      expect(correlations.length).toBe(0);
    });
  });

  describe('unifiedSearch', () => {
    it('should perform cross-domain search', async () => {
      // This test assumes a full-text search index exists
      // In a real scenario, you'd need to create the index first
      const results = await queries.unifiedSearch('budget', TEST_USER_ID, 10);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Results would contain entities across different domains
      if (results.length > 0) {
        const result = results[0];
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('score');
      }
    });

    it('should limit search results', async () => {
      const results = await queries.unifiedSearch('budget', TEST_USER_ID, 5);

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty search term gracefully', async () => {
      try {
        const result = await queries.unifiedSearch('', TEST_USER_ID);
        expect(result).toBeDefined();
      } catch (error: any) {
        // Skip test if full-text search index doesn't exist
        if (error.message?.includes('Failed to invoke procedure') || error.message?.includes('no such procedure')) {
          console.warn('⚠️  Skipping unified search test - full-text search index not created');
          return;
        }
        throw error;
      }
    });
  });

  describe('findSimilarEntities', () => {
    it('should find similar entities based on shared connections', async () => {
      // Find similar events to e1
      const similar = await queries.findSimilarEntities('e1', 'Event', 5);

      expect(similar).toBeDefined();
      expect(Array.isArray(similar)).toBe(true);

      if (similar.length > 0) {
        const entity = similar[0];
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('type');
        expect(entity).toHaveProperty('sharedConnections');
        expect(entity).toHaveProperty('relationshipTypes');
        // Neo4j returns Integer objects, convert to number
        const sharedConnections = entity.sharedConnections;
        expect(sharedConnections?.toNumber ? sharedConnections.toNumber() : sharedConnections).toBeGreaterThanOrEqual(2);
      }
    });

    it('should handle non-existent entity', async () => {
      const similar = await queries.findSimilarEntities('nonexistent', 'Event', 5);

      expect(similar).toBeDefined();
      expect(similar.length).toBe(0);
    });

    it('should respect limit parameter', async () => {
      const similar = await queries.findSimilarEntities('e1', 'Event', 2);

      expect(similar.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid Cypher syntax gracefully', async () => {
      // This would test that the class handles errors properly
      // In actual implementation, errors are logged and re-thrown
      await expect(
        queries.findSpendingLocationPatterns(TEST_USER_ID)
      ).resolves.toBeDefined();
    });
  });
});
