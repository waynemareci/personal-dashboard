import { Db, CreateIndexesOptions, IndexSpecification } from 'mongodb';
import { logger } from '../utils/logger';
import { getMongoDBConnection } from './mongodb';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  FINANCIAL_TRANSACTIONS: 'financial_transactions',
  FINANCIAL_ACCOUNTS: 'financial_accounts',
  MONTHLY_BUDGETS: 'monthly_budgets',
  FINANCIAL_GOALS: 'financial_goals',
  HEALTH_METRICS: 'health_metrics',
  MEALS: 'meals',
  WORKOUTS: 'workouts',
  HEALTH_GOALS: 'health_goals',
  TASKS: 'tasks',
  CALENDAR_EVENTS: 'calendar_events',
  PROJECTS: 'projects'
} as const;

// Index definitions for each collection
interface CollectionIndex {
  collection: string;
  indexes: Array<{
    spec: IndexSpecification;
    options?: CreateIndexesOptions;
    name: string;
    description: string;
  }>;
}

const COLLECTION_INDEXES: CollectionIndex[] = [
  {
    collection: COLLECTIONS.USERS,
    indexes: [
      {
        spec: { 'profile.email': 1 },
        options: { unique: true, sparse: true },
        name: 'users_email_unique',
        description: 'Unique index on user email'
      },
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'users_id_unique',
        description: 'Unique index on user ID'
      },
      {
        spec: { status: 1 },
        name: 'users_status',
        description: 'Index on user status for filtering'
      },
      {
        spec: { createdAt: -1 },
        name: 'users_created_desc',
        description: 'Index on creation date for sorting'
      },
      {
        spec: { 'neo4jRef.nodeId': 1 },
        options: { sparse: true },
        name: 'users_neo4j_ref',
        description: 'Index on Neo4j node reference'
      }
    ]
  },
  {
    collection: COLLECTIONS.FINANCIAL_TRANSACTIONS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'transactions_id_unique',
        description: 'Unique index on transaction ID'
      },
      {
        spec: { userId: 1, date: -1 },
        name: 'transactions_user_date',
        description: 'Compound index on user and date for queries'
      },
      {
        spec: { accountId: 1, date: -1 },
        name: 'transactions_account_date',
        description: 'Compound index on account and date'
      },
      {
        spec: { userId: 1, type: 1, date: -1 },
        name: 'transactions_user_type_date',
        description: 'Index for filtering by user, type, and date'
      },
      {
        spec: { categoryId: 1 },
        options: { sparse: true },
        name: 'transactions_category',
        description: 'Index on transaction category'
      },
      {
        spec: { 'location.coordinates': '2dsphere' },
        options: { sparse: true },
        name: 'transactions_location_geo',
        description: 'Geospatial index on transaction location'
      },
      {
        spec: { tags: 1 },
        name: 'transactions_tags',
        description: 'Index on transaction tags'
      },
      {
        spec: { description: 'text', 'merchant.name': 'text' },
        name: 'transactions_text_search',
        description: 'Text search index on description and merchant'
      }
    ]
  },
  {
    collection: COLLECTIONS.FINANCIAL_ACCOUNTS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'accounts_id_unique',
        description: 'Unique index on account ID'
      },
      {
        spec: { userId: 1, isActive: 1 },
        name: 'accounts_user_active',
        description: 'Index on user and active status'
      },
      {
        spec: { type: 1 },
        name: 'accounts_type',
        description: 'Index on account type'
      },
      {
        spec: { plaidAccountId: 1 },
        options: { sparse: true, unique: true },
        name: 'accounts_plaid_unique',
        description: 'Unique index on Plaid account ID'
      }
    ]
  },
  {
    collection: COLLECTIONS.HEALTH_METRICS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'health_metrics_id_unique',
        description: 'Unique index on metric ID'
      },
      {
        spec: { userId: 1, type: 1, date: -1 },
        name: 'health_metrics_user_type_date',
        description: 'Compound index for user metrics by type and date'
      },
      {
        spec: { userId: 1, date: -1 },
        name: 'health_metrics_user_date',
        description: 'Index for user metrics by date'
      },
      {
        spec: { type: 1, date: -1 },
        name: 'health_metrics_type_date',
        description: 'Index for metrics by type and date'
      },
      {
        spec: { source: 1 },
        name: 'health_metrics_source',
        description: 'Index on metric source (device/app)'
      },
      {
        spec: { tags: 1 },
        name: 'health_metrics_tags',
        description: 'Index on metric tags'
      }
    ]
  },
  {
    collection: COLLECTIONS.MEALS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'meals_id_unique',
        description: 'Unique index on meal ID'
      },
      {
        spec: { userId: 1, date: -1, time: -1 },
        name: 'meals_user_datetime',
        description: 'Compound index on user, date, and time'
      },
      {
        spec: { userId: 1, type: 1, date: -1 },
        name: 'meals_user_type_date',
        description: 'Index for meals by user, type, and date'
      },
      {
        spec: { name: 'text', 'foods.food.name': 'text' },
        name: 'meals_text_search',
        description: 'Text search on meal name and food items'
      },
      {
        spec: { tags: 1 },
        name: 'meals_tags',
        description: 'Index on meal tags'
      }
    ]
  },
  {
    collection: COLLECTIONS.WORKOUTS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'workouts_id_unique',
        description: 'Unique index on workout ID'
      },
      {
        spec: { userId: 1, date: -1 },
        name: 'workouts_user_date',
        description: 'Compound index on user and date'
      },
      {
        spec: { userId: 1, type: 1, date: -1 },
        name: 'workouts_user_type_date',
        description: 'Index for workouts by user, type, and date'
      },
      {
        spec: { templateId: 1 },
        options: { sparse: true },
        name: 'workouts_template',
        description: 'Index on workout template ID'
      },
      {
        spec: { name: 'text', 'exercises.name': 'text' },
        name: 'workouts_text_search',
        description: 'Text search on workout name and exercises'
      },
      {
        spec: { tags: 1 },
        name: 'workouts_tags',
        description: 'Index on workout tags'
      }
    ]
  },
  {
    collection: COLLECTIONS.TASKS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'tasks_id_unique',
        description: 'Unique index on task ID'
      },
      {
        spec: { userId: 1, status: 1, priority: -1 },
        name: 'tasks_user_status_priority',
        description: 'Compound index for task filtering and sorting'
      },
      {
        spec: { userId: 1, dueDate: 1 },
        name: 'tasks_user_due_date',
        description: 'Index for tasks by user and due date'
      },
      {
        spec: { projectId: 1 },
        options: { sparse: true },
        name: 'tasks_project',
        description: 'Index on project ID'
      },
      {
        spec: { parentTaskId: 1 },
        options: { sparse: true },
        name: 'tasks_parent',
        description: 'Index on parent task ID for subtasks'
      },
      {
        spec: { category: 1 },
        name: 'tasks_category',
        description: 'Index on task category'
      },
      {
        spec: { tags: 1 },
        name: 'tasks_tags',
        description: 'Index on task tags'
      },
      {
        spec: { title: 'text', description: 'text' },
        name: 'tasks_text_search',
        description: 'Text search on task title and description'
      }
    ]
  },
  {
    collection: COLLECTIONS.CALENDAR_EVENTS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'events_id_unique',
        description: 'Unique index on event ID'
      },
      {
        spec: { userId: 1, startDate: 1, endDate: 1 },
        name: 'events_user_date_range',
        description: 'Compound index for date range queries'
      },
      {
        spec: { userId: 1, type: 1, startDate: 1 },
        name: 'events_user_type_date',
        description: 'Index for events by user, type, and date'
      },
      {
        spec: { recurringGroupId: 1 },
        options: { sparse: true },
        name: 'events_recurring_group',
        description: 'Index on recurring event group'
      },
      {
        spec: { externalId: 1 },
        options: { sparse: true },
        name: 'events_external_id',
        description: 'Index on external calendar ID'
      },
      {
        spec: { title: 'text', description: 'text' },
        name: 'events_text_search',
        description: 'Text search on event title and description'
      },
      {
        spec: { tags: 1 },
        name: 'events_tags',
        description: 'Index on event tags'
      }
    ]
  },
  {
    collection: COLLECTIONS.PROJECTS,
    indexes: [
      {
        spec: { id: 1 },
        options: { unique: true },
        name: 'projects_id_unique',
        description: 'Unique index on project ID'
      },
      {
        spec: { userId: 1, status: 1, priority: -1 },
        name: 'projects_user_status_priority',
        description: 'Compound index for project filtering and sorting'
      },
      {
        spec: { userId: 1, dueDate: 1 },
        name: 'projects_user_due_date',
        description: 'Index for projects by user and due date'
      },
      {
        spec: { parentProjectId: 1 },
        options: { sparse: true },
        name: 'projects_parent',
        description: 'Index on parent project ID for subprojects'
      },
      {
        spec: { category: 1 },
        name: 'projects_category',
        description: 'Index on project category'
      },
      {
        spec: { tags: 1 },
        name: 'projects_tags',
        description: 'Index on project tags'
      },
      {
        spec: { name: 'text', description: 'text' },
        name: 'projects_text_search',
        description: 'Text search on project name and description'
      }
    ]
  }
];

