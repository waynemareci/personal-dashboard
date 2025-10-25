# Claude Code Implementation Prompts

Copy-paste ready prompts for implementing different phases of the Personal Dashboard PRD. Each prompt references specific PRD sections and provides actionable implementation guidance.

## Phase 1: Foundation & Infrastructure

### 1. Neo4j Connection and Initial Schema Setup

```
Set up Neo4j connection and initial schema for the Personal Dashboard system. Reference PRD Section 6.1 (Technical Architecture) and Section 4.2 (Cross-Domain Relationship Discovery).

Requirements:
- Create Neo4j driver configuration in packages/api-server/src/database/neo4j.ts
- Implement connection pool with retry logic and health checks
- Create initial schema with base node types: Entity, Person, Location, Topic, Date
- Set up full-text search index for unified search (see PRD Section 4.3)
- Create Cypher migration system for schema updates
- Add environment variables for Neo4j connection (bolt://localhost:7687)
- Include example Cypher queries from PRD Section 4.2 for relationship discovery
- Create database initialization script that can be run via npm command

Acceptance Criteria:
- Connection established with proper error handling
- Base schema created with indexes
- Migration system functional
- Health check endpoint returns Neo4j status
```

### 2. MongoDB Setup and Dual Database Strategy

```
Implement MongoDB connection and dual database strategy per PRD Section 6.1. Create the operational data layer that works alongside Neo4j for CRUD operations.

Requirements:
- Set up MongoDB connection in packages/api-server/src/database/mongodb.ts  
- Create base collections: users, financial_transactions, health_metrics, schedule_items
- Implement transaction coordination between Neo4j and MongoDB
- Create rollback mechanisms for failed dual-database writes (PRD Section 6.1.3)
- Add MongoDB health checks
- Create data models with Zod validation schemas
- Set up database indexes for performance
- Implement graceful degradation when Neo4j is unavailable

Acceptance Criteria:
- MongoDB connection with proper error handling
- Transaction coordination working
- Rollback mechanism tested
- Health check endpoint includes MongoDB status
```

### 3. API Server Foundation with WebSocket Sync

```
Create the core API server structure with WebSocket support for real-time synchronization per PRD Section 9 (Data Flows & Synchronization).

Requirements:
- Set up Fastify server in packages/api-server/src/index.ts with CORS and JWT middleware
- Implement WebSocket server with @fastify/websocket for real-time sync
- Create authentication middleware with JWT token validation
- Set up API route structure: /api/financial, /api/health, /api/schedule, /api/relationships
- Implement event-driven sync system for multi-device updates
- Add logging with Pino for debugging sync issues
- Create API documentation structure
- Add rate limiting and basic security headers

Acceptance Criteria:
- Server starts without errors
- WebSocket connections establish successfully
- JWT authentication working
- Basic CRUD endpoints respond
- Real-time events broadcast to connected clients
```

## Phase 2: Core Subdomain Implementation

### 4. Financial Subdomain Backend API

```
Implement the complete Financial subdomain backend API per PRD Section 5.1 (Financial Management Subdomain).

Requirements:
- Create financial API routes in packages/api-server/src/routes/financial.ts
- Implement CRUD operations for Expenses, Income, Accounts, Budgets, Categories
- Set up dual-database writes: MongoDB for operational data, Neo4j for relationships
- Create transaction categorization system with auto-suggestions
- Implement budget tracking with overspend alerts
- Add net worth calculation endpoints
- Create financial insights queries (spending patterns, category analysis)
- Set up data validation with Zod schemas
- Implement relationship creation: Transaction -> Account, Transaction -> Category

API Endpoints needed:
- POST /api/financial/expenses - Create expense with Neo4j relationships
- GET /api/financial/expenses - List with filtering and pagination  
- PUT /api/financial/expenses/:id - Update with relationship sync
- DELETE /api/financial/expenses/:id - Cascade delete from both databases
- GET /api/financial/insights/spending-patterns - Cross-domain analysis
- POST /api/financial/categories/suggest - AI-powered categorization

Acceptance Criteria:
- All CRUD operations working
- Dual database consistency maintained
- Financial insights returning useful data
- Relationship creation functioning
```

