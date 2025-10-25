import { z } from 'zod';
import { DualDbEntitySchema } from './base';

// Health metric types
export const HealthMetricTypeEnum = z.enum([
  'weight',
  'body_fat_percentage',
  'muscle_mass',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'heart_rate_resting',
  'heart_rate_max',
  'steps',
  'calories_burned',
  'sleep_hours',
  'sleep_quality',
  'water_intake',
  'mood',
  'stress_level',
  'energy_level',
  'custom'
]);

// Health metrics
export const HealthMetricSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  type: HealthMetricTypeEnum,
  value: z.number(),
  unit: z.string(),
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  source: z.enum([
    'manual',
    'fitbit',
    'apple_health',
    'google_fit', 
    'garmin',
    'withings',
    'oura',
    'other'
  ]).default('manual'),
  deviceId: z.string().optional(),
  notes: z.string().max(500).optional(),
  confidence: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).default([])
});

// Nutrition information
export const NutritionInfoSchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbohydrates: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  cholesterol: z.number().optional(),
  vitamins: z.record(z.number()).optional(),
  minerals: z.record(z.number()).optional()
});

// Food items
export const FoodItemSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  servingSize: z.string(),
  nutrition: NutritionInfoSchema
});

// Meal types
export const MealTypeEnum = z.enum([
  'breakfast',
  'lunch', 
  'dinner',
  'snack',
  'drink',
  'other'
]);

// Meals
export const MealSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(100),
  type: MealTypeEnum,
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  foods: z.array(z.object({
    food: FoodItemSchema,
    quantity: z.number().positive(),
    unit: z.string()
  })).min(1),
  totalNutrition: NutritionInfoSchema,
  location: z.string().optional(),
  photo: z.string().url().optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  rating: z.number().int().min(1).max(5).optional()
});

// Exercise types
export const ExerciseTypeEnum = z.enum([
  'cardio',
  'strength',
  'flexibility',
  'sports',
  'yoga',
  'pilates',
  'hiking',
  'cycling',
  'swimming',
  'running',
  'walking',
  'dancing',
  'martial_arts',
  'other'
]);

// Exercise intensity
export const ExerciseIntensityEnum = z.enum([
  'light',
  'moderate', 
  'vigorous',
  'very_vigorous'
]);

// Workout exercises
export const WorkoutExerciseSchema = z.object({
  name: z.string(),
  type: ExerciseTypeEnum,
  sets: z.array(z.object({
    reps: z.number().optional(),
    weight: z.number().optional(),
    duration: z.number().optional(), // seconds
    distance: z.number().optional(), // meters
    notes: z.string().optional()
  })).min(1),
  restTime: z.number().optional(), // seconds
  notes: z.string().max(200).optional()
});

// Workouts
export const WorkoutSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(100),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().positive(), // minutes
  type: ExerciseTypeEnum,
  intensity: ExerciseIntensityEnum,
  exercises: z.array(WorkoutExerciseSchema).min(1),
  caloriesBurned: z.number().optional(),
  avgHeartRate: z.number().optional(),
  maxHeartRate: z.number().optional(),
  location: z.string().optional(),
  equipment: z.array(z.string()).default([]),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  rating: z.number().int().min(1).max(5).optional(),
  isTemplate: z.boolean().default(false),
  templateId: z.string().optional()
});

// Health goals
export const HealthGoalSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    'weight_loss',
    'weight_gain',
    'muscle_gain',
    'endurance',
    'strength',
    'flexibility',
    'nutrition',
    'sleep',
    'stress_reduction',
    'habit_building',
    'other'
  ]),
  targetValue: z.number().optional(),
  targetUnit: z.string().optional(),
  currentValue: z.number().optional(),
  startValue: z.number().optional(),
  targetDate: z.date().optional(),
  frequency: z.enum([
    'daily',
    'weekly', 
    'monthly',
    'custom'
  ]).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
  progress: z.number().min(0).max(100).default(0),
  milestones: z.array(z.object({
    name: z.string(),
    targetValue: z.number(),
    targetDate: z.date().optional(),
    completed: z.boolean().default(false),
    completedAt: z.date().optional()
  })).default([])
});

export type HealthMetric = z.infer<typeof HealthMetricSchema>;
export type Meal = z.infer<typeof MealSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type HealthGoal = z.infer<typeof HealthGoalSchema>;
export type NutritionInfo = z.infer<typeof NutritionInfoSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;

// Create/Update schemas
export const CreateHealthMetricSchema = HealthMetricSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateMealSchema = MealSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateWorkoutSchema = WorkoutSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateHealthGoalSchema = HealthGoalSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export type CreateHealthMetric = z.infer<typeof CreateHealthMetricSchema>;
export type CreateMeal = z.infer<typeof CreateMealSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type CreateHealthGoal = z.infer<typeof CreateHealthGoalSchema>;