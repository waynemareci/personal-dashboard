import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Base schema for all entities
export const BaseEntitySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().default(1),
  isDeleted: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// Neo4j node reference
export const Neo4jNodeRefSchema = z.object({
  nodeId: z.string(),
  labels: z.array(z.string()),
  synced: z.boolean().default(false),
  syncedAt: z.date().optional(),
  syncError: z.string().optional()
});

export type Neo4jNodeRef = z.infer<typeof Neo4jNodeRefSchema>;

// Dual database entity (MongoDB + Neo4j)
export const DualDbEntitySchema = BaseEntitySchema.extend({
  neo4jRef: Neo4jNodeRefSchema.optional()
});

export type DualDbEntity = z.infer<typeof DualDbEntitySchema>;

// Common validation patterns
export const EmailSchema = z.string().email();
export const PhoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/);
export const UrlSchema = z.string().url();
export const CurrencyAmountSchema = z.number().multipleOf(0.01);
export const DateStringSchema = z.string().datetime();

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

// Error schemas
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string()
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
  validationErrors: z.array(ValidationErrorSchema).optional()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;