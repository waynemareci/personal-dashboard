import { getNeo4jConnection } from './neo4j';
import { logger } from '../utils/logger';

export interface SchemaDefinition {
  name: string;
  constraints: string[];
  indexes: string[];
  description: string;
}

/**
 * Base schema for the Personal Dashboard system
 * Based on PRD Section 6.1 (Technical Architecture) and Section 4.2 (Cross-Domain Relationship Discovery)
 */
export const BASE_SCHEMA: SchemaDefinition[] = [
  {
    name: 'Entity',
    description: 'Base node for all entities in the system',
    constraints: [
      'CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE',
      'CREATE CONSTRAINT entity_id_not_null IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS NOT NULL'
    ],
    indexes: [
      'CREATE INDEX entity_type_idx IF NOT EXISTS FOR (e:Entity) ON (e.type)',
      'CREATE INDEX entity_created_at_idx IF NOT EXISTS FOR (e:Entity) ON (e.createdAt)',
      'CREATE INDEX entity_updated_at_idx IF NOT EXISTS FOR (e:Entity) ON (e.updatedAt)'
    ]
  },
  {
    name: 'Person',
    description: 'Represents people mentioned or referenced in the system',
    constraints: [
      'CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX person_name_idx IF NOT EXISTS FOR (p:Person) ON (p.name)',
      'CREATE INDEX person_email_idx IF NOT EXISTS FOR (p:Person) ON (p.email)'
    ]
  },
  {
    name: 'Location',
    description: 'Physical or virtual locations',
    constraints: [
      'CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX location_name_idx IF NOT EXISTS FOR (l:Location) ON (l.name)',
      'CREATE INDEX location_type_idx IF NOT EXISTS FOR (l:Location) ON (l.type)',
      'CREATE INDEX location_coordinates_idx IF NOT EXISTS FOR (l:Location) ON (l.latitude, l.longitude)'
    ]
  },
  {
    name: 'Topic',
    description: 'Categories, tags, or subject matters',
    constraints: [
      'CREATE CONSTRAINT topic_id_unique IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE',
      'CREATE CONSTRAINT topic_name_unique IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX topic_name_idx IF NOT EXISTS FOR (t:Topic) ON (t.name)',
      'CREATE INDEX topic_category_idx IF NOT EXISTS FOR (t:Topic) ON (t.category)'
    ]
  },
  {
    name: 'Date',
    description: 'Time-based nodes for temporal relationships',
    constraints: [
      'CREATE CONSTRAINT date_value_unique IF NOT EXISTS FOR (d:Date) REQUIRE d.value IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX date_value_idx IF NOT EXISTS FOR (d:Date) ON (d.value)',
      'CREATE INDEX date_year_idx IF NOT EXISTS FOR (d:Date) ON (d.year)',
      'CREATE INDEX date_month_idx IF NOT EXISTS FOR (d:Date) ON (d.month)',
      'CREATE INDEX date_day_idx IF NOT EXISTS FOR (d:Date) ON (d.day)'
    ]
  },
  // Domain-specific entities
  {
    name: 'Transaction',
    description: 'Financial transactions',
    constraints: [
      'CREATE CONSTRAINT transaction_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX transaction_amount_idx IF NOT EXISTS FOR (t:Transaction) ON (t.amount)',
      'CREATE INDEX transaction_date_idx IF NOT EXISTS FOR (t:Transaction) ON (t.date)',
      'CREATE INDEX transaction_category_idx IF NOT EXISTS FOR (t:Transaction) ON (t.category)'
    ]
  },
  {
    name: 'Account',
    description: 'Financial accounts',
    constraints: [
      'CREATE CONSTRAINT account_id_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX account_name_idx IF NOT EXISTS FOR (a:Account) ON (a.name)',
      'CREATE INDEX account_type_idx IF NOT EXISTS FOR (a:Account) ON (a.type)'
    ]
  },
  {
    name: 'Task',
    description: 'Tasks and to-do items',
    constraints: [
      'CREATE CONSTRAINT task_id_unique IF NOT EXISTS FOR (t:Task) REQUIRE t.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX task_status_idx IF NOT EXISTS FOR (t:Task) ON (t.status)',
      'CREATE INDEX task_priority_idx IF NOT EXISTS FOR (t:Task) ON (t.priority)',
      'CREATE INDEX task_due_date_idx IF NOT EXISTS FOR (t:Task) ON (t.dueDate)'
    ]
  },
  {
    name: 'Event',
    description: 'Calendar events and appointments',
    constraints: [
      'CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX event_start_time_idx IF NOT EXISTS FOR (e:Event) ON (e.startTime)',
      'CREATE INDEX event_end_time_idx IF NOT EXISTS FOR (e:Event) ON (e.endTime)',
      'CREATE INDEX event_type_idx IF NOT EXISTS FOR (e:Event) ON (e.type)'
    ]
  },
  {
    name: 'Meal',
    description: 'Meals and food items',
    constraints: [
      'CREATE CONSTRAINT meal_id_unique IF NOT EXISTS FOR (m:Meal) REQUIRE m.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX meal_type_idx IF NOT EXISTS FOR (m:Meal) ON (m.type)',
      'CREATE INDEX meal_date_idx IF NOT EXISTS FOR (m:Meal) ON (m.date)',
      'CREATE INDEX meal_calories_idx IF NOT EXISTS FOR (m:Meal) ON (m.calories)'
    ]
  },
  {
    name: 'Workout',
    description: 'Exercise and workout sessions',
    constraints: [
      'CREATE CONSTRAINT workout_id_unique IF NOT EXISTS FOR (w:Workout) REQUIRE w.id IS UNIQUE'
    ],
    indexes: [
      'CREATE INDEX workout_type_idx IF NOT EXISTS FOR (w:Workout) ON (w.type)',
      'CREATE INDEX workout_date_idx IF NOT EXISTS FOR (w:Workout) ON (w.date)',
      'CREATE INDEX workout_duration_idx IF NOT EXISTS FOR (w:Workout) ON (w.duration)'
    ]
  }
];

