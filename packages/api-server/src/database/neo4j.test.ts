import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Neo4jConnection, initializeNeo4j, getNeo4jConnection, closeNeo4jConnection } from './neo4j';
import { Driver, Session } from 'neo4j-driver';

// Note: Not mocking logger for integration tests - we want real output

describe('Neo4jConnection', () => {
  const testConfig = {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: '10101010',
    database: 'neo4j'
  };

  let connection: Neo4jConnection;

  beforeEach(() => {
    connection = new Neo4jConnection(testConfig);
  });

  afterEach(async () => {
    await connection.close();
  });

  describe('connect', () => {
    it('should connect to Neo4j successfully', async () => {
      await connection.connect();

      expect(connection.isConnected()).toBe(true);
      expect(connection.getDriver()).toBeDefined();
    });

    it('should verify connection after connecting', async () => {
      await connection.connect();

      const driver = connection.getDriver();
      expect(driver).toBeInstanceOf(Driver);
    });

    it('should throw error on invalid credentials', async () => {
      const invalidConnection = new Neo4jConnection({
        uri: 'bolt://localhost:7687',
        username: 'invalid',
        password: 'invalid',
        database: 'neo4j'
      });

      await expect(invalidConnection.connect()).rejects.toThrow();
    });

    it('should throw error on invalid URI', async () => {
      const invalidConnection = new Neo4jConnection({
        uri: 'bolt://invalid-host:7687',
        username: 'neo4j',
        password: 'password',
        database: 'neo4j'
      });

      await expect(invalidConnection.connect()).rejects.toThrow();
    });
  });

  describe('getSession', () => {
    it('should return a session when connected', async () => {
      await connection.connect();

      const session = await connection.getSession();
      expect(session).toBeDefined();
      expect(session).toBeInstanceOf(Session);

      await session.close();
    });

    it('should throw error when not connected', async () => {
      await expect(connection.getSession()).rejects.toThrow('Neo4j driver not initialized');
    });

    it('should allow custom database parameter', async () => {
      await connection.connect();

      const session = await connection.getSession('neo4j');
      expect(session).toBeDefined();

      await session.close();
    });
  });

  describe('executeQuery', () => {
    beforeEach(async () => {
      await connection.connect();
    });

    it('should execute a simple query', async () => {
      const result = await connection.executeQuery('RETURN 1 as number');

      expect(result).toBeDefined();
      expect(result.records.length).toBe(1);
      // Neo4j returns Integer objects, need to convert to number
      const value = result.records[0].get('number');
      expect(value.toNumber ? value.toNumber() : value).toBe(1);
    });

    it('should execute query with parameters', async () => {
      const result = await connection.executeQuery(
        'RETURN $name as name, $age as age',
        { name: 'John', age: 30 }
      );

      expect(result.records.length).toBe(1);
      expect(result.records[0].get('name')).toBe('John');
      expect(result.records[0].get('age')).toBe(30);
    });

    it('should throw error on invalid query', async () => {
      await expect(
        connection.executeQuery('INVALID CYPHER QUERY')
      ).rejects.toThrow();
    });
  });

  describe('executeTransaction', () => {
    beforeEach(async () => {
      await connection.connect();
    });

    afterEach(async () => {
      // Clean up any TestNode entities created during tests
      await connection.executeQuery('MATCH (n:TestNode) DETACH DELETE n');
    });

    it('should execute a transaction', async () => {
      const result = await connection.executeTransaction(async (tx) => {
        const queryResult = await tx.run('RETURN 42 as answer');
        const value = queryResult.records[0].get('answer');
        return value.toNumber ? value.toNumber() : value;
      });

      expect(result).toBe(42);
    });

    it('should rollback transaction on error', async () => {
      await expect(
        connection.executeTransaction(async (tx) => {
          await tx.run('CREATE (n:TestNode {id: "test1"})');
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');

      // Verify node was not created
      const result = await connection.executeQuery(
        'MATCH (n:TestNode {id: "test1"}) RETURN count(n) as count'
      );
      expect(result.records[0].get('count').toNumber()).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy when connected', async () => {
      await connection.connect();

      const health = await connection.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.latency).toBeDefined();
      expect(typeof health.latency).toBe('number');
      expect(health.latency!).toBeGreaterThan(0);
    });

    it('should return unhealthy when not connected', async () => {
      const health = await connection.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.error).toBeDefined();
    });

    it('should return unhealthy after close', async () => {
      await connection.connect();
      await connection.close();

      const health = await connection.healthCheck();
      expect(health.status).toBe('unhealthy');
    });
  });

  describe('close', () => {
    it('should close the connection', async () => {
      await connection.connect();
      expect(connection.isConnected()).toBe(true);

      await connection.close();
      expect(connection.isConnected()).toBe(false);
    });

    it('should handle close when not connected', async () => {
      await expect(connection.close()).resolves.not.toThrow();
    });
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      expect(connection.isConnected()).toBe(false);
    });

    it('should return true when connected', async () => {
      await connection.connect();
      expect(connection.isConnected()).toBe(true);
    });

    it('should return false after disconnect', async () => {
      await connection.connect();
      await connection.close();
      expect(connection.isConnected()).toBe(false);
    });
  });
});