### 5. Health Subdomain Backend Implementation

```
Develop the Health subdomain backend per PRD Section 5.2 (Health & Wellness Tracking).

Requirements:
- Create health API routes in packages/api-server/src/routes/health.ts
- Implement data models for Meals, Workouts, BodyMetrics, HealthGoals
- Set up meal logging with nutritional calculation
- Create workout tracking with exercise library
- Implement body metrics trending (weight, sleep, mood)
- Add health goal tracking with progress calculations
- Create health insights: correlation between sleep and workout performance
- Set up relationships: Meal -> Ingredients, Workout -> Exercises, Metric -> Goal
- Add data visualization endpoints for charts

Key Features:
- Meal planning with grocery list generation
- Workout routine templates and tracking
- Health metric correlations using Neo4j queries
- Integration points for future wearable device data
- Nutritional goal tracking and recommendations

Acceptance Criteria:
- Health data CRUD operations functional
- Goal tracking with progress calculation
- Meal planning system working
- Cross-domain health insights available
```

### 6. Schedule Subdomain Backend Development

```
Build the Schedule subdomain backend per PRD Section 5.3 (Schedule & Task Management).

Requirements:  
- Create schedule API routes in packages/api-server/src/routes/schedule.ts
- Implement data models for Tasks, Events, Projects, TimeBlocks, Habits
- Set up task management with priority and status tracking
- Create calendar event integration preparation
- Implement habit tracking with streak calculation
- Add time blocking functionality for deep work
- Create project management with task relationships
- Set up deadline tracking and reminder system
- Implement productivity insights and time analysis

Key Features:
- Task dependencies and project hierarchies
- Habit formation tracking with statistics
- Time blocking optimization suggestions
- Productivity pattern analysis using Neo4j
- Integration preparation for calendar systems

Acceptance Criteria:
- Task and project management fully functional
- Habit tracking with streak calculations
- Time blocking system operational
- Productivity insights generating valuable data
```

## Phase 3: Desktop Application Development

### 7. Electron Desktop Application Skeleton

```
Create the Electron desktop application skeleton per PRD Section 7.1 (Desktop Application - Electron).

Requirements:
- Set up Electron main process in apps/desktop/src/main/main.ts
- Configure window management with proper sizing and state persistence
- Implement global keyboard shortcuts for quick capture (Ctrl/Cmd + Shift + N)
- Set up IPC communication between main and renderer processes
- Create application menu with subdomain navigation
- Set up auto-updater configuration
- Implement system tray integration for quick access
- Add deep linking support for cross-app navigation
- Configure development tools and debugging

Key Features:
- Multi-window support for different subdomains
- Global quick capture modal overlay
- System notifications for reminders and insights
- Offline-first data storage with sync when online
- Window state persistence across app restarts

Acceptance Criteria:
- Electron app launches successfully
- IPC communication working
- Global shortcuts functional
- Menu system navigable
- Development setup complete
```

### 8. Carousel Dashboard Navigation Component

```
Implement the carousel dashboard navigation system per PRD Section 4.1 and Section 8.1 (User Interface Specifications).

Requirements:
- Create carousel component in apps/desktop/src/renderer/components/carousel/
- Implement swipeable navigation between Financial, Health, Schedule subdomains
- Add smooth transitions and touch/trackpad gesture support
- Create navigation indicators and subdomain tabs
- Implement keyboard navigation (arrow keys, tab switching)
- Add subdomain loading states and error boundaries
- Create responsive layout that adapts to window size
- Set up state management for active subdomain
- Implement deep linking to specific subdomains

Design Requirements:
- Each subdomain gets full dashboard space when active
- Smooth transitions between subdomains (300ms easing)
- Visual indicators for available subdomains
- Support for future plugin subdomains
- Accessible navigation for keyboard users

Acceptance Criteria:
- Smooth carousel navigation working
- All three subdomains accessible
- Keyboard and gesture navigation functional
- State persistence across app sessions
- Responsive to window resizing
```

