import { getNeo4jConnection } from './neo4j';
import { logger } from '../utils/logger';

/**
 * Cross-domain relationship discovery queries
 * Based on PRD Section 4.2 (Cross-Domain Relationship Discovery)
 */
export class RelationshipDiscoveryQueries {
  private connection = getNeo4jConnection();

  /**
   * Find spending patterns related to locations
   * Example from PRD: "You spend 40% more on food when you're traveling"
   */
  async findSpendingLocationPatterns(userId: string): Promise<any[]> {
    const query = `
      MATCH (user:Person {id: $userId})-[:MADE_TRANSACTION]->(t:Transaction)
      MATCH (t)-[:OCCURRED_AT]->(l:Location)
      MATCH (t)-[:CATEGORIZED_AS]->(topic:Topic)
      WITH l, topic, 
           avg(t.amount) as avgAmount,
           count(t) as transactionCount,
           collect(t.date) as dates
      WHERE transactionCount >= 3
      RETURN l.name as location,
             l.type as locationType,
             topic.name as category,
             round(avgAmount * 100) / 100 as averageAmount,
             transactionCount,
             dates
      ORDER BY avgAmount DESC
      LIMIT 20
    `;

    try {
      const result = await this.connection.executeQuery(query, { userId });
      return result.records.map(record => ({
        location: record.get('location'),
        locationType: record.get('locationType'),
        category: record.get('category'),
        averageAmount: record.get('averageAmount'),
        transactionCount: record.get('transactionCount'),
        dates: record.get('dates')
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to find spending location patterns');
      throw error;
    }
  }

  /**
   * Discover temporal patterns in health and productivity
   * Example: "Your workout intensity correlates with task completion rates"
   */
  async findHealthProductivityCorrelations(userId: string): Promise<any[]> {
    const query = `
      MATCH (user:Person {id: $userId})-[:DID_WORKOUT]->(w:Workout)
      MATCH (w)-[:OCCURRED_ON]->(date:Date)
      MATCH (date)<-[:DUE_ON]-(t:Task)-[:ASSIGNED_TO]->(user)
      WITH date,
           avg(w.intensity) as avgIntensity,
           avg(w.duration) as avgDuration,
           count(w) as workoutCount,
           count(CASE WHEN t.status = 'completed' THEN 1 END) as completedTasks,
           count(t) as totalTasks
      WHERE workoutCount > 0 AND totalTasks > 0
      WITH date,
           avgIntensity,
           avgDuration,
           workoutCount,
           round((completedTasks * 100.0 / totalTasks) * 100) / 100 as completionRate
      RETURN date.value as date,
             round(avgIntensity * 100) / 100 as averageIntensity,
             round(avgDuration * 100) / 100 as averageDuration,
             workoutCount,
             completionRate
      ORDER BY date.value DESC
      LIMIT 30
    `;

    try {
      const result = await this.connection.executeQuery(query, { userId });
      return result.records.map(record => ({
        date: record.get('date'),
        averageIntensity: record.get('averageIntensity'),
        averageDuration: record.get('averageDuration'),
        workoutCount: record.get('workoutCount'),
        completionRate: record.get('completionRate')
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to find health-productivity correlations');
      throw error;
    }
  }

  /**
   * Find people and topics that frequently appear together
   * Example: "Meeting with Sarah always involves budget discussions"
   */
  async findPersonTopicAssociations(userId: string): Promise<any[]> {
    const query = `
      MATCH (user:Person {id: $userId})-[:ATTENDED]->(e:Event)
      MATCH (e)-[:INVOLVES]->(p:Person)
      MATCH (e)-[:RELATES_TO]->(topic:Topic)
      WHERE p.id <> $userId
      WITH p, topic, count(e) as meetingCount, collect(e.title) as meetings
      WHERE meetingCount >= 2
      RETURN p.name as person,
             topic.name as topic,
             topic.category as topicCategory,
             meetingCount,
             meetings[0..5] as recentMeetings
      ORDER BY meetingCount DESC
      LIMIT 15
    `;

    try {
      const result = await this.connection.executeQuery(query, { userId });
      return result.records.map(record => ({
        person: record.get('person'),
        topic: record.get('topic'),
        topicCategory: record.get('topicCategory'),
        meetingCount: record.get('meetingCount'),
        recentMeetings: record.get('recentMeetings')
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to find person-topic associations');
      throw error;
    }
  }

  /**
   * Discover meal and workout timing patterns
   * Example: "You perform better when you eat protein 2 hours before working out"
   */
  async findMealWorkoutTimingPatterns(userId: string): Promise<any[]> {
    const query = `
      MATCH (user:Person {id: $userId})-[:ATE_MEAL]->(m:Meal)
      MATCH (user)-[:DID_WORKOUT]->(w:Workout)
      WHERE abs(duration.between(m.timestamp, w.timestamp).seconds) <= 14400 // Within 4 hours
      WITH m, w, 
           duration.between(m.timestamp, w.timestamp).seconds / 3600.0 as hoursDiff,
           m.macros.protein as protein,
           w.performance as performance
      WHERE protein IS NOT NULL AND performance IS NOT NULL
      WITH round(hoursDiff) as hoursBeforeWorkout,
           avg(protein) as avgProtein,
           avg(performance) as avgPerformance,
           count(*) as occurrences
      WHERE occurrences >= 3
      RETURN hoursBeforeWorkout,
             round(avgProtein * 100) / 100 as averageProtein,
             round(avgPerformance * 100) / 100 as averagePerformance,
             occurrences
      ORDER BY averagePerformance DESC
    `;

    try {
      const result = await this.connection.executeQuery(query, { userId });
      return result.records.map(record => ({
        hoursBeforeWorkout: record.get('hoursBeforeWorkout'),
        averageProtein: record.get('averageProtein'),
        averagePerformance: record.get('averagePerformance'),
        occurrences: record.get('occurrences')
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to find meal-workout timing patterns');
      throw error;
    }
  }

  /**
   * Find budget category trends and their relationship to life events
   */
  async findBudgetLifeEventCorrelations(userId: string): Promise<any[]> {
    const query = `
      MATCH (user:Person {id: $userId})-[:MADE_TRANSACTION]->(t:Transaction)
      MATCH (t)-[:CATEGORIZED_AS]->(category:Topic)
      MATCH (t)-[:OCCURRED_ON]->(date:Date)
      MATCH (date)<-[:OCCURRED_ON]-(e:Event)-[:ATTENDED_BY]->(user)
      WHERE e.type IN ['meeting', 'appointment', 'social', 'travel']
      WITH category, e.type as eventType, 
           sum(t.amount) as totalSpent,
           count(t) as transactionCount,
           collect(DISTINCT e.title) as events
      WHERE transactionCount >= 2
      RETURN category.name as budgetCategory,
             eventType,
             round(totalSpent * 100) / 100 as totalAmount,
             transactionCount,
             round((totalSpent / transactionCount) * 100) / 100 as averagePerTransaction,
             events[0..3] as relatedEvents
      ORDER BY totalAmount DESC
      LIMIT 20
    `;

    try {
      const result = await this.connection.executeQuery(query, { userId });
      return result.records.map(record => ({
        budgetCategory: record.get('budgetCategory'),
        eventType: record.get('eventType'),
        totalAmount: record.get('totalAmount'),
        transactionCount: record.get('transactionCount'),
        averagePerTransaction: record.get('averagePerTransaction'),
        relatedEvents: record.get('relatedEvents')
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to find budget-life event correlations');
      throw error;
    }
  }

  /**
   * Unified search across all domains using full-text search
   * Based on PRD Section 4.3 (Unified Search Interface)
   */
  async unifiedSearch(searchTerm: string, userId: string, limit: number = 20): Promise<any[]> {
    const query = `
      CALL db.index.fulltext.queryNodes("unified_search_index", $searchTerm)
      YIELD node, score
      WHERE (node)-[:BELONGS_TO|:CREATED_BY|:ASSIGNED_TO]->(:Person {id: $userId})
         OR ((:Person {id: $userId})-[:OWNS|:PARTICIPATES_IN|:RELATED_TO]->(node))
      WITH node, score, labels(node) as nodeLabels
      RETURN node.id as id,
             node.name as name,
             node.title as title,
             node.description as description,
             nodeLabels[0] as type,
             score,
             node.createdAt as createdAt,
             node.updatedAt as updatedAt
      ORDER BY score DESC
      LIMIT $limit
    `;

    try {
      const result = await this.connection.executeQuery(query, { 
        searchTerm, 
        userId, 
        limit 
      });
      
      return result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        title: record.get('title'),
        description: record.get('description'),
        type: record.get('type'),
        score: record.get('score'),
        createdAt: record.get('createdAt'),
        updatedAt: record.get('updatedAt')
      }));
    } catch (error) {
      logger.error({ error, searchTerm, userId }, 'Failed to perform unified search');
      throw error;
    }
  }

  /**
   * Find similar entities across different domains based on shared relationships
   */
  async findSimilarEntities(entityId: string, entityType: string, limit: number = 10): Promise<any[]> {
    const query = `
      MATCH (entity {id: $entityId})
      WHERE $entityType IN labels(entity)
      MATCH (entity)-[r]-(sharedNode)-[r2]-(similar)
      WHERE similar <> entity
      WITH similar, count(DISTINCT sharedNode) as sharedConnections,
           labels(similar) as similarLabels,
           collect(DISTINCT type(r)) as relationshipTypes
      WHERE sharedConnections >= 2
      RETURN similar.id as id,
             similar.name as name,
             similar.title as title,
             similarLabels[0] as type,
             sharedConnections,
             relationshipTypes
      ORDER BY sharedConnections DESC
      LIMIT $limit
    `;

    try {
      const result = await this.connection.executeQuery(query, { 
        entityId, 
        entityType, 
        limit 
      });
      
      return result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        title: record.get('title'),
        type: record.get('type'),
        sharedConnections: record.get('sharedConnections'),
        relationshipTypes: record.get('relationshipTypes')
      }));
    } catch (error) {
      logger.error({ error, entityId, entityType }, 'Failed to find similar entities');
      throw error;
    }
  }
}