export class SchemaManager {
  private connection = getNeo4jConnection();

  async initializeSchema(): Promise<void> {
    logger.info('Initializing Neo4j schema...');

    try {
      for (const schema of BASE_SCHEMA) {
        logger.info(`Creating schema for ${schema.name}: ${schema.description}`);
        
        // Apply constraints
        for (const constraint of schema.constraints) {
          try {
            await this.connection.executeQuery(constraint);
            logger.debug(`Applied constraint: ${constraint}`);
          } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
              logger.debug(`Constraint already exists: ${constraint}`);
            } else {
              throw error;
            }
          }
        }

        // Apply indexes
        for (const index of schema.indexes) {
          try {
            await this.connection.executeQuery(index);
            logger.debug(`Applied index: ${index}`);
          } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
              logger.debug(`Index already exists: ${index}`);
            } else {
              throw error;
            }
          }
        }
      }

      logger.info('Schema initialization completed successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize schema');
      throw error;
    }
  }

  async createFullTextSearchIndex(): Promise<void> {
    logger.info('Creating full-text search index for unified search...');

    const fullTextIndexQuery = `
      CREATE FULLTEXT INDEX unified_search_index IF NOT EXISTS 
      FOR (n:Entity|Person|Location|Topic|Transaction|Task|Event|Meal|Workout) 
      ON EACH [n.name, n.title, n.description, n.content, n.notes, n.tags]
    `;

    try {
      await this.connection.executeQuery(fullTextIndexQuery);
      logger.info('Full-text search index created successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        logger.info('Full-text search index already exists');
      } else {
        logger.error({ error }, 'Failed to create full-text search index');
        throw error;
      }
    }
  }

  async getSchemaInfo(): Promise<any[]> {
    const query = `
      CALL db.schema.visualization()
      YIELD nodes, relationships
      RETURN nodes, relationships
    `;

    try {
      const result = await this.connection.executeQuery(query);
      return result.records.map(record => ({
        nodes: record.get('nodes'),
        relationships: record.get('relationships')
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to get schema info');
      throw error;
    }
  }

  async getConstraints(): Promise<any[]> {
    const query = 'SHOW CONSTRAINTS';
    
    try {
      const result = await this.connection.executeQuery(query);
      return result.records.map(record => record.toObject());
    } catch (error) {
      logger.error({ error }, 'Failed to get constraints');
      throw error;
    }
  }

  async getIndexes(): Promise<any[]> {
    const query = 'SHOW INDEXES';
    
    try {
      const result = await this.connection.executeQuery(query);
      return result.records.map(record => record.toObject());
    } catch (error) {
      logger.error({ error }, 'Failed to get indexes');
      throw error;
    }
  }
}