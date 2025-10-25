# Health API Implementation Summary

## Overview

The Health subdomain API provides comprehensive health and wellness tracking capabilities, including meal logging with nutritional analysis, workout tracking with exercise templates, body metrics trending, and health goal management. This implementation follows the dual-database architecture pattern, using MongoDB for operational data and Neo4j for relationship mapping and correlation analysis.

## Table of Contents

1. [Architecture](#architecture)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Key Features](#key-features)
5. [Neo4j Relationships](#neo4j-relationships)
6. [MongoDB Aggregations](#mongodb-aggregations)
7. [Algorithm Implementations](#algorithm-implementations)
8. [Usage Examples](#usage-examples)
9. [Performance Considerations](#performance-considerations)
10. [Testing Guidelines](#testing-guidelines)
11. [Future Enhancements](#future-enhancements)

---

## Architecture

### Technology Stack

- **Fastify**: Web framework for routing and middleware
- **Zod**: Schema validation for all API inputs
- **MongoDB**: Operational data storage with aggregation pipelines
- **Neo4j**: Graph database for relationship management and correlation queries
- **DualDatabaseCoordinator**: Ensures consistency across both databases
- **SyncManager**: Real-time data synchronization

### Design Patterns

1. **Dual-Database Writes**: All create/update/delete operations write to both MongoDB and Neo4j
2. **Automatic Calculations**: Nutritional totals and goal progress calculated automatically
3. **Correlation Analysis**: Neo4j queries for cross-domain health insights
4. **Aggregation Pipelines**: MongoDB aggregations for analytics and statistics
5. **Template System**: Reusable workout and meal templates

---

## Data Models

### Health Metrics

Tracks various health measurements over time.

```typescript
{
  userId: string;
  type: 'weight' | 'body_fat_percentage' | 'muscle_mass' | 'blood_pressure_systolic' |
        'blood_pressure_diastolic' | 'heart_rate_resting' | 'heart_rate_max' | 'steps' |
        'calories_burned' | 'sleep_hours' | 'sleep_quality' | 'water_intake' | 'mood' |
        'stress_level' | 'energy_level' | 'custom';
  value: number;
  unit: string;
  date: Date;
  time?: string; // HH:MM format
  source: 'manual' | 'fitbit' | 'apple_health' | 'google_fit' | 'garmin' | 'withings' | 'oura' | 'other';
  deviceId?: string;
  notes?: string;
  confidence?: number; // 0-1
  tags: string[];
}
```

**Validation**: `CreateHealthMetricSchema` - accepts date strings, omits system-generated fields

### Meals

Tracks food consumption with automatic nutritional calculation.

```typescript
{
  userId: string;
  name: string; // max 100 chars
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'other';
  date: Date;
  time: string; // HH:MM format (required)
  foods: [{
    food: {
      name: string;
      brand?: string;
      barcode?: string;
      servingSize: string;
      nutrition: {
        calories?: number;
        protein?: number;
        carbohydrates?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
        cholesterol?: number;
        vitamins?: Record<string, number>;
        minerals?: Record<string, number>;
      }
    };
    quantity: number; // positive
    unit: string;
  }];
  totalNutrition: NutritionInfo; // Auto-calculated
  location?: string;
  photo?: string; // URL
  notes?: string; // max 500 chars
  tags: string[];
  rating?: number; // 1-5
}
```

**Validation**: `CreateMealSchema` - accepts date strings, validates food array has at least 1 item

### Workouts

Tracks exercise sessions with detailed exercise breakdown.

```typescript
{
  userId: string;
  name: string; // max 100 chars
  date: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // minutes (positive)
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'yoga' | 'pilates' |
        'hiking' | 'cycling' | 'swimming' | 'running' | 'walking' | 'dancing' |
        'martial_arts' | 'other';
  intensity: 'light' | 'moderate' | 'vigorous' | 'very_vigorous';
  exercises: [{
    name: string;
    type: ExerciseType;
    sets: [{
      reps?: number;
      weight?: number;
      duration?: number; // seconds
      distance?: number; // meters
      notes?: string;
    }];
    restTime?: number; // seconds
    notes?: string; // max 200 chars
  }];
  caloriesBurned?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  location?: string;
  equipment: string[];
  notes?: string; // max 500 chars
  tags: string[];
  rating?: number; // 1-5
  isTemplate: boolean; // default false
  templateId?: string;
}
```

**Validation**: `CreateWorkoutSchema` - accepts date strings, validates exercises array has at least 1 item

### Health Goals

Tracks health objectives with automatic progress calculation.

```typescript
{
  userId: string;
  name: string; // max 100 chars
  description?: string; // max 500 chars
  category: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' |
           'flexibility' | 'nutrition' | 'sleep' | 'stress_reduction' | 'habit_building' | 'other';
  targetValue?: number;
  targetUnit?: string;
  currentValue?: number;
  startValue?: number;
  targetDate?: Date;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  priority: 'low' | 'medium' | 'high'; // default 'medium'
  status: 'active' | 'completed' | 'paused' | 'cancelled'; // default 'active'
  progress: number; // 0-100 (auto-calculated)
  milestones: [{
    name: string;
    targetValue: number;
    targetDate?: Date;
    completed: boolean; // default false
    completedAt?: Date;
  }];
}
```

**Validation**: `CreateHealthGoalSchema` - accepts date strings for targetDate

---

## API Endpoints

### Health Metrics

#### GET `/api/health/metrics`

List health metrics with filtering and statistics.

**Query Parameters**:
- `limit` (number, default 50, max 100): Number of records to return
- `offset` (number, default 0): Pagination offset
- `type` (string): Filter by metric type
- `startDate` (ISO date): Filter by date range start
- `endDate` (ISO date): Filter by date range end
- `source` (string): Filter by data source

**Response**:
```json
{
  "metrics": [
    {
      "_id": "...",
      "userId": "user-123",
      "type": "weight",
      "value": 180.5,
      "unit": "lbs",
      "date": "2025-10-20T00:00:00.000Z",
      "source": "manual",
      "tags": ["morning"],
      "createdAt": "2025-10-20T08:30:00.000Z"
    }
  ],
  "total": 145,
  "hasMore": true,
  "stats": [
    {
      "_id": "weight",
      "count": 30,
      "avg": 182.4,
      "min": 178.0,
      "max": 185.2,
      "latest": "2025-10-25T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/health/metrics`

Create a new health metric.

**Request Body**:
```json
{
  "type": "weight",
  "value": 180.5,
  "unit": "lbs",
  "date": "2025-10-25T00:00:00.000Z",
  "time": "08:30",
  "source": "manual",
  "tags": ["morning", "post-workout"]
}
```

**Response**: 201 Created
```json
{
  "_id": "metric-456",
  "userId": "user-123",
  "type": "weight",
  "value": 180.5,
  "unit": "lbs",
  "date": "2025-10-25T00:00:00.000Z",
  "time": "08:30",
  "source": "manual",
  "tags": ["morning", "post-workout"],
  "createdAt": "2025-10-25T08:30:00.000Z",
  "neo4jRef": "neo4j-node-id"
}
```

#### PUT `/api/health/metrics/:id`

Update an existing health metric.

**Request Body**: Same as POST (all fields optional)

**Response**: 200 OK with updated metric

#### DELETE `/api/health/metrics/:id`

Soft delete a health metric (sets `isDeleted: true`).

**Response**: 204 No Content

---

### Meals

#### GET `/api/health/meals`

List meals with nutritional summaries.

**Query Parameters**:
- `limit` (number, default 50, max 100)
- `offset` (number, default 0)
- `type` (string): Filter by meal type
- `startDate` (ISO date): Filter by date range
- `endDate` (ISO date): Filter by date range

**Response**:
```json
{
  "meals": [
    {
      "_id": "meal-789",
      "userId": "user-123",
      "name": "Breakfast Bowl",
      "type": "breakfast",
      "date": "2025-10-25T00:00:00.000Z",
      "time": "08:00",
      "foods": [
        {
          "food": {
            "name": "Oatmeal",
            "servingSize": "1 cup",
            "nutrition": {
              "calories": 150,
              "protein": 5,
              "carbohydrates": 27,
              "fat": 3
            }
          },
          "quantity": 1,
          "unit": "cup"
        }
      ],
      "totalNutrition": {
        "calories": 450,
        "protein": 25,
        "carbohydrates": 60,
        "fat": 12
      },
      "rating": 5,
      "createdAt": "2025-10-25T08:00:00.000Z"
    }
  ],
  "total": 87,
  "hasMore": true,
  "nutritionSummary": {
    "totalCalories": 2150,
    "totalProtein": 145,
    "totalCarbs": 250,
    "totalFat": 65,
    "avgCaloriesPerMeal": 358
  }
}
```

#### POST `/api/health/meals`

Create a new meal with automatic nutritional calculation.

**Request Body**:
```json
{
  "name": "Protein Smoothie",
  "type": "snack",
  "date": "2025-10-25T00:00:00.000Z",
  "time": "15:30",
  "foods": [
    {
      "food": {
        "name": "Protein Powder",
        "brand": "Optimum Nutrition",
        "servingSize": "1 scoop",
        "nutrition": {
          "calories": 120,
          "protein": 24,
          "carbohydrates": 3,
          "fat": 1
        }
      },
      "quantity": 1,
      "unit": "scoop"
    },
    {
      "food": {
        "name": "Banana",
        "servingSize": "1 medium",
        "nutrition": {
          "calories": 105,
          "protein": 1,
          "carbohydrates": 27,
          "fat": 0
        }
      },
      "quantity": 1,
      "unit": "medium"
    }
  ],
  "tags": ["post-workout", "high-protein"]
}
```

**Response**: 201 Created
```json
{
  "_id": "meal-890",
  "userId": "user-123",
  "name": "Protein Smoothie",
  "type": "snack",
  "date": "2025-10-25T00:00:00.000Z",
  "time": "15:30",
  "foods": [...],
  "totalNutrition": {
    "calories": 225,
    "protein": 25,
    "carbohydrates": 30,
    "fat": 1
  },
  "tags": ["post-workout", "high-protein"],
  "createdAt": "2025-10-25T15:30:00.000Z",
  "neo4jRef": "neo4j-node-id"
}
```

**Note**: The `totalNutrition` field is automatically calculated from all foods based on their quantities.

#### PUT `/api/health/meals/:id`

Update a meal (recalculates nutrition if foods changed).

#### DELETE `/api/health/meals/:id`

Soft delete a meal.

---

### Workouts

#### GET `/api/health/workouts`

List workouts with statistics.

**Query Parameters**:
- `limit` (number, default 50, max 100)
- `offset` (number, default 0)
- `type` (string): Filter by workout type
- `intensity` (string): Filter by intensity level
- `startDate` (ISO date): Filter by date range
- `endDate` (ISO date): Filter by date range
- `isTemplate` (boolean): Filter templates vs actual workouts

**Response**:
```json
{
  "workouts": [
    {
      "_id": "workout-123",
      "userId": "user-123",
      "name": "Upper Body Strength",
      "date": "2025-10-25T00:00:00.000Z",
      "startTime": "17:00",
      "endTime": "18:15",
      "duration": 75,
      "type": "strength",
      "intensity": "vigorous",
      "exercises": [
        {
          "name": "Bench Press",
          "type": "strength",
          "sets": [
            {"reps": 8, "weight": 185},
            {"reps": 8, "weight": 185},
            {"reps": 6, "weight": 195}
          ],
          "restTime": 120
        }
      ],
      "caloriesBurned": 450,
      "equipment": ["barbell", "bench"],
      "rating": 5,
      "isTemplate": false,
      "createdAt": "2025-10-25T17:00:00.000Z"
    }
  ],
  "total": 56,
  "hasMore": false,
  "stats": {
    "totalWorkouts": 56,
    "totalDuration": 3240,
    "totalCalories": 24500,
    "avgDuration": 57.8,
    "avgCalories": 437.5
  }
}
```

#### POST `/api/health/workouts`

Create a new workout.

**Request Body**:
```json
{
  "name": "Morning Run",
  "date": "2025-10-25T00:00:00.000Z",
  "startTime": "06:00",
  "endTime": "06:45",
  "duration": 45,
  "type": "running",
  "intensity": "moderate",
  "exercises": [
    {
      "name": "Running",
      "type": "cardio",
      "sets": [
        {
          "duration": 2700,
          "distance": 5000,
          "notes": "Pace felt good"
        }
      ]
    }
  ],
  "caloriesBurned": 450,
  "avgHeartRate": 145,
  "maxHeartRate": 165,
  "location": "Central Park",
  "tags": ["outdoor", "cardio"]
}
```

**Response**: 201 Created with full workout object

#### PUT `/api/health/workouts/:id`

Update a workout.

#### DELETE `/api/health/workouts/:id`

Soft delete a workout.

---

### Health Goals

#### GET `/api/health/goals`

List health goals with filtering.

**Query Parameters**:
- `limit` (number, default 50, max 100)
- `offset` (number, default 0)
- `category` (string): Filter by goal category
- `status` (string): Filter by status (active, completed, paused, cancelled)
- `priority` (string): Filter by priority

**Response**:
```json
{
  "goals": [
    {
      "_id": "goal-456",
      "userId": "user-123",
      "name": "Lose 20 pounds",
      "description": "Weight loss for summer",
      "category": "weight_loss",
      "targetValue": 180,
      "currentValue": 190,
      "startValue": 200,
      "targetUnit": "lbs",
      "targetDate": "2025-12-31T00:00:00.000Z",
      "frequency": "weekly",
      "priority": "high",
      "status": "active",
      "progress": 50,
      "milestones": [
        {
          "name": "First 5 pounds",
          "targetValue": 195,
          "completed": true,
          "completedAt": "2025-09-15T00:00:00.000Z"
        },
        {
          "name": "Halfway point",
          "targetValue": 190,
          "completed": true,
          "completedAt": "2025-10-20T00:00:00.000Z"
        },
        {
          "name": "Final 10 pounds",
          "targetValue": 180,
          "completed": false
        }
      ],
      "createdAt": "2025-08-01T00:00:00.000Z"
    }
  ],
  "total": 5,
  "hasMore": false
}
```

#### POST `/api/health/goals`

Create a new health goal with automatic progress calculation.

**Request Body**:
```json
{
  "name": "Run a 5K",
  "description": "Complete a 5K race in under 30 minutes",
  "category": "endurance",
  "targetValue": 5000,
  "currentValue": 3000,
  "startValue": 1000,
  "targetUnit": "meters",
  "targetDate": "2026-06-01T00:00:00.000Z",
  "frequency": "weekly",
  "priority": "medium",
  "milestones": [
    {
      "name": "Run 2K non-stop",
      "targetValue": 2000
    },
    {
      "name": "Run 3.5K non-stop",
      "targetValue": 3500
    },
    {
      "name": "Complete 5K",
      "targetValue": 5000
    }
  ]
}
```

**Response**: 201 Created
```json
{
  "_id": "goal-789",
  "userId": "user-123",
  "name": "Run a 5K",
  "description": "Complete a 5K race in under 30 minutes",
  "category": "endurance",
  "targetValue": 5000,
  "currentValue": 3000,
  "startValue": 1000,
  "targetUnit": "meters",
  "targetDate": "2026-06-01T00:00:00.000Z",
  "frequency": "weekly",
  "priority": "medium",
  "status": "active",
  "progress": 50,
  "milestones": [...],
  "createdAt": "2025-10-25T00:00:00.000Z",
  "neo4jRef": "neo4j-node-id"
}
```

**Note**: Progress is automatically calculated as `((currentValue - startValue) / (targetValue - startValue)) * 100`

#### PUT `/api/health/goals/:id`

Update a goal (recalculates progress automatically).

#### DELETE `/api/health/goals/:id`

Soft delete a goal.

---

### Meal Planning

#### POST `/api/health/meal-plans/generate`

Generate a meal plan with grocery list.

**Request Body**:
```json
{
  "days": 7,
  "calorieTarget": 2000,
  "proteinTarget": 150,
  "preferences": {
    "excludeIngredients": ["peanuts"],
    "mealTypes": ["breakfast", "lunch", "dinner", "snack"]
  }
}
```

**Response**: 200 OK
```json
{
  "mealPlan": [
    {
      "day": 1,
      "date": "2025-10-26",
      "meals": [
        {
          "type": "breakfast",
          "meal": {
            "_id": "meal-123",
            "name": "Oatmeal Bowl",
            "foods": [...],
            "totalNutrition": {
              "calories": 450,
              "protein": 25,
              "carbohydrates": 60,
              "fat": 12
            }
          }
        },
        {
          "type": "lunch",
          "meal": {...}
        },
        {
          "type": "dinner",
          "meal": {...}
        },
        {
          "type": "snack",
          "meal": {...}
        }
      ],
      "dailyNutrition": {
        "calories": 2050,
        "protein": 152,
        "carbohydrates": 225,
        "fat": 68
      }
    }
  ],
  "groceryList": [
    {
      "name": "Oatmeal",
      "quantity": 7,
      "unit": "cup"
    },
    {
      "name": "Chicken Breast",
      "quantity": 3.5,
      "unit": "lbs"
    },
    {
      "name": "Broccoli",
      "quantity": 14,
      "unit": "cup"
    }
  ],
  "summary": {
    "totalDays": 7,
    "avgDailyCalories": 2025,
    "avgDailyProtein": 148
  }
}
```

**Algorithm**:
1. Fetches user's historical meals rated 4+ stars
2. Randomly selects meals for each day/type
3. Aggregates all food ingredients into a consolidated grocery list
4. Calculates nutritional summaries

---

### Workout Templates

#### GET `/api/health/workout-templates`

List workout templates (user + system).

**Query Parameters**:
- `type` (string): Filter by workout type

**Response**:
```json
{
  "templates": [
    {
      "_id": "template-123",
      "userId": "user-123",
      "name": "Full Body Workout",
      "type": "strength",
      "intensity": "vigorous",
      "duration": 60,
      "exercises": [
        {
          "name": "Squats",
          "type": "strength",
          "sets": [
            {"reps": 10, "weight": 135},
            {"reps": 10, "weight": 135},
            {"reps": 8, "weight": 155}
          ],
          "restTime": 90
        },
        {
          "name": "Bench Press",
          "type": "strength",
          "sets": [
            {"reps": 8, "weight": 185},
            {"reps": 8, "weight": 185},
            {"reps": 6, "weight": 195}
          ],
          "restTime": 120
        }
      ],
      "equipment": ["barbell", "bench", "squat rack"],
      "isTemplate": true,
      "createdAt": "2025-09-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/health/workout-templates/:templateId/use`

Create a workout from a template.

**Request Body**:
```json
{
  "date": "2025-10-25T00:00:00.000Z",
  "startTime": "17:00",
  "endTime": "18:00"
}
```

**Response**: 201 Created with full workout object (with `templateId` reference)

---

### Health Insights

#### GET `/api/health/insights/sleep-performance`

Analyze correlation between sleep and workout performance using Neo4j.

**Query Parameters**:
- `startDate` (ISO date, default: 30 days ago)
- `endDate` (ISO date, default: today)

**Response**:
```json
{
  "correlation": [
    {
      "sleepHours": 7,
      "avgCalories": 425,
      "avgRating": 4.5,
      "workoutCount": 12,
      "intensities": ["moderate", "vigorous", "vigorous"]
    },
    {
      "sleepHours": 6,
      "avgCalories": 380,
      "avgRating": 3.8,
      "workoutCount": 8,
      "intensities": ["moderate", "moderate", "light"]
    },
    {
      "sleepHours": 8,
      "avgCalories": 450,
      "avgRating": 4.8,
      "workoutCount": 10,
      "intensities": ["vigorous", "vigorous", "vigorous"]
    }
  ],
  "insights": {
    "insights": [
      {
        "type": "optimal_sleep",
        "message": "Your best workout performances occur with around 8 hours of sleep",
        "data": {
          "sleepHours": 8,
          "avgRating": 4.8,
          "avgCalories": 450
        }
      },
      {
        "type": "sleep_deprivation",
        "message": "Workouts after less than 6 hours of sleep have 15% lower performance ratings"
      }
    ]
  }
}
```

**Neo4j Query**:
```cypher
MATCH (user:User {id: $userId})-[:MEASURED_BY]->(sleep:HealthMetric {type: 'sleep_hours'})
MATCH (user)-[:PERFORMED_BY]->(workout:Workout)
WHERE sleep.date = workout.date
  AND sleep.date >= datetime($startDate)
  AND sleep.date <= datetime($endDate)
WITH sleep.value as sleepHours,
     workout.caloriesBurned as calories,
     workout.rating as rating,
     workout.intensity as intensity
RETURN sleepHours,
       avg(calories) as avgCalories,
       avg(rating) as avgRating,
       count(*) as workoutCount,
       collect(intensity) as intensities
ORDER BY sleepHours
```

#### GET `/api/health/insights/nutrition-energy`

Analyze correlation between nutrition and energy levels using MongoDB aggregation.

**Query Parameters**:
- `startDate` (ISO date, default: 30 days ago)
- `endDate` (ISO date, default: today)

**Response**:
```json
{
  "correlation": [
    {
      "date": "2025-10-20",
      "calories": 2150,
      "protein": 145,
      "carbs": 250,
      "fat": 68,
      "energyLevel": 8
    },
    {
      "date": "2025-10-21",
      "calories": 1850,
      "protein": 120,
      "carbs": 200,
      "fat": 55,
      "energyLevel": 6
    }
  ],
  "insights": {
    "insights": [
      {
        "type": "protein_energy",
        "message": "Days with higher protein intake show 15% better energy levels"
      },
      {
        "type": "calorie_energy",
        "message": "Your energy levels drop below target when consuming less than 1900 calories"
      }
    ]
  }
}
```

---

### Data Visualization

#### GET `/api/health/charts/weight-trend`

Get weight trend data for charts.

**Query Parameters**:
- `period` (string): 'week' | 'month' | 'quarter' | 'year' (default: 'month')

**Response**:
```json
{
  "data": [
    {
      "date": "2025-10-01",
      "value": 200,
      "source": "manual"
    },
    {
      "date": "2025-10-08",
      "value": 198.5,
      "source": "manual"
    },
    {
      "date": "2025-10-15",
      "value": 196,
      "source": "fitbit"
    },
    {
      "date": "2025-10-22",
      "value": 194.5,
      "source": "manual"
    }
  ],
  "summary": {
    "current": 194.5,
    "previous": 200,
    "change": -5.5,
    "avgWeight": 197.25
  }
}
```

#### GET `/api/health/charts/workout-volume`

Get workout volume data for charts.

**Query Parameters**:
- `period` (string): 'week' | 'month' | 'quarter' | 'year' (default: 'month')
- `groupBy` (string): 'day' | 'week' | 'month' (default: 'week')

**Response**:
```json
{
  "data": [
    {
      "period": "2025-W42",
      "totalDuration": 300,
      "totalCalories": 2400,
      "workoutCount": 4,
      "avgIntensity": 2.75
    },
    {
      "period": "2025-W43",
      "totalDuration": 350,
      "totalCalories": 2800,
      "workoutCount": 5,
      "avgIntensity": 3.0
    }
  ],
  "summary": {
    "totalWorkouts": 9,
    "totalDuration": 650,
    "totalCalories": 5200,
    "avgDuration": 72.2,
    "avgCalories": 577.8
  }
}
```

**Intensity Mapping**:
- light: 1
- moderate: 2
- vigorous: 3
- very_vigorous: 4

#### GET `/api/health/charts/nutrition-breakdown`

Get daily nutrition breakdown by meal type.

**Query Parameters**:
- `date` (ISO date, default: today)

**Response**:
```json
{
  "breakdown": [
    {
      "_id": "breakfast",
      "totalCalories": 450,
      "totalProtein": 25,
      "totalCarbs": 60,
      "totalFat": 12,
      "mealCount": 1
    },
    {
      "_id": "lunch",
      "totalCalories": 650,
      "totalProtein": 45,
      "totalCarbs": 75,
      "totalFat": 22,
      "mealCount": 1
    },
    {
      "_id": "dinner",
      "totalCalories": 700,
      "totalProtein": 55,
      "totalCarbs": 80,
      "totalFat": 25,
      "mealCount": 1
    },
    {
      "_id": "snack",
      "totalCalories": 200,
      "totalProtein": 15,
      "totalCarbs": 25,
      "totalFat": 8,
      "mealCount": 2
    }
  ],
  "totals": {
    "calories": 2000,
    "protein": 140,
    "carbs": 240,
    "fat": 67
  },
  "macroDistribution": {
    "protein": 28,
    "carbs": 48,
    "fat": 30
  }
}
```

**Macro Calculation**:
- Protein: 4 calories per gram
- Carbohydrates: 4 calories per gram
- Fat: 9 calories per gram

---

## Key Features

### 1. Automatic Nutritional Calculation

When creating or updating meals, the system automatically calculates total nutrition from individual food items.

**Implementation** (`packages/api-server/src/routes/health-data.ts:280-298`):

```typescript
const totalNutrition = {
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0
};

mealData.foods.forEach(foodEntry => {
  const nutrition = foodEntry.food.nutrition;
  if (nutrition.calories) totalNutrition.calories += nutrition.calories * foodEntry.quantity;
  if (nutrition.protein) totalNutrition.protein += nutrition.protein * foodEntry.quantity;
  if (nutrition.carbohydrates) totalNutrition.carbohydrates += nutrition.carbohydrates * foodEntry.quantity;
  if (nutrition.fat) totalNutrition.fat += nutrition.fat * foodEntry.quantity;
  if (nutrition.fiber) totalNutrition.fiber += nutrition.fiber * foodEntry.quantity;
  if (nutrition.sugar) totalNutrition.sugar += nutrition.sugar * foodEntry.quantity;
  if (nutrition.sodium) totalNutrition.sodium += nutrition.sodium * foodEntry.quantity;
  if (nutrition.cholesterol) totalNutrition.cholesterol += nutrition.cholesterol * foodEntry.quantity;
});
```

**Benefits**:
- Eliminates client-side calculation errors
- Ensures consistency across all meal records
- Simplifies API usage

### 2. Automatic Goal Progress Calculation

Health goals automatically calculate progress percentages based on start, current, and target values.

**Implementation** (`packages/api-server/src/routes/health-data.ts:802-808`):

```typescript
let progress = 0;
if (goalData.currentValue !== undefined && goalData.targetValue !== undefined && goalData.startValue !== undefined) {
  const totalChange = goalData.targetValue - goalData.startValue;
  const currentChange = goalData.currentValue - goalData.startValue;
  if (totalChange !== 0) {
    progress = Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
  }
}
```

**Formula**: `progress = ((current - start) / (target - start)) * 100`

**Example**:
- Start: 200 lbs
- Current: 190 lbs
- Target: 180 lbs
- Progress: `((190 - 200) / (180 - 200)) * 100 = 50%`

### 3. Meal Planning with Grocery List

The meal planning algorithm generates multi-day meal plans and consolidates ingredients into a grocery list.

**Algorithm** (`packages/api-server/src/routes/health-data.ts:1011-1101`):

1. **Fetch Historical Meals**: Get user's highly-rated meals (4+ stars)
2. **Generate Daily Plans**: For each day, randomly select meals for each type
3. **Aggregate Ingredients**: Consolidate all ingredients across all meals
4. **Calculate Summaries**: Compute daily and average nutritional totals

```typescript
// Consolidate ingredients into grocery list
selected.foods?.forEach((food: any) => {
  const key = food.food.name;
  const existing = groceryList.get(key) || {
    name: key,
    quantity: 0,
    unit: food.unit
  };
  existing.quantity += food.quantity;
  groceryList.set(key, existing);
});
```

**Benefits**:
- Reduces meal planning time
- Prevents duplicate grocery items
- Provides nutritional planning visibility

### 4. Workout Templates

Users can save favorite workouts as templates for quick reuse.

**Implementation** (`packages/api-server/src/routes/health-data.ts:1171-1207`):

1. **Template Creation**: Mark workout with `isTemplate: true`
2. **Template Usage**: Create new workout from template with `templateId` reference
3. **Template Library**: System templates (no userId) + user templates

**Use Cases**:
- Save and reuse common workout routines
- Track consistency using the same template
- Share templates across users (future feature)

### 5. Cross-Domain Health Insights

The system uses Neo4j graph queries to discover correlations between health metrics.

**Sleep-Performance Correlation** (`packages/api-server/src/routes/health-data.ts:1245-1267`):

```cypher
MATCH (user:User {id: $userId})-[:MEASURED_BY]->(sleep:HealthMetric {type: 'sleep_hours'})
MATCH (user)-[:PERFORMED_BY]->(workout:Workout)
WHERE sleep.date = workout.date
```

**Key Insights Generated**:
- Optimal sleep hours for best performance
- Impact of sleep deprivation on workout quality
- Sleep-intensity relationship patterns

**Nutrition-Energy Correlation** (`packages/api-server/src/routes/health-data.ts:1276-1363`):

Uses MongoDB aggregation to correlate daily nutrition with energy levels.

**Key Insights Generated**:
- Protein intake impact on energy
- Calorie threshold for optimal energy
- Macro distribution recommendations

---

## Neo4j Relationships

### Relationship Mapping

All health entities are connected in Neo4j for relationship discovery.

#### Health Metrics

**Node Labels**: `['HealthMetric', 'Health']`

**Properties**:
```typescript
{
  domain: 'health',
  type: metricType,
  value: metricValue,
  unit: metricUnit,
  date: date,
  source: source
}
```

**Relationships**:
- `(User)-[:MEASURED_BY]->(HealthMetric)`

#### Meals

**Node Labels**: `['Meal', 'Health']`

**Properties**:
```typescript
{
  domain: 'health',
  type: 'meal',
  mealType: mealData.type,
  calories: totalNutrition.calories,
  protein: totalNutrition.protein,
  date: date
}
```

**Relationships**:
- `(User)-[:CONSUMED]->(Meal)`
- `(Meal)-[:CONTAINS_FOOD]->(FoodItem)` (future)

#### Workouts

**Node Labels**: `['Workout', 'Health']`

**Properties**:
```typescript
{
  domain: 'health',
  type: 'workout',
  workoutType: workoutData.type,
  intensity: workoutData.intensity,
  duration: workoutData.duration,
  calories: workoutData.caloriesBurned,
  date: date
}
```

**Relationships**:
- `(User)-[:PERFORMED]->(Workout)`
- `(Workout)-[:INCLUDES_EXERCISE]->(Exercise)` (future)
- `(Workout)-[:BASED_ON_TEMPLATE]->(WorkoutTemplate)` (when using template)

#### Health Goals

**Node Labels**: `['HealthGoal', 'Health']`

**Properties**:
```typescript
{
  domain: 'health',
  type: 'goal',
  category: goalData.category,
  targetValue: goalData.targetValue,
  progress: progress,
  status: goalData.status
}
```

**Relationships**:
- `(User)-[:HAS_GOAL]->(HealthGoal)`
- `(HealthGoal)-[:TRACKS_METRIC]->(HealthMetric)` (future)

### Cross-Domain Relationship Examples

**Sleep → Workout Performance**:
```cypher
MATCH (user:User)-[:MEASURED_BY]->(sleep:HealthMetric {type: 'sleep_hours'})
MATCH (user)-[:PERFORMED]->(workout:Workout)
WHERE sleep.date = workout.date
RETURN sleep.value, workout.rating, workout.caloriesBurned
```

**Nutrition → Energy Levels**:
```cypher
MATCH (user:User)-[:CONSUMED]->(meal:Meal)
MATCH (user)-[:MEASURED_BY]->(energy:HealthMetric {type: 'energy_level'})
WHERE date(meal.date) = date(energy.date)
RETURN date(meal.date) as date,
       sum(meal.calories) as totalCalories,
       avg(energy.value) as avgEnergy
```

**Goals → Progress Tracking**:
```cypher
MATCH (user:User)-[:HAS_GOAL]->(goal:HealthGoal {category: 'weight_loss'})
MATCH (user)-[:MEASURED_BY]->(weight:HealthMetric {type: 'weight'})
WHERE weight.date >= goal.createdAt
RETURN weight.date, weight.value, goal.targetValue, goal.progress
ORDER BY weight.date
```

---

## MongoDB Aggregations

### Nutrition Summary by Date Range

```javascript
await mealsCollection.aggregate([
  {
    $match: {
      userId: user.id,
      isDeleted: false,
      date: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: null,
      totalCalories: { $sum: '$totalNutrition.calories' },
      totalProtein: { $sum: '$totalNutrition.protein' },
      totalCarbs: { $sum: '$totalNutrition.carbohydrates' },
      totalFat: { $sum: '$totalNutrition.fat' },
      mealCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      totalCalories: 1,
      totalProtein: 1,
      totalCarbs: 1,
      totalFat: 1,
      mealCount: 1,
      avgCaloriesPerMeal: { $divide: ['$totalCalories', '$mealCount'] }
    }
  }
]).toArray();
```

### Workout Statistics by Type

```javascript
await workoutsCollection.aggregate([
  {
    $match: {
      userId: user.id,
      isDeleted: false,
      date: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: '$type',
      count: { $sum: 1 },
      totalDuration: { $sum: '$duration' },
      totalCalories: { $sum: '$caloriesBurned' },
      avgDuration: { $avg: '$duration' },
      avgCalories: { $avg: '$caloriesBurned' },
      avgRating: { $avg: '$rating' }
    }
  },
  {
    $sort: { count: -1 }
  }
]).toArray();
```

### Daily Nutrition Breakdown

```javascript
await mealsCollection.aggregate([
  {
    $match: {
      userId: user.id,
      isDeleted: false,
      date: { $gte: startOfDay, $lte: endOfDay }
    }
  },
  {
    $group: {
      _id: '$type',
      totalCalories: { $sum: '$totalNutrition.calories' },
      totalProtein: { $sum: '$totalNutrition.protein' },
      totalCarbs: { $sum: '$totalNutrition.carbohydrates' },
      totalFat: { $sum: '$totalNutrition.fat' },
      mealCount: { $sum: 1 }
    }
  }
]).toArray();
```

### Metric Trends with Moving Averages

```javascript
await metricsCollection.aggregate([
  {
    $match: {
      userId: user.id,
      type: 'weight',
      isDeleted: false
    }
  },
  {
    $sort: { date: 1 }
  },
  {
    $setWindowFields: {
      sortBy: { date: 1 },
      output: {
        movingAvg7Day: {
          $avg: '$value',
          window: {
            documents: [-3, 3]
          }
        },
        movingAvg30Day: {
          $avg: '$value',
          window: {
            documents: [-14, 15]
          }
        }
      }
    }
  }
]).toArray();
```

---

## Algorithm Implementations

### 1. Nutritional Calculation Algorithm

**Location**: `packages/api-server/src/routes/health-data.ts:280-298`

**Input**: Array of food items with quantities
**Output**: Aggregated nutritional totals

```typescript
interface FoodEntry {
  food: {
    nutrition: {
      calories?: number;
      protein?: number;
      carbohydrates?: number;
      fat?: number;
      // ... more nutrients
    }
  };
  quantity: number;
}

function calculateTotalNutrition(foods: FoodEntry[]): NutritionInfo {
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0
  };

  foods.forEach(entry => {
    const { nutrition } = entry.food;
    const { quantity } = entry;

    Object.keys(totals).forEach(nutrient => {
      if (nutrition[nutrient]) {
        totals[nutrient] += nutrition[nutrient] * quantity;
      }
    });
  });

  return totals;
}
```

**Complexity**: O(n × m) where n = number of foods, m = number of nutrients

### 2. Goal Progress Calculation Algorithm

**Location**: `packages/api-server/src/routes/health-data.ts:802-808`

**Input**: Start value, current value, target value
**Output**: Progress percentage (0-100)

```typescript
function calculateProgress(
  startValue: number,
  currentValue: number,
  targetValue: number
): number {
  // Handle edge cases
  if (startValue === targetValue) return 100;

  const totalChange = targetValue - startValue;
  const currentChange = currentValue - startValue;

  // Calculate percentage
  let progress = (currentChange / totalChange) * 100;

  // Clamp between 0 and 100
  progress = Math.min(100, Math.max(0, progress));

  return Math.round(progress * 100) / 100; // Round to 2 decimals
}
```

**Examples**:
- Weight loss: start=200, current=190, target=180 → 50%
- Weight gain: start=150, current=160, target=180 → 33.33%
- Overachieved: start=200, current=175, target=180 → 100% (clamped)

### 3. Meal Planning Algorithm

**Location**: `packages/api-server/src/routes/health-data.ts:1011-1101`

**Input**: Number of days, calorie target, protein target, preferences
**Output**: Meal plan with grocery list

```typescript
async function generateMealPlan(
  userId: string,
  days: number,
  calorieTarget: number,
  proteinTarget: number,
  preferences: any
): Promise<MealPlan> {
  // Step 1: Fetch historical highly-rated meals
  const historicalMeals = await mealsCollection
    .find({
      userId,
      isDeleted: false,
      rating: { $gte: 4 }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  // Step 2: Group by meal type
  const mealsByType = groupBy(historicalMeals, 'type');

  const mealPlan = [];
  const groceryMap = new Map();

  // Step 3: Generate plan for each day
  for (let day = 0; day < days; day++) {
    const dailyMeals = [];

    // Select meals for each type
    for (const type of ['breakfast', 'lunch', 'dinner', 'snack']) {
      const candidates = mealsByType[type] || [];
      if (candidates.length === 0) continue;

      // Random selection (could be optimized with calorie targeting)
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      dailyMeals.push({ type, meal: selected });

      // Add ingredients to grocery list
      selected.foods?.forEach(food => {
        const key = food.food.name;
        const existing = groceryMap.get(key) || {
          name: key,
          quantity: 0,
          unit: food.unit
        };
        existing.quantity += food.quantity;
        groceryMap.set(key, existing);
      });
    }

    mealPlan.push({
      day: day + 1,
      date: addDays(new Date(), day + 1),
      meals: dailyMeals
    });
  }

  return {
    mealPlan,
    groceryList: Array.from(groceryMap.values()),
    summary: calculateSummary(mealPlan)
  };
}
```

**Complexity**: O(d × m × f) where d = days, m = meals per day, f = foods per meal

**Optimizations** (future):
- Calorie-aware meal selection
- Variety optimization (avoid repetition)
- Budget constraints
- Seasonal ingredient preferences

### 4. Sleep-Performance Correlation Algorithm

**Location**: `packages/api-server/src/routes/health-data.ts:1598-1641`

**Input**: Array of {sleepHours, avgRating, avgCalories, workoutCount}
**Output**: Actionable insights about sleep-performance relationship

```typescript
function generateSleepPerformanceInsights(
  correlation: Array<{
    sleepHours: number;
    avgRating: number;
    avgCalories: number;
    workoutCount: number;
  }>
): { insights: Insight[] } {
  const insights = [];

  // Insight 1: Find optimal sleep hours
  const sortedByRating = [...correlation].sort((a, b) => b.avgRating - a.avgRating);
  if (sortedByRating.length > 0 && sortedByRating[0].avgRating > 3) {
    insights.push({
      type: 'optimal_sleep',
      message: `Your best workout performances occur with around ${sortedByRating[0].sleepHours} hours of sleep`,
      data: sortedByRating[0]
    });
  }

  // Insight 2: Sleep deprivation impact
  const lowSleep = correlation.filter(c => c.sleepHours < 6);
  if (lowSleep.length > 0) {
    const avgRatingLowSleep = avg(lowSleep.map(c => c.avgRating));
    const avgRatingAllSleep = avg(correlation.map(c => c.avgRating));

    if (avgRatingLowSleep < avgRatingAllSleep) {
      const impactPercent = Math.round((1 - avgRatingLowSleep / avgRatingAllSleep) * 100);
      insights.push({
        type: 'sleep_deprivation',
        message: `Workouts after less than 6 hours of sleep have ${impactPercent}% lower performance ratings`
      });
    }
  }

  // Insight 3: Oversleeping impact (if applicable)
  const highSleep = correlation.filter(c => c.sleepHours > 9);
  // ... similar analysis

  return { insights };
}
```

**Statistical Methods**:
- Simple averages (mean)
- Sorting by key metric
- Threshold-based segmentation
- Percentage impact calculation

**Future Enhancements**:
- Linear regression for trend lines
- Confidence intervals
- P-value significance testing
- Machine learning predictions

---

## Usage Examples

### Example 1: Creating a Complete Daily Health Log

```bash
# Step 1: Log morning weight
POST /api/health/metrics
{
  "type": "weight",
  "value": 185.5,
  "unit": "lbs",
  "date": "2025-10-25T00:00:00.000Z",
  "time": "07:00",
  "source": "manual"
}

# Step 2: Log breakfast
POST /api/health/meals
{
  "name": "Protein Oatmeal",
  "type": "breakfast",
  "date": "2025-10-25T00:00:00.000Z",
  "time": "07:30",
  "foods": [
    {
      "food": {
        "name": "Oatmeal",
        "servingSize": "1 cup",
        "nutrition": {"calories": 150, "protein": 5, "carbohydrates": 27, "fat": 3}
      },
      "quantity": 1,
      "unit": "cup"
    },
    {
      "food": {
        "name": "Protein Powder",
        "brand": "Optimum Nutrition",
        "servingSize": "1 scoop",
        "nutrition": {"calories": 120, "protein": 24, "carbohydrates": 3, "fat": 1}
      },
      "quantity": 1,
      "unit": "scoop"
    }
  ]
}
# Returns: totalNutrition automatically calculated as {calories: 270, protein: 29, carbs: 30, fat: 4}

# Step 3: Log workout
POST /api/health/workouts
{
  "name": "Morning Run",
  "date": "2025-10-25T00:00:00.000Z",
  "startTime": "17:00",
  "endTime": "17:45",
  "duration": 45,
  "type": "running",
  "intensity": "moderate",
  "exercises": [
    {
      "name": "Running",
      "type": "cardio",
      "sets": [{"duration": 2700, "distance": 5000}]
    }
  ],
  "caloriesBurned": 450,
  "rating": 5
}

# Step 4: Log evening sleep quality
POST /api/health/metrics
{
  "type": "sleep_hours",
  "value": 7.5,
  "unit": "hours",
  "date": "2025-10-24T00:00:00.000Z",
  "source": "manual"
}

# Step 5: Check goal progress
GET /api/health/goals
# Returns goals with automatically updated progress percentages
```

### Example 2: Using Workout Templates

```bash
# Step 1: Create a workout template
POST /api/health/workouts
{
  "name": "Full Body Strength",
  "type": "strength",
  "intensity": "vigorous",
  "duration": 60,
  "exercises": [
    {
      "name": "Squats",
      "type": "strength",
      "sets": [
        {"reps": 10, "weight": 135},
        {"reps": 10, "weight": 135},
        {"reps": 8, "weight": 155}
      ],
      "restTime": 90
    },
    {
      "name": "Bench Press",
      "type": "strength",
      "sets": [
        {"reps": 8, "weight": 185},
        {"reps": 8, "weight": 185},
        {"reps": 6, "weight": 195}
      ],
      "restTime": 120
    }
  ],
  "equipment": ["barbell", "bench", "squat rack"],
  "isTemplate": true
}
# Returns: {_id: "template-123", isTemplate: true, ...}

# Step 2: List available templates
GET /api/health/workout-templates?type=strength
# Returns: {templates: [{_id: "template-123", name: "Full Body Strength", ...}]}

# Step 3: Use the template
POST /api/health/workout-templates/template-123/use
{
  "date": "2025-10-25T00:00:00.000Z",
  "startTime": "17:00",
  "endTime": "18:00"
}
# Returns: New workout with all exercises from template + templateId reference
```

### Example 3: Generating a Meal Plan

```bash
# Generate 7-day meal plan
POST /api/health/meal-plans/generate
{
  "days": 7,
  "calorieTarget": 2000,
  "proteinTarget": 150,
  "preferences": {
    "excludeIngredients": ["peanuts"],
    "mealTypes": ["breakfast", "lunch", "dinner", "snack"]
  }
}

# Returns:
{
  "mealPlan": [
    {
      "day": 1,
      "date": "2025-10-26",
      "meals": [
        {"type": "breakfast", "meal": {...}},
        {"type": "lunch", "meal": {...}},
        {"type": "dinner", "meal": {...}},
        {"type": "snack", "meal": {...}}
      ],
      "dailyNutrition": {
        "calories": 2050,
        "protein": 152,
        "carbohydrates": 225,
        "fat": 68
      }
    }
    // ... 6 more days
  ],
  "groceryList": [
    {"name": "Chicken Breast", "quantity": 3.5, "unit": "lbs"},
    {"name": "Broccoli", "quantity": 14, "unit": "cup"},
    {"name": "Rice", "quantity": 21, "unit": "cup"}
  ],
  "summary": {
    "totalDays": 7,
    "avgDailyCalories": 2025,
    "avgDailyProtein": 148
  }
}
```

### Example 4: Analyzing Health Insights

```bash
# Check sleep-performance correlation
GET /api/health/insights/sleep-performance?startDate=2025-09-25&endDate=2025-10-25

# Returns:
{
  "correlation": [
    {"sleepHours": 7, "avgCalories": 425, "avgRating": 4.5, "workoutCount": 12},
    {"sleepHours": 8, "avgCalories": 450, "avgRating": 4.8, "workoutCount": 10}
  ],
  "insights": {
    "insights": [
      {
        "type": "optimal_sleep",
        "message": "Your best workout performances occur with around 8 hours of sleep"
      }
    ]
  }
}

# Check nutrition-energy correlation
GET /api/health/insights/nutrition-energy?startDate=2025-09-25&endDate=2025-10-25

# Returns insights about protein, calorie, and macro impacts on energy levels
```

### Example 5: Visualizing Health Data

```bash
# Get weight trend
GET /api/health/charts/weight-trend?period=quarter

# Get workout volume
GET /api/health/charts/workout-volume?period=month&groupBy=week

# Get today's nutrition breakdown
GET /api/health/charts/nutrition-breakdown?date=2025-10-25T00:00:00.000Z

# All return chart-ready data for frontend visualization
```

---

## Performance Considerations

### Database Indexes

#### MongoDB Indexes

```javascript
// Health Metrics
db.health_metrics.createIndex({ userId: 1, type: 1, date: -1 });
db.health_metrics.createIndex({ userId: 1, date: -1 });
db.health_metrics.createIndex({ userId: 1, source: 1 });
db.health_metrics.createIndex({ isDeleted: 1 });

// Meals
db.meals.createIndex({ userId: 1, date: -1 });
db.meals.createIndex({ userId: 1, type: 1, date: -1 });
db.meals.createIndex({ userId: 1, rating: -1 });
db.meals.createIndex({ isDeleted: 1 });

// Workouts
db.workouts.createIndex({ userId: 1, date: -1 });
db.workouts.createIndex({ userId: 1, type: 1, date: -1 });
db.workouts.createIndex({ userId: 1, isTemplate: 1 });
db.workouts.createIndex({ userId: 1, templateId: 1 });
db.workouts.createIndex({ isDeleted: 1 });

// Health Goals
db.health_goals.createIndex({ userId: 1, status: 1 });
db.health_goals.createIndex({ userId: 1, category: 1 });
db.health_goals.createIndex({ userId: 1, priority: 1 });
db.health_goals.createIndex({ isDeleted: 1 });
```

#### Neo4j Indexes

```cypher
// User lookups
CREATE INDEX user_id_index FOR (u:User) ON (u.id);

// Health metric queries
CREATE INDEX health_metric_type_index FOR (m:HealthMetric) ON (m.type);
CREATE INDEX health_metric_date_index FOR (m:HealthMetric) ON (m.date);

// Workout queries
CREATE INDEX workout_type_index FOR (w:Workout) ON (w.workoutType);
CREATE INDEX workout_date_index FOR (w:Workout) ON (w.date);

// Goal tracking
CREATE INDEX goal_category_index FOR (g:HealthGoal) ON (g.category);
CREATE INDEX goal_status_index FOR (g:HealthGoal) ON (g.status);
```

### Query Optimization

#### Pagination Best Practices

```javascript
// Use cursor-based pagination for large datasets
const lastId = request.query.lastId;
const filter = lastId
  ? { userId: user.id, _id: { $gt: new ObjectId(lastId) } }
  : { userId: user.id };

const results = await collection
  .find(filter)
  .sort({ _id: 1 })
  .limit(limit)
  .toArray();
```

#### Aggregation Pipeline Optimization

```javascript
// Place $match as early as possible
db.meals.aggregate([
  { $match: { userId: user.id, isDeleted: false } }, // Filter first
  { $group: { _id: '$type', total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);

// Use $project to reduce document size early
db.workouts.aggregate([
  { $match: { userId: user.id } },
  { $project: { exercises: 0, notes: 0 } }, // Remove large fields
  { $group: { _id: '$type', count: { $sum: 1 } } }
]);
```

#### Neo4j Query Optimization

```cypher
// Use labels and property filters in MATCH
MATCH (user:User {id: $userId})-[:MEASURED_BY]->(m:HealthMetric {type: 'weight'})
WHERE m.date >= datetime($startDate)
RETURN m
ORDER BY m.date DESC
LIMIT 50;

// Avoid Cartesian products
// BAD:
MATCH (user:User {id: $userId})
MATCH (m:HealthMetric)
WHERE m.userId = user.id

// GOOD:
MATCH (user:User {id: $userId})-[:MEASURED_BY]->(m:HealthMetric)
```

### Caching Strategy

```javascript
// Cache frequently accessed data (Redis)
const cacheKey = `user:${userId}:goals:active`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const goals = await collection.find({ userId, status: 'active' }).toArray();
await redis.setex(cacheKey, 3600, JSON.stringify(goals)); // 1 hour TTL

return goals;
```

### Batch Operations

```javascript
// Batch create metrics for wearable device imports
const bulkOps = metrics.map(metric => ({
  insertOne: {
    document: {
      userId,
      ...metric,
      createdAt: new Date(),
      isDeleted: false
    }
  }
}));

await collection.bulkWrite(bulkOps);
```

---

## Testing Guidelines

### Unit Tests

Test individual functions and calculations.

```typescript
describe('Nutritional Calculation', () => {
  it('should calculate total nutrition from foods', () => {
    const foods = [
      {
        food: {
          nutrition: { calories: 100, protein: 10 }
        },
        quantity: 2
      },
      {
        food: {
          nutrition: { calories: 50, protein: 5 }
        },
        quantity: 3
      }
    ];

    const result = calculateTotalNutrition(foods);
    expect(result.calories).toBe(350); // (100*2) + (50*3)
    expect(result.protein).toBe(35); // (10*2) + (5*3)
  });
});

describe('Goal Progress Calculation', () => {
  it('should calculate progress correctly', () => {
    expect(calculateProgress(200, 190, 180)).toBe(50);
    expect(calculateProgress(150, 160, 180)).toBeCloseTo(33.33, 2);
  });

  it('should clamp progress between 0 and 100', () => {
    expect(calculateProgress(200, 175, 180)).toBe(100);
    expect(calculateProgress(200, 205, 180)).toBe(0);
  });
});
```

### Integration Tests

Test API endpoints with mocked databases.

```typescript
describe('Health Metrics API', () => {
  it('should create health metric with dual-database write', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/health/metrics',
      headers: { authorization: 'Bearer test-token' },
      payload: {
        type: 'weight',
        value: 185.5,
        unit: 'lbs',
        date: '2025-10-25T00:00:00.000Z'
      }
    });

    expect(response.statusCode).toBe(201);
    const data = JSON.parse(response.payload);
    expect(data.type).toBe('weight');
    expect(data.neo4jRef).toBeDefined();
  });

  it('should return metrics with stats', async () => {
    // Seed test data
    await seedHealthMetrics(userId);

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/health/metrics?type=weight',
      headers: { authorization: 'Bearer test-token' }
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.metrics).toBeInstanceOf(Array);
    expect(data.stats).toBeDefined();
  });
});
```

### Neo4j Relationship Tests

```typescript
describe('Neo4j Relationships', () => {
  it('should create User-MEASURED_BY->HealthMetric relationship', async () => {
    await createHealthMetric(userId, metricData);

    const query = `
      MATCH (u:User {id: $userId})-[:MEASURED_BY]->(m:HealthMetric)
      RETURN count(m) as count
    `;
    const result = await neo4jConnection.executeQuery(query, { userId });
    expect(result.records[0].get('count')).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```typescript
describe('Health Tracking Workflow', () => {
  it('should complete full day health logging', async () => {
    // 1. Create health goal
    const goalResponse = await createGoal({
      name: 'Weight Loss',
      category: 'weight_loss',
      targetValue: 180,
      currentValue: 200,
      startValue: 200
    });
    expect(goalResponse.progress).toBe(0);

    // 2. Log morning weight
    await createMetric({
      type: 'weight',
      value: 195,
      date: '2025-10-25'
    });

    // 3. Log meals
    await createMeal({ type: 'breakfast', ... });
    await createMeal({ type: 'lunch', ... });
    await createMeal({ type: 'dinner', ... });

    // 4. Log workout
    await createWorkout({ type: 'cardio', ... });

    // 5. Check updated goal progress
    const updatedGoal = await getGoal(goalResponse._id);
    expect(updatedGoal.currentValue).toBe(195);
    expect(updatedGoal.progress).toBe(25); // (200-195)/(200-180) = 25%

    // 6. Get insights
    const insights = await getInsights('sleep-performance');
    expect(insights.correlation).toBeDefined();
  });
});
```

---

## Future Enhancements

### 1. Wearable Device Integration

**Goal**: Automatically sync health data from wearables

**Implementation Roadmap**:
- Fitbit API integration
- Apple Health integration (iOS)
- Google Fit integration (Android)
- Garmin Connect API
- Oura Ring API
- Withings API

**Technical Approach**:
```typescript
// New service: packages/api-server/src/services/wearable-sync.ts
class WearableSyncService {
  async syncFitbitData(userId: string, accessToken: string) {
    // Fetch data from Fitbit API
    const data = await fitbitClient.getActivities(accessToken);

    // Transform to health metrics
    const metrics = data.map(activity => ({
      userId,
      type: mapActivityType(activity.type),
      value: activity.value,
      source: 'fitbit',
      deviceId: activity.deviceId,
      date: activity.date,
      confidence: 1.0
    }));

    // Batch import
    await batchCreateMetrics(metrics);
  }
}
```

**Challenges**:
- OAuth flow for each provider
- Rate limiting
- Data deduplication
- Conflict resolution (manual vs automated entries)

### 2. Machine Learning Recommendations

**Goal**: Provide personalized recommendations based on historical data

**Features**:
- **Meal Recommendations**: Suggest meals based on goals and preferences
- **Workout Optimization**: Recommend best workout times based on performance history
- **Goal Predictions**: Predict goal completion dates based on current progress
- **Anomaly Detection**: Alert user to unusual patterns (sudden weight changes, missed workouts)

**Technical Approach**:
```python
# New ML service: packages/ml-service/src/models/meal_recommender.py
from sklearn.neighbors import NearestNeighbors

class MealRecommender:
    def recommend_meals(self, user_id, target_calories, target_protein):
        # Fetch user's historical meals
        meals = get_user_meals(user_id)

        # Feature engineering
        features = extract_features(meals)

        # Train KNN model
        model = NearestNeighbors(n_neighbors=5)
        model.fit(features)

        # Find similar meals to target
        target_features = [target_calories, target_protein, ...]
        indices = model.kneighbors([target_features])

        return [meals[i] for i in indices]
```

### 3. Social Features

**Goal**: Enable community engagement and accountability

**Features**:
- Share workout templates with friends
- Group challenges (step competitions, weight loss challenges)
- Workout buddies (find people with similar goals)
- Recipe sharing and ratings
- Achievement badges and leaderboards

**Neo4j Relationships**:
```cypher
// Friendship
(User)-[:FRIENDS_WITH]->(User)

// Challenge participation
(User)-[:PARTICIPATES_IN]->(Challenge)
(Challenge)-[:TRACKS_METRIC {targetValue: 10000}]->(HealthMetric {type: 'steps'})

// Shared templates
(User)-[:SHARED]->(WorkoutTemplate)-[:USED_BY]->(User)

// Workout buddy matching
MATCH (u1:User)-[:HAS_GOAL]->(g1:HealthGoal {category: 'weight_loss'})
MATCH (u2:User)-[:HAS_GOAL]->(g2:HealthGoal {category: 'weight_loss'})
WHERE u1 <> u2 AND abs(g1.targetValue - g2.targetValue) < 10
RETURN u2 as potentialBuddy
```

### 4. Advanced Analytics

**Goal**: Deeper insights and predictive analytics

**Features**:
- **Macro Timing**: Optimal macro distribution throughout the day
- **Recovery Analysis**: Recovery time based on workout intensity
- **Injury Risk**: Predict injury risk from overtraining patterns
- **Plateau Detection**: Identify progress plateaus and suggest interventions
- **Cross-Domain Correlations**: Stress → Sleep → Workout Performance chains

**Technical Approach**:
```typescript
// Advanced correlation engine
class AdvancedCorrelationEngine {
  async analyzeMultiFactorCorrelation(userId: string, factors: string[]) {
    // Neo4j query for multi-hop relationships
    const query = `
      MATCH path = (u:User {id: $userId})-[*1..3]-(n)
      WHERE n:HealthMetric OR n:Workout OR n:Meal
        AND any(label IN labels(n) WHERE label IN $factors)
      RETURN path
    `;

    const graph = await neo4jConnection.executeQuery(query, { userId, factors });

    // Apply correlation analysis
    const correlations = await calculateMultiFactorCorrelations(graph);

    // Generate insights
    return generateAdvancedInsights(correlations);
  }
}
```

### 5. Voice Interface Expansion

**Goal**: Full voice control via Alexa

**Features**:
- "Alexa, log my breakfast: oatmeal and protein powder"
- "Alexa, how many calories have I eaten today?"
- "Alexa, start workout: Full Body Strength"
- "Alexa, what's my weight loss progress?"
- "Alexa, when should I go to bed for optimal workout tomorrow?"

**Implementation**:
```javascript
// Alexa skill handler
const LogMealIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LogMealIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const mealName = slots.mealName.value;
    const ingredients = slots.ingredients.values;

    // Call API to log meal
    await apiClient.createMeal({
      name: mealName,
      foods: parseIngredients(ingredients),
      date: new Date()
    });

    return handlerInput.responseBuilder
      .speak(`I've logged your ${mealName}. You've consumed ${totalCalories} calories today.`)
      .getResponse();
  }
};
```

### 6. Gamification

**Goal**: Increase engagement through game mechanics

**Features**:
- **Streaks**: Track consecutive days of logging, workouts, goal adherence
- **Achievements**: Unlock badges for milestones (first 5K, 100 workouts, etc.)
- **Experience Points**: Earn XP for logging data, completing workouts, hitting goals
- **Levels**: Level up system with unlockable features
- **Daily Quests**: Random daily challenges ("Log all meals today", "Hit 10k steps")

**Data Model**:
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'workout' | 'nutrition' | 'goals' | 'consistency';
  requirement: {
    type: 'count' | 'streak' | 'value';
    target: number;
    metric?: string;
  };
  reward: {
    xp: number;
    badge: string;
  };
}

interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  streaks: {
    workouts: number;
    mealLogging: number;
    goalAdherence: number;
  };
  achievements: string[];
  dailyQuests: {
    date: Date;
    quests: Array<{
      name: string;
      completed: boolean;
      reward: number;
    }>;
  };
}
```

---

## Conclusion

The Health subdomain API provides a comprehensive foundation for health and wellness tracking. With automatic calculations, dual-database architecture, cross-domain insights, and flexible visualization endpoints, the system enables users to track, analyze, and optimize their health journey.

**Key Strengths**:
- ✅ Comprehensive health tracking (meals, workouts, metrics, goals)
- ✅ Automatic calculations eliminate user errors
- ✅ Neo4j correlations discover hidden relationships
- ✅ Flexible aggregation pipelines for analytics
- ✅ Template system for recurring activities
- ✅ Chart-ready visualization endpoints

**Production Readiness Checklist**:
- [ ] Write comprehensive test suite
- [ ] Add MongoDB indexes for performance
- [ ] Add Neo4j indexes for query optimization
- [ ] Implement rate limiting
- [ ] Add request validation for all endpoints
- [ ] Set up monitoring and alerting
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Implement caching layer (Redis)
- [ ] Add batch import endpoints for wearable devices
- [ ] Set up backup and disaster recovery

**Next Steps**:
1. Complete test suite (unit, integration, E2E)
2. Performance testing with realistic data volumes
3. Security audit and penetration testing
4. User acceptance testing
5. Deploy to staging environment

---

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Author**: Health API Implementation Team
**Related Documents**:
- [Financial API Implementation](./FINANCIAL_API_IMPLEMENTATION.md)
- [Neo4j Relationship Schema](./NEO4J_RELATIONSHIPS.md)
- [API Authentication Guide](./API_AUTHENTICATION.md)