describe('Singleton functions', () => {
  const testConfig = {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: '10101010',
    database: 'neo4j'
  };

  afterAll(async () => {
    await closeNeo4jConnection();
  });

  describe('initializeNeo4j', () => {
    it('should initialize and return connection', () => {
      const connection = initializeNeo4j(testConfig);

      expect(connection).toBeDefined();
      expect(connection).toBeInstanceOf(Neo4jConnection);
    });

    it('should return same instance on multiple calls', () => {
      const conn1 = initializeNeo4j(testConfig);
      const conn2 = initializeNeo4j(testConfig);

      expect(conn1).toBe(conn2);
    });
  });

  describe('getNeo4jConnection', () => {
    it('should return the initialized connection', () => {
      initializeNeo4j(testConfig);
      const connection = getNeo4jConnection();

      expect(connection).toBeDefined();
      expect(connection).toBeInstanceOf(Neo4jConnection);
    });

    it('should throw error if not initialized', async () => {
      await closeNeo4jConnection();

      expect(() => getNeo4jConnection()).toThrow('Neo4j connection not initialized');
    });
  });

  describe('closeNeo4jConnection', () => {
    it('should close the singleton connection', async () => {
      initializeNeo4j(testConfig);
      await closeNeo4jConnection();

      expect(() => getNeo4jConnection()).toThrow();
    });

    it('should handle close when not initialized', async () => {
      await expect(closeNeo4jConnection()).resolves.not.toThrow();
    });
  });
});