### 9. Relationship Sidebar and Graph Explorer

```
Build the relationship sidebar and graph explorer per PRD Section 4.2 (Cross-Domain Relationship Discovery).

Requirements:
- Create RelationshipSidebar component showing related items to current context
- Implement GraphExplorer with interactive visualization using vis-network
- Set up Neo4j query integration for relationship discovery
- Create relationship type filtering and strength indicators
- Add clickable navigation to related entities
- Implement graph visualization controls (zoom, pan, filter)
- Create connection insights panel with daily/weekly patterns
- Add relationship suggestion system with user confirmation
- Set up cross-domain navigation from graph nodes

Features:
- Real-time relationship updates via WebSocket
- Graph filtering by date range, subdomain, relationship type
- Visual relationship strength indicators
- Entity detail preview on hover
- Relationship creation UI for manual connections

Key Cypher Queries to implement:
```cypher
// Find all entities related to current context
MATCH (entity:Entity {id: $entityId})-[r]-(related)
RETURN entity, r, related, labels(related) as types

// Find temporal correlations within 24 hours
MATCH (event1)-[:OCCURRED_ON]->(date1:Date)
MATCH (event2)-[:OCCURRED_ON]->(date2:Date)  
WHERE date1.timestamp - date2.timestamp < 86400
RETURN event1, event2, labels(event1), labels(event2)
```

Acceptance Criteria:
- Relationship sidebar updates with context
- Graph visualization responsive and interactive
- Cross-domain navigation working
- Insights panel showing valuable patterns
```

## Phase 4: PWA and Mobile Features

### 10. Progressive Web App Setup with Offline Support

```
Create the PWA with offline support per PRD Section 7.2 (Progressive Web App - Next.js).

Requirements:
- Set up Next.js PWA in apps/pwa/ with next-pwa configuration
- Implement offline-first architecture with IndexedDB caching
- Create service worker for background sync and push notifications
- Set up Web Share Target API for quick capture from other apps
- Implement responsive design for mobile and tablet viewports
- Add PWA manifest with proper icons and theme colors
- Create offline indicator and sync status display
- Set up background sync for when connectivity returns
- Implement push notification system for reminders

Key Features:
- Offline data access with local IndexedDB storage
- Background sync queue for offline actions
- Share target integration for quick data entry
- Mobile-optimized UI with touch gestures
- Push notifications for insights and reminders

Technical Implementation:
- Use Workbox for service worker management
- Implement custom sync strategies for different data types
- Create offline-capable graph visualization
- Set up conflict resolution for offline-online sync
- Add network status detection and user feedback

Acceptance Criteria:
- PWA installs on mobile devices
- Offline functionality working
- Background sync operational
- Share target receiving data
- Responsive design across viewports
```

### 11. Mobile Quick Capture and Bottom Navigation

```
Implement mobile-optimized quick capture and navigation per PRD Section 4.4 (Quick Capture Mechanisms).

Requirements:
- Create bottom navigation component with floating "+" quick add button
- Implement bottom sheet modal for subdomain selection and data entry
- Set up mobile-optimized forms with appropriate input types
- Create swipe gestures for navigation between subdomains
- Add haptic feedback for touch interactions (where supported)
- Implement mobile-specific shortcuts and gesture controls
- Create thumb-friendly touch targets and spacing
- Set up voice input integration for supported browsers
- Add mobile share sheet integration

Mobile UX Features:
- One-handed operation support
- Swipe-based navigation patterns
- Touch-optimized form controls
- Quick actions accessible within 2 taps
- Predictive text and auto-completion
- Offline form submission with sync queue

Acceptance Criteria:
- Bottom navigation accessible and responsive
- Quick capture working from any screen
- Swipe navigation functional
- Mobile forms optimized for touch
- Share integration working on supported platforms
```

