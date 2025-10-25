import { getNeo4jConnection } from './neo4j';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface Migration {
  version: string;
  name: string;
  description: string;
  up: string[];
  down: string[];
  timestamp: Date;
}

export interface MigrationRecord {
  version: string;
  name: string;
  appliedAt: Date;
  checksum: string;
}

export class MigrationManager {
  private connection = getNeo4jConnection();
  private migrationsPath: string;

  constructor(migrationsPath: string = join(__dirname, '../../migrations')) {
    this.migrationsPath = migrationsPath;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing migration system...');

    // Create migration tracking node if it doesn't exist
    const initQuery = `
      MERGE (m:MigrationTracker {id: 'main'})
      ON CREATE SET m.createdAt = $now
      RETURN m
    `;

    await this.connection.executeQuery(initQuery, { now: new Date().toISOString() });
    logger.info('Migration tracking system initialized');
  }

  async loadMigrations(): Promise<Migration[]> {
    try {
      await fs.access(this.migrationsPath);
    } catch {
      // Create migrations directory if it doesn't exist
      await fs.mkdir(this.migrationsPath, { recursive: true });
      return [];
    }

    const files = await fs.readdir(this.migrationsPath);
    const migrationFiles = files.filter(f => f.endsWith('.json')).sort();

    const migrations: Migration[] = [];
    for (const file of migrationFiles) {
      const filePath = join(this.migrationsPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const migration = JSON.parse(content) as Migration;
      migrations.push(migration);
    }

    return migrations;
  }

  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const query = `
      MATCH (tracker:MigrationTracker {id: 'main'})-[:APPLIED]->(m:Migration)
      RETURN m.version as version,
             m.name as name,
             m.appliedAt as appliedAt,
             m.checksum as checksum
      ORDER BY m.appliedAt
    `;

    try {
      const result = await this.connection.executeQuery(query);
      return result.records.map(record => ({
        version: record.get('version'),
        name: record.get('name'),
        appliedAt: new Date(record.get('appliedAt')),
        checksum: record.get('checksum')
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to get applied migrations');
      return [];
    }
  }

  async applyMigration(migration: Migration): Promise<void> {
    logger.info(`Applying migration ${migration.version}: ${migration.name}`);

    const session = await this.connection.getSession();

    try {
      await session.executeWrite(async (transaction) => {
        // Execute all migration queries in a transaction
        for (const query of migration.up) {
          if (query.trim()) {
            await transaction.run(query);
            logger.debug(`Executed: ${query}`);
          }
        }

        // Record the migration as a separate node with relationship to tracker
        const checksum = this.generateChecksum(migration);
        const appliedAt = new Date().toISOString();
        const recordQuery = `
          MATCH (tracker:MigrationTracker {id: 'main'})
          CREATE (m:Migration {
            version: $version,
            name: $name,
            appliedAt: $appliedAt,
            checksum: $checksum
          })
          CREATE (tracker)-[:APPLIED]->(m)
          RETURN m
        `;

        await transaction.run(recordQuery, {
          version: migration.version,
          name: migration.name,
          appliedAt,
          checksum
        });
      });

      logger.info(`Migration ${migration.version} applied successfully`);
    } catch (error) {
      logger.error({ error, migration: migration.version }, 'Failed to apply migration');
      throw error;
    } finally {
      await session.close();
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    logger.info(`Rolling back migration ${migration.version}: ${migration.name}`);

    const session = await this.connection.getSession();

    try {
      await session.executeWrite(async (transaction) => {
        // Execute rollback queries in reverse order
        for (const query of migration.down.reverse()) {
          if (query.trim()) {
            await transaction.run(query);
            logger.debug(`Executed rollback: ${query}`);
          }
        }

        // Remove migration node
        const removeQuery = `
          MATCH (tracker:MigrationTracker {id: 'main'})-[r:APPLIED]->(m:Migration {version: $version})
          DELETE r, m
        `;

        await transaction.run(removeQuery, { version: migration.version });
      });

      logger.info(`Migration ${migration.version} rolled back successfully`);
    } catch (error) {
      logger.error({ error, migration: migration.version }, 'Failed to rollback migration');
      throw error;
    } finally {
      await session.close();
    }
  }

  async migrate(): Promise<void> {
    await this.initialize();

    const allMigrations = await this.loadMigrations();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));

    const pendingMigrations = allMigrations.filter(m => !appliedVersions.has(m.version));

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.applyMigration(migration);
    }

    logger.info('All migrations applied successfully');
  }

  async createMigration(name: string, description: string): Promise<string> {
    const timestamp = new Date();
    // Include milliseconds for uniqueness: YYYYMMDDHHMMSSmmm
    const version = timestamp.toISOString().replace(/[-:.]/g, '').slice(0, 17);
    const filename = `${version}_${name.replace(/\s+/g, '_').toLowerCase()}.json`;

    const migration: Migration = {
      version,
      name,
      description,
      up: [
        '// Add your Cypher queries here',
        '// Example: CREATE (n:Node {name: "example"}) RETURN n'
      ],
      down: [
        '// Add rollback queries here',
        '// Example: MATCH (n:Node {name: "example"}) DELETE n'
      ],
      timestamp
    };

    const filePath = join(this.migrationsPath, filename);
    await fs.writeFile(filePath, JSON.stringify(migration, null, 2));

    logger.info(`Created migration file: ${filename}`);
    return filePath;
  }

  private generateChecksum(migration: Migration): string {
    const content = JSON.stringify({
      version: migration.version,
      up: migration.up,
      down: migration.down
    });

    // Simple checksum (in production, use crypto for better hashing)
    let checksum = 0;
    for (let i = 0; i < content.length; i++) {
      checksum = ((checksum << 5) - checksum + content.charCodeAt(i)) & 0xffffffff;
    }
    return checksum.toString(16);
  }

  async getMigrationStatus(): Promise<{
    total: number;
    applied: number;
    pending: string[];
    lastApplied?: MigrationRecord;
  }> {
    const allMigrations = await this.loadMigrations();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));

    const pendingMigrations = allMigrations.filter(m => !appliedVersions.has(m.version));

    return {
      total: allMigrations.length,
      applied: appliedMigrations.length,
      pending: pendingMigrations.map(m => `${m.version}: ${m.name}`),
      lastApplied: appliedMigrations[appliedMigrations.length - 1]
    };
  }
}