describe('Neo4j integration tests', () => {
  const testConfig = {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: '10101010',
    database: 'neo4j'
  };

  let connection: Neo4jConnection;

  beforeAll(async () => {
    connection = new Neo4jConnection(testConfig);
    await connection.connect();
  });

  afterAll(async () => {
    // Clean up test data
    await connection.executeQuery('MATCH (n:TestUser) DETACH DELETE n');
    await connection.executeQuery('MATCH (n:TestTransaction) DETACH DELETE n');
    await connection.close();
  });

  describe('Node operations', () => {
    it('should create a node', async () => {
      const result = await connection.executeQuery(
        'CREATE (n:TestUser {id: $id, name: $name}) RETURN n',
        { id: 'user1', name: 'Test User' }
      );

      expect(result.records.length).toBe(1);
      const node = result.records[0].get('n');
      expect(node.properties.id).toBe('user1');
      expect(node.properties.name).toBe('Test User');
    });

    it('should update a node', async () => {
      // Create node
      await connection.executeQuery(
        'CREATE (n:TestUser {id: $id, name: $name})',
        { id: 'user2', name: 'Original Name' }
      );

      // Update node
      const result = await connection.executeQuery(
        'MATCH (n:TestUser {id: $id}) SET n.name = $newName RETURN n',
        { id: 'user2', newName: 'Updated Name' }
      );

      expect(result.records[0].get('n').properties.name).toBe('Updated Name');
    });

    it('should delete a node', async () => {
      // Create node
      await connection.executeQuery(
        'CREATE (n:TestUser {id: $id})',
        { id: 'user3' }
      );

      // Delete node
      await connection.executeQuery(
        'MATCH (n:TestUser {id: $id}) DELETE n',
        { id: 'user3' }
      );

      // Verify deletion
      const result = await connection.executeQuery(
        'MATCH (n:TestUser {id: $id}) RETURN n',
        { id: 'user3' }
      );

      expect(result.records.length).toBe(0);
    });
  });

  describe('Relationship operations', () => {
    beforeEach(async () => {
      // Create test nodes
      await connection.executeQuery(`
        CREATE (u:TestUser {id: 'user_a', name: 'User A'})
        CREATE (t:TestTransaction {id: 'tx_a', amount: 100})
      `);
    });

    afterEach(async () => {
      // Clean up
      await connection.executeQuery(
        'MATCH (u:TestUser)-[r]-() DELETE r'
      );
      await connection.executeQuery(
        'MATCH (n:TestUser) DELETE n'
      );
      await connection.executeQuery(
        'MATCH (n:TestTransaction) DELETE n'
      );
    });

    it('should create a relationship', async () => {
      const result = await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})
        MATCH (t:TestTransaction {id: $txId})
        CREATE (u)-[r:MADE_TRANSACTION]->(t)
        RETURN r
      `, { userId: 'user_a', txId: 'tx_a' });

      expect(result.records.length).toBe(1);
      expect(result.records[0].get('r').type).toBe('MADE_TRANSACTION');
    });

    it('should query relationships', async () => {
      // Create relationship
      await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})
        MATCH (t:TestTransaction {id: $txId})
        CREATE (u)-[:MADE_TRANSACTION]->(t)
      `, { userId: 'user_a', txId: 'tx_a' });

      // Query relationships
      const result = await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})-[r:MADE_TRANSACTION]->(t:TestTransaction)
        RETURN t
      `, { userId: 'user_a' });

      expect(result.records.length).toBe(1);
      expect(result.records[0].get('t').properties.id).toBe('tx_a');
    });

    it('should delete relationships', async () => {
      // Create relationship
      await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})
        MATCH (t:TestTransaction {id: $txId})
        CREATE (u)-[r:MADE_TRANSACTION]->(t)
      `, { userId: 'user_a', txId: 'tx_a' });

      // Delete relationship
      await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})-[r:MADE_TRANSACTION]->(t:TestTransaction {id: $txId})
        DELETE r
      `, { userId: 'user_a', txId: 'tx_a' });

      // Verify deletion
      const result = await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})-[r:MADE_TRANSACTION]->(t:TestTransaction)
        RETURN count(r) as count
      `, { userId: 'user_a' });

      expect(result.records[0].get('count').toNumber()).toBe(0);
    });
  });

  describe('Complex queries', () => {
    beforeEach(async () => {
      // Create test graph
      await connection.executeQuery(`
        CREATE (u1:TestUser {id: 'u1', name: 'User 1'})
        CREATE (u2:TestUser {id: 'u2', name: 'User 2'})
        CREATE (t1:TestTransaction {id: 't1', amount: 100, category: 'Food'})
        CREATE (t2:TestTransaction {id: 't2', amount: 200, category: 'Transport'})
        CREATE (t3:TestTransaction {id: 't3', amount: 150, category: 'Food'})
        CREATE (u1)-[:MADE_TRANSACTION]->(t1)
        CREATE (u1)-[:MADE_TRANSACTION]->(t2)
        CREATE (u2)-[:MADE_TRANSACTION]->(t3)
      `);
    });

    afterEach(async () => {
      await connection.executeQuery('MATCH (n:TestUser) DETACH DELETE n');
      await connection.executeQuery('MATCH (n:TestTransaction) DETACH DELETE n');
    });

    it('should perform aggregation queries', async () => {
      const result = await connection.executeQuery(`
        MATCH (u:TestUser {id: $userId})-[:MADE_TRANSACTION]->(t:TestTransaction)
        RETURN sum(t.amount) as total
      `, { userId: 'u1' });

      expect(result.records[0].get('total').toNumber()).toBe(300);
    });

    it('should filter by properties', async () => {
      const result = await connection.executeQuery(`
        MATCH (t:TestTransaction {category: $category})
        RETURN count(t) as count
      `, { category: 'Food' });

      expect(result.records[0].get('count').toNumber()).toBe(2);
    });

    it('should perform path queries', async () => {
      const result = await connection.executeQuery(`
        MATCH path = (u:TestUser {id: $userId})-[:MADE_TRANSACTION]->(t:TestTransaction)
        RETURN length(path) as pathLength, t.id as transactionId
      `, { userId: 'u1' });

      expect(result.records.length).toBe(2);
      expect(result.records[0].get('pathLength').toNumber()).toBe(1);
    });
  });
});