## Phase 5: Voice Interface Development

### 12. Alexa Skill Foundation and Echo Show Support

```
Create Alexa Skill foundation with Echo Show visual support per PRD Section 7.4 (Voice Interface - Alexa Skills Kit).

Requirements:
- Set up Alexa Skill in apps/alexa-skill/ with ASK CLI configuration
- Create interaction model with voice intents for data entry and querying
- Implement Lambda functions for skill backend in apps/alexa-skill/lambda/
- Set up Echo Show visual templates (APL) for data display
- Create voice intents for: logging expenses, adding tasks, checking insights
- Implement slot filling for structured data entry
- Add account linking for user authentication
- Set up webhook integration with main API server
- Create conversational flows for complex data entry

Voice Intents to Implement:
```json
{
  "intents": [
    {
      "name": "LogExpenseIntent",
      "slots": [
        {"name": "Amount", "type": "AMAZON.NUMBER"},
        {"name": "Category", "type": "CUSTOM_CATEGORIES"},
        {"name": "Description", "type": "AMAZON.SearchQuery"}
      ],
      "samples": [
        "log an expense of {Amount} dollars for {Category}",
        "I spent {Amount} on {Description}",
        "add expense {Description} for {Amount}"
      ]
    },
    {
      "name": "AddTaskIntent", 
      "slots": [
        {"name": "TaskName", "type": "AMAZON.SearchQuery"},
        {"name": "DueDate", "type": "AMAZON.DATE"}
      ],
      "samples": [
        "add task {TaskName}",
        "remind me to {TaskName}",
        "create task {TaskName} due {DueDate}"
      ]
    }
  ]
}
```

Echo Show Visual Features:
- Daily dashboard summary on skill launch
- Visual confirmation of logged data
- Interactive lists for recent items
- Touch navigation for detailed views

Acceptance Criteria:
- Alexa skill responds to voice commands
- Echo Show displays visual feedback
- Data successfully logged to main system
- Account linking working
- Conversational flows natural and helpful
```

### 13. Voice Data Entry and Insight Queries

```
Implement advanced voice data entry and insight querying for Alexa per PRD Section 4.4.

Requirements:
- Create complex conversational flows for detailed data entry
- Implement voice querying for cross-domain insights
- Set up natural language processing for relationship queries
- Add voice confirmation and error correction flows
- Create daily/weekly voice briefings with personalized insights
- Implement voice shortcuts for frequent actions
- Set up proactive notifications based on data patterns
- Add multi-turn conversations for complex operations

Advanced Voice Features:
- "Alexa, how much did I spend on groceries this month?"
- "Alexa, what's the correlation between my sleep and productivity?"
- "Alexa, show me tasks related to my health goals"
- "Alexa, give me my weekly insights summary"
- "Alexa, log my workout: 30 minute run, 5 miles"

Conversation Flow Examples:
```
User: "Alexa, add a medical expense"
Alexa: "What was the medical expense for?"
User: "Doctor visit"  
Alexa: "How much did you spend?"
User: "One hundred fifty dollars"
Alexa: "I've logged $150 for a doctor visit today. Would you like me to link this to any existing appointments or health goals?"
```

Implementation Requirements:
- Natural language understanding for amounts, dates, categories
- Context persistence across conversation turns
- Integration with Neo4j for relationship queries
- Voice-optimized response formatting
- Error handling and clarification requests

Acceptance Criteria:
- Multi-turn conversations working smoothly
- Complex data entry via voice functional
- Insight queries returning valuable information
- Voice briefings personalized and helpful
- Error correction flows intuitive
```

## Phase 6: Advanced Features and Integration

### 14. Cross-Domain Insight Generation System

