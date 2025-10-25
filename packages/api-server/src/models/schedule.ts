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

// ===================================
// TIME BLOCKS (for deep work)
// ===================================

export const TimeBlockTypeEnum = z.enum([
  'deep_work',
  'shallow_work',
  'meeting',
  'break',
  'exercise',
  'learning',
  'creative',
  'admin',
  'other'
]);

export const DeepWorkBlockSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: TimeBlockTypeEnum.default('deep_work'),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  actualStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  actualEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  focusMode: z.boolean().default(false),
  energyLevel: z.enum(['low', 'medium', 'high']).optional(),
  targetEnergyLevel: z.enum(['low', 'medium', 'high']).optional(),
  location: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  completed: z.boolean().default(false),
  rating: z.number().int().min(1).max(5).optional(),
  distractions: z.array(z.object({
    type: z.string(),
    duration: z.number(), // minutes
    timestamp: z.date()
  })).default([]),
  notes: z.string().max(1000).optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),
  recurringGroupId: z.string().optional()
});

export const CreateDeepWorkBlockSchema = DeepWorkBlockSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const UpdateDeepWorkBlockSchema = CreateDeepWorkBlockSchema.partial();

export type DeepWorkBlock = z.infer<typeof DeepWorkBlockSchema>;
export type CreateDeepWorkBlock = z.infer<typeof CreateDeepWorkBlockSchema>;
export type UpdateDeepWorkBlock = z.infer<typeof UpdateDeepWorkBlockSchema>;

// ===================================
// HABITS
// ===================================

export const HabitFrequencyEnum = z.enum(['daily', 'weekly', 'monthly']);
export const HabitCategoryEnum = z.enum([
  'health',
  'productivity',
  'learning',
  'social',
  'creative',
  'financial',
  'spiritual',
  'fitness',
  'mindfulness',
  'other'
]);

export const HabitSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: HabitCategoryEnum.default('other'),
  frequency: HabitFrequencyEnum.default('daily'),
  targetCount: z.number().int().positive().default(1),
  targetDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  targetTimeOfDay: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  reminderDays: z.array(z.number().int().min(0).max(6)).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  currentStreak: z.number().int().default(0),
  longestStreak: z.number().int().default(0),
  totalCompletions: z.number().int().default(0)
});

export const HabitCompletionSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  habitId: z.string(),
  completedAt: z.date(),
  date: z.date(),
  count: z.number().int().positive().default(1),
  notes: z.string().max(500).optional(),
  mood: z.enum(['great', 'good', 'okay', 'bad', 'terrible']).optional(),
  difficulty: z.enum(['very_easy', 'easy', 'moderate', 'hard', 'very_hard']).optional(),
  energyBefore: z.enum(['low', 'medium', 'high']).optional(),
  energyAfter: z.enum(['low', 'medium', 'high']).optional(),
  location: z.string().optional(),
  duration: z.number().optional() // minutes
});

export const CreateHabitSchema = HabitSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true,
  currentStreak: true,
  longestStreak: true,
  totalCompletions: true
});

export const UpdateHabitSchema = CreateHabitSchema.partial();

export const CreateHabitCompletionSchema = HabitCompletionSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export type Habit = z.infer<typeof HabitSchema>;
export type HabitCompletion = z.infer<typeof HabitCompletionSchema>;
export type CreateHabit = z.infer<typeof CreateHabitSchema>;
export type UpdateHabit = z.infer<typeof UpdateHabitSchema>;
export type CreateHabitCompletion = z.infer<typeof CreateHabitCompletionSchema>;

// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * Calculate habit streak based on completions
 */
