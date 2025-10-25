import { z } from 'zod';
import { DualDbEntitySchema } from './base';

// Task priority and status
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export const TaskStatusEnum = z.enum([
  'todo',
  'in_progress', 
  'blocked',
  'completed',
  'cancelled',
  'archived'
]);

// Task categories
export const TaskCategoryEnum = z.enum([
  'work',
  'personal',
  'health',
  'finance',
  'learning',
  'social',
  'household',
  'creative',
  'travel',
  'other'
]);

// Recurrence pattern
export const RecurrencePatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().min(1).default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  monthOfYear: z.number().int().min(1).max(12).optional(),
  endDate: z.date().optional(),
  occurrences: z.number().int().positive().optional()
});

// Time block
export const TimeBlockSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isAllDay: z.boolean().default(false),
  timezone: z.string().default('UTC')
});

// Location
export const LocationSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  isRemote: z.boolean().default(false)
});

// Tasks
export const TaskSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: TaskCategoryEnum,
  priority: TaskPriorityEnum.default('medium'),
  status: TaskStatusEnum.default('todo'),
  dueDate: z.date().optional(),
  dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  startDate: z.date().optional(),
  completedAt: z.date().optional(),
  estimatedDuration: z.number().optional(), // minutes
  actualDuration: z.number().optional(), // minutes
  projectId: z.string().optional(),
  parentTaskId: z.string().optional(),
  subtasks: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  assignees: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number().optional()
  })).default([]),
  checklist: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean().default(false)
  })).default([]),
  location: LocationSchema.optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),
  recurringGroupId: z.string().optional(),
  notes: z.string().max(1000).optional(),
  energy: z.enum(['low', 'medium', 'high']).optional(),
  context: z.array(z.string()).default([]), // e.g., @home, @office, @phone
  blockedReason: z.string().optional()
});

// Event types
export const EventTypeEnum = z.enum([
  'meeting',
  'appointment',
  'deadline',
  'reminder',
  'birthday',
  'holiday',
  'vacation',
  'conference',
  'social',
  'personal',
  'other'
]);

// Event status
export const EventStatusEnum = z.enum([
  'confirmed',
  'tentative',
  'cancelled',
  'no_show'
]);

// Calendar events
export const CalendarEventSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: EventTypeEnum,
  status: EventStatusEnum.default('confirmed'),
  startDate: z.date(),
  endDate: z.date(),
  timeBlock: TimeBlockSchema.optional(),
  location: LocationSchema.optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    status: z.enum(['accepted', 'declined', 'pending', 'tentative']).default('pending'),
    isOrganizer: z.boolean().default(false)
  })).default([]),
  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),
  recurringGroupId: z.string().optional(),
  reminders: z.array(z.object({
    type: z.enum(['email', 'push', 'popup']),
    minutesBefore: z.number().int().min(0)
  })).default([]),
  calendarId: z.string().optional(),
  externalId: z.string().optional(), // Google Calendar, Outlook, etc.
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isPrivate: z.boolean().default(false),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number().optional()
  })).default([])
});

// Project status
export const ProjectStatusEnum = z.enum([
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
  'archived'
]);

// Projects
export const ProjectSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  category: TaskCategoryEnum,
  status: ProjectStatusEnum.default('planning'),
  priority: TaskPriorityEnum.default('medium'),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  progress: z.number().min(0).max(100).default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  tags: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  milestones: z.array(z.object({
    id: z.string(),
    name: z.string(),
    dueDate: z.date().optional(),
    completed: z.boolean().default(false),
    completedAt: z.date().optional()
  })).default([]),
  team: z.array(z.object({
    userId: z.string(),
    role: z.string(),
    permissions: z.array(z.string())
  })).default([]),
  budget: z.object({
    allocated: z.number().optional(),
    spent: z.number().default(0),
    currency: z.string().length(3).default('USD')
  }).optional(),
  resources: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string().url().optional(),
    notes: z.string().optional()
  })).default([]),
  parentProjectId: z.string().optional(),
  template: z.boolean().default(false)
});

export type Task = z.infer<typeof TaskSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>;
export type TimeBlock = z.infer<typeof TimeBlockSchema>;
export type Location = z.infer<typeof LocationSchema>;

// Create/Update schemas
export const CreateTaskSchema = TaskSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateCalendarEventSchema = CalendarEventSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateProjectSchema = ProjectSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const UpdateTaskSchema = CreateTaskSchema.partial();
export const UpdateCalendarEventSchema = CreateCalendarEventSchema.partial();
export const UpdateProjectSchema = CreateProjectSchema.partial();

export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type CreateCalendarEvent = z.infer<typeof CreateCalendarEventSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type UpdateCalendarEvent = z.infer<typeof UpdateCalendarEventSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;