```
Build the automated insight generation system per PRD Section 4.2 (Cross-Domain Relationship Discovery).

Requirements:
- Create insight generation engine using Neo4j pattern matching
- Implement daily/weekly insight calculation jobs
- Set up correlation detection between different life domains
- Create insight scoring and relevance ranking
- Add insight persistence and user feedback collection
- Implement insight notification system across all platforms
- Create customizable insight preferences and filters
- Set up machine learning preparation for pattern recognition

Key Insight Patterns to Implement:
```cypher
// Spending correlation with activities
MATCH (expense:Expense)-[:CATEGORIZED_AS]->(cat:Category {name: 'Groceries'})
MATCH (workout:Workout)
WHERE expense.date >= date() - duration({weeks: 4})
  AND workout.date >= date() - duration({weeks: 4})
WITH date.truncate('week', expense.date) as week, 
     sum(expense.amount) as grocerySpend,
     count(workout) as workoutCount
WHERE grocerySpend > 0 AND workoutCount > 0
RETURN week, grocerySpend, workoutCount, 
       grocerySpend / workoutCount as spendPerWorkout
ORDER BY week

// Productivity correlation with health metrics  
MATCH (task:Task)-[:COMPLETED_ON]->(date:Date)
MATCH (sleep:HealthMetric {type: 'sleep'})-[:RECORDED_ON]->(date)
WITH date, count(task) as tasksCompleted, sleep.value as hoursSlept
WHERE tasksCompleted > 0 AND hoursSlept > 0
RETURN date, tasksCompleted, hoursSlept,
       tasksCompleted / hoursSlept as productivityPerHour
ORDER BY date DESC
```

Insight Categories:
- Spending behavior patterns
- Health impact on productivity
- Time management effectiveness
- Goal achievement correlations
- Habit formation success rates

Acceptance Criteria:
- Daily insights generated automatically
- Correlation detection working accurately
- Insights ranked by relevance and importance
- User feedback collection functional
- Notification system delivering timely insights
```

### 15. Plugin Architecture and Extensibility Framework

```
Implement the plugin/subdomain architecture per PRD Section 4.5 for future extensibility.

Requirements:
- Create subdomain registration system in packages/api-server/src/framework/
- Implement plugin discovery and loading mechanism
- Set up standardized subdomain interface and lifecycle hooks
- Create plugin configuration schema validation
- Add dynamic route registration for subdomain APIs
- Implement plugin permission system
- Create subdomain communication bus for inter-plugin messaging
- Set up plugin marketplace preparation (metadata, versioning)
- Add hot-reloading for development plugins

Plugin Interface Structure:
```typescript
interface SubdomainPlugin {
  id: string;
  version: string;
  name: string;
  description: string;
  
  // Lifecycle hooks
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onActivate?(): Promise<void>;
  onDeactivate?(): Promise<void>;
  
  // Data schema
  getNodeTypes(): Neo4jNodeType[];
  getRelationshipTypes(): Neo4jRelationshipType[];
  
  // API endpoints
  getRoutes(): FastifyRouteOptions[];
  
  // UI components
  getDashboardComponent(): React.ComponentType;
  getQuickCaptureForm(): React.ComponentType;
  
  // Framework integration
  getSearchIndexes(): SearchIndex[];
  getInsightQueries(): CypherQuery[];
}
```

Framework Services for Plugins:
- Neo4j query builder and executor
- MongoDB collection management
- Authentication and authorization
- WebSocket event broadcasting
- Search index management
- Insight generation utilities

Acceptance Criteria:
- Plugin loading and registration working
- Dynamic API route registration functional
- Plugin lifecycle hooks executing correctly
- Inter-plugin communication working
- Permission system enforced
- Development hot-reloading operational
```

## Usage Instructions

1. Copy any prompt above directly into Claude Code
2. Each prompt is self-contained and references specific PRD sections
3. Run the prompts in suggested phase order for best results
4. Modify prompts based on your specific implementation preferences
5. Use the acceptance criteria to validate implementation completion

Each prompt is designed to be immediately actionable while maintaining alignment with the comprehensive PRD architecture and requirements.