export function calculateHabitStreak(
  completions: HabitCompletion[],
  frequency: 'daily' | 'weekly' | 'monthly',
  targetCount: number = 1,
  targetDaysOfWeek?: number[]
): { currentStreak: number; longestStreak: number; lastCompletedAt: Date | null } {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedAt: null };
  }

  // Sort completions by date (most recent first)
  const sorted = [...completions].sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group completions by period
  const periodCounts = new Map<string, number>();

  for (const completion of sorted) {
    const date = new Date(completion.date);
    date.setHours(0, 0, 0, 0);

    let key: string;
    if (frequency === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (frequency === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    periodCounts.set(key, (periodCounts.get(key) || 0) + completion.count);
  }

  // Calculate streaks
  const periods = Array.from(periodCounts.entries())
    .sort((a, b) => b[0].localeCompare(a[0]));

  let expectedPeriod = getPeriodKey(today, frequency);
  let streakActive = true;

  for (const [periodKey, count] of periods) {
    const meetsTarget = count >= targetCount;

    if (meetsTarget) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);

      if (streakActive && periodKey === expectedPeriod) {
        currentStreak++;
        expectedPeriod = getPreviousPeriodKey(periodKey, frequency);
      } else if (streakActive) {
        streakActive = false;
      }
    } else {
      tempStreak = 0;
      streakActive = false;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastCompletedAt: new Date(sorted[0].completedAt)
  };
}

function getPeriodKey(date: Date, frequency: 'daily' | 'weekly' | 'monthly'): string {
  if (frequency === 'daily') {
    return date.toISOString().split('T')[0];
  } else if (frequency === 'weekly') {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().split('T')[0];
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

function getPreviousPeriodKey(currentKey: string, frequency: 'daily' | 'weekly' | 'monthly'): string {
  const date = new Date(currentKey);

  if (frequency === 'daily') {
    date.setDate(date.getDate() - 1);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() - 7);
  } else {
    date.setMonth(date.getMonth() - 1);
  }

  return getPeriodKey(date, frequency);
}

/**
 * Check if a task is blocked by incomplete dependencies
 */
export function isTaskBlocked(task: Task, allTasks: Task[]): boolean {
  if (!task.dependencies || task.dependencies.length === 0) {
    return false;
  }

  for (const depId of task.dependencies) {
    const depTask = allTasks.find(t => t.id === depId);
    if (depTask && depTask.status !== 'completed') {
      return true;
    }
  }

  return false;
}

/**
 * Calculate project completion percentage
 */
export function calculateProjectCompletion(projectTasks: Task[]): number {
  if (projectTasks.length === 0) return 0;

  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  return Math.round((completedTasks / projectTasks.length) * 100);
}

/**
 * Get tasks that are due soon (within specified hours)
 */
export function getTasksDueSoon(tasks: Task[], hoursAhead: number = 24): Task[] {
  const now = new Date();
  const deadline = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  return tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    return dueDate <= deadline && dueDate >= now;
  });
}

/**
 * Calculate time blocking efficiency
 */
export function calculateTimeBlockEfficiency(timeBlocks: DeepWorkBlock[]): {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  completionRate: number;
  averageRating: number;
} {
  const completed = timeBlocks.filter(tb => tb.completed);

  const totalPlannedMinutes = timeBlocks.reduce((sum, tb) => {
    const [startH, startM] = tb.startTime.split(':').map(Number);
    const [endH, endM] = tb.endTime.split(':').map(Number);
    return sum + ((endH * 60 + endM) - (startH * 60 + startM));
  }, 0);

  const totalActualMinutes = completed.reduce((sum, tb) => {
    if (!tb.actualStartTime || !tb.actualEndTime) return sum;
    const [startH, startM] = tb.actualStartTime.split(':').map(Number);
    const [endH, endM] = tb.actualEndTime.split(':').map(Number);
    return sum + ((endH * 60 + endM) - (startH * 60 + startM));
  }, 0);

  const completionRate = timeBlocks.length > 0
    ? (completed.length / timeBlocks.length) * 100
    : 0;

  const ratedBlocks = completed.filter(tb => tb.rating != null);
  const averageRating = ratedBlocks.length > 0
    ? ratedBlocks.reduce((sum, tb) => sum + (tb.rating || 0), 0) / ratedBlocks.length
    : 0;

  return {
    totalPlannedMinutes: Math.round(totalPlannedMinutes),
    totalActualMinutes: Math.round(totalActualMinutes),
    completionRate: Math.round(completionRate),
    averageRating: Math.round(averageRating * 10) / 10
  };
}