export class CollectionManager {
  private db: Db;

  constructor() {
    this.db = getMongoDBConnection().getDatabase();
  }

  /**
   * Initialize all collections with proper indexes
   */
  async initializeCollections(): Promise<void> {
    logger.info('Initializing MongoDB collections and indexes...');

    for (const collectionConfig of COLLECTION_INDEXES) {
      await this.initializeCollection(collectionConfig);
    }

    logger.info('All MongoDB collections and indexes initialized successfully');
  }

  /**
   * Initialize a single collection with its indexes
   */
  private async initializeCollection(config: CollectionIndex): Promise<void> {
    const { collection, indexes } = config;

    try {
      // Create collection if it doesn't exist
      const collections = await this.db.listCollections({ name: collection }).toArray();
      if (collections.length === 0) {
        await this.db.createCollection(collection);
        logger.debug(`Created collection: ${collection}`);
      }

      // Create indexes
      for (const indexConfig of indexes) {
        await this.createIndexSafely(collection, indexConfig);
      }

      logger.debug(`Initialized collection '${collection}' with ${indexes.length} indexes`);
    } catch (error) {
      logger.error(`Failed to initialize collection '${collection}':`, error);
      throw error;
    }
  }

  /**
   * Create an index safely (won't fail if it already exists)
   */
  private async createIndexSafely(
    collectionName: string,
    indexConfig: {
      spec: IndexSpecification;
      options?: CreateIndexesOptions;
      name: string;
      description: string;
    }
  ): Promise<void> {
    try {
      const collection = this.db.collection(collectionName);
      const options = {
        ...indexConfig.options,
        name: indexConfig.name,
        background: true // Create index in background
      };

      await collection.createIndex(indexConfig.spec, options);
      logger.debug(`Created index '${indexConfig.name}' on collection '${collectionName}'`);
    } catch (error: any) {
      // Index already exists - this is fine
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        logger.debug(`Index '${indexConfig.name}' already exists on collection '${collectionName}'`);
      } else {
        logger.warn(`Failed to create index '${indexConfig.name}' on collection '${collectionName}':`, error);
        // Don't throw - we want to continue with other indexes
      }
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const collectionName of Object.values(COLLECTIONS)) {
      try {
        const collection = this.db.collection(collectionName);
        const collectionStats = await this.db.stats();
        const indexes = await collection.listIndexes().toArray();
        const documentCount = await collection.countDocuments();

        stats[collectionName] = {
          documentCount,
          indexCount: indexes.length,
          indexes: indexes.map(idx => ({
            name: idx.name,
            keys: idx.key,
            unique: idx.unique || false,
            sparse: idx.sparse || false
          }))
        };
      } catch (error) {
        logger.warn(`Failed to get stats for collection '${collectionName}':`, error);
        stats[collectionName] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Drop all collections (use with caution!)
   */
  async dropAllCollections(): Promise<void> {
    logger.warn('Dropping all collections...');

    for (const collectionName of Object.values(COLLECTIONS)) {
      try {
        await this.db.dropCollection(collectionName);
        logger.debug(`Dropped collection: ${collectionName}`);
      } catch (error: any) {
        if (error.codeName === 'NamespaceNotFound') {
          logger.debug(`Collection '${collectionName}' does not exist`);
        } else {
          logger.error(`Failed to drop collection '${collectionName}':`, error);
        }
      }
    }

    logger.warn('All collections dropped');
  }

  /**
   * Ensure a collection exists
   */
  async ensureCollection(collectionName: string): Promise<void> {
    const collections = await this.db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await this.db.createCollection(collectionName);
      logger.debug(`Created collection: ${collectionName}`);
    }
  }
}

// Singleton instance
let collectionManager: CollectionManager | null = null;

export function getCollectionManager(): CollectionManager {
  if (!collectionManager) {
    collectionManager = new CollectionManager();
  }
  return collectionManager;
}