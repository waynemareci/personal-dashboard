# Product Requirements Document
# Personal Dashboards powered by Dynamic Knowledge Graphs

**Version:** 1.0  
**Date:** October 23, 2025  
**Author:** Solo Developer  
**Status:** Draft for Implementation  

---

## Document Control

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 23, 2025 | Initial comprehensive PRD | Solo Developer |

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Philosophy](#2-product-vision--philosophy)
3. [User Personas](#3-user-personas)
4. [Core Framework Features](#4-core-framework-features)
5. [Initial Subdomain Specifications](#5-initial-subdomain-specifications)
6. [Technical Architecture](#6-technical-architecture)
7. [Platform-Specific Implementation Guides](#7-platform-specific-implementation-guides)
8. [User Interface Specifications](#8-user-interface-specifications)
9. [Data Flows & Synchronization](#9-data-flows--synchronization)
10. [User Stories with Acceptance Criteria](#10-user-stories-with-acceptance-criteria)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Development Roadmap](#12-development-roadmap)
13. [Testing Strategy](#13-testing-strategy)
14. [Success Metrics & Analytics](#14-success-metrics--analytics)
15. [Risk Assessment & Mitigation](#15-risk-assessment--mitigation)
16. [Security & Privacy](#16-security--privacy)
17. [Future Extensibility](#17-future-extensibility)
18. [Competitive Analysis Deep Dive](#18-competitive-analysis-deep-dive)
19. [Go-to-Market Strategy](#19-go-to-market-strategy)
20. [Learning Resources & Implementation Guide](#20-learning-resources--implementation)
21. [Appendices](#21-appendices)

---

# 1. Executive Summary

## 1.1 Vision Statement

Personal Dashboards powered by Dynamic Knowledge Graphs represents a paradigm shift in Personal Knowledge Management (PKM). Unlike existing tools that treat different life domains as isolated silos, this meta-framework creates a unified, graph-based ecosystem where financial data, health metrics, schedules, and knowledge bases interconnect through Neo4j's relationship discovery engine. The system surfaces unexpected insights by treating all personal data as nodes in a living knowledge graph, revealing correlations and patterns invisible to traditional productivity tools.

## 1.2 Market Opportunity

The PKM market is experiencing explosive growth, estimated at $2.1B in 2024 and projected to reach $5.8B by 2028. However, current solutions suffer from fundamental limitations:

- **Fragmentation:** Users juggle 5-10 different apps (Mint for finance, Todoist for tasks, Notion for notes, MyFitnessPal for health)
- **Missed Connections:** Traditional tools can't answer "Which projects have I been most productive on during high-sleep weeks?" or "How do my grocery expenses correlate with meal planning success?"
- **Limited Graph Capabilities:** While Obsidian and Roam offer note-linking, they don't extend graph thinking to non-textual life data
- **No Unified Context:** Switching between apps loses the holistic view of how different life aspects influence each other

This creates a significant opportunity for a graph-native, multi-domain integration platform that treats relationships as first-class features.

## 1.3 Unique Value Proposition

**"Turn your life data into a knowledge graph that thinks for you."**

Our three core differentiators:

1. **Graph-First Architecture:** Every piece of data (transactions, tasks, health metrics, notes) exists as nodes in Neo4j, with relationships automatically detected and surfaced
2. **Carousel Dashboard Framework:** Modular, swipeable subdomain dashboards that maintain context across domains while providing specialized views
3. **Cross-Domain Intelligence:** Automatic insight generation through Cypher queries that span arbitrary data types ("Show me how coffee purchases correlate with workout completion")

## 1.4 Commercial Trajectory

### Phase 1: Personal MVP (Months 0-6)
- Solo developer builds for personal use
- Validates architecture with 3 core subdomains
- Establishes technical feasibility of graph-powered insights

### Phase 2: Private Beta (Months 7-12)
- Friend/family testing with 5-10 users
- Refines UI/UX based on real-world feedback
- Establishes plugin architecture for extensibility

### Phase 3: Market Launch (Months 13-18)
- Public beta with freemium model
- Target: quantified-self enthusiasts, knowledge workers, productivity optimizers
- Pricing: Free (2 subdomains) → $9/mo (unlimited) → $49/mo (team features)

### Phase 4: Scale & Ecosystem (Months 19-24)
- Third-party subdomain marketplace
- Enterprise features (team knowledge graphs)
- API for integrations with existing tools

## 1.5 Success Criteria Summary

- **Personal Use:** Daily reliance replacing 3+ existing tools, 10+ valuable cross-domain insights weekly
- **Beta Phase:** 3+ users adopting for daily use, <5% sync conflicts, zero data loss
- **Commercial:** 1,000 MAU within 6 months of launch, 20% free-to-paid conversion, $5K MRR

---

# 2. Product Vision & Philosophy

## 2.1 Why Existing PKM Tools Fall Short

### The Single-Domain Trap
Most productivity tools excel at one thing: Mint tracks finances brilliantly, Todoist manages tasks effectively, Notion organizes notes beautifully. But life isn't compartmentalized. When you log a medical expense in Mint, it doesn't connect to the doctor's appointment in Google Calendar or the health notes in Evernote. You maintain these connections manually in your head—or you lose them.

### The Graph Thinking Gap
Tools like Obsidian and Roam pioneered bidirectional linking for notes, demonstrating the power of graph-based knowledge representation. But they limit this paradigm to textual content. Your financial transactions, fitness metrics, and calendar events remain locked in tabular/chronological formats, unable to participate in the graph.

### The Integration Illusion
Zapier and IFTTT promise integration, but they offer linear automation (if-this-then-that), not relationship discovery. They can copy data between systems but can't answer "What's the relationship between my grocery spending and my workout frequency?"

### The Context-Switching Tax
Studies show each app switch costs 23 minutes of productive focus. Power users juggling 10+ apps for life management spend hours weekly just navigating between tools, losing the holistic view of their life's interconnected systems.

## 2.2 The Power of Unexpected Connections

**Core Philosophy:** The most valuable insights come from relationships you didn't know to look for.

Examples from personal testing:
- Discovered Friday coffee expenses correlated with Monday productivity (weekend rest matters more than caffeine)
- Found that projects referencing "efficiency" notes took 30% longer to complete (overthinking tax)
- Realized medical appointment scheduling in the morning led to 60% higher workout completion that day (momentum effect)

These insights emerged not from manual analysis but from Neo4j queries that explored the graph structure itself. Traditional tools require you to know what you're looking for. Graph-powered discovery reveals what you didn't know to search for.

## 2.3 Subdomain Modularity Philosophy

### Separation of Concerns
Each subdomain is a specialized dashboard with domain-specific UI/UX:
- Financial subdomain: Charts, transaction tables, budget meters
- Health subdomain: Trend lines, calorie counters, workout logs
- Schedule subdomain: Calendar views, todo lists, time blocks

### Unified Through Graph
Despite UI differences, all subdomains share:
- Common entity types (Person, Location, Topic)
- Standard relationship registration with the framework
- Participation in cross-domain queries
- Framework-provided services (search, sync, relationship explorer)

### Plugin Architecture
Future subdomains can be developed independently and "plug in" by:
1. Declaring their Neo4j node types and relationships
2. Providing a React component for their dashboard UI
3. Registering with the framework's subdomain registry
4. Immediately participating in cross-domain insights

## 2.4 Privacy-First, User-Owned Data Principles

### Your Data, Your Control
- All data stored in user-owned databases (personal Neo4j/MongoDB instances or dedicated cloud deployments)
- Export functionality provides complete data portability in standard formats
- No vendor lock-in: all schemas documented, migration paths provided

### Privacy by Architecture
- No centralized data warehouse (until user opts into commercial features)
- Offline-first design means data lives on your devices
- Sync mechanisms use encrypted channels
- Optional: self-hosted backend for complete data sovereignty

### Ethical AI/ML Stance
Future ML features for insight generation will:
- Run locally or in user-controlled environments
- Never train on user data without explicit consent
- Provide full transparency into how insights are generated
- Allow users to disable any ML features

---

# 3. User Personas

## 3.1 Primary Persona: Solo Developer Power User

**Name:** Alex Chen (Representative User: You)
**Age:** 32
**Occupation:** Full-stack Developer / Technical Architect
**Location:** Urban/Suburban, Remote-first work environment

### Background & Context
Alex is an experienced developer with 8+ years in web and desktop development, currently working solo on personal projects and consulting work. They have a strong technical background but are expanding into mobile development and IoT integrations (Echo Show/Alexa Skills). Alex values efficiency, data-driven insights, and tools that can scale with their growing complexity of personal data.

### Goals & Motivations
- **Primary Goal:** Create a unified system to manage all personal data domains (finance, health, tasks, knowledge) with automatic relationship discovery
- **Efficiency:** Replace scattered tools (multiple apps, spreadsheets, notes) with one integrated system
- **Insight Generation:** Discover unexpected connections between different life domains (e.g., health events correlating with expenses, reading influencing projects)
- **Technical Learning:** Use this project to master mobile PWA development and Echo Show/Alexa Skills Kit
- **Future Commercialization:** Build something personally valuable that could eventually become a commercial product

### Technical Profile
- **Strengths:** React, Next.js, Neo4j, MongoDB, web development patterns
- **Learning Areas:** Mobile PWA optimization, Alexa Skills Kit, advanced Neo4j query optimization
- **Preferences:** Keyboard-driven interfaces, data visualization, graph-based thinking
- **Development Style:** Pragmatic, iterative, documentation-focused

### Daily Usage Patterns
- **Morning (Echo Show):** Quick summary of day's priorities across all domains, voice capture of initial thoughts
- **Work Hours (Desktop):** Deep data entry, analysis, and relationship exploration during breaks
- **Evening (Desktop):** Comprehensive review and planning session using cross-domain insights
- **Mobile (PWA):** Quick capture while away from desk, summary viewing during commute

### Pain Points with Current Tools
- **Data Silos:** Financial app doesn't connect to health tracking, task manager doesn't reference knowledge base
- **Manual Correlation:** Spending hours manually finding patterns between different data types
- **Context Switching:** 6+ different apps for different domains, no unified view
- **No Relationship Discovery:** Missing valuable insights because connections aren't surfaced automatically
- **Sync Issues:** Inconsistent data between mobile and desktop versions of various tools

### Success Metrics
- **Daily Active Use:** Uses the system every day within 6 months of launch
- **Tool Consolidation:** Replaces at least 4 existing tools with this unified system
- **Insight Generation:** Discovers 2+ valuable cross-domain relationships per week
- **Development Learning:** Successfully builds and deploys Echo Show skill, improves mobile development skills

### Feature Priorities (High to Low)
1. **Desktop carousel dashboard** - Primary interface for deep work
2. **Neo4j relationship discovery** - Core differentiator from existing tools
3. **Financial subdomain expansion** - Building on existing implementation
4. **Cross-domain search** - Essential for finding connections
5. **PWA mobile capture** - Quick data entry on the go
6. **Echo Show integration** - Learning opportunity and convenience feature

## 3.2 Secondary Persona: The Architect (Solo Developer)

**Name:** Alex (Doppleganger)  
**Age:** [ASSUMPTION: 30-45]  
**Occupation:** Solo Developer / Knowledge Worker  
**Technical Proficiency:** Expert in web/desktop development, learning mobile/Echo Show

### Background
- Maintains multiple life domains with scattered tools
- Frustrated by lack of integration between financial, health, task, and knowledge systems
- Experienced with Neo4j and graph thinking
- Values control over data and customizability
- Willing to invest development time for long-term productivity gains

### Goals
- Unified view of all life data in one system
- Discover non-obvious correlations between life domains
- Reduce cognitive load from app-switching
- Build a commercial product that solves real problems
- Learn mobile and voice interface development

### Pain Points
- Current financial tracking tool has unacceptable UI
- PWA prototype can't display real data yet
- Managing relationships between domains manually
- No way to query across life aspects ("How does sleep affect my code quality?")

### Usage Patterns
- **Morning:** Check Echo Show for day's priorities across all subdomains
- **Day:** Desktop for deep work, data entry, analysis
- **Mobile:** Quick capture of expenses, tasks, notes while away from desk
- **Evening:** Review dashboard to spot patterns and plan tomorrow

### Success Metrics
- Replaces 3+ current tools within 6 months
- Discovers 10+ actionable cross-domain insights weekly
- Daily use becomes habit
- System feels indispensable to decision-making

## 3.3 Future Persona: Knowledge Workers

**Name:** Sarah Martinez
**Age:** 28
**Occupation:** Product Manager at SaaS Company
**Location:** Hybrid work environment (3 days office, 2 days remote)

### Background & Context
Sarah manages multiple projects, maintains extensive research notes, tracks professional development goals, and wants to optimize her personal productivity systems. She's not technically minded enough to build her own solutions but appreciates tools that offer deep customization and insight generation.

### Goals & Motivations
- **Professional Optimization:** Connect project work with learning goals, track what research influences which decisions
- **Personal Growth:** Link reading/courses to career advancement, health goals to productivity patterns
- **Efficiency:** Reduce time spent in multiple productivity apps, get better insights from existing data
- **Evidence-Based Decisions:** Use data to optimize work patterns, meeting schedules, and personal habits

### Technical Profile
- **Strengths:** Power user of productivity tools (Notion, Todoist, Calendly), comfortable with complex interfaces
- **Learning Areas:** Basic database concepts, advanced search patterns
- **Preferences:** Visual interfaces, mobile-first design, integration with existing tools
- **Usage Style:** Structured, goal-oriented, metrics-driven

### Daily Usage Patterns
- **Morning:** Review cross-domain priorities (project deadlines + personal goals + health tracking)
- **Work Hours:** Quick capture of meeting notes, project updates, research insights
- **Commute:** Mobile review of daily summaries and relationship insights
- **Evening:** Weekly/monthly review sessions using advanced relationship queries

### Pain Points with Current Tools
- **Information Overload:** Too much data across too many platforms, hard to see patterns
- **Manual Planning:** Spending significant time correlating work projects with personal development
- **Limited Insights:** Current tools show what happened but not why or how things connect
- **Mobile Limitations:** Desktop productivity tools have poor mobile experiences

### Success Metrics
- **Weekly Planning Time Reduction:** 50% less time spent on weekly planning and review
- **Insight Actionability:** Takes action on 80% of relationship insights surfaced by the system
- **Goal Achievement:** 25% improvement in personal and professional goal completion rates
- **Tool Consolidation:** Replaces 3-5 existing productivity tools

## 3.4 Future Persona: The Quantified Optimizer

**Name:** Jordan  
**Age:** 28-40  
**Occupation:** Knowledge Worker (PM, Designer, Analyst)  
**Technical Proficiency:** Comfortable with apps, not a developer

### Background
- Already uses 5-8 productivity/tracking apps
- Interested in quantified self movement
- Frustrated by data silos
- Willing to pay $10-20/mo for a unified solution
- Wants insights without manual analysis

### Goals
- Single dashboard for life overview
- Automatic correlation discovery
- Mobile-first experience with desktop power when needed
- Beautiful, intuitive UI
- Worth the switching cost from existing tools

### Pain Points
- Too many apps to maintain
- Insights require manual spreadsheet work
- Subscription fatigue (paying for 5+ apps)
- No way to connect health data to work productivity

### Adoption Criteria
- Imports data from existing tools (Mint, Todoist, etc.)
- Works seamlessly across devices
- Clear value proposition within first week
- Trustworthy data handling

## 3.5 Future Persona: Life Optimizers

**Name:** Marcus Johnson
**Age:** 35
**Occupation:** Marketing Director / Quantified Self Enthusiast
**Location:** Urban, high-stress environment

### Background & Context
Marcus is deeply invested in personal optimization - tracking fitness, sleep, productivity, finances, reading, and relationships. Currently uses 8+ different tracking apps but struggles to find meaningful connections between different life domains. Has some technical literacy but isn't a developer.

### Goals & Motivations
- **Holistic Optimization:** Understand how different life areas influence each other
- **Data-Driven Lifestyle:** Make decisions based on patterns rather than intuition
- **Health & Performance:** Optimize energy, productivity, and well-being through data insights
- **Life Experimentation:** Run personal experiments and measure cross-domain impacts

### Technical Profile
- **Strengths:** Data analysis mindset, comfortable with complex tracking systems, API integrations
- **Learning Areas:** Graph database concepts, advanced correlation analysis
- **Preferences:** Rich data visualization, automated tracking, predictive insights
- **Usage Style:** Experimental, metrics-heavy, optimization-focused

### Daily Usage Patterns
- **Multiple Check-ins:** Throughout day for various tracking (meals, mood, energy, expenses)
- **Pattern Recognition:** Daily review of relationship insights and correlations
- **Weekly Deep Dives:** Extended analysis sessions looking for optimization opportunities
- **Experimentation Tracking:** Monitoring impacts of lifestyle changes across all domains

### Pain Points with Current Tools
- **Data Integration Complexity:** Managing exports/imports between 8+ tracking apps
- **Shallow Correlations:** Existing tools only show basic correlations within single domains
- **Manual Analysis:** Spending hours in spreadsheets trying to find cross-domain patterns
- **Inconsistent Tracking:** Different apps have different UX, leading to incomplete data

### Success Metrics
- **Correlation Discovery:** Finds 5+ actionable cross-domain correlations per month
- **Optimization Results:** Measurable improvements in 3+ life domains within 6 months
- **Time Efficiency:** 70% reduction in manual data analysis time
- **Predictive Accuracy:** System accurately predicts outcomes based on patterns 60%+ of the tim

## 3.6 Future Persona: The Team Leader

**Name:** Morgan  
**Age:** 35-50  
**Occupation:** Manager / Team Lead  
**Technical Proficiency:** Moderate

### Background
- Manages team projects and personal knowledge simultaneously
- Needs to track how personal energy affects team performance
- Values shared knowledge bases but wants personal data separate
- Budget for tools: $50-100/mo

### Goals
- Manage both personal and team information
- Keep personal health/finance data private
- Share project knowledge with team
- Understand how personal factors affect leadership effectiveness

### Pain Points
- Can't mix personal and professional in existing tools appropriately
- Team uses different systems than personal preferences
- No insight into how personal life affects work performance

## 3.7 Anti-Personas

### The Simplicity Seeker
- Wants single-purpose, simple apps
- Doesn't care about cross-domain insights
- Prefers "good enough" to "powerful"
- **Why not a fit:** Our complexity is a feature, not a bug

### The Enterprise-Only User
- Only cares about work data
- No personal life integration needed
- Wants admin controls, permissions, audit logs
- **Why not a fit (Phase 1-3):** We're personal-first, enterprise later

### The Non-Tracker
- Doesn't track anything systematically
- Uncomfortable with data collection
- Prefers intuition over metrics
- **Why not a fit:** Requires baseline data discipline

### Simple Tool Preferrer
**Profile:** Users who want single-purpose, simple tools and find complex integrations overwhelming
**Why Anti:** This system's core value is complexity and integration - the opposite of what they want
**Alternative Tools:** They're better served by simple, focused apps like Mint (finance only) or Apple Notes (notes only)

### Privacy Minimalists
**Profile:** Users who prefer to keep different life domains completely separate for privacy/security
**Why Anti:** The system's core feature is connecting across domains, which they specifically want to avoid
**Alternative Tools:** They should use completely separate, isolated tools for each domain

### Non-Data-Driven Users
**Profile:** Users who prefer intuition-based decisions and find data tracking burdensome
**Why Anti:** This system requires consistent data input and rewards analytical thinking
**Alternative Tools:** Simple task managers, traditional calendars, basic budgeting apps without analytics

### Enterprise/Team-First Users
**Profile:** Users whose primary need is collaboration and team productivity
**Why Anti:** This system is designed for personal use and cross-domain insights that aren't relevant for team collaboration
**Alternative Tools:** Slack, Microsoft Teams, Asana, enterprise-focused productivity suites

### Platform Loyalists
**Profile:** Users deeply invested in single-ecosystem solutions (all Apple, all Google, all Microsoft)
**Why Anti:** This system requires multi-platform usage and doesn't integrate deeply with any single ecosystem
**Alternative Tools:** Apple's ecosystem (Health, Notes, Calendar, etc.), Google Workspace, Microsoft 365

---

# 4. Core Framework Features

## 4.1 Carousel Dashboard Navigation

### Concept
The carousel is the primary navigation metaphor: a horizontal stream of specialized subdomain dashboards that users swipe/arrow through. Think of it as a living dashboard that adapts to show different facets of your integrated life data.

### Key Characteristics

**Visual Design:**
- Horizontal layout with current subdomain centered, adjacent ones partially visible
- Smooth transition animations between subdomains
- Breadcrumb showing current position (e.g., "Financial → Health → Schedule")
- Minimap view showing all available subdomains as thumbnails

**Interaction Patterns:**
- **Desktop:** Arrow keys (←/→), keyboard shortcuts (Ctrl+1-9), mouse drag
- **Mobile:** Swipe gestures, edge swipe for quick subdomain picker
- **Echo Show:** Voice ("Alexa, next dashboard" / "Alexa, show financial")

**State Persistence:**
- Last-viewed subdomain remembered per platform
- Each subdomain maintains its own state (filter selections, scroll position)
- Framework-level state (search, relationship sidebar) persists across all subdomains

### Implementation Requirements

```javascript
// Subdomain Registration Interface
interface SubdomainRegistration {
  id: string; // 'financial', 'health', 'schedule'
  name: string; // Display name
  icon: ReactElement; // Icon for carousel
  component: ReactComponent; // Dashboard UI
  color: string; // Theme color for this subdomain
  order: number; // Position in carousel
  nodeTypes: string[]; // Neo4j node labels this subdomain creates
  relationships: RelationshipDefinition[]; // Relationship types
  quickActions: QuickAction[]; // Actions available from other subdomains
}
```

### User Stories
*(Detailed stories in Section 10)*

## 4.2 Cross-Subdomain Relationship Discovery Engine

### Concept
The "magic" of the system: automatically detect, surface, and navigate relationships between entities across different life domains.

### Core Components

**1. Relationship Sidebar**
- Persistent panel showing related items to current context
- Displays relationships from Neo4j queries
- Clickable navigation to related entities
- Shows relationship type and strength (if computable)

**2. Connection Insights Panel**
- Daily/weekly digest of interesting cross-domain patterns
- Examples:
  - "You spend 40% more on groceries in weeks with 4+ workouts"
  - "Projects tagged 'urgent' take 2x longer than 'important' projects"
  - "Doctor appointments scheduled on Tuesdays have 80% better follow-through"

**3. Graph Explorer**
- Visual representation of Neo4j relationships
- Interactive graph visualization (powered by vis.js or D3)
- Filter by date range, subdomain, relationship type
- Click any node to navigate to its detail view

**4. Smart Suggestions**
- System proposes relationships for user confirmation
- Example: "You mentioned Dr. Smith in a note. Link to the $150 medical expense from that date?"
- User confirms/rejects, system learns patterns (future ML opportunity)

### Neo4j Query Patterns

```cypher
// Example: Find all entities related to a specific person
MATCH (person:Person {name: 'Dr. Smith'})-[r]-(entity)
RETURN person, r, entity, labels(entity) as types

// Example: Find temporal correlations
MATCH (event1)-[:OCCURRED_ON]->(date1:Date)
MATCH (event2)-[:OCCURRED_ON]->(date2:Date)
WHERE date1.timestamp - date2.timestamp < 86400 // Within 24 hours
RETURN event1, event2, labels(event1), labels(event2)

// Example: Cross-domain pattern detection
MATCH (expense:Expense)-[:CATEGORY]->(cat:Category {name: 'Groceries'})
MATCH (workout:Workout)
WHERE expense.date >= date() - duration({weeks: 4})
  AND workout.date >= date() - duration({weeks: 4})
WITH date.truncate('week', expense.date) as week, 
     sum(expense.amount) as grocerySpend,
     count(workout) as workoutCount
RETURN week, grocerySpend, workoutCount
ORDER BY week
```

### Implementation Requirements

**Backend API Endpoints:**
- `GET /api/relationships/:entityId` - Get all relationships for an entity
- `POST /api/relationships/suggest` - Generate relationship suggestions
- `GET /api/insights/daily` - Daily connection insights
- `POST /api/graph/explore` - Custom Cypher queries with safety limits

**Frontend Components:**
- `<RelationshipSidebar />` - Persistent sidebar component
- `<GraphExplorer />` - Interactive graph visualization
- `<InsightCard />` - Display format for discovered insights
- `<RelationshipSuggestion />` - UI for confirming/rejecting suggestions

## 4.3 Unified Search and Filtering

### Concept
Single search box that queries across all subdomains, returning results organized by type with relationship context.

### Search Capabilities

**Full-Text Search:**
- Searches Neo4j node properties (if using full-text indexes)
- Searches MongoDB documents (notes, descriptions)
- Returns results with snippets and context

**Faceted Filtering:**
- Filter by subdomain: "Show only Financial results"
- Filter by date range: "Last 30 days"
- Filter by relationship type: "Show only items related to 'Project X'"
- Filter by entity type: "Show only People"

**Saved Searches:**
- Save complex queries for reuse
- Example saved searches:
  - "Medical expenses this year"
  - "All tasks mentioning research"
  - "Workouts on weekdays in Q4"

### Search Result Display

```
[Financial] Target Credit Card Purchase - $156.32
  └─ Related to: [Health] Doctor Appointment (same day)
  └─ Referenced in: [Schedule] Task "Submit medical reimbursement"
  
[Health] Workout: Morning Run - 5.2 miles
  └─ Related to: [Schedule] Habit "Morning exercise"
  └─ Tagged: #cardio, #morning

[Knowledge] Note: "Neo4j Query Optimization"
  └─ Referenced by: [Schedule] Project "Dashboard Performance"
  └─ Related to: 3 other notes
```

### Implementation

**Neo4j Full-Text Index:**
```cypher
CREATE FULLTEXT INDEX entity_search IF NOT EXISTS
FOR (n:Entity) ON EACH [n.name, n.description, n.notes]
```

**Search Query API:**
```javascript
// POST /api/search
{
  "query": "medical",
  "filters": {
    "subdomains": ["financial", "health"],
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-10-23"
    },
    "relationshipType": "RELATED_TO"
  },
  "limit": 20,
  "offset": 0
}
```

## 4.4 Quick Capture Mechanisms

### Concept
Reduce friction for data entry from any context: global keyboard shortcuts, mobile share targets, voice commands.

### Desktop Quick Capture

**Global Keyboard Shortcut:**
- `Ctrl/Cmd + Shift + N` - Opens quick capture modal overlay
- User selects subdomain from dropdown
- Minimal form with smart defaults
- Saves and dismisses, user stays in current context

**Quick Capture Modal:**
```
┌────────── Quick Capture ──────────┐
│ Subdomain: [Financial ▼]         │
│                                   │
│ What: ________________________    │
│ Amount: $______                   │
│ Date: [Today ▼]                   │
│                                   │
│ Related to (optional):            │
│ [Search entities...]              │
│                                   │
│ [ Create ]  [ Create & Another ]  │
└───────────────────────────────────┘
```

### Mobile Quick Capture (PWA)

**Share Target Integration:**
- Register PWA as share target for text, URLs, images
- When user shares from another app, opens quick capture with pre-filled content
- Example: Share restaurant receipt photo → Financial expense entry with OCR (future)

**Bottom Navigation Quick Add:**
- Floating "+" button always visible
- Tapping opens bottom sheet with subdomain selector
- Each subdomain provides a simplified entry form

### Voice Capture (Echo Show)

**Voice Intents:**
```
User: "Alexa, add a task"
Alexa: "What task would you like to add?"
User: "Call dentist for checkup"
Alexa: "I've added 'Call dentist for checkup' to your schedule. Would you like to set a due date?"

User: "Alexa, log an expense"
Alexa: "What did you spend money on?"
User: "Coffee at Starbucks, $6.50"
Alexa: "Logged $6.50 for coffee at Starbucks today."
```

### Implementation Requirements

**Backend:**
- `POST /api/quick-capture` - Unified endpoint for all capture sources
- Accepts flexible payload with subdomain identifier
- Returns created entity with temporary ID (before sync)

**Frontend:**
- Desktop: Electron global shortcut registration
- PWA: Web Share Target API integration
- Echo Show: Alexa Intent handling with slot filling

## 4.5 Plugin/Subdomain Architecture

### Concept
Extensible system where new subdomains can be added without modifying core framework code. Each subdomain is a self-contained module that registers with the framework.

### Subdomain Structure

```
/subdomains
  /financial
    - index.ts           // Subdomain entry point
    - dashboard.tsx      // Main dashboard component
    - schema.cypher      // Neo4j schema definition
    - api-routes.ts      // Subdomain-specific API endpoints
    - components/        // UI components
    - utils/             // Subdomain-specific utilities
    - config.json        // Subdomain metadata
  /health
    - [similar structure]
  /schedule
    - [similar structure]
```

### Registration Mechanism

**config.json:**
```json
{
  "id": "financial",
  "version": "1.0.0",
  "name": "Financial Dashboard",
  "description": "Track expenses, income, budgets, and net worth",
  "author": "Core Framework",
  "icon": "DollarSign",
  "color": "#10b981",
  "order": 1,
  "dependencies": {
    "framework": "^1.0.0"
  },
  "neo4j": {
    "nodeTypes": ["Expense", "Income", "Account", "Budget", "Transaction"],
    "relationships": [
      {
        "type": "PAID_WITH",
        "from": "Transaction",
        "to": "Account"
      },
      {
        "type": "CATEGORIZED_AS",
        "from": "Transaction",
        "to": "Category"
      }
    ]
  },
  "permissions": ["READ_ALL", "WRITE_OWN"],
  "quickActions": [
    {
      "id": "log-expense",
      "name": "Log Expense",
      "icon": "Receipt",
      "form": "quick-expense-form"
    }
  ]
}
```

### Framework API for Subdomains

```typescript
// Available to all subdomain components
import { useFramework } from '@framework/hooks';

function FinancialDashboard() {
  const {
    // Data access
    neo4j,
    mongodb,
    
    // Navigation
    navigateToEntity,
    navigateToSubdomain,
    
    // Framework services
    search,
    createRelationship,
    getRelationships,
    
    // UI utilities
    showToast,
    showModal,
    getCurrentUser
  } = useFramework();
  
  // Subdomain implementation...
}
```

### Lifecycle Hooks

```typescript
// index.ts - Subdomain entry point
export default {
  // Called when subdomain is loaded
  async onLoad(framework: FrameworkAPI) {
    // Initialize subdomain-specific services
    await initializeFinancialSync();
  },
  
  // Called when user navigates to this subdomain
  async onActivate(context: ActivationContext) {
    // Refresh data, update UI state
  },
  
  // Called when user navigates away
  async onDeactivate() {
    // Save state, cleanup resources
  },
  
  // Called during global search
  async onSearch(query: string, filters: SearchFilters) {
    return await searchFinancialEntities(query, filters);
  },
  
  // Called when user creates a relationship to this subdomain's entities
  async onRelationshipCreated(relationship: Relationship) {
    // Handle cross-domain relationship logic
  }
};
```

### Data Isolation vs. Sharing

**Isolated:**
- Each subdomain has its own MongoDB collections (if needed)
- Subdomain-specific configuration and preferences
- Private utility functions and internal state

**Shared:**
- All data participates in Neo4j graph (with proper labeling)
- Common entity types (Person, Location, Topic)
- Framework-provided services (auth, sync, search)
- Relationship discovery across all subdomains

### Future: Third-Party Subdomains

**[ASSUMPTION: Phase 4-5 feature]**

Marketplace for community-developed subdomains:
- Subdomain developer creates plugin following framework spec
- Submits to marketplace with documentation, screenshots
- Users browse and install from marketplace
- Installed subdomains appear in carousel automatically
- Revenue share model (e.g., 70/30 split for paid subdomains)

---

# 5. Initial Subdomain Specifications

## 5.1 Financial Subdomain

### 5.1.1 Purpose and Scope

**Primary Goal:** Comprehensive personal finance management with transaction tracking, budget monitoring, net worth calculation, and financial goal tracking.

**Current State:** 
- Existing: Web-based form for credit card data input, rudimentary report
- Tech stack: React, Next.js, MongoDB
- Limitations: Unacceptable UI, limited functionality

**Target State:**
- Beautiful, functional UI matching modern fintech apps
- Support for multiple account types (checking, savings, credit cards, investments, loans)
- Automated transaction categorization
- Budget tracking with visual progress indicators
- Net worth trends over time
- Financial goal setting and tracking
- Integration with Neo4j for relationship discovery

### 5.1.2 Key Entities (Neo4j Nodes)

```cypher
// Account - Bank accounts, credit cards, investment accounts
CREATE (a:Account:FinancialEntity {
  id: randomUUID(),
  name: 'Chase Sapphire',
  type: 'CREDIT_CARD', // CHECKING, SAVINGS, CREDIT_CARD, INVESTMENT, LOAN
  institution: 'Chase',
  accountNumber: '****1234', // Masked
  currency: 'USD',
  currentBalance: 2543.18,
  creditLimit: 10000.00, // For credit cards
  interestRate: 0.1899, // APR as decimal
  openDate: date('2020-01-15'),
  status: 'ACTIVE', // ACTIVE, CLOSED
  metadata: {
    color: '#0066CC',
    icon: 'creditCard'
  },
  createdAt: datetime(),
  updatedAt: datetime()
});

// Transaction - Individual financial transactions
CREATE (t:Transaction:FinancialEntity {
  id: randomUUID(),
  date: date('2025-10-23'),
  amount: -45.67, // Negative for expenses, positive for income
  description: 'Whole Foods Market',
  merchant: 'Whole Foods',
  type: 'EXPENSE', // EXPENSE, INCOME, TRANSFER
  status: 'CLEARED', // PENDING, CLEARED, CANCELLED
  notes: 'Weekly groceries',
  tags: ['groceries', 'food'],
  location: {
    latitude: 40.7589,
    longitude: -73.9851,
    address: '250 7th Ave, New York, NY 10001'
  },
  receiptUrl: null, // Future: cloud storage URL
  createdAt: datetime(),
  updatedAt: datetime()
});

// Category - Transaction categories (hierarchical)
CREATE (c:Category:FinancialEntity {
  id: randomUUID(),
  name: 'Groceries',
  parentCategory: 'Food & Dining',
  color: '#10b981',
  icon: 'shoppingCart',
  budgetAmount: 600.00, // Monthly budget for this category
  type: 'EXPENSE', // EXPENSE, INCOME
  isCustom: false, // Framework-provided vs user-created
  createdAt: datetime()
});

// Budget - Monthly/yearly budget definitions
CREATE (b:Budget:FinancialEntity {
  id: randomUUID(),
  name: 'October 2025 Budget',
  period: 'MONTHLY', // MONTHLY, YEARLY, CUSTOM
  startDate: date('2025-10-01'),
  endDate: date('2025-10-31'),
  totalAmount: 3500.00,
  categories: [ // Array of category budgets
    {categoryId: 'cat-123', amount: 600.00},
    {categoryId: 'cat-456', amount: 1200.00}
  ],
  status: 'ACTIVE',
  createdAt: datetime()
});

// FinancialGoal - Savings goals, debt payoff targets
CREATE (g:FinancialGoal:FinancialEntity {
  id: randomUUID(),
  name: 'Emergency Fund',
  description: '6 months of expenses',
  targetAmount: 18000.00,
  currentAmount: 7500.00,
  targetDate: date('2026-12-31'),
  type: 'SAVINGS', // SAVINGS, DEBT_PAYOFF, INVESTMENT
  priority: 'HIGH', // HIGH, MEDIUM, LOW
  status: 'IN_PROGRESS', // NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
  createdAt: datetime(),
  updatedAt: datetime()
});

// NetWorthSnapshot - Periodic net worth calculations
CREATE (n:NetWorthSnapshot:FinancialEntity {
  id: randomUUID(),
  date: date('2025-10-23'),
  totalAssets: 125000.00,
  totalLiabilities: 45000.00,
  netWorth: 80000.00,
  breakdown: {
    cash: 15000.00,
    investments: 95000.00,
    property: 15000.00,
    creditCards: -8000.00,
    loans: -37000.00
  },
  createdAt: datetime()
});
```

### 5.1.3 Key Relationships (Neo4j Edges)

```cypher
// Transaction belongs to Account
CREATE (t:Transaction)-[:PAID_WITH]->(a:Account)

// Transaction categorized
CREATE (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)

// Transaction relates to other domains (THE MAGIC)
CREATE (t:Transaction)-[:RELATED_TO]->(h:HealthEvent) // Medical expense → doctor visit
CREATE (t:Transaction)-[:RELATED_TO]->(task:Task) // Purchase → project
CREATE (t:Transaction)-[:MENTIONS]->(p:Person) // Transaction → person involved

// Transaction location
CREATE (t:Transaction)-[:OCCURRED_AT]->(l:Location)

// Budget for category
CREATE (b:Budget)-[:ALLOCATES]->(c:Category)

// Goal uses accounts
CREATE (g:FinancialGoal)-[:FUNDS_FROM]->(a:Account)

// Transactions contribute to goals
CREATE (t:Transaction)-[:CONTRIBUTES_TO]->(g:FinancialGoal)

// Account has snapshot history
CREATE (a:Account)-[:HAS_SNAPSHOT]->(n:NetWorthSnapshot)

// User owns accounts
CREATE (u:User)-[:OWNS]->(a:Account)
CREATE (u:User)-[:HAS_GOAL]->(g:FinancialGoal)
```

### 5.1.4 User Interface Requirements

**Dashboard View (Primary):**

Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Financial Dashboard                           [+ Add] [⚙️]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Net Worth    │  │ This Month   │  │ Budget       │      │
│  │ $80,234      │  │ -$2,456      │  │ 72% Used     │      │
│  │ ↑ +2.3%      │  │ 🔴 +$234     │  │ 🟢 On Track  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Recent Transactions                         [View All →]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Oct 23  Whole Foods         -$45.67  🛒 Groceries   │   │
│  │         Related: Health tracking reminder           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Oct 23  Target              -$156.32 🏠 Home        │   │
│  │         Related: Home improvement project           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Oct 22  Paycheck           +$3,250.00 💰 Income     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Spending by Category (October)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [===Food & Dining===$850====]  71% of $1,200        │   │
│  │ [==Transportation=$340==   ]  85% of $400           │   │
│  │ [=Entertainment=$120=      ]  40% of $300           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Financial Goals                             [+ New Goal]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Emergency Fund                  $7,500 / $18,000     │   │
│  │ [==========>            ] 42%   Target: Dec 2026     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Transaction List View:**
- Infinite scroll with virtualization (handle 10,000+ transactions)
- Multi-column sortable table
- Inline editing for quick updates
- Bulk actions (categorize multiple, delete, export)
- Filter by: date range, account, category, amount range, search text

**Account Detail View:**
- Account summary card (balance, transactions, trends)
- Transaction history for this account
- Balance over time chart (line graph)
- Related accounts (e.g., credit card payment from checking account)

**Budget Planning View:**
- Monthly budget setup with category allocation
- Visual progress bars for each category
- Alerts when approaching/exceeding budget
- Comparison: This month vs last month vs budget

**Net Worth Tracking:**
- Line chart showing net worth over time
- Breakdown by asset/liability type (stacked area chart)
- Ability to manually add net worth snapshots
- Export to CSV for external analysis

**Financial Goals:**
- Goal creation wizard
- Progress tracking with milestone indicators
- Automatic calculation of required monthly contributions
- Celebration UI when goals are achieved

### 5.1.5 User Stories with Acceptance Criteria

**Story 1: Log an Expense Transaction**

**As a** user  
**I want to** quickly log an expense  
**So that** I can track my spending without friction

**Acceptance Criteria:**
- **Given** I'm on any dashboard
  **When** I press Ctrl+Shift+N and select "Financial"
  **Then** A quick capture form appears with fields: Amount, Description, Category, Date (defaulted to today), Account
- **Given** I've filled the required fields (Amount, Description, Account)
  **When** I click "Create"
  **Then** The transaction is saved to MongoDB with a temporary ID
  **And** A Neo4j Transaction node is created with relationships to Account and Category
  **And** The form closes and I see a success toast
  **And** The transaction appears in the Recent Transactions list
- **Given** The system is offline
  **When** I create a transaction
  **Then** It's queued for sync and marked with an indicator
  **And** I can continue working with the queued transaction visible

**Priority:** High  
**Subdomain:** Financial  
**Platform:** Desktop, PWA

---

**Story 2: Discover Financial-Health Relationship**

**As a** user tracking both finances and health  
**I want to** see medical expenses connected to health events  
**So that** I can understand my healthcare costs in context

**Acceptance Criteria:**
- **Given** I have a Transaction with description "Dr. Smith - Copay"
  **When** I view this transaction's detail page
  **Then** The Relationship Sidebar shows "Related: Health Appointment with Dr. Smith on 10/23"
- **Given** I'm viewing a Health Event (doctor appointment)
  **When** I check the Relationship Sidebar
  **Then** I see "Related: $30.00 copay expense on 10/23"
- **Given** I create a medical expense
  **When** The system detects "medical", "doctor", "pharmacy", etc. in the description
  **Then** It suggests creating a relationship to any Health Events on the same date
  **And** I can confirm or dismiss the suggestion

**Priority:** High  
**Subdomain:** Financial (with Health cross-domain)  
**Platform:** All

---

**Story 3: Monthly Budget Overview**

**As a** user  
**I want to** see how my spending compares to my budget  
**So that** I can stay on track financially

**Acceptance Criteria:**
- **Given** I have set a monthly budget for October 2025
  **When** I view the Financial Dashboard
  **Then** I see a "Budget" summary card showing overall percentage used (e.g., "72% Used")
  **And** A status indicator (green if under 80%, yellow if 80-100%, red if over 100%)
- **Given** I scroll to the "Spending by Category" section
  **When** I view it
  **Then** Each category shows: progress bar, amount spent, budget amount, percentage used
  **And** Categories exceeding budget are highlighted in red
- **Given** I'm within 10% of exceeding a category budget
  **When** I log a new transaction in that category
  **Then** I receive a warning notification: "You're at 92% of your Dining budget"

**Priority:** High  
**Subdomain:** Financial  
**Platform:** Desktop, PWA (mobile view simplified)

---

**Story 4: Net Worth Tracking Over Time**

**As a** user  
**I want to** see how my net worth changes over time  
**So that** I can measure my financial progress

**Acceptance Criteria:**
- **Given** I have created NetWorthSnapshot nodes for multiple dates
  **When** I view the Financial Dashboard
  **Then** I see a "Net Worth" summary card showing current net worth and change percentage
- **Given** I click "View Details" on the Net Worth card
  **When** The detailed view loads
  **Then** I see a line chart with net worth over time (X: dates, Y: dollar amounts)
  **And** I can hover over points to see exact values
  **And** I see a breakdown table showing assets and liabilities for each snapshot
- **Given** I want to add a new snapshot
  **When** I click "Add Snapshot"
  **Then** The system calculates total assets from all Account balances
  **And** Calculates total liabilities from loans and credit card balances
  **And** Pre-fills the form, allowing me to adjust before saving

**Priority:** Medium  
**Subdomain:** Financial  
**Platform:** Desktop (primary), PWA (view only)

---

**Story 5: Set and Track Financial Goals**

**As a** user  
**I want to** set a savings goal and track progress  
**So that** I stay motivated to save

**Acceptance Criteria:**
- **Given** I click "+ New Goal" in the Financial Goals section
  **When** The goal creation form appears
  **Then** I enter: Name, Description, Target Amount, Target Date, Goal Type, Priority
  **And** I can optionally select which accounts contribute to this goal
- **Given** I've created an "Emergency Fund" goal for $18,000
  **When** I make deposits to the linked savings account
  **Then** The goal's "current amount" updates automatically based on account balance
  **And** The progress bar and percentage update
- **Given** I achieve a goal (current ≥ target)
  **When** I next view the dashboard
  **Then** I see a celebration modal: "🎉 Goal Achieved: Emergency Fund!"
  **And** The goal status changes to "Completed"
  **And** The completed goal moves to an "Achieved Goals" section

**Priority:** Medium  
**Subdomain:** Financial  
**Platform:** All

### 5.1.6 Integration Points with Other Subdomains

**Health Subdomain:**
- Medical expenses (categorized with "Medical" or "Healthcare") automatically suggest relationships to Health Events
- Pharmacy transactions link to Medication entries
- Gym membership transactions link to Workout tracking

**Schedule Subdomain:**
- Recurring expenses (subscriptions) create recurring Task reminders to review
- Bill due dates create Task entries
- Financial goals with target dates create milestone reminders

**Knowledge Subdomain (Future):**
- Financial notes (e.g., "Tax strategy 2025") link to relevant transactions
- Research on investment strategies tags related Investment accounts

### 5.1.7 MongoDB Collections

```javascript
// Collection: financial_transactions
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  date: ISODate("2025-10-23T12:00:00Z"),
  amount: -45.67,
  description: "Whole Foods Market",
  merchant: "Whole Foods",
  type: "EXPENSE",
  status: "CLEARED",
  accountId: "account-uuid",
  categoryId: "category-uuid",
  notes: "Weekly groceries",
  tags: ["groceries", "food"],
  location: {
    type: "Point",
    coordinates: [-73.9851, 40.7589],
    address: "250 7th Ave, New York, NY 10001"
  },
  receiptUrl: null,
  metadata: {
    importSource: null, // For future CSV imports
    originalDescription: "WHOLE FOODS MKT #10",
  },
  syncStatus: "synced", // synced, pending, error
  createdAt: ISODate("2025-10-23T12:05:00Z"),
  updatedAt: ISODate("2025-10-23T12:05:00Z")
}

// Collection: financial_accounts
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  name: "Chase Sapphire",
  type: "CREDIT_CARD",
  institution: "Chase",
  accountNumber: "****1234",
  currency: "USD",
  currentBalance: 2543.18,
  creditLimit: 10000.00,
  interestRate: 0.1899,
  openDate: ISODate("2020-01-15T00:00:00Z"),
  status: "ACTIVE",
  metadata: {
    color: "#0066CC",
    icon: "creditCard",
    lastSynced: ISODate("2025-10-23T12:00:00Z")
  },
  createdAt: ISODate("2020-01-15T00:00:00Z"),
  updatedAt: ISODate("2025-10-23T12:00:00Z")
}

// Collection: financial_budgets
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  name: "October 2025 Budget",
  period: "MONTHLY",
  startDate: ISODate("2025-10-01T00:00:00Z"),
  endDate: ISODate("2025-10-31T23:59:59Z"),
  totalAmount: 3500.00,
  categories: [
    {categoryId: "cat-groceries", categoryName: "Groceries", amount: 600.00, spent: 425.50},
    {categoryId: "cat-transport", categoryName: "Transportation", amount: 400.00, spent: 340.00}
  ],
  status: "ACTIVE",
  createdAt: ISODate("2025-09-25T00:00:00Z"),
  updatedAt: ISODate("2025-10-23T12:00:00Z")
}
```

---

## 5.2 Health and Fitness Subdomain

### 5.2.1 Purpose and Scope

**Primary Goal:** Comprehensive health and fitness tracking including diet, exercise, body metrics, medical appointments, and wellness indicators.

**Target State:**
- Track daily diet (meals, calories, macros)
- Log workouts and physical activities
- Monitor body metrics (weight, sleep, energy levels)
- Record medical appointments and health events
- Discover correlations between health behaviors and other life domains

### 5.2.2 Key Entities (Neo4j Nodes)

```cypher
// Meal - Individual meals or snacks
CREATE (m:Meal:HealthEntity {
  id: randomUUID(),
  date: datetime(),
  mealType: 'BREAKFAST', // BREAKFAST, LUNCH, DINNER, SNACK
  description: 'Oatmeal with berries and almonds',
  calories: 350,
  macros: {
    protein: 12,
    carbs: 54,
    fat: 14,
    fiber: 8
  },
  foods: [
    {name: 'Oatmeal', amount: '1 cup', calories: 150},
    {name: 'Blueberries', amount: '1/2 cup', calories: 40},
    {name: 'Almonds', amount: '1 oz', calories: 160}
  ],
  notes: 'Felt energized after',
  location: 'Home',
  imageUrl: null, // Future: meal photos
  createdAt: datetime(),
  updatedAt: datetime()
});

// Workout - Exercise session
CREATE (w:Workout:HealthEntity {
  id: randomUUID(),
  date: datetime(),
  type: 'CARDIO', // CARDIO, STRENGTH, FLEXIBILITY, SPORTS
  activity: 'Running',
  duration: 30, // minutes
  distance: 5.2, // miles
  intensity: 'MODERATE', // LIGHT, MODERATE, VIGOROUS
  caloriesBurned: 425,
  heartRateAvg: 145,
  heartRateMax: 172,
  notes: 'Morning run, felt great',
  route: {
    start: 'Home',
    end: 'Park Loop',
    gpxData: null // Future: GPS tracking
  },
  exercises: [ // For strength training
    {name: 'Squats', sets: 3, reps: 12, weight: 135},
    {name: 'Bench Press', sets: 3, reps: 10, weight: 185}
  ],
  createdAt: datetime(),
  updatedAt: datetime()
});

// BodyMetric - Physical measurements and vitals
CREATE (bm:BodyMetric:HealthEntity {
  id: randomUUID(),
  date: date(),
  type: 'WEIGHT', // WEIGHT, BLOOD_PRESSURE, HEART_RATE, SLEEP, ENERGY
  value: 175.5, // pounds
  unit: 'lbs',
  time: time(), // Time of day if relevant
  context: 'Morning, before breakfast',
  notes: null,
  createdAt: datetime()
});

// Additional BodyMetric examples:
// Sleep tracking
CREATE (sleep:BodyMetric:HealthEntity {
  id: randomUUID(),
  date: date('2025-10-23'),
  type: 'SLEEP',
  value: 7.5, // hours
  unit: 'hours',
  quality: 'GOOD', // POOR, FAIR, GOOD, EXCELLENT
  bedtime: time('23:00'),
  wakeTime: time('06:30'),
  notes: 'Woke up once at 3am',
  createdAt: datetime()
});

// Energy/Mood tracking
CREATE (energy:BodyMetric:HealthEntity {
  id: randomUUID(),
  date: date('2025-10-23'),
  type: 'ENERGY',
  value: 4, // Scale 1-5
  unit: 'scale',
  time: time('14:00'),
  context: 'After lunch',
  mood: 'FOCUSED', // ANXIOUS, TIRED, FOCUSED, ENERGETIC, CALM
  createdAt: datetime()
});

// HealthEvent - Medical appointments, symptoms, medications
CREATE (he:HealthEvent:HealthEntity {
  id: randomUUID(),
  date: datetime(),
  type: 'APPOINTMENT', // APPOINTMENT, SYMPTOM, MEDICATION, TEST_RESULT
  title: 'Annual Physical with Dr. Smith',
  description: 'Routine checkup, discussed blood pressure',
  provider: 'Dr. Sarah Smith',
  location: 'City Medical Center',
  outcome: 'All clear, continue current medications',
  followUp: date('2026-10-23'),
  documents: [], // Future: lab results PDFs
  createdAt: datetime(),
  updatedAt: datetime()
});

// Medication entry example
CREATE (med:HealthEvent:HealthEntity {
  id: randomUUID(),
  date: datetime(),
  type: 'MEDICATION',
  title: 'Started Vitamin D supplement',
  medication: {
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Daily',
    startDate: date('2025-10-23'),
    endDate: null,
    prescribedBy: 'Dr. Smith'
  },
  createdAt: datetime()
});

// HealthGoal - Fitness and health targets
CREATE (hg:HealthGoal:HealthEntity {
  id: randomUUID(),
  name: 'Reach target weight',
  description: 'Lose 15 pounds through diet and exercise',
  type: 'WEIGHT_LOSS', // WEIGHT_LOSS, WEIGHT_GAIN, FITNESS, HABIT
  targetValue: 160,
  currentValue: 175.5,
  unit: 'lbs',
  targetDate: date('2026-03-31'),
  status: 'IN_PROGRESS',
  milestones: [
    {date: date('2025-12-31'), target: 170, achieved: false},
    {date: date('2026-02-28'), target: 165, achieved: false}
  ],
  createdAt: datetime(),
  updatedAt: datetime()
});
```

### 5.2.3 Key Relationships (Neo4j Edges)

```cypher
// User logs meals/workouts/metrics
CREATE (u:User)-[:LOGGED]->(m:Meal)
CREATE (u:User)-[:LOGGED]->(w:Workout)
CREATE (u:User)-[:MEASURED]->(bm:BodyMetric)
CREATE (u:User)-[:ATTENDED]->(he:HealthEvent)

// Temporal relationships
CREATE (m:Meal)-[:OCCURRED_ON]->(d:Date)
CREATE (w:Workout)-[:OCCURRED_ON]->(d:Date)

// Location relationships
CREATE (w:Workout)-[:OCCURRED_AT]->(l:Location)
CREATE (he:HealthEvent)-[:OCCURRED_AT]->(l:Location)

// Cross-domain relationships (THE MAGIC)
CREATE (he:HealthEvent)-[:RELATED_TO]->(t:Transaction) // Doctor visit → copay
CREATE (w:Workout)-[:RELATED_TO]->(task:Task) // Workout → "Morning exercise" habit
CREATE (he:HealthEvent)-[:MENTIONS]->(p:Person) // Appointment → doctor
CREATE (m:Meal)-[:PURCHASED_AT]->(t:Transaction) // Restaurant meal → expense

// Goals and progress
CREATE (u:User)-[:HAS_GOAL]->(hg:HealthGoal)
CREATE (w:Workout)-[:PROGRESSES]->(hg:HealthGoal)
CREATE (bm:BodyMetric)-[:TRACKS]->(hg:HealthGoal)

// Correlations (discovered over time)
CREATE (w:Workout)-[:CORRELATES_WITH]->(bm:BodyMetric {type: 'ENERGY'})
  // "Workouts correlate with higher afternoon energy"
CREATE (m:Meal)-[:AFFECTS]->(bm:BodyMetric {type: 'SLEEP'})
  // "Late dinners correlate with poor sleep"
```

### 5.2.4 User Interface Requirements

**Dashboard View:**

```
┌─────────────────────────────────────────────────────────────┐
│ Health & Fitness Dashboard                   [+ Log] [⚙️]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Weight       │  │ Today's Cals │  │ This Week    │      │
│  │ 175.5 lbs    │  │ 1,850/2,000  │  │ 4/5 Workouts │      │
│  │ ↓ -2.3 lbs   │  │ 🟢 93%       │  │ 🟢 On Track  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Today's Meals                               [+ Add Meal]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🌅 Breakfast (8:00 AM)                    350 cal   │   │
│  │    Oatmeal with berries and almonds                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🌞 Lunch (12:30 PM)                       580 cal   │   │
│  │    Chicken salad with quinoa                        │   │
│  │    Related: $12 expense at Sweetgreen               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🌙 Dinner (Not logged yet)               Est. 600   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Recent Workouts                             [View All →]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Oct 23  🏃 Running - 5.2 mi - 30 min - 425 cal     │   │
│  │         Morning run, felt great                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Oct 22  💪 Strength - 45 min - 210 cal             │   │
│  │         Upper body workout                          │   │
│  │         Related: Task "Gym session" completed       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Body Metrics Trends                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Weight chart: line graph Oct 1-23, trending down] │   │
│  │ [Sleep chart: bar graph, avg 7.2 hrs/night]        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Meal Logging View:**
- Quick add form with calorie/macro lookup (future: API integration)
- Photo capture (mobile) with OCR for nutrition labels
- Meal templates for frequently eaten meals
- Copy from previous day feature

**Workout Logging View:**
- Exercise template library (common workouts)
- Timer integration for duration tracking
- GPS tracking for runs/bike rides (future, mobile)
- Progress tracking: "Last time you did this workout: 25 min, today: 23 min"

**Body Metrics Tracking:**
- Quick entry forms for each metric type
- Trend visualization (line/bar charts)
- Goal overlays on charts
- Correlation insights: "Your weight drops 0.5 lbs in weeks with 4+ workouts"

**Health Events Calendar:**
- Calendar view of appointments, medications, symptoms
- Reminders for upcoming appointments and medication refills
- Document storage for lab results, prescriptions

### 5.2.5 User Stories with Acceptance Criteria

**Story 1: Log a Meal with Calories**

**As a** user tracking my diet  
**I want to** quickly log what I eat with calorie information  
**So that** I can monitor my daily calorie intake

**Acceptance Criteria:**
- **Given** I click "+ Add Meal" on the Health Dashboard
  **When** The meal logging form appears
  **Then** I see fields: Meal Type (dropdown), Description, Time, Calories, Foods (optional detailed breakdown)
- **Given** I enter "Oatmeal with berries" and calorie count 350
  **When** I save the meal
  **Then** A Meal node is created in Neo4j
  **And** The meal appears in "Today's Meals" section
  **And** The "Today's Cals" summary updates to include this meal
- **Given** This meal was purchased (e.g., restaurant)
  **When** The system detects a matching financial transaction on the same day
  **Then** It suggests creating a RELATED_TO relationship
  **And** I can confirm or dismiss

**Priority:** High  
**Subdomain:** Health  
**Platform:** All

---

**Story 2: Track Workout and Link to Schedule**

**As a** user with a workout routine  
**I want to** log my workouts and connect them to my schedule  
**So that** I can see workout consistency and how it relates to my habits

**Acceptance Criteria:**
- **Given** I have a recurring task "Morning workout" in Schedule subdomain
  **When** I log a workout in Health subdomain
  **Then** The system suggests completing the corresponding Schedule task
  **And** Creates a RELATED_TO relationship between Workout and Task
- **Given** I've logged multiple workouts over 4 weeks
  **When** I view the Health Dashboard
  **Then** I see "This Week: 4/5 Workouts" with progress indicator
  **And** I can click to see detailed weekly workout history
- **Given** I'm in the Relationship Sidebar while viewing a workout
  **When** The sidebar loads
  **Then** I see related tasks, related energy/sleep metrics from that day, and any financial expenses (gym membership, equipment purchases)

**Priority:** High  
**Subdomain:** Health (with Schedule cross-domain)  
**Platform:** All

---

**Story 3: Discover Health-Energy Correlation**

**As a** user tracking both workouts and energy levels  
**I want to** see how exercise affects my energy throughout the day  
**So that** I can optimize my workout timing

**Acceptance Criteria:**
- **Given** I've logged 20+ workouts and 50+ energy/mood entries
  **When** The system runs correlation analysis (background job)
  **Then** It discovers patterns like "Afternoon energy 30% higher on workout days"
  **And** Creates CORRELATES_WITH relationships in Neo4j
- **Given** Correlations have been discovered
  **When** I view the Connection Insights panel
  **Then** I see an insight card: "💡 Your afternoon energy is 30% higher on days you work out in the morning"
  **And** I can click to see the supporting data visualization
- **Given** I'm planning my day in Schedule subdomain
  **When** I consider scheduling a morning workout
  **Then** The system can surface the correlation as a suggestion

**Priority:** Medium  
**Subdomain:** Health (correlation engine)  
**Platform:** Desktop (primary analysis), PWA (view insights)

---

**Story 4: Track Medical Expenses Automatically**

**As a** user with medical appointments  
**I want to** automatically link medical expenses to health events  
**So that** I can track healthcare costs in context

**Acceptance Criteria:**
- **Given** I create a HealthEvent "Appointment with Dr. Smith" on Oct 23
  **When** I later log a $30 expense with description containing "Dr. Smith" or "copay"
  **Then** The system suggests linking the Transaction to the HealthEvent
  **And** When confirmed, creates a RELATED_TO relationship
- **Given** I'm viewing the HealthEvent detail page
  **When** I look at the Relationship Sidebar
  **Then** I see all related financial transactions
  **And** A summary: "Total cost for this appointment: $130" (copay + lab fees + prescriptions)
- **Given** I'm in the Financial subdomain viewing medical category
  **When** I filter by "Medical" expenses
  **Then** Each expense shows which HealthEvent it relates to (if any)
  **And** I can click through to the HealthEvent details

**Priority:** High  
**Subdomain:** Health (with Financial cross-domain)  
**Platform:** All

### 5.2.6 Integration Points with Other Subdomains

**Financial Subdomain:**
- Restaurant/grocery expenses link to meals
- Medical expenses link to health events
- Gym memberships, fitness equipment purchases link to workout goals
- Nutrition supplement purchases link to medication/supplement tracking

**Schedule Subdomain:**
- Workout routines appear as recurring tasks
- Medical appointments sync with calendar
- Meal prep reminders based on dietary goals
- Medication reminders

**Knowledge Subdomain (Future):**
- Nutrition research notes link to dietary tracking
- Workout programs link to exercise logs
- Health articles relate to specific health goals

### 5.2.7 MongoDB Collections

```javascript
// Collection: health_meals
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  date: ISODate("2025-10-23T08:00:00Z"),
  mealType: "BREAKFAST",
  description: "Oatmeal with berries and almonds",
  calories: 350,
  macros: {
    protein: 12,
    carbs: 54,
    fat: 14,
    fiber: 8
  },
  foods: [
    {name: "Oatmeal", amount: "1 cup", calories: 150, macros: {protein: 5, carbs: 27, fat: 3}},
    {name: "Blueberries", amount: "1/2 cup", calories: 40, macros: {protein: 1, carbs: 10, fat: 0}},
    {name: "Almonds", amount: "1 oz", calories: 160, macros: {protein: 6, carbs: 17, fat: 11}}
  ],
  notes: "Felt energized after",
  location: "Home",
  imageUrl: null,
  relatedTransactionId: null, // Link to financial expense if applicable
  syncStatus: "synced",
  createdAt: ISODate("2025-10-23T08:15:00Z"),
  updatedAt: ISODate("2025-10-23T08:15:00Z")
}

// Collection: health_workouts
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  date: ISODate("2025-10-23T06:30:00Z"),
  type: "CARDIO",
  activity: "Running",
  duration: 30,
  distance: 5.2,
  distanceUnit: "miles",
  intensity: "MODERATE",
  caloriesBurned: 425,
  heartRateAvg: 145,
  heartRateMax: 172,
  notes: "Morning run, felt great",
  route: {
    start: "Home",
    end: "Park Loop",
    gpxData: null
  },
  exercises: null, // For strength training
  weather: {
    temp: 62,
    conditions: "Partly Cloudy"
  },
  relatedTaskId: null, // Link to schedule task if applicable
  syncStatus: "synced",
  createdAt: ISODate("2025-10-23T07:05:00Z"),
  updatedAt: ISODate("2025-10-23T07:05:00Z")
}

// Collection: health_metrics
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  date: ISODate("2025-10-23T00:00:00Z"),
  time: "07:00",
  type: "WEIGHT",
  value: 175.5,
  unit: "lbs",
  context: "Morning, before breakfast",
  notes: null,
  syncStatus: "synced",
  createdAt: ISODate("2025-10-23T07:05:00Z")
}
```

---

## 5.3 Schedule Subdomain

### 5.3.1 Purpose and Scope

**Primary Goal:** Comprehensive schedule management including appointments, tasks, todos, reminders, recurring activities, and optional activity suggestions based on availability and goals.

**Target State:**
- Calendar view of all appointments and time-blocked activities
- Task management with priorities, due dates, and project grouping
- Recurring task/habit tracking
- Smart suggestions for filling free time based on goals and patterns
- Integration with other subdomains for holistic time awareness

### 5.3.2 Key Entities (Neo4j Nodes)

```cypher
// Event - Calendar appointments and time-blocked activities
CREATE (e:Event:ScheduleEntity {
  id: randomUUID(),
  title: 'Team Meeting',
  description: 'Weekly team sync to discuss project progress',
  startTime: datetime('2025-10-23T10:00:00'),
  endTime: datetime('2025-10-23T11:00:00'),
  allDay: false,
  location: 'Conference Room B',
  type: 'MEETING', // MEETING, APPOINTMENT, PERSONAL, TRAVEL, BLOCK
  status: 'CONFIRMED', // TENTATIVE, CONFIRMED, CANCELLED
  attendees: ['john@example.com', 'sarah@example.com'],
  reminders: [
    {type: 'NOTIFICATION', minutesBefore: 15},
    {type: 'EMAIL', minutesBefore: 60}
  ],
  recurrence: null, // For one-time events
  notes: 'Bring Q4 planning document',
  color: '#3b82f6',
  createdAt: datetime(),
  updatedAt: datetime()
});

// Recurring event example
CREATE (recurring:Event:ScheduleEntity {
  id: randomUUID(),
  title: 'Morning Workout',
  startTime: datetime('2025-10-23T06:30:00'),
  endTime: datetime('2025-10-23T07:30:00'),
  type: 'PERSONAL',
  recurrence: {
    frequency: 'WEEKLY', // DAILY, WEEKLY, MONTHLY, YEARLY
    interval: 1, // Every 1 week
    daysOfWeek: ['MON', 'WED', 'FRI'], // M-W-F
    endDate: null, // Continues indefinitely
    exceptions: ['2025-12-25'] // Skip Christmas
  },
  createdAt: datetime()
});

// Task - Action items with due dates
CREATE (t:Task:ScheduleEntity {
  id: randomUUID(),
  title: 'Submit quarterly report',
  description: 'Compile Q4 metrics and submit to leadership',
  dueDate: date('2025-10-31'),
  dueTime: time('17:00'),
  priority: 'HIGH', // LOW, MEDIUM, HIGH, URGENT
  status: 'IN_PROGRESS', // NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED
  estimatedDuration: 120, // minutes
  actualDuration: null, // Filled when completed
  completedAt: null,
  project: 'Q4 Planning',
  tags: ['work', 'reporting', 'deadline'],
  subtasks: [
    {id: 'sub-1', title: 'Gather metrics', completed: true},
    {id: 'sub-2', title: 'Write analysis', completed: false},
    {id: 'sub-3', title: 'Review with manager', completed: false}
  ],
  recurrence: null, // One-time task
  reminders: [
    {type: 'NOTIFICATION', when: datetime('2025-10-30T09:00:00')}
  ],
  createdAt: datetime(),
  updatedAt: datetime()
});

// Recurring task (habit) example
CREATE (habit:Task:ScheduleEntity {
  id: randomUUID(),
  title: 'Daily review and planning',
  description: 'Review today, plan tomorrow',
  dueTime: time('21:00'),
  priority: 'MEDIUM',
  status: 'NOT_STARTED',
  estimatedDuration: 15,
  recurrence: {
    frequency: 'DAILY',
    interval: 1
  },
  habitTracking: {
    streak: 23, // Days in a row completed
    totalCompletions: 87,
    lastCompleted: date('2025-10-22')
  },
  createdAt: datetime()
});

// Reminder - Simple reminders without task structure
CREATE (r:Reminder:ScheduleEntity {
  id: randomUUID(),
  title: 'Call mom',
  notes: 'Check in about her birthday plans',
  remindAt: datetime('2025-10-24T14:00:00'),
  status: 'PENDING', // PENDING, DISMISSED, COMPLETED
  createdAt: datetime()
});

// Project - Grouping for related tasks
CREATE (p:Project:ScheduleEntity {
  id: randomUUID(),
  name: 'Q4 Planning',
  description: 'All tasks related to end-of-year planning and reporting',
  status: 'ACTIVE', // ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
  startDate: date('2025-10-01'),
  targetEndDate: date('2025-12-31'),
  color: '#8b5cf6',
  tags: ['work', 'planning'],
  createdAt: datetime(),
  updatedAt: datetime()
});

// TimeBlock - Reserved time for specific activities
CREATE (tb:TimeBlock:ScheduleEntity {
  id: randomUUID(),
  title: 'Deep Work Block',
  description: 'Focused coding time, no meetings',
  startTime: datetime('2025-10-23T09:00:00'),
  endTime: datetime('2025-10-23T12:00:00'),
  type: 'FOCUS', // FOCUS, BREAK, ADMIN, BUFFER
  recurrence: {
    frequency: 'WEEKLY',
    daysOfWeek: ['MON', 'TUE', 'THU']
  },
  createdAt: datetime()
});

// ActivitySuggestion - System-generated suggestions for free time
CREATE (as:ActivitySuggestion:ScheduleEntity {
  id: randomUUID(),
  suggestedTime: datetime('2025-10-23T15:00:00'),
  duration: 45, // minutes
  activity: 'Afternoon workout',
  reason: 'You have 90 minutes free, and you workout on Wednesdays typically',
  priority: 'MEDIUM',
  relatedGoalId: 'health-goal-uuid',
  status: 'PENDING', // PENDING, ACCEPTED, DISMISSED
  createdAt: datetime()
});
```

### 5.3.3 Key Relationships (Neo4j Edges)

```cypher
// User owns schedule entities
CREATE (u:User)-[:HAS_EVENT]->(e:Event)
CREATE (u:User)-[:HAS_TASK]->(t:Task)
CREATE (u:User)-[:HAS_PROJECT]->(p:Project)

// Tasks belong to projects
CREATE (t:Task)-[:PART_OF]->(p:Project)

// Events and tasks occur on dates
CREATE (e:Event)-[:OCCURS_ON]->(d:Date)
CREATE (t:Task)-[:DUE_ON]->(d:Date)

// Events occur at locations
CREATE (e:Event)-[:OCCURS_AT]->(l:Location)

// Tasks depend on other tasks
CREATE (t1:Task)-[:DEPENDS_ON]->(t2:Task)
CREATE (t1:Task)-[:BLOCKS]->(t2:Task)

// Cross-domain relationships (THE MAGIC)
CREATE (e:Event)-[:RELATED_TO]->(he:HealthEvent) // Meeting → doctor appointment
CREATE (t:Task)-[:RELATED_TO]->(w:Workout) // "Morning workout" task → actual workout logged
CREATE (t:Task)-[:RELATED_TO]->(note:Note) // Task → knowledge base note
CREATE (e:Event)-[:RELATED_TO]->(t:Transaction) // Appointment → expense (Uber, parking)
CREATE (p:Project)-[:RELATED_TO]->(fg:FinancialGoal) // Project → budget allocation

// Activity suggestions relate to goals
CREATE (as:ActivitySuggestion)-[:SUPPORTS]->(g:HealthGoal)
CREATE (as:ActivitySuggestion)-[:SUPPORTS]->(fg:FinancialGoal)

// Mentions of people in schedule
CREATE (e:Event)-[:INVOLVES]->(p:Person)
CREATE (t:Task)-[:ASSIGNED_TO]->(p:Person)
```

### 5.3.4 User Interface Requirements

**Dashboard View:**

```
┌─────────────────────────────────────────────────────────────┐
│ Schedule Dashboard                          [+ Add] [⚙️]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Today        │  │ This Week    │  │ Overdue      │      │
│  │ 5 events     │  │ 12 tasks     │  │ 2 tasks      │      │
│  │ 8 tasks      │  │ 32 hrs       │  │ 🔴 Action    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Today - Wednesday, October 23                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 6:30 AM  🏃 Morning Workout (Recurring)            │   │
│  │          Related: Health tracking                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 9:00 AM  💼 Deep Work Block                        │   │
│  │          Focus time - no meetings                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 10:00 AM 👥 Team Meeting                           │   │
│  │          Conference Room B • With John, Sarah       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2:00 PM  [FREE TIME - 90 minutes]                  │   │
│  │          💡 Suggested: Afternoon workout            │   │
│  │          [Accept] [Dismiss]                         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 3:30 PM  📱 Doctor Appointment                      │   │
│  │          Dr. Smith • City Medical                   │   │
│  │          Related: $30 copay (Financial)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Tasks Due Soon                              [View All →]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚠️  HIGH  Submit quarterly report     Due Oct 31    │   │
│  │     Q4 Planning • 2/3 subtasks complete             │   │
│  │     Related: Financial analysis notes               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🔴  URGENT Call dentist              Overdue 2 days │   │
│  │     Personal                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Habits & Streaks                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Daily review      🔥 23 day streak   [✓] Complete   │   │
│  │ Morning workout   🔥 12 day streak   [✓] Complete   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Calendar View:**
- Month/week/day views
- Color-coded by event type
- Drag-and-drop event rescheduling
- Click to see event details with relationship sidebar
- Filter by: event type, project, person involved

**Task List View:**
- Grouped by: Project, Priority, Due Date, or Status
- Sortable and filterable
- Bulk actions (mark complete, reschedule, assign to project)
- Kanban board view option (columns: Not Started, In Progress, Completed)

**Project View:**
- Project overview with progress tracking
- All tasks within project
- Timeline/Gantt chart (future)
- Related entities from other subdomains

**Habit Tracker:**
- List of recurring tasks with completion status
- Streak counters and completion percentage
- Calendar heatmap showing completion patterns
- Insights: "You're most consistent on weekdays"

### 5.3.5 User Stories with Acceptance Criteria

**Story 1: Create a Calendar Event with Reminders**

**As a** user managing my schedule  
**I want to** create calendar events with reminders  
**So that** I don't miss important appointments

**Acceptance Criteria:**
- **Given** I click "+ Add" and select "Event"
  **When** The event creation form appears
  **Then** I see fields: Title, Date/Time, Duration, Location, Type, Attendees, Reminders, Recurrence
- **Given** I create an event "Doctor Appointment" on Oct 23 at 3:30 PM
  **When** I add a 15-minute reminder
  **Then** The Event node is created in Neo4j with reminder configuration
  **And** At 3:15 PM, I receive a notification (desktop/mobile) and Echo Show announcement
- **Given** The event has a location "City Medical Center"
  **When** The system detects a matching Location node
  **Then** It creates an OCCURS_AT relationship
  **And** Shows me other events/entities at the same location in the Relationship Sidebar

**Priority:** High  
**Subdomain:** Schedule  
**Platform:** All

---

**Story 2: Complete Recurring Task and Track Streak**

**As a** user building habits  
**I want to** track completion of recurring tasks and see my streak  
**So that** I stay motivated to maintain habits

**Acceptance Criteria:**
- **Given** I have a recurring task "Daily review" that repeats every day at 9 PM
  **When** I mark it complete today
  **Then** The task's habitTracking.streak increments by 1
  **And** habitTracking.lastCompleted updates to today
  **And** habitTracking.totalCompletions increments
  **And** A new instance of the task is created for tomorrow
- **Given** I have a 23-day streak on "Daily review"
  **When** I view the Habits & Streaks section
  **Then** I see "🔥 23 day streak" with visual prominence
- **Given** I miss a day (don't complete by midnight)
  **When** The next day arrives
  **Then** The streak resets to 0
  **And** I receive a notification: "Your Daily review streak ended at 23 days"
- **Given** I've completed a recurring task multiple times
  **When** The system analyzes patterns
  **Then** It can report: "You complete this task 85% of the time on weekdays, 40% on weekends"

**Priority:** High  
**Subdomain:** Schedule  
**Platform:** All

---

**Story 3: Receive Activity Suggestion for Free Time**

**As a** user with health goals  
**I want to** receive smart suggestions for activities during free time  
**So that** I can optimize my schedule toward my goals

**Acceptance Criteria:**
- **Given** I have a health goal "Workout 5x per week"
  **And** I have 90 minutes free between 2-4 PM today
  **And** I typically workout on Wednesdays at this time (pattern detection)
  **When** The system runs its suggestion algorithm
  **Then** An ActivitySuggestion node is created: "Afternoon workout, 45 min, 2:00 PM"
  **And** The suggestion appears in my Schedule Dashboard with reason
- **Given** I see the activity suggestion
  **When** I click "Accept"
  **Then** The suggestion becomes a scheduled Event
  **And** If the activity is a workout, it can optionally create a related Task or link to Health subdomain
- **Given** I click "Dismiss" on a suggestion
  **When** The suggestion is dismissed
  **Then** The system learns: don't suggest workouts at 2 PM on Wednesdays (ML opportunity)
- **Given** I consistently accept or dismiss certain suggestions
  **When** Future suggestions are generated
  **Then** The algorithm adapts to my preferences

**Priority:** Medium (Phase 2 feature)  
**Subdomain:** Schedule (with ML/intelligence layer)  
**Platform:** Desktop, PWA

---

**Story 4: Link Task to Financial Budget**

**As a** user managing projects with budgets  
**I want to** connect project tasks to financial goals  
**So that** I can see which tasks relate to budget tracking

**Acceptance Criteria:**
- **Given** I have a Project "Home Renovation" with associated tasks
  **And** I have a FinancialGoal "Home renovation budget: $5,000"
  **When** I create a task "Buy paint" in the project
  **Then** The system suggests linking to the financial goal
  **And** Creates a RELATED_TO relationship between Project and FinancialGoal
- **Given** I complete the task "Buy paint"
  **And** I log a $150 expense in Financial subdomain
  **When** The expense is categorized as "Home Improvement"
  **Then** The system links the Transaction to the Task
  **And** The financial goal shows $150 spent / $5,000 budget
- **Given** I'm viewing the Project detail page
  **When** I check the Relationship Sidebar
  **Then** I see all related financial transactions
  **And** A summary: "Total spent on this project: $2,340 / $5,000"

**Priority:** Medium  
**Subdomain:** Schedule (with Financial cross-domain)  
**Platform:** Desktop, PWA

---

**Story 5: View Schedule-Health Integration**

**As a** user tracking health and schedule  
**I want to** see how my scheduled activities relate to health outcomes  
**So that** I can optimize my schedule for wellness

**Acceptance Criteria:**
- **Given** I have scheduled "Morning Workout" events on M-W-F
  **And** I've logged actual workouts in Health subdomain
  **When** I view the recurring event details
  **Then** The Relationship Sidebar shows completion rate: "Completed 9/12 times in past month"
  **And** Shows related Health Workout entries
- **Given** I have appointments scheduled at different times
  **And** I track energy levels throughout the day
  **When** The system analyzes correlations
  **Then** It discovers: "Appointments after 2 PM have 70% better follow-through"
  **And** Surfaces this as a Connection Insight
- **Given** I'm planning my week
  **When** I drag a "Workout" event to schedule it
  **Then** The system can suggest optimal times based on past energy patterns from Health subdomain

**Priority:** Medium  
**Subdomain:** Schedule (with Health cross-domain)  
**Platform:** Desktop, PWA

### 5.3.6 Integration Points with Other Subdomains

**Financial Subdomain:**
- Project budgets link to Financial Goals
- Appointments with costs (parking, Uber) link to Transactions
- Recurring subscription payments create recurring Tasks for review
- Bill due dates become Task reminders

**Health Subdomain:**
- Workout tasks/events link to actual Workout logs
- Medical appointments link to HealthEvents
- Meal planning tasks connect to diet tracking
- Sleep schedule affects activity suggestions

**Knowledge Subdomain (Future):**
- Tasks reference research notes
- Projects collect related knowledge entries
- Meeting notes stored as Knowledge entities linked to Events

### 5.3.7 MongoDB Collections

```javascript
// Collection: schedule_events
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  title: "Team Meeting",
  description: "Weekly team sync",
  startTime: ISODate("2025-10-23T10:00:00Z"),
  endTime: ISODate("2025-10-23T11:00:00Z"),
  allDay: false,
  location: "Conference Room B",
  type: "MEETING",
  status: "CONFIRMED",
  attendees: ["john@example.com", "sarah@example.com"],
  reminders: [
    {type: "NOTIFICATION", minutesBefore: 15, sent: false},
    {type: "EMAIL", minutesBefore: 60, sent: false}
  ],
  recurrence: null,
  notes: "Bring Q4 planning document",
  color: "#3b82f6",
  syncStatus: "synced",
  createdAt: ISODate("2025-10-20T00:00:00Z"),
  updatedAt: ISODate("2025-10-20T00:00:00Z")
}

// Collection: schedule_tasks
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  title: "Submit quarterly report",
  description: "Compile Q4 metrics",
  dueDate: ISODate("2025-10-31T00:00:00Z"),
  dueTime: "17:00",
  priority: "HIGH",
  status: "IN_PROGRESS",
  estimatedDuration: 120,
  actualDuration: null,
  completedAt: null,
  project: "Q4 Planning",
  projectId: "project-uuid",
  tags: ["work", "reporting", "deadline"],
  subtasks: [
    {id: "sub-1", title: "Gather metrics", completed: true, completedAt: ISODate("2025-10-20T00:00:00Z")},
    {id: "sub-2", title: "Write analysis", completed: false},
    {id: "sub-3", title: "Review with manager", completed: false}
  ],
  recurrence: null,
  habitTracking: null,
  reminders: [
    {type: "NOTIFICATION", when: ISODate("2025-10-30T09:00:00Z"), sent: false}
  ],
  syncStatus: "synced",
  createdAt: ISODate("2025-10-15T00:00:00Z"),
  updatedAt: ISODate("2025-10-23T00:00:00Z")
}

// Collection: schedule_projects
{
  _id: ObjectId("..."),
  neo4jId: "uuid-from-neo4j",
  userId: "user-123",
  name: "Q4 Planning",
  description: "End-of-year planning and reporting",
  status: "ACTIVE",
  startDate: ISODate("2025-10-01T00:00:00Z"),
  targetEndDate: ISODate("2025-12-31T00:00:00Z"),
  color: "#8b5cf6",
  tags: ["work", "planning"],
  taskCount: 12,
  completedTaskCount: 7,
  relatedFinancialGoalId: null,
  syncStatus: "synced",
  createdAt: ISODate("2025-10-01T00:00:00Z"),
  updatedAt: ISODate("2025-10-23T00:00:00Z")
}
```

---

# 6. Technical Architecture

## 6.1 System Architecture

### 6.1.1 High-Level Architecture Diagram Description

**Components:**

```
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICES                         │
├─────────────┬──────────────┬────────────┬──────────────┤
│  Desktop    │     PWA      │   Mobile   │  Echo Show   │
│  (Electron) │  (Next.js)   │  (React    │  (Alexa      │
│             │              │   Native?) │   Skill)     │
└──────┬──────┴──────┬───────┴─────┬──────┴──────┬───────┘
       │             │             │             │
       │  WebSocket  │  HTTPS      │  HTTPS      │  HTTPS
       │  (realtime) │  REST/      │  REST/      │  REST/
       │             │  GraphQL    │  GraphQL    │  GraphQL
       │             │             │             │
       └─────────────┴─────────────┴─────────────┘
                          │
                          ▼
       ┌─────────────────────────────────────────┐
       │        BACKEND API LAYER                │
       │  (Node.js + Express/Fastify or          │
       │   Python + FastAPI)                     │
       ├─────────────────────────────────────────┤
       │  • Authentication & Authorization       │
       │  • Subdomain API Routes                 │
       │  • Real-time Sync Service (WebSocket)   │
       │  • Relationship Discovery Engine        │
       │  • Search Service                       │
       │  • Background Jobs (insights, backups)  │
       │  • File Storage Service                 │
       └────────┬──────────────┬─────────────────┘
                │              │
                ▼              ▼
       ┌──────────────┐  ┌──────────────┐
       │   Neo4j      │  │   MongoDB    │
       │   Graph DB   │  │   Document   │
       │              │  │   Store      │
       │  • Entities  │  │  • Trans.    │
       │  • Relations │  │  • Details   │
       │  • Schema    │  │  • Cache     │
       └──────────────┘  └──────────────┘
                │              │
                └──────┬───────┘
                       │
                       ▼
              ┌──────────────────┐
              │  Cloud Storage   │
              │  (S3 or equiv.)  │
              │  • Receipts      │
              │  • Documents     │
              │  • Backups       │
              └──────────────────┘
```

**Data Flow:**

1. **User Interaction → Client Device**
   - User performs action (create transaction, log workout, etc.)
   - Client validates input locally
   - Client sends request to Backend API

2. **Backend API → Databases**
   - API receives request
   - Creates/updates MongoDB document (detailed data)
   - Creates/updates Neo4j node and relationships (graph structure)
   - Both operations wrapped in transaction (consistency)

3. **Backend API → Other Clients (Sync)**
   - WebSocket pushes change notification to connected clients
   - Disconnected clients poll on reconnect
   - Conflict resolution applied if needed

4. **Background Jobs**
   - Relationship Discovery: Periodic Cypher queries to find correlations
   - Insight Generation: Daily analysis creates ActivitySuggestions and Connection Insights
   - Backup Service: Regular exports of Neo4j and MongoDB to cloud storage

### 6.1.2 Authentication Flow

**Initial Authentication:**
```
User (Desktop/PWA) → Backend /auth/login
  ├─ Email/Password or OAuth (Google, GitHub)
  └─ Backend validates credentials
      ├─ Success: Generate JWT access token (15 min expiry)
      │           Generate refresh token (30 days, stored in HTTP-only cookie)
      └─ Return tokens to client

Client stores access token (memory only, not localStorage)
Client stores refresh token (HTTP-only cookie, secure)
```

**Authenticated Requests:**
```
Client → Backend API (with Authorization: Bearer <access_token>)
  ├─ Backend validates JWT
  │   ├─ Valid: Process request
  │   └─ Expired: Return 401
  └─ Client receives 401
      └─ Client calls /auth/refresh with refresh token cookie
          ├─ Backend validates refresh token
          │   ├─ Valid: Issue new access token
          │   └─ Invalid: Redirect to login
          └─ Client retries original request
```

**Echo Show Authentication:**
```
User: "Alexa, open Personal Dashboard"
Alexa → Backend /auth/alexa/link
  ├─ Backend generates linking code
  └─ Alexa: "Please link your account at dashboard.app/link with code 1234-5678"

User visits dashboard.app/link on desktop/mobile
  ├─ Enters code 1234-5678
  ├─ Logs in with regular credentials
  └─ Backend associates Alexa user ID with account

Future Alexa requests include user context
Alexa → Backend with Alexa user ID
  └─ Backend maps to authenticated user account
```

### 6.1.3 Data Sync Architecture

**Sync Strategy: Event-Driven with Operational Transform**

```
Primary Device (Desktop) creates Transaction
  └─ POST /api/financial/transactions
      ├─ Backend creates MongoDB doc with ID
      ├─ Backend creates Neo4j node with same ID
      ├─ Backend returns success + entity to client
      └─ Backend broadcasts via WebSocket:
          {
            type: "ENTITY_CREATED",
            subdomain: "financial",
            entity: "Transaction",
            id: "uuid",
            data: {...},
            timestamp: "2025-10-23T12:00:00Z",
            userId: "user-123"
          }

Secondary Device (PWA) receives WebSocket message
  └─ Client checks local cache
      ├─ Entity doesn't exist: Add to local IndexedDB
      ├─ Entity exists with older timestamp: Update
      └─ Entity exists with newer timestamp: CONFLICT

Offline Device (PWA, disconnected)
  └─ User creates Transaction locally
      ├─ Stored in IndexedDB with temp ID
      ├─ Marked as syncStatus: "pending"
      └─ Queued for sync when reconnected

Device Reconnects
  └─ Client calls GET /api/sync/changes?since=<last_sync_timestamp>
      ├─ Backend returns all changes since timestamp
      ├─ Client applies changes (with conflict resolution)
      └─ Client uploads pending changes
          ├─ Backend processes each pending change
          ├─ Assigns permanent IDs
          └─ Returns mapping of temp IDs → permanent IDs
```

**Conflict Resolution (Last-Write-Wins):**

```cypher
// When conflict detected (same entity, different timestamps)
MATCH (entity {id: $entityId})
WITH entity, $incomingTimestamp as incoming, entity.updatedAt as existing
WHERE incoming > existing
SET entity = $incomingData, entity.updatedAt = incoming
RETURN entity

// If existing > incoming, discard incoming change
```

**[ASSUMPTION: Last-write-wins is acceptable for Phase 1 personal use. Future: User-prompted conflict resolution for critical changes]**

## 6.2 Technology Stack Recommendations

### 6.2.1 Desktop Application

**Recommendation: Electron + React**

**Rationale:**
- You're experienced with web technologies (React, Next.js)
- Electron allows code reuse from PWA
- Cross-platform (Windows, Mac, Linux) from single codebase
- Access to native OS features (global shortcuts, system tray)
- Large ecosystem and community support

**Alternative Considered: Tauri**
- Pros: Smaller bundle size, better security, uses system webview
- Cons: Newer, smaller community, less mature ecosystem
- **Decision:** Use Electron for faster development, consider Tauri migration in future

**Key Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "electron": "^27.0.0",
    "electron-store": "^8.1.0",
    "neo4j-driver": "^5.14.0",
    "mongodb": "^6.3.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.3.0",
    "@tanstack/react-query": "^5.8.0",
    "zustand": "^4.4.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0"
  }
}
```

**Project Structure:**
```
/desktop-app
  /src
    /main              # Electron main process
      - main.ts
      - preload.ts
      - ipc-handlers.ts
    /renderer          # React app
      /components
      /subdomains
        /financial
        /health  
        /schedule
      /framework       # Core framework code
        - carousel.tsx
        - relationship-sidebar.tsx
        - search.tsx
      /hooks
      /utils
    /shared            # Shared between main and renderer
      /types
      /constants
```

**Development Workflow:**
1. `npm run dev` - Start Electron with hot reload
2. Local Neo4j/MongoDB for development
3. VSCode with Electron debugging configured

### 6.2.2 Backend API

**Recommendation: Node.js + Fastify + TypeScript**

**Rationale:**
- Consistent language with frontend (TypeScript)
- Fastify is faster than Express with better TypeScript support
- Excellent Neo4j and MongoDB drivers for Node.js
- WebSocket support built-in
- Easy to deploy (Vercel, Railway, AWS Lambda)

**Alternative Considered: Python + FastAPI**
- Pros: Excellent for ML/AI features (future), great async support
- Cons: Different language from frontend, smaller Neo4j ecosystem
- **Decision:** Node.js for consistency, Python microservices for ML later

**Key Dependencies:**
```json
{
  "dependencies": {
    "@fastify/cors": "^8.4.0",
    "@fastify/jwt": "^7.2.0",
    "@fastify/websocket": "^8.3.0",
    "fastify": "^4.24.0",
    "neo4j-driver": "^5.14.0",
    "mongodb": "^6.3.0",
    "zod": "^3.22.0",
    "pino": "^8.16.0",
    "bull": "^4.11.0",
    "ioredis": "^5.3.0"
  }
}
```

**API Design: REST + GraphQL Hybrid**

**REST for Simple CRUD:**
```typescript
// Subdomain-specific routes
POST   /api/financial/transactions
GET    /api/financial/transactions/:id
PUT    /api/financial/transactions/:id
DELETE /api/financial/transactions/:id
GET    /api/financial/transactions?filters={...}

POST   /api/health/workouts
GET    /api/health/metrics?type=weight&start=2025-10-01

POST   /api/schedule/tasks
PUT    /api/schedule/tasks/:id/complete
```

**GraphQL for Complex Queries:**
```graphql
# Query with relationships
query GetTransactionWithRelationships($id: ID!) {
  transaction(id: $id) {
    id
    amount
    description
    date
    account {
      name
      type
    }
    relationships {
      type
      entity {
        ... on HealthEvent {
          id
          title
          date
        }
        ... on Task {
          id
          title
          status
        }
      }
    }
  }
}

# Cross-subdomain search
query Search($query: String!, $filters: SearchFilters) {
  search(query: $query, filters: $filters) {
    results {
      entity {
        ... on Transaction { id amount description }
        ... on Workout { id activity duration }
        ... on Task { id title dueDate }
      }
      relationships {
        type
        relatedEntity { id type }
      }
    }
  }
}
```

**Recommendation:** Use REST for 80% of operations, GraphQL for complex relationship queries.

**Project Structure:**
```
/backend-api
  /src
    /routes
      /financial
      /health
      /schedule
      /auth
      /sync
      /relationships
    /services
      - neo4j.service.ts
      - mongodb.service.ts
      - auth.service.ts
      - sync.service.ts
      - relationships.service.ts
    /jobs            # Background jobs
      - insights.job.ts
      - backup.job.ts
    /graphql
      - schema.ts
      - resolvers.ts
    /middleware
    /utils
    /types
```

### 6.2.3 Progressive Web App

**Recommendation: Continue with Next.js 14+ (App Router)**

**Rationale:**
- You're already using React + Next.js
- Next.js 14 App Router provides excellent PWA capabilities
- Server-side rendering for initial load speed
- Built-in API routes for backend communication
- Vercel deployment is seamless

**Key Dependencies:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "next-pwa": "^5.6.0",
    "workbox": "^7.0.0",
    "idb": "^7.1.1",
    "react-query": "^5.8.0"
  }
}
```

**Offline-First Architecture:**

```typescript
// Service Worker Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // API requests: Network first, fallback to cache
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open('api-cache').then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
  
  // Static assets: Cache first
  else {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request);
      })
    );
  }
});
```

**IndexedDB Schema for Offline Storage:**
```typescript
// Using idb library
const db = await openDB('personal-dashboard', 1, {
  upgrade(db) {
    // Stores for each subdomain
    db.createObjectStore('transactions', { keyPath: 'id' });
    db.createObjectStore('workouts', { keyPath: 'id' });
    db.createObjectStore('tasks', { keyPath: 'id' });
    
    // Sync queue
    db.createObjectStore('sync-queue', { keyPath: 'tempId', autoIncrement: true });
    
    // Metadata
    db.createObjectStore('sync-metadata', { keyPath: 'key' });
  }
});
```

**Responsive Design Breakpoints:**
```css
/* Mobile First */
/* Base styles: 320px - 640px */

/* Tablet: 641px - 1024px */
@media (min-width: 641px) {
  /* Two-column layouts, larger touch targets */
}

/* Desktop: 1025px+ */
@media (min-width: 1025px) {
  /* Multi-column layouts, hover states, keyboard shortcuts */
}
```

### 6.2.4 Echo Show Skill

**Alexa Skills Kit Development Approach**

**Prerequisites to Learn:**
1. Alexa Skills Kit (ASK) fundamentals
2. Voice User Interface (VUI) design principles
3. AWS Lambda (skill backend runs here)
4. APL (Alexa Presentation Language) for visual displays

**Recommended Learning Path:**
1. Start: [Alexa Developer Console Tutorial](https://developer.amazon.com/en-US/alexa/alexa-skills-kit/get-deeper/tutorials-code-samples)
2. Complete: "Fact Skill" tutorial (2-3 hours)
3. Study: APL templates for Echo Show
4. Build: Simple prototype that fetches data from your API

**Development Stack:**
```json
{
  "dependencies": {
    "ask-sdk-core": "^2.13.0",
    "ask-sdk-model": "^1.38.0",
    "axios": "^1.6.0"
  }
}
```

**Intent Schema Design:**

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "personal dashboard",
      "intents": [
        {
          "name": "ViewDashboardIntent",
          "slots": [
            {
              "name": "subdomain",
              "type": "SUBDOMAIN_TYPE"
            }
          ],
          "samples": [
            "show my {subdomain}",
            "open {subdomain} dashboard",
            "what's my {subdomain} looking like"
          ]
        },
        {
          "name": "LogExpenseIntent",
          "slots": [
            {
              "name": "amount",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "description",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "log an expense",
            "I spent {amount} dollars on {description}",
            "add expense {amount} for {description}"
          ]
        },
        {
          "name": "AskSummaryIntent",
          "slots": [
            {
              "name": "subdomain",
              "type": "SUBDOMAIN_TYPE"
            },
            {
              "name": "timeframe",
              "type": "TIMEFRAME_TYPE"
            }
          ],
          "samples": [
            "what did I spend {timeframe}",
            "how many workouts {timeframe}",
            "what's on my schedule {timeframe}"
          ]
        }
      ],
      "types": [
        {
          "name": "SUBDOMAIN_TYPE",
          "values": [
            {"name": {"value": "financial"}},
            {"name": {"value": "health"}},
            {"name": {"value": "schedule"}}
          ]
        },
        {
          "name": "TIMEFRAME_TYPE",
          "values": [
            {"name": {"value": "today"}},
            {"name": {"value": "this week"}},
            {"name": {"value": "this month"}}
          ]
        }
      ]
    }
  }
}
```

**Voice Interaction Flow Example:**

```typescript
// Lambda function handler
const ViewDashboardIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ViewDashboardIntent';
  },
  async handle(handlerInput) {
    const subdomain = handlerInput.requestEnvelope.request.intent.slots.subdomain.value;
    const userId = handlerInput.requestEnvelope.context.System.user.userId;
    
    // Fetch data from your backend API
    const data = await axios.get(`${API_URL}/api/alexa/summary`, {
      params: { userId, subdomain }
    });
    
    const speechText = generateSpeechResponse(subdomain, data);
    const aplDocument = generateAPLDocument(subdomain, data);
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: aplDocument,
        datasources: data
      })
      .getResponse();
  }
};

function generateSpeechResponse(subdomain, data) {
  if (subdomain === 'financial') {
    return `Here's your financial summary. This month you've spent ${data.spending} 
            and you're at ${data.budgetPercent}% of your budget. You have ${data.accountCount} 
            accounts with a total balance of ${data.totalBalance}.`;
  }
  // ... other subdomains
}
```

**APL Visual Template (Echo Show Display):**

```json
{
  "type": "APL",
  "version": "2023.3",
  "mainTemplate": {
    "items": [
      {
        "type": "Container",
        "width": "100vw",
        "height": "100vh",
        "items": [
          {
            "type": "Text",
            "text": "${title}",
            "style": "textStyleDisplay2",
            "textAlign": "center"
          },
          {
            "type": "Container",
            "direction": "row",
            "items": [
              {
                "type": "Text",
                "text": "This Month: ${spending}",
                "style": "textStyleBody"
              },
              {
                "type": "Text",
                "text": "Budget: ${budgetPercent}%",
                "style": "textStyleBody",
                "color": "${budgetPercent > 100 ? 'red' : 'green'}"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Backend Integration:**

```typescript
// In your backend API
router.get('/api/alexa/summary', authenticate, async (req, res) => {
  const { userId, subdomain } = req.query;
  
  // Fetch relevant data
  const data = await getSubdomainSummary(userId, subdomain);
  
  // Return in format optimized for Alexa
  res.json({
    title: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Dashboard`,
    ...data,
    timestamp: new Date().toISOString()
  });
});
```

**Testing and Debugging:**
1. Use Alexa Developer Console simulator (no device needed)
2. Test on actual Echo Show before deployment
3. Enable CloudWatch logs for Lambda function debugging
4. Use `ask dialog` CLI for conversation testing

**Common Pitfalls to Avoid:**
- Voice responses too long (keep under 30 seconds)
- Visual displays with too much text (users are 6-10 feet away)
- Not handling errors gracefully ("Sorry, I couldn't fetch your data right now")
- Forgetting to re-prompt for multi-turn conversations

### 6.2.5 Databases

**Neo4j Configuration:**

**Hosting Recommendation: Neo4j Aura (Cloud)**
- **Pros:** Managed service, automatic backups, scaling, security patches
- **Cons:** Cost (~$65/month for basic tier)
- **Alternative:** Self-hosted on VPS (DigitalOcean, Linode) for ~$12/month
- **Decision for Phase 1:** Self-hosted for cost savings, migrate to Aura at Phase 3 (commercial)

**Schema Design Principles:**
```cypher
// 1. Use Labels hierarchically
CREATE (:Entity:FinancialEntity:Transaction)
// Allows queries like: MATCH (e:Entity) or MATCH (f:FinancialEntity)

// 2. Index critical properties
CREATE INDEX transaction_date IF NOT EXISTS FOR (t:Transaction) ON (t.date);
CREATE INDEX transaction_user IF NOT EXISTS FOR (t:Transaction) ON (t.userId);
CREATE CONSTRAINT transaction_id IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE;

// 3. Store denormalized data for performance
// Instead of always traversing relationships, cache commonly accessed data
CREATE (t:Transaction {
  id: $id,
  amount: $amount,
  accountName: $accountName, // Denormalized from Account node
  categoryName: $categoryName // Denormalized from Category node
})

// 4. Use relationship properties for metadata
CREATE (t:Transaction)-[:RELATED_TO {
  discoveredAt: datetime(),
  confidence: 0.85,
  discoveryMethod: 'TEMPORAL_CORRELATION'
}]->(h:HealthEvent)
```

**MongoDB Configuration:**

**Hosting Recommendation: MongoDB Atlas (Free Tier → Paid)**
- **Free Tier:** 512MB storage, good for Phase 1
- **Paid:** $9/month for 2GB, scales as needed
- **Alternative:** Self-hosted, but managed service is better value

**Collections Structure:**
```javascript
// financial_transactions, financial_accounts, financial_budgets
// health_meals, health_workouts, health_metrics, health_events
// schedule_events, schedule_tasks, schedule_projects

// Common patterns:
{
  _id: ObjectId,
  neo4jId: "uuid",        // Links to Neo4j node
  userId: "user-id",      // Always indexed
  // ... entity-specific fields
  syncStatus: "synced",   // synced | pending | error
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Data Lifecycle Management:**

```typescript
// When creating an entity
async function createTransaction(data: TransactionInput) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Create MongoDB document
    const mongoDoc = await TransactionModel.create([{
      ...data,
      neo4jId: generateUUID(),
      syncStatus: 'pending'
    }], { session });
    
    // 2. Create Neo4j node
    await neo4j.session().run(
      `CREATE (t:Transaction:FinancialEntity {
        id: $id,
        amount: $amount,
        description: $description,
        date: date($date),
        userId: $userId
      })`,
      { id: mongoDoc[0].neo4jId, ...data }
    );
    
    // 3. Create relationships
    await neo4j.session().run(
      `MATCH (t:Transaction {id: $transactionId})
       MATCH (a:Account {id: $accountId})
       CREATE (t)-[:PAID_WITH]->(a)`,
      { transactionId: mongoDoc[0].neo4jId, accountId: data.accountId }
    );
    
    // 4. Update sync status
    await TransactionModel.updateOne(
      { _id: mongoDoc[0]._id },
      { syncStatus: 'synced' },
      { session }
    );
    
    await session.commitTransaction();
    return mongoDoc[0];
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 6.2.6 Infrastructure

**Hosting Recommendations (Budget-Conscious):**

**Phase 1 (Personal Use):**
- **Backend API:** Railway ($5-10/month, includes Redis for job queue)
- **Neo4j:** Self-hosted VPS (Linode $12/month)
- **MongoDB:** Atlas Free Tier
- **File Storage:** Backblaze B2 ($0.005/GB, cheaper than S3)
- **Total:** ~$20/month

**Phase 2-3 (Beta/Commercial):**
- **Backend API:** AWS ECS Fargate or Railway ($20-50/month)
- **Neo4j:** Aura ($65/month)
- **MongoDB:** Atlas M10 ($57/month)
- **File Storage:** AWS S3
- **CDN:** Cloudflare (free tier)
- **Total:** ~$150-200/month

**CI/CD Pipeline:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up

  deploy-pwa:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
```

**Monitoring and Logging:**
- **Application Monitoring:** Sentry (free tier: 5K events/month)
- **Logs:** Papertrail or Better Stack (free tier)
- **Uptime Monitoring:** UptimeRobot (free)
- **Analytics:** Plausible or self-hosted Umami (privacy-friendly)

**Backup Strategy:**
- **Neo4j:** Daily automated dumps to S3/B2, retention: 30 days
- **MongoDB:** Atlas automated backups (included)
- **Files:** Versioned in S3/B2
- **Full System Backup:** Weekly complete snapshots

## 6.3 Neo4j Graph Schema

### 6.3.1 Core Node Types with Properties

**Base Entity (Abstract):**
All nodes inherit these properties:
```cypher
{
  id: UUID (unique),
  userId: String (indexed),
  createdAt: DateTime,
  updatedAt: DateTime,
  metadata: Map // Flexible for subdomain-specific data
}
```

**User Node:**
```cypher
CREATE (u:User {
  id: randomUUID(),
  email: 'user@example.com',
  name: 'Alex Developer',
  timezone: 'America/New_York',
  preferences: {
    defaultCurrency: 'USD',
    theme: 'dark',
    notificationsEnabled: true
  },
  createdAt: datetime(),
  updatedAt: datetime()
})

// Indexes
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email);
```

**Common Entity Types (Shared across subdomains):**

```cypher
// Person - People mentioned/involved across any subdomain
CREATE (p:Person {
  id: randomUUID(),
  name: 'Dr. Sarah Smith',
  email: 'sarah.smith@medical.com',
  phone: '+1-555-0123',
  type: 'PROFESSIONAL', // PROFESSIONAL, FRIEND, FAMILY, COLLEAGUE
  notes: 'Primary care physician',
  createdAt: datetime()
})

// Location - Places referenced anywhere
CREATE (l:Location {
  id: randomUUID(),
  name: 'City Medical Center',
  address: '123 Main St, New York, NY 10001',
  coordinates: point({latitude: 40.7589, longitude: -73.9851}),
  type: 'MEDICAL', // MEDICAL, RESTAURANT, GYM, WORK, HOME, OTHER
  createdAt: datetime()
})

// Topic/Tag - Categorical organization
CREATE (t:Topic {
  id: randomUUID(),
  name: 'Health & Wellness',
  parent: 'Personal Development', // Hierarchical
  color: '#10b981',
  createdAt: datetime()
})

// Date - Temporal anchor for queries
CREATE (d:Date {
  date: date('2025-10-23'),
  dayOfWeek: 'Wednesday',
  week: 43,
  month: 10,
  quarter: 4,
  year: 2025,
  isWeekday: true,
  isWeekend: false
})

// Indexes
CREATE INDEX date_value IF NOT EXISTS FOR (d:Date) ON (d.date);
CREATE INDEX location_coords IF NOT EXISTS FOR (l:Location) ON (l.coordinates);
CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name);
CREATE INDEX topic_name IF NOT EXISTS FOR (t:Topic) ON (t.name);
```

**Financial Entities** (See section 5.1.2 for complete details):
- Transaction :FinancialEntity
- Account :FinancialEntity
- Category :FinancialEntity
- Budget :FinancialEntity
- FinancialGoal :FinancialEntity
- NetWorthSnapshot :FinancialEntity

**Health Entities** (See section 5.2.2 for complete details):
- Meal :HealthEntity
- Workout :HealthEntity
- BodyMetric :HealthEntity
- HealthEvent :HealthEntity
- HealthGoal :HealthEntity

**Schedule Entities** (See section 5.3.2 for complete details):
- Event :ScheduleEntity
- Task :ScheduleEntity
- Reminder :ScheduleEntity
- Project :ScheduleEntity
- TimeBlock :ScheduleEntity
- ActivitySuggestion :ScheduleEntity

### 6.3.2 All Relationship Types with Properties

**Ownership Relationships:**
```cypher
(:User)-[:OWNS]->(:Account)
(:User)-[:HAS_GOAL]->(:FinancialGoal)
(:User)-[:HAS_GOAL]->(:HealthGoal)
(:User)-[:HAS_EVENT]->(:Event)
(:User)-[:HAS_TASK]->(:Task)
(:User)-[:HAS_PROJECT]->(:Project)

// Properties: None (simple ownership)
```

**Subdomain-Specific Relationships:**

Financial:
```cypher
(:Transaction)-[:PAID_WITH {
  isDefault: boolean
}]->(:Account)

(:Transaction)-[:CATEGORIZED_AS {
  confidence: float, // 0.0-1.0 if auto-categorized
  autoDetected: boolean
}]->(:Category)

(:Transaction)-[:CONTRIBUTES_TO {
  amount: float
}]->(:FinancialGoal)

(:Budget)-[:ALLOCATES {
  amount: float,
  spent: float
}]->(:Category)
```

Health:
```cypher
(:User)-[:LOGGED {
  timestamp: datetime
}]->(:Meal)

(:User)-[:LOGGED {
  timestamp: datetime
}]->(:Workout)

(:User)-[:MEASURED {
  timestamp: datetime
}]->(:BodyMetric)

(:Workout)-[:PROGRESSES {
  contributionAmount: float // e.g., miles toward goal
}]->(:HealthGoal)

(:BodyMetric)-[:TRACKS {
  // Links weight measurements to weight loss goal
}]->(:HealthGoal)
```

Schedule:
```cypher
(:Task)-[:PART_OF]->(:Project)

(:Task)-[:DEPENDS_ON {
  dependencyType: 'BLOCKS' | 'STARTS_AFTER'
}]->(:Task)

(:Event)-[:INVOLVES]->(:Person)
(:Task)-[:ASSIGNED_TO]->(:Person)

(:ActivitySuggestion)-[:SUPPORTS {
  reasoning: string
}]->(:HealthGoal | :FinancialGoal)
```

**Temporal Relationships:**
```cypher
(:Transaction | :Meal | :Workout | :Event | :Task)-[:OCCURRED_ON {
  // No properties needed
}]->(:Date)

// Allows queries like:
MATCH (entity)-[:OCCURRED_ON]->(d:Date {date: date('2025-10-23')})
RETURN entity
```

**Spatial Relationships:**
```cypher
(:Transaction | :Workout | :Event | :HealthEvent)-[:OCCURRED_AT {
  arrivalTime: time,
  departureTime: time
}]->(:Location)
```

**Cross-Domain Relationships (The Magic!):**

```cypher
// Generic semantic connection
()-[:RELATED_TO {
  discoveredAt: datetime,
  confidence: float,
  discoveryMethod: 'MANUAL' | 'TEMPORAL' | 'SEMANTIC' | 'ML',
  notes: string
}]->()

// Temporal correlation
()-[:OCCURRED_WITH {
  timeDelta: duration, // How close in time
  correlation: float // Statistical correlation if computed
}]->()

// Causal or inspirational
()-[:INFLUENCED_BY {
  influenceType: 'CAUSED' | 'INSPIRED' | 'ENABLED',
  description: string
}]->()

// Explicit citation
()-[:REFERENCES {
  context: string // Where/how it's referenced
}]->()

// Examples:
(t:Transaction)-[:RELATED_TO {discoveryMethod: 'TEMPORAL'}]->(he:HealthEvent)
(w:Workout)-[:RELATED_TO]->(task:Task)
(m:Meal)-[:PURCHASED_AT]->(t:Transaction)
(e:Event)-[:RELATED_TO]->(t:Transaction) // Uber to appointment
```

**Tagging Relationships:**
```cypher
()-[:TAGGED_AS]->(:Topic)

// All entities can be tagged with topics
(t:Transaction)-[:TAGGED_AS]->(topic:Topic {name: 'Work Expenses'})
(n:Note)-[:TAGGED_AS]->(topic:Topic {name: 'Neo4j'})
```

### 6.3.3 Indexes and Constraints

```cypher
// Unique constraints (prevent duplicates)
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT transaction_id IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT account_id IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT workout_id IF NOT EXISTS FOR (w:Workout) REQUIRE w.id IS UNIQUE;
CREATE CONSTRAINT task_id IF NOT EXISTS FOR (t:Task) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT location_id IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT date_date IF NOT EXISTS FOR (d:Date) REQUIRE d.date IS UNIQUE;

// Performance indexes
CREATE INDEX transaction_date IF NOT EXISTS FOR (t:Transaction) ON (t.date);
CREATE INDEX transaction_user IF NOT EXISTS FOR (t:Transaction) ON (t.userId);
CREATE INDEX transaction_amount IF NOT EXISTS FOR (t:Transaction) ON (t.amount);
CREATE INDEX workout_date IF NOT EXISTS FOR (w:Workout) ON (w.date);
CREATE INDEX task_duedate IF NOT EXISTS FOR (t:Task) ON (t.dueDate);
CREATE INDEX task_status IF NOT EXISTS FOR (t:Task) ON (t.status);
CREATE INDEX event_starttime IF NOT EXISTS FOR (e:Event) ON (e.startTime);
CREATE INDEX bodymetric_date IF NOT EXISTS FOR (b:BodyMetric) ON (b.date);
CREATE INDEX bodymetric_type IF NOT EXISTS FOR (b:BodyMetric) ON (b.type);

// Composite indexes for common queries
CREATE INDEX transaction_user_date IF NOT EXISTS FOR (t:Transaction) ON (t.userId, t.date);
CREATE INDEX task_user_status IF NOT EXISTS FOR (t:Task) ON (t.userId, t.status);

// Full-text search index
CREATE FULLTEXT INDEX entity_search IF NOT EXISTS
FOR (n:Transaction|Workout|Task|Event|Note|HealthEvent)
ON EACH [n.description, n.title, n.notes, n.name];
```

### 6.3.4 Example Cypher Queries for Common Operations

**1. Get all entities for a user on a specific date:**
```cypher
MATCH (u:User {id: $userId})-[r]->(entity)
WHERE entity:Transaction OR entity:Workout OR entity:Event OR entity:Task
WITH entity, date(entity.date) as entityDate
WHERE entityDate = date($date)
RETURN entity, labels(entity) as types
ORDER BY 
  CASE 
    WHEN entity:Event THEN entity.startTime
    WHEN entity:Transaction THEN entity.createdAt
    ELSE entity.createdAt
  END
```

**2. Find all relationships for a specific entity:**
```cypher
MATCH (entity {id: $entityId})-[r]-(related)
RETURN 
  type(r) as relationshipType,
  related,
  labels(related) as relatedType,
  properties(r) as relationshipProps
ORDER BY relationshipType
```

**3. Discover cross-domain temporal correlations:**
```cypher
// Find transactions and workouts on the same day
MATCH (t:Transaction)-[:OCCURRED_ON]->(d:Date)
MATCH (w:Workout)-[:OCCURRED_ON]->(d)
WHERE t.userId = $userId 
  AND d.date >= date($startDate)
  AND d.date <= date($endDate)
RETURN 
  d.date,
  collect(DISTINCT {type: 'transaction', amount: t.amount, description: t.description}) as transactions,
  collect(DISTINCT {type: 'workout', activity: w.activity, duration: w.duration}) as workouts
ORDER BY d.date
```

**4. Calculate spending by category for a date range:**
```cypher
MATCH (u:User {id: $userId})-[:OWNS]->(a:Account)<-[:PAID_WITH]-(t:Transaction)
MATCH (t)-[:CATEGORIZED_AS]->(c:Category)
WHERE t.date >= date($startDate) AND t.date <= date($endDate)
RETURN 
  c.name as category,
  c.color as color,
  sum(abs(t.amount)) as totalSpent,
  count(t) as transactionCount
ORDER BY totalSpent DESC
```

**5. Find people mentioned across all subdomains:**
```cypher
MATCH (p:Person)
OPTIONAL MATCH (p)<-[:INVOLVES]-(e:Event)
OPTIONAL MATCH (p)<-[:MENTIONS]-(t:Transaction)
OPTIONAL MATCH (p)<-[:ASSIGNED_TO]-(task:Task)
WITH p, 
  count(DISTINCT e) as eventCount,
  count(DISTINCT t) as transactionCount,
  count(DISTINCT task) as taskCount
WHERE eventCount + transactionCount + taskCount > 0
RETURN 
  p.name,
  eventCount,
  transactionCount,
  taskCount,
  eventCount + transactionCount + taskCount as totalMentions
ORDER BY totalMentions DESC
```

**6. Track progress toward a health goal:**
```cypher
MATCH (u:User {id: $userId})-[:HAS_GOAL]->(g:HealthGoal {id: $goalId})
MATCH (w:Workout)-[:PROGRESSES]->(g)
WHERE w.date >= date($startDate)
RETURN 
  g.name,
  g.targetValue,
  g.currentValue,
  count(w) as workoutsCompleted,
  sum(w.duration) as totalMinutes,
  (g.currentValue / g.targetValue * 100) as percentComplete
```

**7. Find related items for relationship sidebar:**
```cypher
// Given an entity, find all related entities with context
MATCH (entity {id: $entityId})
OPTIONAL MATCH (entity)-[r1:RELATED_TO]-(related1)
OPTIONAL MATCH (entity)-[r2:OCCURRED_WITH]-(related2)
OPTIONAL MATCH (entity)-[r3:REFERENCES]-(related3)
WITH entity, 
  collect(DISTINCT {
    entity: related1, 
    relationship: type(r1), 
    properties: properties(r1),
    labels: labels(related1)
  }) + 
  collect(DISTINCT {
    entity: related2, 
    relationship: type(r2), 
    properties: properties(r2),
    labels: labels(related2)
  }) + 
  collect(DISTINCT {
    entity: related3, 
    relationship: type(r3), 
    properties: properties(r3),
    labels: related3)
  }) as allRelated
UNWIND allRelated as rel
WHERE rel.entity IS NOT NULL
RETURN rel
LIMIT 20
```

**8. Detect spending patterns correlated with workouts:**
```cypher
// Group by week, compare grocery spending on workout vs non-workout weeks
MATCH (u:User {id: $userId})-[:OWNS]->(:Account)<-[:PAID_WITH]-(t:Transaction)
MATCH (t)-[:CATEGORIZED_AS]->(c:Category {name: 'Groceries'})
MATCH (t)-[:OCCURRED_ON]->(d:Date)
WITH date.truncate('week', d.date) as week, sum(abs(t.amount)) as grocerySpend
ORDER BY week

MATCH (u:User {id: $userId})-[:LOGGED]->(w:Workout)
MATCH (w)-[:OCCURRED_ON]->(wd:Date)
WITH week, grocerySpend, date.truncate('week', wd.date) as workoutWeek, count(w) as workoutCount
WHERE week = workoutWeek
RETURN 
  week,
  grocerySpend,
  workoutCount,
  CASE WHEN workoutCount >= 4 THEN 'active' ELSE 'inactive' END as weekType
ORDER BY week
```

**9. Search across all entities:**
```cypher
CALL db.index.fulltext.queryNodes('entity_search', $searchQuery)
YIELD node, score
WHERE node.userId = $userId
MATCH (node)-[r]-(related)
RETURN 
  node,
  labels(node) as entityType,
  score,
  collect(DISTINCT {
    type: labels(related)[0],
    relationship: type(r),
    id: related.id
  })[..5] as relationships
ORDER BY score DESC
LIMIT 20
```

**10. Generate daily insight: most productive task completion time:**
```cypher
MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task)
WHERE t.status = 'COMPLETED' 
  AND t.completedAt >= datetime() - duration({days: 90})
WITH t, duration.between(datetime({date: date(t.completedAt), time: time('00:00')}), t.completedAt) as timeOfDay
WITH timeOfDay.hours as hour, count(t) as completions
RETURN hour, completions
ORDER BY completions DESC
LIMIT 3
```

### 6.3.5 Schema Evolution Strategy

**Versioning Approach:**

```cypher
// Add schema version to User node
MATCH (u:User)
SET u.schemaVersion = 1

// When schema changes, create migration scripts
// Example: Adding new property to all Transactions
MATCH (t:Transaction)
WHERE NOT exists(t.schemaVersion) OR t.schemaVersion < 2
SET t.merchantCategory = 
  CASE 
    WHEN t.merchant CONTAINS 'Whole Foods' THEN 'GROCERY'
    WHEN t.merchant CONTAINS 'Starbucks' THEN 'COFFEE'
    ELSE 'OTHER'
  END,
  t.schemaVersion = 2
```

**Migration Script Template:**

```typescript
// migrations/002_add_merchant_category.ts
import { neo4j } from '../services/neo4j.service';

export async function up() {
  const session = neo4j.session();
  try {
    await session.run(`
      MATCH (t:Transaction)
      WHERE NOT exists(t.schemaVersion) OR t.schemaVersion < 2
      SET t.merchantCategory = 'OTHER',
          t.schemaVersion = 2
      RETURN count(t) as updatedCount
    `);
    console.log('Migration 002 completed');
  } finally {
    await session.close();
  }
}

export async function down() {
  const session = neo4j.session();
  try {
    await session.run(`
      MATCH (t:Transaction)
      WHERE t.schemaVersion = 2
      REMOVE t.merchantCategory
      SET t.schemaVersion = 1
    `);
    console.log('Migration 002 rolled back');
  } finally {
    await session.close();
  }
}
```

**Safe Schema Changes (No Migration Needed):**
- Adding optional properties (just update application code)
- Adding new node labels (can coexist with old labels)
- Adding new relationship types

**Migrations Required:**
- Renaming properties
- Changing property types
- Restructuring relationships
- Splitting nodes into multiple nodes

**Testing Migrations:**
```typescript
// Always test on a copy of production data
// 1. Export production Neo4j database
// 2. Import to local/staging
// 3. Run migration
// 4. Verify with queries
// 5. Deploy to production with backup

describe('Migration 002', () => {
  it('should add merchantCategory to all Transactions', async () => {
    await migration_002.up();
    
    const result = await neo4j.session().run(`
      MATCH (t:Transaction)
      WHERE NOT exists(t.merchantCategory)
      RETURN count(t) as missingCount
    `);
    
    expect(result.records[0].get('missingCount')).toBe(0);
  });
});
```

## 6.4 API Design

### 6.4.1 REST API Endpoints

**Authentication:**
```
POST   /api/auth/register          # Create new user account
POST   /api/auth/login             # Login with email/password
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # Invalidate refresh token
GET    /api/auth/me                # Get current user info
POST   /api/auth/alexa/link        # Generate Alexa linking code
POST   /api/auth/alexa/complete    # Complete Alexa account linking
```

**Financial Subdomain:**
```
POST   /api/financial/transactions
GET    /api/financial/transactions/:id
PUT    /api/financial/transactions/:id
DELETE /api/financial/transactions/:id
GET    /api/financial/transactions
  ?userId=xxx
  &startDate=2025-10-01
  &endDate=2025-10-31
  &accountId=xxx
  &categoryId=xxx
  &minAmount=0
  &maxAmount=1000
  &limit=50
  &offset=0

POST   /api/financial/accounts
GET    /api/financial/accounts/:id
PUT    /api/financial/accounts/:id
DELETE /api/financial/accounts/:id
GET    /api/financial/accounts

POST   /api/financial/budgets
GET    /api/financial/budgets/:id
PUT    /api/financial/budgets/:id
GET    /api/financial/budgets?period=MONTHLY&year=2025&month=10

POST   /api/financial/goals
GET    /api/financial/goals/:id
PUT    /api/financial/goals/:id
GET    /api/financial/goals

GET    /api/financial/reports/spending-by-category
  ?startDate=2025-10-01&endDate=2025-10-31
GET    /api/financial/reports/net-worth-trend
  ?startDate=2025-01-01&endDate=2025-10-31
GET    /api/financial/reports/budget-progress
  ?budgetId=xxx
```

**Health Subdomain:**
```
POST   /api/health/meals
GET    /api/health/meals/:id
PUT    /api/health/meals/:id
DELETE /api/health/meals/:id
GET    /api/health/meals?date=2025-10-23

POST   /api/health/workouts
GET    /api/health/workouts/:id
PUT    /api/health/workouts/:id
DELETE /api/health/workouts/:id
GET    /api/health/workouts?startDate=2025-10-01&endDate=2025-10-31

POST   /api/health/metrics
GET    /api/health/metrics/:id
PUT    /api/health/metrics/:id
GET    /api/health/metrics?type=WEIGHT&startDate=2025-10-01

POST   /api/health/events
GET    /api/health/events/:id
PUT    /api/health/events/:id
GET    /api/health/events

GET    /api/health/reports/calorie-trend
GET    /api/health/reports/workout-frequency
GET    /api/health/reports/weight-progress
```

**Schedule Subdomain:**
```
POST   /api/schedule/events
GET    /api/schedule/events/:id
PUT    /api/schedule/events/:id
DELETE /api/schedule/events/:id
GET    /api/schedule/events?startDate=2025-10-23&endDate=2025-10-30

POST   /api/schedule/tasks
GET    /api/schedule/tasks/:id
PUT    /api/schedule/tasks/:id
PUT    /api/schedule/tasks/:id/complete   # Mark complete
DELETE /api/schedule/tasks/:id
GET    /api/schedule/tasks
  ?status=IN_PROGRESS&priority=HIGH&projectId=xxx

POST   /api/schedule/projects
GET    /api/schedule/projects/:id
PUT    /api/schedule/projects/:id
GET    /api/schedule/projects

GET    /api/schedule/calendar?year=2025&month=10
```

**Cross-Subdomain (Framework):**
```
GET    /api/relationships/:entityId     # Get all relationships for entity
POST   /api/relationships                # Create relationship
  Body: {fromId, toId, type, properties}
DELETE /api/relationships/:fromId/:toId/:type

GET    /api/search
  ?q=medical&subdomains=financial,health&dateRange=...
  
GET    /api/insights/daily              # Daily connection insights
GET    /api/insights/weekly             # Weekly patterns
POST   /api/insights/:insightId/dismiss # Dismiss a suggestion

GET    /api/graph/explore
  ?entityId=xxx&depth=2
  # Returns graph data for visualization

POST   /api/quick-capture               # Universal quick capture
  Body: {subdomain, type, data}
```

**Sync:**
```
GET    /api/sync/changes
  ?since=2025-10-23T12:00:00Z
  # Returns all changes since timestamp
  
POST   /api/sync/upload                 # Upload pending offline changes
  Body: [{entity, operation, data}, ...]
  
GET    /api/sync/status                 # Get sync status
```

**Alexa-Specific (Simplified):**
```
GET    /api/alexa/summary
  ?userId=xxx&subdomain=financial
  # Returns summary optimized for voice
  
POST   /api/alexa/quick-capture
  Body: {userId, subdomain, type, data}
  # Voice-initiated data capture
```

### 6.4.2 Request/Response Examples

**Create Transaction:**
```http
POST /api/financial/transactions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": -45.67,
  "description": "Whole Foods Market",
  "merchant": "Whole Foods",
  "date": "2025-10-23",
  "accountId": "account-uuid",
  "categoryId": "category-uuid",
  "notes": "Weekly groceries",
  "tags": ["groceries", "food"],
  "location": {
    "latitude": 40.7589,
    "longitude": -73.9851,
    "address": "250 7th Ave, New York, NY 10001"
  }
}

Response 201 Created:
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "neo4jId": "neo4j-uuid",
    "amount": -45.67,
    "description": "Whole Foods Market",
    "merchant": "Whole Foods",
    "date": "2025-10-23",
    "accountId": "account-uuid",
    "accountName": "Chase Sapphire",
    "categoryId": "category-uuid",
    "categoryName": "Groceries",
    "notes": "Weekly groceries",
    "tags": ["groceries", "food"],
    "location": {
      "latitude": 40.7589,
      "longitude": -73.9851,
      "address": "250 7th Ave, New York, NY 10001"
    },
    "status": "CLEARED",
    "createdAt": "2025-10-23T12:05:00Z",
    "updatedAt": "2025-10-23T12:05:00Z"
  }
}
```

**Search Across Subdomains:**
```http
GET /api/search?q=medical&subdomains=financial,health&limit=10
Authorization: Bearer <access_token>

Response 200 OK:
{
  "success": true,
  "data": {
    "query": "medical",
    "results": [
      {
        "id": "transaction-uuid",
        "type": "Transaction",
        "subdomain": "financial",
        "score": 0.95,
        "data": {
          "amount": -30.00,
          "description": "Dr. Smith - Copay",
          "date": "2025-10-23"
        },
        "relationships": [
          {
            "type": "RELATED_TO",
            "entity": {
              "id": "health-event-uuid",
              "type": "HealthEvent",
              "title": "Annual Physical"
            }
          }
        ]
      },
      {
        "id": "health-event-uuid",
        "type": "HealthEvent",
        "subdomain": "health",
        "score": 0.92,
        "data": {
          "title": "Annual Physical with Dr. Smith",
          "date": "2025-10-23T15:30:00Z",
          "provider": "Dr. Sarah Smith"
        },
        "relationships": [
          {
            "type": "RELATED_TO",
            "entity": {
              "id": "transaction-uuid",
              "type": "Transaction",
              "amount": -30.00
            }
          }
        ]
      }
    ],
    "total": 2,
    "facets": {
      "subdomains": {
        "financial": 1,
        "health": 1
      },
      "types": {
        "Transaction": 1,
        "HealthEvent": 1
      }
    }
  }
}
```

**Get Relationships:**
```http
GET /api/relationships/transaction-uuid
Authorization: Bearer <access_token>

Response 200 OK:
{
  "success": true,
  "data": {
    "entityId": "transaction-uuid",
    "entityType": "Transaction",
    "relationships": [
      {
        "type": "PAID_WITH",
        "direction": "OUTGOING",
        "entity": {
          "id": "account-uuid",
          "type": "Account",
          "name": "Chase Sapphire"
        },
        "properties": {
          "isDefault": true
        }
      },
      {
        "type": "CATEGORIZED_AS",
        "direction": "OUTGOING",
        "entity": {
          "id": "category-uuid",
          "type": "Category",
          "name": "Groceries"
        },
        "properties": {
          "confidence": 0.95,
          "autoDetected": true
        }
      },
      {
        "type": "RELATED_TO",
        "direction": "BIDIRECTIONAL",
        "entity": {
          "id": "health-event-uuid",
          "type": "HealthEvent",
          "title": "Doctor Appointment"
        },
        "properties": {
          "discoveredAt": "2025-10-23T12:10:00Z",
          "discoveryMethod": "TEMPORAL",
          "confidence": 0.85
        }
      },
      {
        "type": "OCCURRED_ON",
        "direction": "OUTGOING",
        "entity": {
          "id": "date-uuid",
          "type": "Date",
          "date": "2025-10-23"
        },
        "properties": {}
      }
    ]
  }
}
```

### 6.4.3 Error Handling

**Standard Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid transaction data",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a number"
      },
      {
        "field": "accountId",
        "message": "Account not found"
      }
    ],
    "requestId": "req-uuid",
    "timestamp": "2025-10-23T12:05:00Z"
  }
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR` (401): Invalid or expired token
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `VALIDATION_ERROR` (400): Invalid request data
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists or sync conflict
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## 6.5 Plugin/Subdomain Architecture

### 6.5.1 Subdomain Registration Mechanism

**Framework Registry:**

```typescript
// framework/subdomain-registry.ts
interface SubdomainDefinition {
  id: string;
  name: string;
  version: string;
  icon: string;
  color: string;
  order: number;
  
  // Neo4j schema
  nodeTypes: string[];
  relationships: RelationshipDefinition[];
  
  // UI components
  dashboardComponent: React.ComponentType;
  detailComponents?: Record<string, React.ComponentType>;
  
  // API routes
  apiRoutes: RouteDefinition[];
  
  // Quick actions
  quickActions: QuickActionDefinition[];
  
  // Search handler
  searchHandler: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  
  // Lifecycle hooks
  onLoad?: (framework: FrameworkAPI) => Promise<void>;
  onActivate?: (context: ActivationContext) => Promise<void>;
  onDeactivate?: () => Promise<void>;
}

class SubdomainRegistry {
  private subdomains: Map<string, SubdomainDefinition> = new Map();
  
  register(subdomain: SubdomainDefinition) {
    if (this.subdomains.has(subdomain.id)) {
      throw new Error(`Subdomain ${subdomain.id} already registered`);
    }
    this.subdomains.set(subdomain.id, subdomain);
    console.log(`✓ Registered subdomain: ${subdomain.name}`);
  }
  
  get(id: string): SubdomainDefinition | undefined {
    return this.subdomains.get(id);
  }
  
  getAll(): SubdomainDefinition[] {
    return Array.from(this.subdomains.values())
      .sort((a, b) => a.order - b.order);
  }
}

export const subdomainRegistry = new SubdomainRegistry();
```

**Subdomain Implementation Example:**

```typescript
// subdomains/financial/index.ts
import { SubdomainDefinition } from '@framework/subdomain-registry';
import FinancialDashboard from './dashboard';
import TransactionDetail from './components/transaction-detail';

const financialSubdomain: SubdomainDefinition = {
  id: 'financial',
  name: 'Financial',
  version: '1.0.0',
  icon: 'DollarSign',
  color: '#10b981',
  order: 1,
  
  nodeTypes: [
    'Transaction',
    'Account',
    'Category',
    'Budget',
    'FinancialGoal',
    'NetWorthSnapshot'
  ],
  
  relationships: [
    {
      type: 'PAID_WITH',
      from: 'Transaction',
      to: 'Account',
      properties: ['isDefault']
    },
    {
      type: 'CATEGORIZED_AS',
      from: 'Transaction',
      to: 'Category',
      properties: ['confidence', 'autoDetected']
    }
  ],
  
  dashboardComponent: FinancialDashboard,
  
  detailComponents: {
    Transaction: TransactionDetail,
    Account: AccountDetail
  },
  
  apiRoutes: [
    {
      method: 'POST',
      path: '/transactions',
      handler: createTransaction
    },
    {
      method: 'GET',
      path: '/transactions/:id',
      handler: getTransaction
    }
  ],
  
  quickActions: [
    {
      id: 'log-expense',
      name: 'Log Expense',
      icon: 'Receipt',
      handler: showExpenseForm
    },
    {
      id: 'log-income',
      name: 'Log Income',
      icon: 'DollarSign',
      handler: showIncomeForm
    }
  ],
  
  searchHandler: async (query, filters) => {
    // Search financial entities
    const results = await searchTransactions(query, filters);
    return results;
  },
  
  onLoad: async (framework) => {
    // Initialize financial sync service
    await initializeFinancialSync(framework);
  },
  
  onActivate: async (context) => {
    // Refresh financial data when subdomain becomes active
    await refreshFinancialData(context.userId);
  }
};

export default financialSubdomain;
```

**Framework Initialization:**

```typescript
// main.ts (Electron) or _app.tsx (Next.js)
import { subdomainRegistry } from '@framework/subdomain-registry';
import financialSubdomain from '@subdomains/financial';
import healthSubdomain from '@subdomains/health';
import scheduleSubdomain from '@subdomains/schedule';

async function initializeApp() {
  // Register all subdomains
  subdomainRegistry.register(financialSubdomain);
  subdomainRegistry.register(healthSubdomain);
  subdomainRegistry.register(scheduleSubdomain);
  
  // Call onLoad for each subdomain
  for (const subdomain of subdomainRegistry.getAll()) {
    if (subdomain.onLoad) {
      await subdomain.onLoad(frameworkAPI);
    }
  }
  
  console.log(`✓ Initialized ${subdomainRegistry.getAll().length} subdomains`);
}
```

### 6.5.2 API Contract Between Framework and Subdomains

**FrameworkAPI Interface:**

```typescript
// framework/api.ts
interface FrameworkAPI {
  // Data access
  neo4j: {
    query: (cypher: string, params: Record<string, any>) => Promise<any[]>;
    createNode: (labels: string[], properties: Record<string, any>) => Promise<string>;
    createRelationship: (fromId: string, toId: string, type: string, properties?: Record<string, any>) => Promise<void>;
    deleteNode: (id: string) => Promise<void>;
  };
  
  mongodb: {
    findOne: (collection: string, query: Record<string, any>) => Promise<any>;
    find: (collection: string, query: Record<string, any>) => Promise<any[]>;
    insertOne: (collection: string, document: Record<string, any>) => Promise<string>;
    updateOne: (collection: string, query: Record<string, any>, update: Record<string, any>) => Promise<void>;
    deleteOne: (collection: string, query: Record<string, any>) => Promise<void>;
  };
  
  // Navigation
  navigateToEntity: (entityId: string, entityType: string) => void;
  navigateToSubdomain: (subdomainId: string) => void;
  openInSidebar: (entityId: string) => void;
  
  // Framework services
  search: {
    query: (searchQuery: string, filters?: SearchFilters) => Promise<SearchResult[]>;
    index: (entityId: string, content: string) => Promise<void>;
  };
  
  relationships: {
    get: (entityId: string) => Promise<Relationship[]>;
    create: (fromId: string, toId: string, type: string, properties?: Record<string, any>) => Promise<void>;
    delete: (fromId: string, toId: string, type: string) => Promise<void>;
    suggest: (entityId: string) => Promise<RelationshipSuggestion[]>;
  };
  
  sync: {
    upload: (entity: any) => Promise<void>;
    download: (since: Date) => Promise<SyncChange[]>;
    getStatus: () => SyncStatus;
  };
  
  // UI utilities
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  showModal: (component: React.ComponentType, props?: Record<string, any>) => Promise<any>;
  showContextMenu: (items: ContextMenuItem[]) => Promise<string | null>;
  
  // User context
  getCurrentUser: () => User;
  getPreferences: () => UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Events (pub/sub)
  on: (event: string, handler: (data: any) => void) => () => void; // Returns unsubscribe function
  emit: (event: string, data: any) => void;
}
```

**Usage in Subdomain Components:**

```typescript
// subdomains/financial/dashboard.tsx
import { useFramework } from '@framework/hooks';

function FinancialDashboard() {
  const framework = useFramework();
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    loadTransactions();
    
    // Subscribe to transaction changes
    const unsubscribe = framework.on('transaction:created', (transaction) => {
      setTransactions(prev => [transaction, ...prev]);
    });
    
    return unsubscribe;
  }, []);
  
  async function loadTransactions() {
    const results = await framework.neo4j.query(`
      MATCH (u:User)-[:OWNS]->(a:Account)<-[:PAID_WITH]-(t:Transaction)
      WHERE u.id = $userId
      ORDER BY t.date DESC
      LIMIT 50
    `, { userId: framework.getCurrentUser().id });
    
    setTransactions(results);
  }
  
  async function handleTransactionClick(transactionId: string) {
    // Navigate to transaction detail
    framework.navigateToEntity(transactionId, 'Transaction');
    
    // Or open in sidebar
    framework.openInSidebar(transactionId);
  }
  
  return (
    <div>
      {/* Dashboard UI */}
    </div>
  );
}
```

### 6.5.3 Lifecycle Hooks

**Hook Execution Flow:**

```
Application Start
  └─> Call onLoad() for each subdomain (parallel)
      └─> Subdomain initializes services, caches

User Navigates to Subdomain
  └─> Call onActivate(context)
      └─> Subdomain refreshes data, updates UI state

User Navigates Away
  └─> Call onDeactivate()
      └─> Subdomain cleans up, saves state

Relationship Created
  └─> Call onRelationshipCreated(relationship) for relevant subdomain
      └─> Subdomain updates internal state, triggers re-render

Global Search Triggered
  └─> Call onSearch(query, filters) for each subdomain (parallel)
      └─> Each subdomain returns matching entities
```

**Example Lifecycle Implementation:**

```typescript
// subdomains/health/index.ts
export default {
  // ... other config
  
  onLoad: async (framework: FrameworkAPI) => {
    // Initialize health sync service
    healthSyncService.initialize(framework);
    
    // Pre-load common data (categories, templates)
    await preloadHealthData();
    
    // Subscribe to relevant events
    framework.on('health:workout:created', handleWorkoutCreated);
    framework.on('health:meal:created', handleMealCreated);
    
    console.log('✓ Health subdomain loaded');
  },
  
  onActivate: async (context: ActivationContext) => {
    const { userId, previousSubdomain } = context;
    
    // Refresh health data if coming from another subdomain
    if (previousSubdomain !== 'health') {
      await refreshHealthDashboard(userId);
    }
    
    // Check for pending reminders
    const reminders = await getPendingHealthReminders(userId);
    if (reminders.length > 0) {
      framework.showToast(`You have ${reminders.length} health reminders`, 'info');
    }
  },
  
  onDeactivate: async () => {
    // Save any unsaved state
    await saveHealthDashboardState();
    
    // Clean up heavy resources
    clearHealthChartCache();
  },
  
  onRelationshipCreated: async (relationship: Relationship) => {
    // If a transaction is linked to a health event
    if (relationship.fromType === 'Transaction' && relationship.toType === 'HealthEvent') {
      // Update health event to show related cost
      await updateHealthEventCost(relationship.toId);
      
      // Emit event for UI update
      framework.emit('health:event:updated', { id: relationship.toId });
    }
  },
  
  onSearch: async (query: string, filters: SearchFilters) => {
    // Search meals
    const meals = await searchMeals(query, filters);
    
    // Search workouts
    const workouts = await searchWorkouts(query, filters);
    
    // Search health events
    const events = await searchHealthEvents(query, filters);
    
    return [...meals, ...workouts, ...events];
  }
};
```

### 6.5.4 Data Isolation vs. Sharing

**Isolated (Private to Subdomain):**

```typescript
// Each subdomain has its own MongoDB collections
// financial_transactions, health_meals, schedule_tasks

// Private state management
const financialStore = create((set) => ({
  transactions: [],
  accounts: [],
  // ... private state
}));

// Private utility functions
function calculateBudgetProgress(budget: Budget) {
  // Implementation hidden from other subdomains
}
```

**Shared (Available to All Subdomains):**

```cypher
// All data participates in Neo4j graph with proper labels
(:Transaction:FinancialEntity)
(:Workout:HealthEntity)
(:Task:ScheduleEntity)

// Common entities used across subdomains
(:Person) - Referenced by any subdomain
(:Location) - Referenced by any subdomain
(:Topic) - Used for tagging by any subdomain
(:Date) - Used for temporal anchoring by any subdomain

// Cross-domain relationships
(:Transaction)-[:RELATED_TO]->(:HealthEvent)
(:Task)-[:RELATED_TO]->(:Workout)
```

**Framework-Provided Services (Shared):**

```typescript
// All subdomains access these through FrameworkAPI
- Authentication & Authorization
- Search (cross-subdomain)
- Relationship Discovery
- Sync Service
- Notification Service
- File Storage
- Analytics/Telemetry
```

**Best Practices:**

1. **Store detailed data in MongoDB (isolated)**: Full transaction details, meal nutritional info, task descriptions
2. **Store relationships in Neo4j (shared)**: Entity connections, cross-domain links
3. **Emit events for cross-subdomain awareness**: When creating/updating entities, emit events that other subdomains can subscribe to
4. **Use FrameworkAPI for cross-subdomain operations**: Don't directly access other subdomains' MongoDB collections

---

# 7. Platform-Specific Implementation Guides

## 7.1 Desktop Application

### 7.1.1 Recommended Project Structure

```
/desktop-app
  /src
    /main                       # Electron main process
      - main.ts                 # Entry point
      - preload.ts              # Context bridge
      - ipc-handlers.ts         # IPC communication handlers
      - menu.ts                 # Application menu
      - shortcuts.ts            # Global keyboard shortcuts
      - tray.ts                 # System tray icon
      - updater.ts              # Auto-update logic
      
    /renderer                   # React application
      /app                      # Next.js-style app directory
        - layout.tsx
        - page.tsx
        
      /components               # Shared UI components
        /ui                     # Base components (Button, Input, etc.)
        /layout                 # Layout components (Header, Sidebar, etc.)
        /common                 # Common patterns (ErrorBoundary, Loading, etc.)
        
      /framework                # Core framework components
        - carousel.tsx          # Subdomain carousel
        - relationship-sidebar.tsx
        - search-bar.tsx
        - quick-capture-modal.tsx
        - graph-explorer.tsx
        
      /subdomains               # Subdomain implementations
        /financial
          - index.ts            # Registration
          - dashboard.tsx       # Main dashboard
          /components           # Subdomain-specific components
          /hooks                # Subdomain-specific hooks
          /utils                # Subdomain-specific utilities
        /health
        /schedule
        
      /hooks                    # Shared React hooks
        - useFramework.ts
        - useNeo4j.ts
        - useSync.ts
        
      /services                 # Service layer
        - neo4j.service.ts
        - mongodb.service.ts
        - sync.service.ts
        - auth.service.ts
        
      /store                    # State management (Zustand)
        - user-store.ts
        - ui-store.ts
        - sync-store.ts
        
      /utils                    # Utility functions
        - date.ts
        - currency.ts
        - validation.ts
        
      /types                    # TypeScript types
        - entities.ts
        - api.ts
        - framework.ts
        
    /shared                     # Shared between main and renderer
      /constants
      /types
      
  /resources                    # Application resources
    - icon.png
    - icon.icns (Mac)
    - icon.ico (Windows)
    
  /scripts                      # Build scripts
    - build.js
    - notarize.js (Mac)
    
  - electron-builder.yml        # Electron Builder config
  - package.json
  - tsconfig.json
```

### 7.1.2 Key Dependencies

```json
{
  "name": "personal-dashboard",
  "version": "1.0.0",
  "main": "dist/main/main.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:electron\"",
    "dev:renderer": "vite",
    "dev:electron": "tsc && electron .",
    "build": "npm run build:renderer && npm run build:electron",
    "build:renderer": "vite build",
    "build:electron": "tsc",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "package:linux": "electron-builder --linux"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "electron-store": "^8.1.0",
    "neo4j-driver": "^5.14.0",
    "mongodb": "^6.3.0",
    "@tanstack/react-query": "^5.8.0",
    "zustand": "^4.4.7",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.4",
    "lucide-react": "^0.294.0",
    "framer-motion": "^10.16.4",
    "react-hook-form": "^7.48.2"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.5",
    "concurrently": "^8.2.2"
  }
}
```

### 7.1.3 Neo4j Connection Management

```typescript
// services/neo4j.service.ts
import neo4j, { Driver, Session } from 'neo4j-driver';

class Neo4jService {
  private driver: Driver | null = null;
  private connectionPromise: Promise<Driver> | null = null;
  
  async connect(uri: string, username: string, password: string): Promise<Driver> {
    if (this.driver) {
      return this.driver;
    }
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.connectionPromise = (async () => {
      try {
        this.driver = neo4j.driver(
          uri,
          neo4j.auth.basic(username, password),
          {
            maxConnectionLifetime: 3600000, // 1 hour
            maxConnectionPoolSize: 50,
            connectionAcquisitionTimeout: 60000, // 1 min
            disableLosslessIntegers: true // Return numbers as JS numbers
          }
        );
        
        // Verify connectivity
        await this.driver.verifyConnectivity();
        console.log('✓ Connected to Neo4j');
        
        return this.driver;
      } catch (error) {
        this.driver = null;
        this.connectionPromise = null;
        console.error('✗ Neo4j connection failed:', error);
        throw error;
      }
    })();
    
    return this.connectionPromise;
  }
  
  session(database?: string): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not connected');
    }
    return this.driver.session({ database });
  }
  
  async query<T = any>(cypher: string, params: Record<string, any> = {}): Promise<T[]> {
    const session = this.session();
    try {
      const result = await session.run(cypher, params);
      return result.records.map(record => record.toObject() as T);
    } finally {
      await session.close();
    }
  }
  
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      this.connectionPromise = null;
      console.log('✓ Neo4j connection closed');
    }
  }
}

export const neo4jService = new Neo4jService();
```

### 7.1.4 Local Data Caching Strategy

```typescript
// services/cache.service.ts
import ElectronStore from 'electron-store';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private store: ElectronStore;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  
  constructor() {
    this.store = new ElectronStore({
      name: 'cache',
      encryptionKey: 'your-encryption-key' // In production, generate per-user
    });
  }
  
  // Memory cache (fast, cleared on app restart)
  setMemory<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const now = Date.now();
    this.memoryCache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttlSeconds * 1000)
    });
  }
  
  getMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  // Persistent cache (survives app restart)
  setPersistent<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttlSeconds * 1000)
    });
  }
  
  getPersistent<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  // Clear all caches
  clearAll(): void {
    this.memoryCache.clear();
    this.store.clear();
  }
  
  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    
    // Memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
    
    // Persistent cache
    const allKeys = Object.keys(this.store.store);
    for (const key of allKeys) {
      const entry = this.store.get(key) as CacheEntry<any>;
      if (entry && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();

// Run cleanup every hour
setInterval(() => cacheService.cleanup(), 3600000);
```

**Usage in Components:**

```typescript
// hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { cacheService } from '@/services/cache.service';
import { neo4jService } from '@/services/neo4j.service';

export function useTransactions(userId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['transactions', userId, startDate, endDate],
    queryFn: async () => {
      // Check cache first
      const cacheKey = `transactions:${userId}:${startDate}:${endDate}`;
      const cached = cacheService.getMemory(cacheKey);
      if (cached) return cached;
      
      // Fetch from Neo4j
      const transactions = await neo4jService.query(`
        MATCH (u:User {id: $userId})-[:OWNS]->(a:Account)<-[:PAID_WITH]-(t:Transaction)
        WHERE t.date >= date($startDate) AND t.date <= date($endDate)
        RETURN t
        ORDER BY t.date DESC
      `, { userId, startDate, endDate });
      
      // Cache for 5 minutes
      cacheService.setMemory(cacheKey, transactions, 300);
      
      return transactions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
}
```

### 7.1.5 Background Sync Implementation

```typescript
// services/sync.service.ts
import { EventEmitter } from 'events';

interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  pendingChanges: number;
  error: string | null;
}

class SyncService extends EventEmitter {
  private status: SyncStatus = {
    status: 'idle',
    lastSyncTime: null,
    pendingChanges: 0,
    error: null
  };
  
  private syncInterval: NodeJS.Timeout | null = null;
  private pendingQueue: SyncOperation[] = [];
  
  start(intervalMs: number = 60000) {
    // Sync every minute by default
    this.syncInterval = setInterval(() => this.sync(), intervalMs);
    
    // Initial sync
    this.sync();
  }
  
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  async sync(): Promise<void> {
    if (this.status.status === 'syncing') {
      console.log('Sync already in progress, skipping...');
      return;
    }
    
    this.updateStatus({ status: 'syncing', error: null });
    this.emit('sync:start');
    
    try {
      // 1. Upload pending changes
      if (this.pendingQueue.length > 0) {
        await this.uploadPendingChanges();
      }
      
      // 2. Download remote changes
      const lastSync = this.status.lastSyncTime;
      const changes = await this.downloadChanges(lastSync);
      
      // 3. Apply changes locally
      await this.applyChanges(changes);
      
      // 4. Update status
      this.updateStatus({
        status: 'idle',
        lastSyncTime: new Date(),
        pendingChanges: 0,
        error: null
      });
      
      this.emit('sync:complete', { changesCount: changes.length });
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.updateStatus({
        status: 'error',
        error: error.message
      });
      this.emit('sync:error', error);
    }
  }
  
  queueChange(operation: SyncOperation): void {
    this.pendingQueue.push(operation);
    this.updateStatus({ pendingChanges: this.pendingQueue.length });
    
    // Trigger immediate sync if queue is large
    if (this.pendingQueue.length >= 10) {
      this.sync();
    }
  }
  
  private async uploadPendingChanges(): Promise<void> {
    const batch = [...this.pendingQueue];
    this.pendingQueue = [];
    
    // Upload to backend
    await fetch('http://localhost:3000/api/sync/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: batch })
    });
  }
  
  private async downloadChanges(since: Date | null): Promise<SyncChange[]> {
    const params = since ? `?since=${since.toISOString()}` : '';
    const response = await fetch(`http://localhost:3000/api/sync/changes${params}`);
    const data = await response.json();
    return data.changes;
  }
  
  private async applyChanges(changes: SyncChange[]): Promise<void> {
    for (const change of changes) {
      try {
        switch (change.operation) {
          case 'CREATE':
            await this.applyCreate(change);
            break;
          case 'UPDATE':
            await this.applyUpdate(change);
            break;
          case 'DELETE':
            await this.applyDelete(change);
            break;
        }
      } catch (error) {
        console.error(`Failed to apply change ${change.id}:`, error);
        // Continue with other changes
      }
    }
  }
  
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...updates };
    this.emit('status:changed', this.status);
  }
  
  getStatus(): SyncStatus {
    return { ...this.status };
  }
}

export const syncService = new SyncService();
```

**Integration in Main Process:**

```typescript
// main/main.ts
import { app, BrowserWindow } from 'electron';
import { syncService } from '../services/sync.service';

app.whenReady().then(() => {
  createWindow();
  
  // Start background sync
  syncService.start(60000); // Every 60 seconds
  
  // Listen to sync events
  syncService.on('sync:complete', ({ changesCount }) => {
    console.log(`✓ Sync complete: ${changesCount} changes`);
    
    // Notify renderer
    mainWindow?.webContents.send('sync:complete', { changesCount });
  });
  
  syncService.on('sync:error', (error) => {
    console.error('✗ Sync error:', error);
    mainWindow?.webContents.send('sync:error', { error: error.message });
  });
});

app.on('before-quit', () => {
  // Stop sync before quitting
  syncService.stop();
});
```

## 7.2 Progressive Web App

### 7.2.1 Project Structure

```
/pwa
  /app                          # Next.js 14 App Router
    /(dashboard)                # Route group
      /financial
        - page.tsx
      /health
        - page.tsx
      /schedule
        - page.tsx
      - layout.tsx
      - page.tsx                # Main dashboard/carousel
      
    /api                        # API routes (if self-hosting)
      /auth
      /sync
      
    - layout.tsx                # Root layout
    - globals.css
    
  /components
    /ui
    /framework
    /subdomains
    
  /lib                          # Utilities and services
    - neo4j.ts
    - mongodb.ts
    - idb.ts                    # IndexedDB wrapper
    
  /public
    - manifest.json
    - service-worker.js
    /icons
      - icon-192.png
      - icon-512.png
      
  - next.config.js
  - tailwind.config.js
  - package.json
```

### 7.2.2 Responsive Design Breakpoints

```css
/* Mobile First Approach */

/* Base styles: 320px - 640px (Mobile) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}

.summary-card {
  padding: 16px;
  font-size: 14px;
}

/* Tablet: 641px - 1024px */
@media (min-width: 641px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 24px;
  }
  
  .summary-card {
    padding: 20px;
    font-size: 16px;
  }
  
  /* Show relationship sidebar on tablet */
  .relationship-sidebar {
    display: block;
    width: 280px;
  }
}

/* Desktop: 1025px+ */
@media (min-width: 1025px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    padding: 32px;
  }
  
  .summary-card {
    padding: 24px;
    font-size: 16px;
  }
  
  /* Full relationship sidebar on desktop */
  .relationship-sidebar {
    width: 320px;
  }
  
  /* Enable hover states on desktop */
  .interactive-element:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .main-content {
    max-width: 1600px;
    margin: 0 auto;
  }
}
```

### 7.2.3 Offline-First Architecture

**Service Worker Setup:**

```javascript
// public/service-worker.js
const CACHE_NAME = 'personal-dashboard-v1';
const API_CACHE_NAME = 'api-cache-v1';

// Files to cache on install
const STATIC_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API requests: Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request)
            .then(cached => {
              if (cached) {
                // Add header to indicate stale data
                const headers = new Headers(cached.headers);
                headers.append('X-From-Cache', 'true');
                return new Response(cached.body, {
                  status: cached.status,
                  statusText: cached.statusText,
                  headers
                });
              }
              // No cache, return offline page
              return caches.match('/offline');
            });
        })
    );
  }
  
  // Static assets: Cache first
  else {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request))
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Get pending changes from IndexedDB
  const db = await openDB();
  const pending = await db.getAll('sync-queue');
  
  if (pending.length === 0) return;
  
  try {
    // Upload to server
    const response = await fetch('/api/sync/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: pending })
    });
    
    if (response.ok) {
      // Clear synced items
      const tx = db.transaction('sync-queue', 'readwrite');
      for (const item of pending) {
        await tx.store.delete(item.id);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
```

### 7.2.4 Service Worker Registration

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => console.log('✓ Service Worker registered', reg.scope))
        .catch(err => console.error('✗ Service Worker registration failed', err));
      
      // Listen for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
        // Optionally reload the page
        window.location.reload();
      });
    }
    
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-data');
      });
    }
  }, []);
  
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 7.2.5 IndexedDB Implementation

```typescript
// lib/idb.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DashboardDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-date': string; 'by-user': string };
  };
  workouts: {
    key: string;
    value: Workout;
    indexes: { 'by-date': string };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string; 'by-due-date': string };
  };
  'sync-queue': {
    key: number;
    value: SyncOperation;
    indexes: { 'by-timestamp': number };
  };
  'sync-metadata': {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<DashboardDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<DashboardDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DashboardDB>('personal-dashboard', 1, {
      upgrade(db) {
        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('by-date', 'date');
          transactionStore.createIndex('by-user', 'userId');
        }
        
        // Workouts store
        if (!db.objectStoreNames.contains('workouts')) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
          workoutStore.createIndex('by-date', 'date');
        }
        
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-status', 'status');
          taskStore.createIndex('by-due-date', 'dueDate');
        }
        
        // Sync queue
        if (!db.objectStoreNames.contains('sync-queue')) {
          const syncStore = db.createObjectStore('sync-queue', { 
            keyPath: 'tempId', 
            autoIncrement: true 
          });
          syncStore.createIndex('by-timestamp', 'timestamp');
        }
        
        // Sync metadata
        if (!db.objectStoreNames.contains('sync-metadata')) {
          db.createObjectStore('sync-metadata', { keyPath: 'key' });
        }
      }
    });
  }
  
  return dbPromise;
}

// Helper functions for common operations
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', transaction);
}

export async function getTransactions(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
  const db = await getDB();
  const all = await db.getAll('transactions');
  return all.filter(t => 
    t.userId === userId && 
    t.date >= startDate && 
    t.date <= endDate
  );
}

export async function queueForSync(operation: SyncOperation): Promise<void> {
  const db = await getDB();
  await db.add('sync-queue', {
    ...operation,
    timestamp: Date.now()
  });
  
  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-data');
  }
}

export async function getLastSyncTime(): Promise<Date | null> {
  const db = await getDB();
  const metadata = await db.get('sync-metadata', 'lastSyncTime');
  return metadata ? new Date(metadata.value) : null;
}

export async function setLastSyncTime(time: Date): Promise<void> {
  const db = await getDB();
  await db.put('sync-metadata', { key: 'lastSyncTime', value: time.toISOString() });
}
```

### 7.2.6 App Manifest Configuration

```json
// public/manifest.json
{
  "name": "Personal Dashboards",
  "short_name": "Dashboard",
  "description": "Personal Knowledge Management powered by Dynamic Knowledge Graphs",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#10b981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "application/pdf"]
        }
      ]
    }
  },
  "shortcuts": [
    {
      "name": "Financial Dashboard",
      "short_name": "Financial",
      "description": "View financial dashboard",
      "url": "/financial",
      "icons": [{ "src": "/icons/shortcut-financial.png", "sizes": "96x96" }]
    },
    {
      "name": "Health Dashboard",
      "short_name": "Health",
      "description": "View health dashboard",
      "url": "/health",
      "icons": [{ "src": "/icons/shortcut-health.png", "sizes": "96x96" }]
    },
    {
      "name": "Quick Capture",
      "short_name": "Capture",
      "description": "Quick capture data",
      "url": "/quick-capture",
      "icons": [{ "src": "/icons/shortcut-capture.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["productivity", "lifestyle", "finance", "health"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png"
    }
  ]
}
```

### 7.2.7 Performance Optimization Strategies

**Code Splitting:**

```typescript
// app/(dashboard)/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy subdomain components
const FinancialDashboard = dynamic(() => import('@/components/subdomains/financial/dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false // Don't server-render if not needed
});

const HealthDashboard = dynamic(() => import('@/components/subdomains/health/dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const ScheduleDashboard = dynamic(() => import('@/components/subdomains/schedule/dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

export default function CarouselPage() {
  const [activeSubdomain, setActiveSubdomain] = useState('financial');
  
  return (
    <Carousel active={activeSubdomain} onChange={setActiveSubdomain}>
      {activeSubdomain === 'financial' && <FinancialDashboard />}
      {activeSubdomain === 'health' && <HealthDashboard />}
      {activeSubdomain === 'schedule' && <ScheduleDashboard />}
    </Carousel>
  );
}
```

**Virtual Scrolling for Large Lists:**

```typescript
// components/transaction-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each row
    overscan: 5 // Render 5 extra items above/below viewport
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <TransactionRow transaction={transactions[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Debounced Search:**

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in search component
function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: results } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchAPI(debouncedQuery),
    enabled: debouncedQuery.length > 2
  });
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Image Optimization:**

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/icons/icon-192.png"
  alt="Dashboard"
  width={192}
  height={192}
  priority // For above-the-fold images
  placeholder="blur" // For better UX
/>
```

## 7.3 Echo Show Skill

### 7.3.1 Alexa Skills Kit Setup (Step-by-Step for Beginner)

**Prerequisites:**
1. Amazon Developer Account (free) - https://developer.amazon.com
2. AWS Account (free tier sufficient for Phase 1) - https://aws.amazon.com
3. Node.js installed locally

**Step 1: Create Alexa Skill**

1. Go to https://developer.amazon.com/alexa/console/ask
2. Click "Create Skill"
3. Skill name: "Personal Dashboard"
4. Primary locale: English (US)
5. Choose model: Custom
6. Hosting: Provision your own
7. Click "Create skill"

**Step 2: Configure Interaction Model**

In the Alexa Developer Console, go to Build tab:

1. **Invocation Name:** "personal dashboard"
2. **Intents:** Click "Add Intent" for each:

```json
// ViewDashboardIntent
{
  "name": "ViewDashboardIntent",
  "slots": [
    {
      "name": "subdomain",
      "type": "SUBDOMAIN_TYPE"
    }
  ],
  "samples": [
    "show my {subdomain}",
    "open {subdomain} dashboard",
    "show my {subdomain} dashboard",
    "what's my {subdomain} looking like",
    "open {subdomain}"
  ]
}

// LogExpenseIntent
{
  "name": "LogExpenseIntent",
  "slots": [
    {
      "name": "amount",
      "type": "AMAZON.NUMBER"
    },
    {
      "name": "description",
      "type": "AMAZON.SearchQuery"
    }
  ],
  "samples": [
    "log an expense",
    "I spent {amount} dollars on {description}",
    "log expense {amount} for {description}",
    "add expense {amount} {description}",
    "I bought {description} for {amount} dollars"
  ]
}

// DailySummaryIntent
{
  "name": "DailySummaryIntent",
  "samples": [
    "show my day",
    "what's on my schedule today",
    "what do I have today",
    "show today's summary",
    "give me a summary"
  ]
}
```

3. **Slot Types:** Create custom slot type "SUBDOMAIN_TYPE"

```json
{
  "name": "SUBDOMAIN_TYPE",
  "values": [
    {
      "id": "financial",
      "name": {
        "value": "financial",
        "synonyms": ["finance", "money", "budget", "spending"]
      }
    },
    {
      "id": "health",
      "name": {
        "value": "health",
        "synonyms": ["fitness", "workout", "exercise", "wellness"]
      }
    },
    {
      "id": "schedule",
      "name": {
        "value": "schedule",
        "synonyms": ["calendar", "tasks", "appointments", "agenda"]
      }
    }
  ]
}
```

4. Click "Save Model" then "Build Model" (takes ~1 minute)

**Step 3: Set Up AWS Lambda Function**

1. Go to AWS Lambda console (https://console.aws.amazon.com/lambda)
2. Click "Create function"
3. Function name: "PersonalDashboardSkill"
4. Runtime: Node.js 18.x
5. Click "Create function"

6. Add Alexa Skills Kit trigger:
   - Click "Add trigger"
   - Select "Alexa Skills Kit"
   - Skill ID: Copy from Alexa Developer Console (Endpoint tab)
   - Click "Add"

7. Upload skill code (see section 7.3.2 for code)

8. Copy Lambda ARN (e.g., `arn:aws:lambda:us-east-1:123456789012:function:PersonalDashboardSkill`)

**Step 4: Connect Lambda to Skill**

1. Return to Alexa Developer Console
2. Go to Endpoint tab
3. Select "AWS Lambda ARN"
4. Paste Lambda ARN in "Default Region" field
5. Click "Save Endpoints"

**Step 5: Enable Account Linking**

1. Go to Account Linking tab
2. Enable "Do you allow users to create an account or link to an existing account?"
3. Authorization URI: `https://your-backend.com/auth/alexa/authorize`
4. Access Token URI: `https://your-backend.com/auth/alexa/token`
5. Client ID: Generate a secure random string
6. Client Secret: Generate a secure random string
7. Authentication Scheme: HTTP Basic
8. Scope: `read:dashboard write:data`
9. Click "Save"

**Step 6: Test Your Skill**

1. Go to Test tab
2. Enable testing: "Development"
3. Type or speak: "open personal dashboard"
4. Expected response: "Welcome to Personal Dashboard. Would you like to see your financial, health, or schedule dashboard?"

### 7.3.2 Lambda Function Implementation

```javascript
// lambda/index.js
const Alexa = require('ask-sdk-core');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://your-backend.com/api';

// LaunchRequest Handler
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Personal Dashboard. You can ask me to show your financial, health, or schedule dashboard, or say "show my day" for a summary.';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('What would you like to see?')
      .getResponse();
  }
};

// ViewDashboardIntent Handler
const ViewDashboardIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViewDashboardIntent';
  },
  async handle(handlerInput) {
    const subdomain = Alexa.getSlotValue(handlerInput.requestEnvelope, 'subdomain');
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    
    if (!accessToken) {
      return handlerInput.responseBuilder
        .speak('Please link your account in the Alexa app to use Personal Dashboard.')
        .withLinkAccountCard()
        .getResponse();
    }
    
    try {
      // Fetch dashboard data from your API
      const response = await axios.get(`${API_BASE_URL}/alexa/summary`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { subdomain }
      });
      
      const data = response.data;
      const speakOutput = generateSpeechResponse(subdomain, data);
      const aplDocument = generateAPLDocument(subdomain, data);
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: aplDocument,
          datasources: {
            dashboardData: data
          }
        })
        .getResponse();
        
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return handlerInput.responseBuilder
        .speak('Sorry, I had trouble fetching your dashboard. Please try again later.')
        .getResponse();
    }
  }
};

// LogExpenseIntent Handler
const LogExpenseIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LogExpenseIntent';
  },
  async handle(handlerInput) {
    const amount = Alexa.getSlotValue(handlerInput.requestEnvelope, 'amount');
    const description = Alexa.getSlotValue(handlerInput.requestEnvelope, 'description');
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    
    if (!accessToken) {
      return handlerInput.responseBuilder
        .speak('Please link your account in the Alexa app.')
        .withLinkAccountCard()
        .getResponse();
    }
    
    try {
      await axios.post(`${API_BASE_URL}/alexa/quick-capture`, {
        subdomain: 'financial',
        type: 'expense',
        data: {
          amount: -Math.abs(parseFloat(amount)),
          description: description || 'Voice entry',
          date: new Date().toISOString().split('T')[0]
        }
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const speakOutput = `Okay, I've logged an expense of ${amount} for ${description}.`;
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
        
    } catch (error) {
      console.error('Error logging expense:', error);
      return handlerInput.responseBuilder
        .speak('Sorry, I couldn\'t log that expense. Please try again.')
        .getResponse();
    }
  }
};

// DailySummaryIntent Handler
const DailySummaryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DailySummaryIntent';
  },
  async handle(handlerInput) {
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    
    if (!accessToken) {
      return handlerInput.responseBuilder
        .speak('Please link your account in the Alexa app.')
        .withLinkAccountCard()
        .getResponse();
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/alexa/daily-summary`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const data = response.data;
      
      let speakOutput = 'Here\'s your summary for today. ';
      
      if (data.events && data.events.length > 0) {
        speakOutput += `You have ${data.events.length} events: `;
        data.events.slice(0, 3).forEach(event => {
          speakOutput += `${event.title} at ${event.time}. `;
        });
      }
      
      if (data.tasks && data.tasks.length > 0) {
        speakOutput += `You have ${data.tasks.length} tasks due today. `;
      }
      
      if (data.budget) {
        speakOutput += `You've used ${data.budget.percentUsed}% of your monthly budget. `;
      }
      
      const aplDocument = generateDailySummaryAPL(data);
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: aplDocument,
          datasources: { summaryData: data }
        })
        .getResponse();
        
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      return handlerInput.responseBuilder
        .speak('Sorry, I had trouble getting your daily summary.')
        .getResponse();
    }
  }
};

// Helper: Generate speech response
function generateSpeechResponse(subdomain, data) {
  if (subdomain === 'financial' || subdomain === 'finance' || subdomain === 'money') {
    return `Here's your financial summary. This month you've spent ${data.spending} and you're at ${data.budgetPercent}% of your budget. Your total balance across all accounts is ${data.totalBalance}.`;
  }
  else if (subdomain === 'health' || subdomain === 'fitness') {
    return `Here's your health summary. You've completed ${data.workoutsThisWeek} workouts this week. Your average daily calories are ${data.avgCalories}. Your current weight is ${data.currentWeight} pounds.`;
  }
  else if (subdomain === 'schedule' || subdomain === 'calendar') {
    const eventCount = data.todayEvents || 0;
    const taskCount = data.todayTasks || 0;
    return `Here's your schedule. You have ${eventCount} events and ${taskCount} tasks today.`;
  }
  
  return 'I couldn\'t find data for that dashboard.';
}

// Helper: Generate APL document
function generateAPLDocument(subdomain, data) {
  return {
    "type": "APL",
    "version": "2023.3",
    "mainTemplate": {
      "parameters": ["dashboardData"],
      "items": [
        {
          "type": "Container",
          "width": "100vw",
          "height": "100vh",
          "direction": "column",
          "alignItems": "center",
          "justifyContent": "start",
          "paddingTop": "40dp",
          "items": [
            {
              "type": "Text",
              "text": `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Dashboard`,
              "fontSize": "48dp",
              "fontWeight": "bold",
              "color": "#FFFFFF"
            },
            {
              "type": "Container",
              "direction": "row",
              "marginTop": "40dp",
              "spacing": "30dp",
              "items": generateAPLCards(subdomain, data)
            }
          ]
        }
      ]
    }
  };
}

function generateAPLCards(subdomain, data) {
  if (subdomain === 'financial' || subdomain === 'finance') {
    return [
      {
        "type": "Container",
        "width": "300dp",
        "height": "200dp",
        "backgroundColor": "#10b981",
        "borderRadius": "20dp",
        "padding": "20dp",
        "direction": "column",
        "items": [
          {
            "type": "Text",
            "text": "This Month",
            "fontSize": "24dp",
            "color": "#FFFFFF"
          },
          {
            "type": "Text",
            "text": `${data.spending}`,
            "fontSize": "48dp",
            "fontWeight": "bold",
            "color": "#FFFFFF",
            "marginTop": "10dp"
          },
          {
            "type": "Text",
            "text": `${data.budgetPercent}% of budget`,
            "fontSize": "20dp",
            "color": "#FFFFFF",
            "marginTop": "10dp"
          }
        ]
      },
      {
        "type": "Container",
        "width": "300dp",
        "height": "200dp",
        "backgroundColor": "#3b82f6",
        "borderRadius": "20dp",
        "padding": "20dp",
        "direction": "column",
        "items": [
          {
            "type": "Text",
            "text": "Total Balance",
            "fontSize": "24dp",
            "color": "#FFFFFF"
          },
          {
            "type": "Text",
            "text": `${data.totalBalance}`,
            "fontSize": "48dp",
            "fontWeight": "bold",
            "color": "#FFFFFF",
            "marginTop": "10dp"
          }
        ]
      }
    ];
  }
  
  // Similar for health and schedule...
  return [];
}

function generateDailySummaryAPL(data) {
  return {
    "type": "APL",
    "version": "2023.3",
    "mainTemplate": {
      "items": [
        {
          "type": "Container",
          "width": "100vw",
          "height": "100vh",
          "direction": "column",
          "paddingTop": "40dp",
          "paddingLeft": "40dp",
          "items": [
            {
              "type": "Text",
              "text": "Today's Summary",
              "fontSize": "48dp",
              "fontWeight": "bold"
            },
            {
              "type": "Text",
              "text": `${data.events?.length || 0} Events • ${data.tasks?.length || 0} Tasks`,
              "fontSize": "24dp",
              "marginTop": "20dp"
            }
          ]
        }
      ]
    }
  };
}

// Error Handler
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.message}`);
    
    return handlerInput.responseBuilder
      .speak('Sorry, I had trouble understanding that. Please try again.')
      .reprompt('What would you like to do?')
      .getResponse();
  }
};

// Export handler
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ViewDashboardIntentHandler,
    LogExpenseIntentHandler,
    DailySummaryIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

### 7.3.3 Testing and Debugging

**Local Testing with ASK CLI:**

```bash
# Install ASK CLI
npm install -g ask-cli

# Configure with your Amazon developer credentials
ask configure

# Test utterances locally
ask dialog --locale en-US

> open personal dashboard
> show my financial dashboard
> log an expense for fifty dollars on groceries
```

**CloudWatch Logs:**

All Lambda function console.log() statements appear in CloudWatch:

1. Go to AWS CloudWatch console
2. Navigate to Logs > Log groups
3. Find `/aws/lambda/PersonalDashboardSkill`
4. View recent log streams for debugging

**Common Issues:**

1. **"There was a problem with the requested skill's response"**
   - Check CloudWatch logs for errors
   - Verify Lambda has correct permissions
   - Ensure response JSON is valid

2. **Account linking fails**
   - Verify OAuth endpoints are publicly accessible
   - Check Client ID and Secret match
   - Test OAuth flow manually with Postman

3. **APL doesn't display on Echo Show**
   - Verify device supports APL (Echo Show 5/8/10/15)
   - Check APL document JSON syntax
   - Test in APL Authoring Tool: https://developer.amazon.com/alexa/console/ask/displays

4. **Slots not capturing correctly**
   - Add more sample utterances
   - Use built-in slot types when possible
   - Check slot values in CloudWatch logs

**Debugging Tips:**

```javascript
// Add extensive logging to Lambda function
console.log('Request envelope:', JSON.stringify(handlerInput.requestEnvelope, null, 2));
console.log('Slot values:', {
  subdomain: Alexa.getSlotValue(handlerInput.requestEnvelope, 'subdomain'),
  amount: Alexa.getSlotValue(handlerInput.requestEnvelope, 'amount')
});
console.log('Access token present:', !!handlerInput.requestEnvelope.context.System.user.accessToken);
```

### 7.3.4 Voice Interaction Design Best Practices

**Keep Responses Concise:**
- Limit voice responses to 30 seconds maximum
- Use conversational, natural language
- Avoid reading long lists (max 3 items)

**Example - Good:**
> "You have 5 events today. Your first one is Team Meeting at 10 AM."

**Example - Bad:**
> "You have 5 events today. The first event is Team Meeting at 10:00 AM in Conference Room B with John and Sarah. The second event is..."

**Provide Clear Next Steps:**

```javascript
return handlerInput.responseBuilder
  .speak('I\'ve logged your expense. Would you like to log another expense or hear your budget status?')
  .reprompt('Say "log another expense" or "budget status"')
  .getResponse();
```

**Handle Errors Gracefully:**

```javascript
catch (error) {
  if (error.response?.status === 401) {
    return handlerInput.responseBuilder
      .speak('Your session has expired. Please link your account again in the Alexa app.')
      .withLinkAccountCard()
      .getResponse();
  }
  
  // Generic error
  return handlerInput.responseBuilder
    .speak('Sorry, something went wrong. Please try again in a moment.')
    .getResponse();
}
```

---

# 8. User Interface Specifications

## 8.1 Design Principles

### 8.1.1 Core Design Philosophy

**Minimalist but Information-Dense**

The interface should present maximum useful information without visual clutter. Every element serves a purpose. White space is intentional, not accidental.

**Principles:**
- Remove all decorative elements that don't enhance understanding
- Use data visualization over tables when possible
- Progressive disclosure: show summaries, reveal details on demand
- Typography and color convey hierarchy, not borders and boxes

**Examples:**
```
❌ Bad: Transaction card with heavy border, shadow, icon, badge, 5 different font sizes
✓ Good: Transaction row with amount (bold), description, date (muted), subtle divider
```

**Relationship-First**

Neo4j relationships are the core value proposition. The UI must constantly surface connections.

**Implementation:**
- Persistent relationship sidebar (desktop)
- Inline relationship chips (mobile)
- Hover previews show related entities
- Click any entity → relationship sidebar updates
- Visual indicators when cross-domain relationships exist

**Consistent Across Platforms (Where Appropriate)**

Maintain design language consistency while respecting platform conventions.

**Consistency:**
- Color palette, typography, iconography
- Interaction patterns (swipe, click, voice)
- Data visualization styles

**Platform-Specific:**
- Desktop: Keyboard shortcuts, multi-window, hover states
- Mobile: Touch targets (44px min), swipe gestures, bottom navigation
- Echo Show: Large text (readable at 6ft), simple layouts, voice-first

**Keyboard-Accessible**

Power users should never need a mouse.

**Requirements:**
- All actions have keyboard shortcuts
- Focus indicators clearly visible
- Logical tab order
- Quick command palette (Cmd/Ctrl+K)
- Vim-like navigation option for lists (j/k)

**Dark Mode Support**

Default to system preference, allow manual override.

**Color Palette:**
```css
/* Light Mode */
--background: #FFFFFF;
--foreground: #1F2937;
--muted: #6B7280;
--border: #E5E7EB;
--accent: #10B981;

/* Dark Mode */
--background: #111827;
--foreground: #F9FAFB;
--muted: #9CA3AF;
--border: #374151;
--accent: #34D399;
```

### 8.1.2 Typography System

**Font Family:**
- Primary: Inter (system font stack fallback)
- Monospace: Jetbrains Mono (for numbers, code)

**Type Scale:**
```css
--text-xs: 0.75rem;    /* 12px - Captions, metadata */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Emphasized text */
--text-xl: 1.25rem;    /* 20px - Subheadings */
--text-2xl: 1.5rem;    /* 24px - Card titles */
--text-3xl: 1.875rem;  /* 30px - Section headers */
--text-4xl: 2.25rem;   /* 36px - Page titles */
```

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (emphasized text, labels)
- Semibold: 600 (headings, buttons)
- Bold: 700 (large numbers, critical info)

### 8.1.3 Color System

**Semantic Colors:**

```css
/* Success / Positive */
--success: #10B981;
--success-light: #D1FAE5;
--success-dark: #065F46;

/* Warning */
--warning: #F59E0B;
--warning-light: #FEF3C7;
--warning-dark: #92400E;

/* Error / Negative */
--error: #EF4444;
--error-light: #FEE2E2;
--error-dark: #991B1B;

/* Info */
--info: #3B82F6;
--info-light: #DBEAFE;
--info-dark: #1E40AF;
```

**Subdomain Colors:**

```css
/* Financial */
--financial: #10B981;      /* Green */
--financial-light: #D1FAE5;

/* Health */
--health: #F59E0B;         /* Amber */
--health-light: #FEF3C7;

/* Schedule */
--schedule: #3B82F6;       /* Blue */
--schedule-light: #DBEAFE;
```

**Usage:**
- Use subdomain colors for headers, icons, accent elements
- Use semantic colors for status indicators, alerts
- Maintain 4.5:1 contrast ratio (WCAG AA)

### 8.1.4 Spacing System

**Base Unit: 4px**

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Application:**
- Card padding: `space-6` (24px)
- Section margins: `space-8` (32px)
- Element gaps: `space-4` (16px)
- Tight spacing: `space-2` (8px)

### 8.1.5 Elevation & Shadows

```css
/* Subtle elevation for cards */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Standard cards */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
             0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Modals, popovers */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
             0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Emphasis (hover states) */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),
             0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### 8.1.6 Animation Guidelines

**Timing:**
```css
--duration-fast: 150ms;     /* Micro-interactions */
--duration-base: 200ms;     /* Standard transitions */
--duration-slow: 300ms;     /* Page transitions */

--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Use Cases:**
- Hover states: 150ms ease-out
- Page transitions: 300ms ease-in-out
- Loading states: Pulsing animation, infinite
- Success confirmations: Scale + fade, 200ms

**Reduce Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8.2 Key Screen Descriptions (Desktop)

### 8.2.1 Main Carousel Dashboard

**Purpose:** Primary navigation interface showing subdomain carousel with summary cards.

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [🔍 Search] [User Menu ▼]                       [Sync: 2 min ago] [⚙️]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ← [Financial] Health Schedule →                                         │
│     ▔▔▔▔▔▔▔▔▔                                                            │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                      │ │
│  │  Financial Dashboard                         [+ Add Transaction]   │ │
│  │                                                                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │
│  │  │ Net Worth   │  │ This Month  │  │ Budget      │                │ │
│  │  │ $80,234     │  │ -$2,456     │  │ 72%         │                │ │
│  │  │ ↑ +2.3%     │  │ 🔴 +15%     │  │ 🟢 On Track │                │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │ │
│  │                                                                      │ │
│  │  Recent Transactions                             [View All →]      │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ Oct 23  Whole Foods      -$45.67  🛒 Groceries              │ │ │
│  │  │         Related: Health meal tracking                        │ │ │
│  │  ├──────────────────────────────────────────────────────────────┤ │ │
│  │  │ Oct 23  Target          -$156.32  🏠 Home                    │ │ │
│  │  │         Related: "Home improvement" project                  │ │ │
│  │  ├──────────────────────────────────────────────────────────────┤ │ │
│  │  │ Oct 22  Paycheck       +$3,250.00  💰 Income                 │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                      │ │
│  │  Spending by Category                                               │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ Food & Dining    [█████████████════════] $850 / $1,200  71% │ │ │
│  │  │ Transportation   [██████████════════════] $340 / $400    85% │ │ │
│  │  │ Entertainment    [████════════════════  ] $120 / $300    40% │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└───────────────────────────────────────────────────────────────────────┬─┘
                                                                          │
                                                         Relationship     │
                                                         Sidebar          │
                                                         (Collapsed)      │
                                                                          │
                                                         [Click to        │
                                                          expand]         │
                                                                          │
                                                                          └─
```

**Component Hierarchy:**

```typescript
<DashboardLayout>
  <TopBar>
    <SearchBar />
    <UserMenu />
    <SyncStatus />
    <SettingsButton />
  </TopBar>
  
  <CarouselContainer>
    <CarouselNav>
      <NavButton subdomain="financial" active />
      <NavButton subdomain="health" />
      <NavButton subdomain="schedule" />
    </CarouselNav>
    
    <CarouselContent activeSubdomain="financial">
      <FinancialDashboard>
        <DashboardHeader title="Financial Dashboard">
          <QuickAction icon="plus" label="Add Transaction" />
        </DashboardHeader>
        
        <SummaryCards>
          <SummaryCard
            title="Net Worth"
            value="$80,234"
            change="+2.3%"
            trend="up"
          />
          <SummaryCard
            title="This Month"
            value="-$2,456"
            change="+15%"
            trend="up"
            status="warning"
          />
          <SummaryCard
            title="Budget"
            value="72%"
            status="success"
            label="On Track"
          />
        </SummaryCards>
        
        <Section title="Recent Transactions" action="View All →">
          <TransactionList transactions={recentTransactions}>
            {transactions.map(t => (
              <TransactionRow
                key={t.id}
                transaction={t}
                showRelationships
                onClick={() => openDetail(t.id)}
              />
            ))}
          </TransactionList>
        </Section>
        
        <Section title="Spending by Category">
          <CategoryBudgetList categories={categories}>
            {categories.map(c => (
              <CategoryProgressBar
                key={c.id}
                name={c.name}
                spent={c.spent}
                budget={c.budget}
                color={c.color}
              />
            ))}
          </CategoryBudgetList>
        </Section>
      </FinancialDashboard>
    </CarouselContent>
  </CarouselContainer>
  
  <RelationshipSidebar collapsed />
</DashboardLayout>
```

**Interactions:**

1. **Carousel Navigation:**
   - Arrow keys (←/→) to switch subdomains
   - Keyboard shortcuts: Cmd/Ctrl+1/2/3
   - Click subdomain name in nav
   - Swipe gesture (trackpad)

2. **Summary Cards:**
   - Hover: Subtle elevation
   - Click: Navigate to detailed view
   - Show trend indicators (↑↓) with color coding

3. **Transaction List:**
   - Hover row: Highlight + show action buttons
   - Click row: Open transaction detail (or sidebar)
   - Click relationship chip: Navigate to related entity
   - Right-click: Context menu (edit, delete, duplicate)

4. **Category Progress Bars:**
   - Hover: Show exact amounts tooltip
   - Click: Filter transactions by category
   - Color coding: Green (<80%), Yellow (80-100%), Red (>100%)

**Visual Details:**

- Card spacing: 32px between sections
- Transaction row height: 64px
- Summary card: 180px × 140px
- Border radius: 12px for cards
- Font sizes: Title (24px), Labels (14px), Values (32px for summary, 16px for list)
- Transaction amounts: Monospace font, bold, right-aligned

### 8.2.2 Subdomain Detail View (Financial Example)

**Purpose:** Detailed transaction list with filtering, sorting, and inline editing.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Financial > Transactions                              [🔍] [Filter ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [All Accounts ▼]  [All Categories ▼]  [Last 30 Days ▼]         │   │
│  │                                                                   │   │
│  │ [Export CSV] [Import CSV] [+ Add Transaction]                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────┬───────────────────────┬──────────┬───────────┬────────┐  │
│  │ Date ↓   │ Description           │ Category │ Account   │ Amount │  │
│  ├──────────┼───────────────────────┼──────────┼───────────┼────────┤  │
│  │ Oct 23   │ Whole Foods Market    │ Grocery  │ Chase     │-$45.67 │  │
│  │          │ 📎 Related: Meal log  │          │ Sapphire  │        │  │
│  ├──────────┼───────────────────────┼──────────┼───────────┼────────┤  │
│  │ Oct 23   │ Target                │ Home     │ Chase     │-156.32 │  │
│  │          │ 📎 Related: Project   │          │ Sapphire  │        │  │
│  ├──────────┼───────────────────────┼──────────┼───────────┼────────┤  │
│  │ Oct 22   │ Paycheck              │ Income   │ Checking  │3250.00 │  │
│  ├──────────┼───────────────────────┼──────────┼───────────┼────────┤  │
│  │ Oct 22   │ Starbucks             │ Coffee   │ Chase     │ -6.50  │  │
│  ├──────────┼───────────────────────┼──────────┼───────────┼────────┤  │
│  │ Oct 21   │ Shell Gas Station     │ Gas      │ Chase     │ -52.30 │  │
│  └──────────┴───────────────────────┴──────────┴───────────┴────────┘  │
│                                                                           │
│  Showing 1-50 of 1,247 transactions                      [1] 2 3 ... 25 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────┬───┘
                                                                        │
                                            [Relationship Sidebar]      │
                                                                        │
                                            Selected: Whole Foods txn   │
                                                                        │
                                            Related Items:              │
                                            • Meal: Groceries (Oct 23) │
                                            • Task: Weekly shop         │
                                            • Location: Whole Foods     │
                                                                        │
                                            [View Graph →]              │
                                                                        │
                                                                        └───
```

**Features:**

1. **Filter Bar:**
   - Account dropdown (multi-select)
   - Category dropdown (multi-select with color chips)
   - Date range picker
   - Amount range slider
   - Text search

2. **Table Controls:**
   - Sortable columns (click header to sort)
   - Column visibility toggle
   - Bulk selection (checkbox column)
   - Inline editing (double-click any cell)

3. **Transaction Row:**
   - Relationship indicator (📎 icon) when relationships exist
   - Color-coded amounts (red for expenses, green for income)
   - Hover: Show edit/delete icons
   - Click: Select and show relationships in sidebar
   - Double-click: Open full detail modal

4. **Pagination:**
   - Show N per page dropdown (25, 50, 100, 200)
   - Page numbers with ellipsis
   - Keyboard: n (next), p (previous)

**Responsive Behavior:**

Desktop (>1024px): Full table
Tablet (641-1024px): Hide Account column, stack relationship chips
Mobile (<640px): Switch to card-based list (see Section 8.3)

### 8.2.3 Relationship Explorer

**Purpose:** Visual graph exploration of entity relationships.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Relationship Explorer                                    [← Back] [⚙️]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         [Interactive Graph]                      │   │
│  │                                                                   │   │
│  │                  ┌─────────┐                                     │   │
│  │         ┌────────│  Task   │────────┐                           │   │
│  │         │        │ Project │        │                           │   │
│  │         │        └─────────┘        │                           │   │
│  │         │                           │                           │   │
│  │         │                           │                           │   │
│  │    ┌────▼────┐               ┌─────▼─────┐                     │   │
│  │    │ Health  │               │ Financial │ ◄─── [Selected]     │   │
│  │    │  Event  │               │   Trans   │                     │   │
│  │    └─────────┘               └───────────┘                     │   │
│  │         │                           │                           │   │
│  │         │                           │                           │   │
│  │         │        ┌─────────┐        │                           │   │
│  │         └────────│ Person  │────────┘                           │   │
│  │                  │Dr. Smith│                                    │   │
│  │                  └─────────┘                                    │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Filters                                                          │   │
│  │ ☑ Show Financial  ☑ Show Health  ☑ Show Schedule               │   │
│  │ Relationship types: [All ▼]                                     │   │
│  │ Max depth: [2 ▼]                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Selected: Financial Transaction - $30 Copay                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Date: Oct 23, 2025                                               │   │
│  │ Description: Dr. Smith - Copay                                   │   │
│  │ Amount: -$30.00                                                  │   │
│  │                                                                   │   │
│  │ Relationships (4):                                               │   │
│  │ • RELATED_TO → Health Event: Annual Physical                    │   │
│  │ • PAID_WITH → Account: Chase Sapphire                           │   │
│  │ • MENTIONS → Person: Dr. Smith                                  │   │
│  │ • PART_OF → Task: Submit medical reimbursement                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────┘
```

**Graph Visualization Library:** vis.js or D3.js

**Node Representation:**
- Different shapes per entity type (circles for transactions, squares for tasks, etc.)
- Color-coded by subdomain
- Size proportional to # of relationships
- Label shows entity name/title

**Edge Representation:**
- Line color matches relationship type
- Line thickness indicates relationship strength/confidence
- Dashed lines for auto-discovered relationships
- Solid lines for manual relationships

**Interactions:**

1. **Node Actions:**
   - Click: Select and show details in bottom panel
   - Double-click: Center graph on this node and load its relationships
   - Right-click: Context menu (navigate to entity, remove from graph)
   - Drag: Reposition node (physics simulation)

2. **Graph Controls:**
   - Zoom: Mouse wheel or pinch gesture
   - Pan: Click-drag background
   - Reset view: Button to fit all nodes
   - Physics toggle: Enable/disable force-directed layout

3. **Filters:**
   - Toggle subdomain visibility
   - Filter by relationship type
   - Adjust depth (1-3 hops from center node)
   - Date range filter

### 8.2.4 Global Search Interface

**Purpose:** Unified search across all subdomains with real-time results.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│           [🔍 Search across all subdomains...              ]             │
│                                                              Cmd+K        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

[After typing "medical"]

┌─────────────────────────────────────────────────────────────────────────┐
│           [🔍 medical                                   ▼]  [×]           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Filters: [☑ Financial] [☑ Health] [☑ Schedule] [☐ Knowledge]           │
│           [Date Range: Any ▼]                                           │
│                                                                           │
│  ─────────────────────────────────────────────────────────────────      │
│  Financial (2 results)                                                   │
│  ─────────────────────────────────────────────────────────────────      │
│                                                                           │
│  💰 Transaction: Dr. Smith - Copay                            Oct 23     │
│     $30.00 • Medical category                                            │
│     Related: Health Event, Person                                        │
│                                                                           │
│  💰 Transaction: CVS Pharmacy                                 Oct 20     │
│     $24.50 • Medical category                                            │
│     Related: Medication refill                                           │
│                                                                           │
│  ─────────────────────────────────────────────────────────────────      │
│  Health (3 results)                                                      │
│  ─────────────────────────────────────────────────────────────────      │
│                                                                           │
│  🏥 Health Event: Annual Physical                             Oct 23     │
│     Dr. Sarah Smith • City Medical Center                                │
│     Related: Transaction ($30), Task (submit reimbursement)              │
│                                                                           │
│  💊 Medication: Vitamin D3                                    Oct 15     │
│     2000 IU daily • Prescribed by Dr. Smith                              │
│                                                                           │
│  📋 Test Result: Blood Panel                                  Oct 10     │
│     All values normal                                                    │
│                                                                           │
│  ─────────────────────────────────────────────────────────────────      │
│  Schedule (1 result)                                                     │
│  ─────────────────────────────────────────────────────────────────      │
│                                                                           │
│  📅 Task: Submit medical reimbursement                        Due Oct 31 │
│     High priority • Q4 Planning project                                  │
│     Related: Transaction ($30), Health Event                             │
│                                                                           │
│  ─────────────────────────────────────────────────────────────────      │
│                                                                           │
│  6 results found                                                         │
│                                                                           │
└───────────────────────────────────────────────────────────────────────┘
```

**Features:**

1. **Search Input:**
   - Global keyboard shortcut: Cmd/Ctrl+K
   - Auto-focus when modal opens
   - Clear button (×)
   - Search as you type (debounced 300ms)

2. **Result Grouping:**
   - Group by subdomain
   - Show count per subdomain
   - Collapsible sections

3. **Result Item:**
   - Entity type icon
   - Title/description (search terms highlighted)
   - Key metadata (date, amount, status)
   - Relationship chips (click to navigate)
   - Hover: Background highlight

4. **Keyboard Navigation:**
   - ↓/↑: Navigate results
   - Enter: Open selected result
   - Esc: Close search
   - Tab: Cycle through filters

5. **Advanced Search:**
   - Operators: `amount:>100`, `date:2025-10`, `category:groceries`
   - Saved searches: Star frequently used searches
   - Recent searches: Show last 5 searches

### 8.2.5 Settings and Subdomain Management

**Purpose:** Configure subdomains, data sources, sync, and preferences.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Settings                                                      [Save] [×] │
├─────────────┬───────────────────────────────────────────────────────────┤
│             │                                                             │
│ General     │  General Settings                                          │
│ Appearance  │  ┌──────────────────────────────────────────────────────┐ │
│ Subdomains  │  │ Theme                                                 │ │
│ Data & Sync │  │ ○ Light  ● Dark  ○ System                            │ │
│ Privacy     │  └──────────────────────────────────────────────────────┘ │
│ Keyboard    │                                                             │
│ About       │  ┌──────────────────────────────────────────────────────┐ │
│             │  │ Language                                              │ │
│             │  │ [English (US) ▼]                                      │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
│             │  ┌──────────────────────────────────────────────────────┐ │
│             │  │ Default Subdomain                                     │ │
│             │  │ [Financial ▼]                                         │ │
│             │  │ Open this subdomain when launching the app            │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
│             │  ┌──────────────────────────────────────────────────────┐ │
│             │  │ Timezone                                              │ │
│             │  │ [America/New_York ▼]                                  │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
└─────────────┴───────────────────────────────────────────────────────────┘
```

**Subdomain Management Tab:**

```
┌─────────────┬───────────────────────────────────────────────────────────┐
│             │  Manage Subdomains                         [+ Add Custom]  │
│ General     │                                                             │
│ Appearance  │  Active Subdomains (Drag to reorder)                       │
│ Subdomains ◄│  ┌──────────────────────────────────────────────────────┐ │
│ Data & Sync │  │ ⋮⋮ Financial                              [Edit] [×]  │ │
│ Privacy     │  │    3 data sources • 1,247 transactions                │ │
│ Keyboard    │  │    Last synced: 2 minutes ago                         │ │
│ About       │  ├──────────────────────────────────────────────────────┤ │
│             │  │ ⋮⋮ Health                                 [Edit] [×]  │ │
│             │  │    4 data sources • 287 entries                       │ │
│             │  │    Last synced: 5 minutes ago                         │ │
│             │  ├──────────────────────────────────────────────────────┤ │
│             │  │ ⋮⋮ Schedule                               [Edit] [×]  │ │
│             │  │    2 data sources • 45 active tasks                   │ │
│             │  │    Last synced: 1 minute ago                          │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
│             │  Available Subdomains (Coming Soon)                        │
│             │  ┌──────────────────────────────────────────────────────┐ │
│             │  │ Knowledge Base                         [Install]      │ │
│             │  │ Take notes, link to other data                        │ │
│             │  ├──────────────────────────────────────────────────────┤ │
│             │  │ Travel                                 [Install]      │ │
│             │  │ Track trips, expenses, and itineraries                │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
└─────────────┴───────────────────────────────────────────────────────────┘
```

**Data & Sync Tab:**

```
┌─────────────┬───────────────────────────────────────────────────────────┐
│             │  Data & Sync                                                │
│ General     │                                                             │
│ Appearance  │  Connection Status                                          │
│ Subdomains  │  ┌──────────────────────────────────────────────────────┐ │
│ Data & Sync◄│  │ ✓ Neo4j Connected                                     │ │
│ Privacy     │  │   neo4j://localhost:7687                              │ │
│ Keyboard    │  │   [Test Connection]                                   │ │
│ About       │  │                                                        │ │
│             │  │ ✓ MongoDB Connected                                   │ │
│             │  │   mongodb://localhost:27017/personal-dashboard        │ │
│             │  │   [Test Connection]                                   │ │
│             │  │                                                        │ │
│             │  │ ✓ Backend API Connected                               │ │
│             │  │   https://api.dashboard.app                           │ │
│             │  │   [Test Connection]                                   │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
│             │  Sync Settings                                              │
│             │  ┌──────────────────────────────────────────────────────┐ │
│             │  │ Automatic Sync                                        │ │
│             │  │ ☑ Enable background sync                             │ │
│             │  │ Interval: [Every 1 minute ▼]                         │ │
│             │  │                                                        │ │
│             │  │ Last sync: 2 minutes ago                              │ │
│             │  │ Pending changes: 0                                    │ │
│             │  │                                                        │ │
│             │  │ [Sync Now]                                            │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
│             │  Data Management                                            │
│             │  ┌──────────────────────────────────────────────────────┐ │
│             │  │ [Export All Data]          Export as JSON/CSV         │ │
│             │  │ [Import Data]              Import from file           │ │
│             │  │ [Clear Cache]              Free up 245 MB             │ │
│             │  │ [Reset All Data]           ⚠️ Cannot be undone        │ │
│             │  └──────────────────────────────────────────────────────┘ │
│             │                                                             │
└─────────────┴───────────────────────────────────────────────────────────┘
```

## 8.3 Key Screen Descriptions (PWA/Mobile)

### 8.3.1 Mobile Dashboard

**Purpose:** Touch-optimized carousel navigation with condensed information.

**Layout (Portrait, 375×812):**

```
┌─────────────────────────────────┐
│ [☰]  Personal Dashboard  [👤]  │
├─────────────────────────────────┤
│                                 │
│  ● Financial  ○ Health  ○ Tasks│
│                                 │
│  ┌───────────────────────────┐ │
│  │ Net Worth      ↑ +2.3%    │ │
│  │ $80,234                   │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ This Month     🔴 +15%    │ │
│  │ -$2,456                   │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Budget         🟢 On Track│ │
│  │ 72%                       │ │
│  └───────────────────────────┘ │
│                                 │
│  Recent Transactions            │
│  ┌───────────────────────────┐ │
│  │ Whole Foods     Oct 23    │ │
│  │ Groceries        -$45.67  │ │
│  │ 📎 Meal log              │ │
│  ├───────────────────────────┤ │
│  │ Target          Oct 23    │ │
│  │ Home            -$156.32  │ │
│  │ 📎 Project               │ │
│  ├───────────────────────────┤ │
│  │ Paycheck        Oct 22    │ │
│  │ Income         +$3,250.00 │ │
│  └───────────────────────────┘ │
│                                 │
│  [View All Transactions →]     │
│                                 │
│                                 │
│ ┌─────────────────────────────┐│
│ │         [+]                 ││ ← Floating Action Button
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Key Differences from Desktop:**

1. **Navigation:**
   - Horizontal dot indicator for carousel position
   - Swipe left/right to change subdomains
   - Tap subdomain name to jump directly

2. **Cards:**
   - Full-width cards with 16px margins
   - Larger touch targets (minimum 44×44px)
   - Reduced information density

3. **Transaction List:**
   - Card-based instead of table
   - 2-line format: Title/category on line 1, amount on line 2
   - Relationship chips shown inline
   - Tap to view details in bottom sheet

4. **Floating Action Button (FAB):**
   - Primary action: Quick capture
   - Tap opens bottom sheet with subdomain selector
   - Positioned bottom-right, 16px margin

### 8.3.2 Mobile Quick Capture Interface

**Purpose:** Fast data entry from any screen.

**Layout (Bottom Sheet):**

```
┌─────────────────────────────────┐
│                                 │
│           Quick Add             │
│           ═══════               │
│                                 │
│  What do you want to log?       │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 💰 Expense                │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ 💵 Income                 │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ 🍔 Meal                   │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ 🏃 Workout                │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ ✓ Task                    │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ 📅 Event                  │ │
│  └───────────────────────────┘ │
│                                 │
│  [Cancel]                       │
│                                 │
└─────────────────────────────────┘
```

**After selecting "Expense":**

```
┌─────────────────────────────────┐
│ [←]        Log Expense          │
│                                 │
│  Amount *                       │
│  ┌───────────────────────────┐ │
│  │ $                         │ │
│  └───────────────────────────┘ │
│                                 │
│  Description *                  │
│  ┌───────────────────────────┐ │
│  │ What did you buy?         │ │
│  └───────────────────────────┘ │
│                                 │
│  Category                       │
│  ┌───────────────────────────┐ │
│  │ Groceries            ▼    │ │
│  └───────────────────────────┘ │
│                                 │
│  Account                        │
│  ┌───────────────────────────┐ │
│  │ Chase Sapphire       ▼    │ │
│  └───────────────────────────┘ │
│                                 │
│  Date                           │
│  ┌───────────────────────────┐ │
│  │ Today                ▼    │ │
│  └───────────────────────────┘ │
│                                 │
│  ☐ Add more details             │
│                                 │
│  ┌───────────────────────────┐ │
│  │         Save              │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Features:**

1. **Smart Defaults:**
   - Amount: Auto-focus keyboard with numpad
   - Category: Predict based on description (ML)
   - Account: Use last selected account
   - Date: Default to today

2. **Expandable Details:**
   - Tap "Add more details" to show: notes, tags, location, photo
   - Keep it simple by default

3. **Keyboard Optimization:**
   - Amount: Numeric keyboard
   - Description: Text keyboard with autocomplete
   - Next/Done buttons to navigate fields

### 8.3.3 Mobile Summary Views

**Purpose:** Quick overview of key metrics.

**Today View:**

```
┌─────────────────────────────────┐
│ [☰]  Today              [🔍] [+]│
├─────────────────────────────────┤
│                                 │
│  Good morning! ☀️               │
│  Thursday, October 23           │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 📅 5 events today         │ │
│  │ ✓ 8 tasks due             │ │
│  │ 💰 Spent $45 so far       │ │
│  └───────────────────────────┘ │
│                                 │
│  Up Next                        │
│  ┌───────────────────────────┐ │
│  │ 10:00 AM                  │ │
│  │ Team Meeting              │ │
│  │ Conference Room B         │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 2:00 PM                   │ │
│  │ Doctor Appointment        │ │
│  │ City Medical Center       │ │
│  │ 📎 $30 copay logged       │ │
│  └───────────────────────────┘ │
│                                 │
│  Tasks Due Today                │
│  ☐ Submit quarterly report      │
│  ☑ Morning workout              │
│  ☐ Call dentist                 │
│                                 │
│  Recent Activity                │
│  • Logged expense: $45.67       │
│  • Completed workout: 30 min    │
│  • Added task: Review budget    │
│                                 │
└─────────────────────────────────┘
```

### 8.3.4 Simplified Relationship Browser

**Purpose:** View entity relationships on mobile.

**Layout:**

```
┌─────────────────────────────────┐
│ [←]  Whole Foods Transaction    │
├─────────────────────────────────┤
│                                 │
│  -$45.67                        │
│  Oct 23, 2025                   │
│  Groceries • Chase Sapphire     │
│                                 │
│  ┌───────────────────────────┐ │
│  │ [Edit]  [Delete]  [⋮]     │ │
│  └───────────────────────────┘ │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  Related Items (3)              │
│                                 │
│  🍔 Meal Log                    │
│  Oct 23 • Breakfast             │
│  Oatmeal with berries, 350 cal  │
│  [View →]                       │
│                                 │
│  ✓ Task                         │
│  Oct 23 • Completed             │
│  Weekly grocery shopping        │
│  [View →]                       │
│                                 │
│  📍 Location                    │
│  Whole Foods Market             │
│  250 7th Ave, New York          │
│  [View →]                       │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  Notes                          │
│  (No notes yet)                 │
│  [Add note]                     │
│                                 │
│  Tags                           │
│  #groceries #weekly             │
│  [+ Add tag]                    │
│                                 │
└─────────────────────────────────┘
```

**Interaction:**
- Tap related item → Navigate to that entity
- Swipe left on related item → Quick actions (remove relationship)
- Pull-to-refresh → Reload relationships
- Long-press → Share entity details

## 8.4 Key Screen Descriptions (Echo Show)

### 8.4.1 Home Card

**Purpose:** Default display showing daily summary.

**Visual Layout (Echo Show 8, 1280×800):**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                                                                    │
│                    Personal Dashboard                              │
│                                                                    │
│                Thursday, October 23, 2025                          │
│                                                                    │
│                                                                    │
│        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│        │              │    │              │    │              │ │
│        │   5 Events   │    │   8 Tasks    │    │   Spent      │ │
│        │              │    │              │    │   $156       │ │
│        │              │    │              │    │              │ │
│        └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                                    │
│                                                                    │
│                         Next Up                                    │
│                                                                    │
│                  Team Meeting at 10:00 AM                          │
│                  Conference Room B                                 │
│                                                                    │
│                                                                    │
│    Say: "Alexa, show my financial dashboard"                      │
│                                                                    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Design Requirements:**
- Large text (minimum 36px for body, 60px for numbers)
- High contrast (dark background, white text)
- Simple 3-card layout
- Clear voice prompts at bottom
- Auto-refresh every 15 minutes

### 8.4.2 Subdomain-Specific Cards

**Financial Card:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                   Financial Dashboard                              │
│                                                                    │
│                                                                    │
│        ┌────────────────────┐         ┌────────────────────┐     │
│        │                    │         │                    │     │
│        │  This Month        │         │  Budget            │     │
│        │                    │         │                    │     │
│        │  $2,456            │         │  72% Used          │     │
│        │  Spent             │         │  On Track          │     │
│        │                    │         │                    │     │
│        └────────────────────┘         └────────────────────┘     │
│                                                                    │
│                                                                    │
│                     Recent Expenses                                │
│                                                                    │
│              Whole Foods              $45.67                       │
│              Target                  $156.32                       │
│              Starbucks                 $6.50                       │
│                                                                    │
│                                                                    │
│    Say: "Alexa, log an expense"                                   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Health Card:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                   Health Dashboard                                 │
│                                                                    │
│                                                                    │
│        ┌────────────────────┐         ┌────────────────────┐     │
│        │                    │         │                    │     │
│        │  This Week         │         │  Current Weight    │     │
│        │                    │         │                    │     │
│        │  4 Workouts        │         │  175.5 lbs         │     │
│        │  🔥 12 day streak  │         │  ↓ -2.3 lbs       │     │
│        │                    │         │                    │     │
│        └────────────────────┘         └────────────────────┘     │
│                                                                    │
│                                                                    │
│                     Today's Summary                                │
│                                                                    │
│              Breakfast                350 cal                      │
│              Lunch                    580 cal                      │
│              Dinner                   Not logged                   │
│                                                                    │
│                                                                    │
│    Say: "Alexa, log a workout"                                    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 8.4.3 Relationship Insight Cards

**Purpose:** Highlight discovered cross-domain connections.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                   💡 Insight Discovered                            │
│                                                                    │
│                                                                    │
│                                                                    │
│          Your grocery spending is 40% higher in weeks              │
│          when you complete 4+ workouts                             │
│                                                                    │
│                                                                    │
│        ┌──────────────────────────────────────────────────┐       │
│        │                                                  │       │
│        │  Active Weeks                                    │       │
│        │  $240 avg grocery spend                          │       │
│        │                                                  │       │
│        │  Inactive Weeks                                  │       │
│        │  $170 avg grocery spend                          │       │
│        │                                                  │       │
│        └──────────────────────────────────────────────────┘       │
│                                                                    │
│                                                                    │
│    Say: "Alexa, tell me more about this pattern"                  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## 8.5 Interaction Patterns

### 8.5.1 Carousel Navigation

**Desktop:**
- **Arrow Keys:** ← previous subdomain, → next subdomain
- **Keyboard Shortcuts:** Ctrl/Cmd+1 (Financial), +2 (Health), +3 (Schedule)
- **Click:** Click subdomain name in navigation bar
- **Trackpad:** Two-finger swipe left/right
- **Animation:** Smooth slide transition, 300ms ease-in-out

**Mobile:**
- **Swipe:** Swipe left for next, right for previous
- **Tap:** Tap dot indicator to jump to subdomain
- **Momentum:** Flick gesture for fast navigation
- **Haptic:** Subtle vibration when changing subdomain

**Echo Show:**
- **Voice:** "Alexa, next dashboard" / "Alexa, show health"
- **Touch:** Swipe gesture if touch-enabled model
- **Auto-rotation:** Optional setting to cycle through every 30 seconds

### 8.5.2 Entity Selection and Detail Views

**Desktop:**
- **Single Click:** Select entity, show relationships in sidebar
- **Double Click:** Open full detail modal
- **Right Click:** Context menu (edit, delete, duplicate, share)
- **Hover:** Highlight row, show action icons
- **Keyboard:** j/k to navigate list, Enter to open detail

**Mobile:**
- **Tap:** Open detail in bottom sheet (swipe down to dismiss)
- **Long Press:** Context menu with actions
- **Swipe Left:** Quick delete
- **Swipe Right:** Quick edit

### 8.5.3 Relationship Exploration

**Inline Relationship Chips:**
```
Transaction: Whole Foods -$45.67
Related: [🍔 Meal Log] [✓ Weekly Shopping]
         ↑ Click to navigate
```

**Sidebar Relationship List:**
- Grouped by relationship type
- Click relationship → Navigate to related entity
- Hover → Preview tooltip
- Right-click → Remove relationship

**Graph Visualization:**
- Click node → Show details, highlight connected nodes
- Double-click node → Recenter graph on this node
- Drag node → Reposition (physics simulation)
- Scroll → Zoom in/out
- Click-drag background → Pan

### 8.5.4 Search Interactions

**Trigger Search:**
- Cmd/Ctrl+K (global shortcut)
- Click search icon in top bar
- Type "/" from any screen (vim-style)

**During Search:**
- Type → Real-time results (debounced 300ms)
- ↓/↑ → Navigate results
- Tab → Switch between filters
- Enter → Open selected result
- Esc → Close search modal

**Result Actions:**
- Click result → Open in main view
- Cmd/Ctrl+Click → Open in new window (desktop)
- Click relationship chip → Navigate to related entity
- Hover → Preview relationship details

### 8.5.5 Quick Capture

**Desktop:**
- Ctrl/Cmd+Shift+N → Open quick capture modal
- Select subdomain → Show minimal form
- Fill fields → Press Enter to save
- Cmd/Ctrl+Shift+Enter → Save and add another

**Mobile:**
- Tap FAB (+) → Open action sheet
- Select action type → Show form in bottom sheet
- Swipe down → Cancel
- Tap Save → Close and show success toast

**Voice (Echo Show):**
- "Alexa, log an expense" → Starts conversation
- Alexa prompts for each required field
- Confirm or correct → Save

## 8.6 Responsive Behavior Matrix

| Feature | Mobile (<640px) | Tablet (641-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Carousel Navigation | Swipe + dots | Swipe + tabs | Arrow keys + tabs |
| Summary Cards | 1 column, full-width | 2 columns | 3 columns |
| Transaction List | Card-based | Hybrid (cards with more detail) | Table |
| Relationship Sidebar | Bottom sheet | Slide-in panel (280px) | Persistent sidebar (320px) |
| Search | Full screen modal | Modal (600px wide) | Modal (800px wide) |
| Quick Capture | Bottom sheet | Bottom sheet | Center modal |
| Graph Explorer | Simplified (fewer controls) | Full featured | Full featured + keyboard shortcuts |
| Settings | Full screen | Modal (700px) | Modal (900px) |
| Touch Targets | 44px minimum | 40px minimum | 32px (mouse-optimized) |
| Font Scale | 14px base | 15px base | 16px base |

## 8.7 Accessibility Features

### 8.7.1 Keyboard Navigation

**Global Shortcuts:**
- `Cmd/Ctrl+K`: Open search
- `Cmd/Ctrl+Shift+N`: Quick capture
- `Cmd/Ctrl+1/2/3`: Switch subdomains
- `Cmd/Ctrl+/`: Show keyboard shortcuts help
- `Esc`: Close modal/cancel

**List Navigation:**
- `j/k` or `↓/↑`: Next/previous item
- `Enter`: Open item
- `Space`: Select/deselect checkbox
- `Delete`: Delete selected items (with confirmation)

**Form Navigation:**
- `Tab`: Next field
- `Shift+Tab`: Previous field
- `Enter`: Submit (when on submit button)
- `Esc`: Cancel

### 8.7.2 Screen Reader Support

**Semantic HTML:**
```html
<nav aria-label="Subdomain navigation">
  <button aria-label="Financial dashboard" aria-current="page">
    Financial
  </button>
</nav>

<main aria-label="Financial dashboard content">
  <section aria-labelledby="summary-heading">
    <h2 id="summary-heading">Financial Summary</h2>
    <!-- Content -->
  </section>
</main>
```

**ARIA Labels:**
- All interactive elements have descriptive labels
- Status changes announced with `aria-live`
- Loading states with `aria-busy`
- Expandable sections with `aria-expanded`

**Focus Management:**
- Focus trap in modals
- Return focus to trigger element on close
- Skip to content link
- Visible focus indicators (2px outline)

### 8.7.3 Color Contrast

**WCAG AA Compliance:**
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Color-Blind Friendly:**
- Don't rely solely on color to convey information
- Use icons, labels, and patterns alongside color
- Test with color-blindness simulators

**Example:**
```
❌ Bad: Red/green for expense/income (color-blind unfriendly)
✓ Good: Red with ↓ icon / Green with ↑ icon for expense/income
```

### 8.7.4 Motion Sensitivity

Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  
  /* But keep essential animations */
  [data-essential-animation] {
    animation-duration: 200ms !important;
  }
}
```

---
# 9. Data Flows & Synchronization

## 9.1 Data Creation Flow

### 9.1.1 Desktop → Neo4j/MongoDB → Sync to Other Devices

**Step-by-Step Flow:**

```
User Action (Desktop)
    ↓
1. User creates transaction via form
    ↓
2. Client validates input locally
    ↓
3. POST /api/financial/transactions
    {
      amount: -45.67,
      description: "Whole Foods",
      date: "2025-10-23",
      accountId: "account-uuid",
      categoryId: "category-uuid"
    }
    ↓
4. Backend API receives request
    ↓
5. Start database transaction
    ↓
6. Create MongoDB document
    - Generate UUID
    - Store full transaction details
    - Set syncStatus: "syncing"
    ↓
7. Create Neo4j node
    MATCH (u:User {id: $userId})
    MATCH (a:Account {id: $accountId})
    MATCH (c:Category {id: $categoryId})
    CREATE (t:Transaction {
      id: $id,
      amount: $amount,
      description: $description,
      date: date($date)
    })
    CREATE (u)-[:OWNS]->(a)
    CREATE (t)-[:PAID_WITH]->(a)
    CREATE (t)-[:CATEGORIZED_AS]->(c)
    CREATE (t)-[:OCCURRED_ON]->(d:Date {date: date($date)})
    ↓
8. Commit database transaction
    ↓
9. Update MongoDB syncStatus: "synced"
    ↓
10. Return response to client
    {
      success: true,
      data: { id: "uuid", ...transaction }
    }
    ↓
11. Client updates local state
    ↓
12. Broadcast via WebSocket to connected clients
    {
      type: "ENTITY_CREATED",
      entity: "Transaction",
      data: { id: "uuid", ...transaction },
      timestamp: "2025-10-23T12:00:00Z"
    }
    ↓
13. Other devices receive WebSocket message
    ↓
14. PWA: Updates IndexedDB + UI
    Echo Show: Schedules next refresh
```

**Error Handling:**

```typescript
async function createTransaction(data: TransactionInput) {
  const session = await mongoose.startSession();
  const neo4jSession = neo4j.session();
  
  session.startTransaction();
  
  try {
    // Step 1: MongoDB
    const mongoDoc = await TransactionModel.create([{
      ...data,
      neo4jId: generateUUID(),
      syncStatus: 'syncing'
    }], { session });
    
    // Step 2: Neo4j
    await neo4jSession.run(
      `CREATE (t:Transaction {...})
       CREATE (t)-[:PAID_WITH]->(:Account {id: $accountId})
       ...`,
      { ...data, id: mongoDoc[0].neo4jId }
    );
    
    // Step 3: Update sync status
    await TransactionModel.updateOne(
      { _id: mongoDoc[0]._id },
      { syncStatus: 'synced' },
      { session }
    );
    
    // Commit both
    await session.commitTransaction();
    await neo4jSession.close();
    
    // Broadcast
    broadcastChange({
      type: 'ENTITY_CREATED',
      entity: 'Transaction',
      data: mongoDoc[0]
    });
    
    return mongoDoc[0];
    
  } catch (error) {
    await session.abortTransaction();
    await neo4jSession.close();
    
    console.error('Transaction creation failed:', error);
    
    // Rollback strategy
    if (mongoDoc) {
      await TransactionModel.deleteOne({ _id: mongoDoc._id });
    }
    
    throw new Error('Failed to create transaction');
  }
}
```

### 9.1.2 Optimistic Updates

**Client-Side Flow:**

```typescript
// components/transaction-form.tsx
async function handleSubmit(data: TransactionInput) {
  const tempId = `temp-${Date.now()}`;
  const optimisticTransaction = {
    id: tempId,
    ...data,
    syncStatus: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // 1. Immediately update UI
  setTransactions(prev => [optimisticTransaction, ...prev]);
  
  try {
    // 2. Send to server
    const response = await fetch('/api/financial/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    const serverTransaction = await response.json();
    
    // 3. Replace optimistic with server version
    setTransactions(prev => 
      prev.map(t => t.id === tempId ? serverTransaction.data : t)
    );
    
    showToast('Transaction saved', 'success');
    
  } catch (error) {
    // 4. Rollback on error
    setTransactions(prev => prev.filter(t => t.id !== tempId));
    showToast('Failed to save transaction', 'error');
    
    // 5. Queue for retry (offline scenario)
    if (!navigator.onLine) {
      await queueForSync({
        operation: 'CREATE',
        entity: 'Transaction',
        data: optimisticTransaction
      });
      showToast('Saved locally, will sync when online', 'info');
    }
  }
}
```

## 9.2 Conflict Resolution

### 9.2.1 Conflict Detection Strategy

**Last-Write-Wins (LWW) with Timestamps:**

```typescript
interface Entity {
  id: string;
  updatedAt: string; // ISO timestamp
  syncVersion: number; // Incremented on each update
  // ... other fields
}

function detectConflict(local: Entity, remote: Entity): boolean {
  // Conflict if both modified since last sync
  return local.updatedAt !== remote.updatedAt && 
         local.syncVersion === remote.syncVersion;
}

function resolveConflict(local: Entity, remote: Entity): Entity {
  // Choose newer timestamp
  return new Date(local.updatedAt) > new Date(remote.updatedAt)
    ? local
    : remote;
}
```

**Implementation in Sync Service:**

```typescript
async function applyRemoteChanges(changes: SyncChange[]) {
  for (const change of changes) {
    const localEntity = await getLocalEntity(change.entityType, change.id);
    
    if (!localEntity) {
      // No local copy, just create
      await createLocalEntity(change.data);
      continue;
    }
    
    // Check for conflict
    if (detectConflict(localEntity, change.data)) {
      console.warn('Conflict detected:', change.id);
      
      const resolution = resolveConflict(localEntity, change.data);
      
      if (resolution.id === localEntity.id) {
        // Local wins, push to server
        await uploadChange({
          operation: 'UPDATE',
          entity: change.entityType,
          data: localEntity
        });
      } else {
        // Remote wins, update local
        await updateLocalEntity(change.data);
        
        // Notify user if significant data loss
        if (hasSignificantDifference(localEntity, change.data)) {
          notifyUser({
            title: 'Data was updated on another device',
            message: `Your local changes to ${change.entityType} were overwritten`,
            action: 'View History'
          });
        }
      }
    } else {
      // No conflict, safe to update
      await updateLocalEntity(change.data);
    }
  }
}
```

### 9.2.2 User-Prompted Resolution (Future Enhancement)

**For High-Value Conflicts:**

```typescript
async function handleHighValueConflict(local: Transaction, remote: Transaction) {
  // High-value: Amount difference > $100 or description completely different
  const isHighValue = 
    Math.abs(local.amount - remote.amount) > 100 ||
    similarity(local.description, remote.description) < 0.5;
  
  if (isHighValue) {
    // Show modal to user
    const choice = await showConflictResolutionModal({
      local,
      remote,
      options: [
        { label: 'Keep local version', value: 'local' },
        { label: 'Use remote version', value: 'remote' },
        { label: 'Keep both', value: 'both' },
        { label: 'Merge manually', value: 'manual' }
      ]
    });
    
    switch (choice) {
      case 'local':
        return local;
      case 'remote':
        return remote;
      case 'both':
        // Create two separate transactions
        const remoteClone = { ...remote, id: generateUUID() };
        await createLocalEntity(remoteClone);
        return local;
      case 'manual':
        // Open merge editor
        return await showMergeEditor(local, remote);
    }
  }
  
  // Low-value: use LWW
  return resolveConflict(local, remote);
}
```

## 9.3 Offline Behavior

### 9.3.1 What Works Offline (Per Platform)

**Desktop:**
- ✅ View all cached data (transactions, workouts, tasks)
- ✅ Create new entities (queued for sync)
- ✅ Edit existing entities (queued for sync)
- ✅ Delete entities (queued for sync)
- ✅ Search cached data
- ✅ View relationships (cached)
- ❌ Discover new relationships (requires server-side analysis)
- ❌ Fetch data not in cache

**PWA (Mobile):**
- ✅ View recent data (last 30 days in IndexedDB)
- ✅ Create new entities (queued for sync)
- ✅ Edit recent entities
- ✅ Quick capture
- ✅ Search recent data
- ❌ View detailed history (older than 30 days)
- ❌ Complex reports
- ❌ Graph explorer

**Echo Show:**
- ✅ View last fetched summary (stale data displayed with indicator)
- ❌ Create/edit data (requires connection)
- ❌ Real-time updates

### 9.3.2 Sync Queue Management

**Queue Structure:**

```typescript
interface SyncOperation {
  tempId: number; // Auto-increment
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string; // 'Transaction', 'Workout', etc.
  entityId?: string; // For UPDATE/DELETE
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}
```

**Queue Processing:**

```typescript
class SyncQueue {
  private queue: SyncOperation[] = [];
  private processing = false;
  
  async enqueue(operation: Omit<SyncOperation, 'tempId' | 'timestamp' | 'retryCount' | 'status'>) {
    const op: SyncOperation = {
      ...operation,
      tempId: Date.now(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };
    
    // Store in IndexedDB
    const db = await getDB();
    await db.add('sync-queue', op);
    
    this.queue.push(op);
    
    // Trigger processing if online
    if (navigator.onLine) {
      this.process();
    }
  }
  
  async process() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const op = this.queue[0];
      
      try {
        op.status = 'syncing';
        
        // Execute operation
        await this.executeOperation(op);
        
        // Remove from queue
        this.queue.shift();
        const db = await getDB();
        await db.delete('sync-queue', op.tempId);
        
      } catch (error) {
        console.error('Sync operation failed:', error);
        
        op.retryCount++;
        op.status = 'failed';
        
        if (op.retryCount >= 3) {
          // Move to failed queue for manual review
          this.queue.shift();
          await this.moveToFailedQueue(op);
        } else {
          // Retry with exponential backoff
          await this.delay(Math.pow(2, op.retryCount) * 1000);
        }
      }
    }
    
    this.processing = false;
  }
  
  private async executeOperation(op: SyncOperation) {
    switch (op.operation) {
      case 'CREATE':
        return await this.syncCreate(op);
      case 'UPDATE':
        return await this.syncUpdate(op);
      case 'DELETE':
        return await this.syncDelete(op);
    }
  }
  
  private async syncCreate(op: SyncOperation) {
    const response = await fetch(`/api/${op.entity.toLowerCase()}s`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(op.data)
    });
    
    if (!response.ok) throw new Error('Sync failed');
    
    const result = await response.json();
    
    // Update local entity with server ID
    const db = await getDB();
    const storeName = `${op.entity.toLowerCase()}s`;
    await db.put(storeName, result.data);
  }
}

export const syncQueue = new SyncQueue();
```

### 9.3.3 Conflict Handling When Coming Online

**Reconnection Flow:**

```typescript
// Listen for online event
window.addEventListener('online', async () => {
  console.log('Connection restored, syncing...');
  
  // 1. Fetch changes since last sync
  const lastSyncTime = await getLastSyncTime();
  const remoteChanges = await fetch(`/api/sync/changes?since=${lastSyncTime}`);
  const changes = await remoteChanges.json();
  
  // 2. Apply remote changes (with conflict resolution)
  await applyRemoteChanges(changes.data);
  
  // 3. Upload local pending changes
  await syncQueue.process();
  
  // 4. Update last sync time
  await setLastSyncTime(new Date());
  
  // 5. Notify user
  showToast(`Synced ${changes.data.length} changes`, 'success');
});

// Listen for offline event
window.addEventListener('offline', () => {
  console.log('Connection lost, queuing changes...');
  showToast('Working offline - changes will sync later', 'info');
});
```

## 9.4 Real-Time Updates

### 9.4.1 WebSocket Implementation

**Server-Side (Backend API):**

```typescript
// server.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Track connected clients
const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  // Authenticate connection
  const token = extractTokenFromRequest(req);
  const userId = verifyToken(token);
  
  if (!userId) {
    ws.close(1008, 'Unauthorized');
    return;
  }
  
  // Register client
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(ws);
  
  console.log(`Client connected: ${userId}`);
  
  // Send initial sync status
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages from client
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    handleClientMessage(userId, message);
  });
  
  // Handle disconnect
  ws.on('close', () => {
    clients.get(userId)?.delete(ws);
    console.log(`Client disconnected: ${userId}`);
  });
});

// Broadcast change to all user's devices
export function broadcastToUser(userId: string, message: any) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  
  const payload = JSON.stringify(message);
  userClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}
```

**Client-Side (Desktop/PWA):**

```typescript
// services/websocket.service.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(token: string) {
    this.ws = new WebSocket(`ws://localhost:8080?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
      this.attemptReconnect(token);
    };
  }
  
  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(token);
    }, delay);
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'ENTITY_CREATED':
        this.emit('entity:created', message.data);
        break;
      case 'ENTITY_UPDATED':
        this.emit('entity:updated', message.data);
        break;
      case 'ENTITY_DELETED':
        this.emit('entity:deleted', message.data);
        break;
      case 'SYNC_REQUIRED':
        this.emit('sync:required');
        break;
    }
  }
  
  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  disconnect() {
    this.ws?.close();
  }
  
  // EventEmitter pattern
  private listeners = new Map<string, Set<Function>>();
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }
  
  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const websocketService = new WebSocketService();
```

**Usage in React Components:**

```typescript
// hooks/useRealtimeSync.ts
export function useRealtimeSync() {
  useEffect(() => {
    const token = getAuthToken();
    websocketService.connect(token);
    
    // Listen for entity updates
    websocketService.on('entity:created', (entity) => {
      // Update React Query cache
      queryClient.invalidateQueries(['transactions']);
      showToast(`New ${entity.type} synced from another device`, 'info');
    });
    
    websocketService.on('entity:updated', (entity) => {
      queryClient.invalidateQueries(['transactions', entity.id]);
    });
    
    return () => {
      websocketService.disconnect();
    };
  }, []);
}
```

---

# 10. User Stories with Acceptance Criteria

## 10.1 Core Framework Stories

### Story 1: Navigate Between Subdomains via Carousel

**As a** user  
**I want to** easily switch between different subdomain dashboards  
**So that** I can view different aspects of my data without losing context

**Acceptance Criteria:**
- **Given** I'm viewing the Financial dashboard
  **When** I press the right arrow key
  **Then** The carousel slides to show the Health dashboard
  **And** The animation is smooth (300ms ease-in-out)
  **And** The active subdomain indicator updates

- **Given** I'm viewing any dashboard
  **When** I press Cmd/Ctrl+2
  **Then** I immediately navigate to the Health dashboard (position 2)
  **And** Focus is set to the dashboard content

- **Given** I'm on mobile viewing Financial dashboard
  **When** I swipe left
  **Then** The Health dashboard slides into view
  **And** I feel haptic feedback
  **And** The dot indicator updates

**Priority:** High  
**Subdomain:** Framework  
**Platform:** All

---

### Story 2: Discover Cross-Domain Relationships

**As a** user with data across multiple subdomains  
**I want to** see how entities are related across domains  
**So that** I can understand connections I wouldn't notice manually

**Acceptance Criteria:**
- **Given** I've created a Transaction with description containing "Dr. Smith"
  **And** I have a HealthEvent "Appointment with Dr. Smith" on the same date
  **When** The system runs relationship discovery (background job)
  **Then** A RELATED_TO relationship is created between Transaction and HealthEvent
  **And** The relationship has properties: {discoveryMethod: 'TEMPORAL', confidence: 0.85}

- **Given** I'm viewing a Transaction detail
  **When** The transaction has cross-domain relationships
  **Then** I see the Relationship Sidebar showing all related entities
  **And** Each relationship shows: entity type icon, title, relationship type, and "View" link

- **Given** I'm viewing the Connection Insights panel
  **When** The system has discovered 5+ new relationships this week
  **Then** I see an insight card: "You've linked X financial expenses to health events this week"
  **And** I can click to explore these relationships

**Priority:** High  
**Subdomain:** Framework (Relationship Engine)  
**Platform:** Desktop (primary), PWA (view only)

---

### Story 3: Search Across All Subdomains

**As a** user looking for specific information  
**I want to** search across all my data regardless of subdomain  
**So that** I don't need to remember where I stored information

**Acceptance Criteria:**
- **Given** I press Cmd/Ctrl+K from any screen
  **When** The search modal opens
  **Then** The search input is auto-focused
  **And** I see placeholders like "Recent: medical expenses"

- **Given** I type "medical" in the search box
  **When** 300ms passes (debounce)
  **Then** I see results grouped by subdomain:
    - Financial (2): Transactions with "medical" category
    - Health (3): HealthEvents with "medical" in title/description
    - Schedule (1): Tasks mentioning "medical"
  **And** Search terms are highlighted in results

- **Given** I have search results displayed
  **When** I press the down arrow key
  **Then** Focus moves to the first result
  **And** The result is highlighted
  **When** I press Enter
  **Then** The search modal closes
  **And** I navigate to the selected entity's detail view

**Priority:** High  
**Subdomain:** Framework  
**Platform:** All

---

### Story 4: Quick Capture from Anywhere

**As a** user who wants to quickly log data  
**I want to** access a quick capture interface from any screen  
**So that** I can record information without navigating away

**Acceptance Criteria:**
- **Given** I'm on any screen in the desktop app
  **When** I press Cmd/Ctrl+Shift+N
  **Then** A quick capture modal opens centered on screen
  **And** I see a subdomain selector dropdown
  **And** Focus is on the subdomain selector

- **Given** The quick capture modal is open
  **When** I select "Financial" subdomain
  **Then** I see a minimal expense form with fields: Amount, Description, Category, Account, Date
  **And** Date defaults to today
  **And** Account defaults to my last-used account
  **And** Focus moves to the Amount field

- **Given** I've filled required fields (Amount, Description)
  **When** I press Enter
  **Then** The transaction is created
  **And** I see a success toast
  **And** The modal closes
  **And** Focus returns to where I was

- **Given** I press Cmd/Ctrl+Shift+Enter after creating an entry
  **Then** The entry is saved
  **And** The form clears
  **And** The modal stays open for another entry

**Priority:** High  
**Subdomain:** Framework  
**Platform:** Desktop, PWA

---

## 10.2 Financial Subdomain Stories

*(Additional stories beyond those in Section 5.1.5)*

### Story 5: Auto-Categorize Transactions

**As a** user who tracks many transactions  
**I want to** have transactions automatically categorized based on merchant  
**So that** I don't have to manually categorize every purchase

**Acceptance Criteria:**
- **Given** I create a transaction with merchant "Whole Foods"
  **When** The system has seen "Whole Foods" transactions before categorized as "Groceries"
  **Then** The new transaction is auto-categorized as "Groceries"
  **And** The category field shows: "Groceries (auto)" with 90% confidence indicator

- **Given** A transaction is auto-categorized
  **When** I view it in the transaction list
  **Then** I can click the category to change it
  **And** The system learns from my correction for future transactions

- **Given** I create a transaction with a new merchant
  **When** No category can be confidently predicted
  **Then** The category field is blank
  **And** I see a suggestion: "Based on similar transactions, this might be: [Category]"

**Priority:** Medium  
**Subdomain:** Financial  
**Platform:** All

---

### Story 6: Export Financial Data

**As a** user who needs data for tax purposes or external analysis  
**I want to** export my financial data in standard formats  
**So that** I can use it with other tools or provide it to my accountant

**Acceptance Criteria:**
- **Given** I'm viewing the Financial dashboard
  **When** I click "Export" in the settings menu
  **Then** I see export options: CSV, JSON, PDF Report
  **And** I can select date range
  **And** I can select which data to include (transactions, accounts, budgets)

- **Given** I select "CSV" and date range "2025 Q4"
  **When** I click "Export"
  **Then** A CSV file downloads named "financial-data-2025-Q4.csv"
  **And** The CSV contains columns: Date, Description, Category, Account, Amount, Tags, Notes
  **And** All transactions in Q4 2025 are included

- **Given** I select "PDF Report"
  **When** I click "Export"
  **Then** A formatted PDF generates with:
    - Summary statistics (total income, expenses, net)
    - Spending by category (chart + table)
    - Transaction list (grouped by month)
  **And** The PDF is professionally formatted for printing

**Priority:** Medium  
**Subdomain:** Financial  
**Platform:** Desktop

---

## 10.3 Health Subdomain Stories

*(Additional stories beyond those in Section 5.2.5)*

### Story 7: Track Workout Streak

**As a** user building a fitness habit  
**I want to** see my current workout streak  
**So that** I stay motivated to maintain consistency

**Acceptance Criteria:**
- **Given** I've logged workouts on Mon, Tue, Wed, Thu this week
  **When** I view the Health Dashboard
  **Then** I see "🔥 4 day streak" prominently displayed
  **And** The streak indicator is visually emphasized

- **Given** I have a 15-day streak
  **And** Today is a workout day in my routine (Mon/Wed/Fri)
  **When** I haven't logged a workout today
  **Then** I see a reminder notification: "Don't break your 15-day streak! Log today's workout"

- **Given** I miss a scheduled workout day
  **When** The next day arrives
  **Then** My streak resets to 0
  **And** I see: "Streak ended at 15 days. Start a new one today!"
  **And** My longest streak (15 days) is saved in stats

**Priority:** Medium  
**Subdomain:** Health  
**Platform:** All

---

### Story 8: Calculate Calorie Goals

**As a** user tracking diet and fitness  
**I want to** have my daily calorie goal calculated based on my goals  
**So that** I know how much to eat to reach my target weight

**Acceptance Criteria:**
- **Given** I set a HealthGoal: "Lose 15 pounds by March 31, 2026"
  **And** I input my current stats: age, height, weight, activity level
  **When** The system calculates my calorie goal
  **Then** It uses TDEE formula: BMR × activity multiplier - 500 cal deficit
  **And** Shows: "Your daily calorie goal: 1,850 calories"
  **And** Explains: "This creates a 500 calorie deficit for 1 lb/week weight loss"

- **Given** I have a daily calorie goal of 1,850
  **When** I've logged meals totaling 1,620 calories
  **Then** The Health Dashboard shows: "1,620 / 1,850 calories (230 remaining)"
  **And** A progress bar: 88% filled, green color

- **Given** I exceed my calorie goal
  **When** I've logged 2,100 calories
  **Then** The display shows: "2,100 / 1,850 calories (+250 over)"
  **And** The progress bar is red
  **And** I see a tip: "Consider an extra workout to burn 250 calories"

**Priority:** Medium  
**Subdomain:** Health  
**Platform:** Desktop, PWA

---

## 10.4 Schedule Subdomain Stories

*(Additional stories beyond those in Section 5.3.5)*

### Story 9: Recurring Task Management

**As a** user with regular responsibilities  
**I want to** create recurring tasks that repeat automatically  
**So that** I don't have to manually create the same task every day/week

**Acceptance Criteria:**
- **Given** I create a task "Daily review and planning"
  **When** I select recurrence: "Daily at 9:00 PM"
  **Then** The task is marked as recurring with 🔁 icon
  **And** A new instance is created every day at midnight
  **And** The previous day's instance is marked "Overdue" if incomplete

- **Given** I complete today's instance of a recurring task
  **When** I mark it complete
  **Then** Only today's instance is marked complete
  **And** Tomorrow's instance remains in "Not Started" status
  **And** My streak counter increments: "🔥 23 day streak"

- **Given** I want to edit a recurring task
  **When** I edit the task
  **Then** I'm asked: "Update just this instance or all future instances?"
  **And** If I select "All future", the recurrence pattern is updated
  **And** If I select "Just this", only today's instance changes (exception created)

- **Given** I want to stop a recurring task
  **When** I delete it
  **Then** I'm asked: "Delete all instances or just this one?"
  **And** If I select "All instances", the recurrence is ended
  **And** Future instances are removed from the schedule

**Priority:** High  
**Subdomain:** Schedule  
**Platform:** All

---

### Story 10: Task Dependencies

**As a** user managing complex projects  
**I want to** mark that some tasks depend on others  
**So that** I can organize my work in the correct order

**Acceptance Criteria:**
- **Given** I have tasks "Research tools" and "Purchase equipment"
  **When** I edit "Purchase equipment"
  **Then** I can add a dependency: "Depends on: Research tools"
  **And** A DEPENDS_ON relationship is created in Neo4j

- **Given** Task B depends on Task A
  **And** Task A is not yet complete
  **When** I view Task B
  **Then** I see a warning: "⚠️ Waiting on: Research tools"
  **And** Task B shows as "Blocked" status
  **And** Task B cannot be marked complete until Task A is done

- **Given** Task B depends on Task A
  **When** I complete Task A
  **Then** Task B status automatically changes from "Blocked" to "Ready"
  **And** I receive a notification: "Task 'Purchase equipment' is now unblocked"

- **Given** Multiple tasks depend on the same task
  **When** I view the dependency task
  **Then** I see: "This task blocks 3 other tasks"
  **And** I can click to see the list of dependent tasks

**Priority:** Medium  
**Subdomain:** Schedule  
**Platform:** Desktop (primary), PWA (view only)

---

## 10.5 Cross-Platform Sync Stories

### Story 11: Offline Creation Syncs When Online

**As a** mobile user who often works offline  
**I want to** create data while offline and have it sync automatically  
**So that** I don't lose any information

**Acceptance Criteria:**
- **Given** I'm on mobile with no internet connection
  **When** I create a transaction via quick capture
  **Then** The transaction is saved to IndexedDB
  **And** Marked with syncStatus: "pending"
  **And** A sync queue indicator shows "1 pending change"

- **Given** I have 5 pending changes in the sync queue
  **When** My internet connection is restored
  **Then** A background sync process starts automatically
  **And** I see a toast: "Syncing 5 pending changes..."
  **And** Each change is uploaded to the server in order

- **Given** Sync is in progress
  **When** All changes sync successfully
  **Then** I see: "✓ All changes synced"
  **And** The pending indicator disappears
  **And** All entities have syncStatus: "synced"

- **Given** One change fails to sync (e.g., server error)
  **When** The sync process encounters the error
  **Then** That change remains in the queue
  **And** Other changes continue syncing
  **And** The failed change is retried with exponential backoff
  **And** After 3 failures, I'm notified: "Failed to sync 1 change. View details?"

**Priority:** High  
**Subdomain:** Framework (Sync)  
**Platform:** PWA, Desktop

---

### Story 12: Sync Conflict Notification

**As a** user who edits data on multiple devices  
**I want to** be notified when conflicts occur  
**So that** I can ensure no important data is lost

**Acceptance Criteria:**
- **Given** I edit Transaction A on my desktop (amount: $50)
  **And** I simultaneously edit the same transaction on mobile (amount: $45)
  **When** Both devices sync
  **Then** A conflict is detected (same entity, different updatedAt timestamps)
  **And** The system uses last-write-wins resolution
  **And** The newer edit ($45 from mobile) is kept

- **Given** A conflict was resolved automatically
  **And** The conflict involved a significant change (>$100 difference or description change)
  **When** I next open the app on the "losing" device
  **Then** I see a notification: "⚠️ Your edit to Transaction 'Whole Foods' was overwritten by a newer edit from your mobile device"
  **And** I can click "View Details" to see both versions
  **And** I can choose to "Restore my version" if needed

- **Given** I choose to restore my version after a conflict
  **When** I click "Restore"
  **Then** My version is uploaded to the server
  **And** All devices sync to my restored version
  **And** A note is added to the transaction history: "Restored from conflict on Oct 23"

**Priority:** Medium  
**Subdomain:** Framework (Sync)  
**Platform:** All

---

## 10.6 Performance & Edge Case Stories

### Story 13: Large Dataset Performance

**As a** user with years of historical data  
**I want to** maintain fast performance even with thousands of entities  
**So that** the app remains responsive as my data grows

**Acceptance Criteria:**
- **Given** I have 10,000+ transactions in my database
  **When** I view the Financial Dashboard
  **Then** The dashboard loads in under 2 seconds
  **And** Summary cards show aggregated data from all transactions
  **And** The recent transactions list shows only the last 50 by default

- **Given** I have 10,000+ transactions
  **When** I scroll through the transaction list
  **Then** Virtual scrolling renders only visible rows
  **And** Scrolling is smooth (60 fps)
  **And** Additional rows load progressively as I scroll

- **Given** I search across all my data
  **When** I type a search query
  **Then** Results appear within 500ms
  **And** Only the first 20 results are displayed
  **And** I can load more with "Show more results"

- **Given** The initial load is slow due to data volume
  **When** The app starts
  **Then** I see a loading skeleton immediately
  **And** Critical data (current month) loads first
  **And** Historical data loads in the background
  **And** A progress indicator shows loading status

**Priority:** Medium  
**Subdomain:** Framework (Performance)  
**Platform:** All

---

### Story 14: Graceful Error Handling

**As a** user encountering errors  
**I want to** understand what went wrong and what I can do  
**So that** I'm not frustrated by cryptic error messages

**Acceptance Criteria:**
- **Given** The backend API is unreachable
  **When** I try to create a transaction
  **Then** I see a user-friendly message: "Unable to reach the server. Your change has been saved locally and will sync when the connection is restored."
  **And** The transaction is added to the sync queue
  **And** I can continue working offline

- **Given** I try to delete a transaction that's linked to other entities
  **When** I click "Delete"
  **Then** I see a warning: "This transaction is linked to a Health Event. Deleting it will remove the link. Continue?"
  **And** Options: [Keep Transaction] [Delete Anyway]

- **Given** A database query times out
  **When** The timeout occurs
  **Then** I see: "This operation is taking longer than expected. [Keep Waiting] [Cancel]"
  **And** If I cancel, I return to the previous screen
  **And** The operation continues in the background

- **Given** An unexpected error occurs
  **When** The error is caught
  **Then** I see: "Something went wrong. Our team has been notified."
  **And** Error details are logged to the error tracking service
  **And** I can click "Report Issue" to add context
  **And** The app remains functional (no crash)

**Priority:** High  
**Subdomain:** Framework  
**Platform:** All

---

# 11. Non-Functional Requirements

## 11.1 Performance Benchmarks

### 11.1.1 Response Time Targets

**Desktop Application:**
- App launch (cold start): < 3 seconds to interactive
- App launch (warm start): < 1 second to interactive
- Dashboard load: < 500ms
- Transaction list load (50 items): < 200ms
- Search results: < 300ms from last keystroke
- Quick capture save: < 100ms (optimistic) + background sync
- Navigation between subdomains: < 300ms (animation time)
- Graph visualization load (50 nodes): < 1 second

**Progressive Web App:**
- Initial page load: < 3 seconds (3G connection)
- Time to interactive: < 5 seconds (3G connection)
- Dashboard load (cached): < 1 second
- Quick capture: < 200ms to show form
- Offline data access: < 100ms (IndexedDB lookup)

**Backend API:**
- Simple CRUD operations: < 100ms (p95)
- Complex Neo4j queries: < 500ms (p95)
- Search queries: < 300ms (p95)
- Relationship discovery: < 2 seconds (p95)
- Bulk operations (100 items): < 3 seconds

**Database Query Performance:**
- Neo4j simple traversal (1-2 hops): < 50ms
- Neo4j complex traversal (3+ hops): < 200ms
- Neo4j full-text search: < 100ms
- MongoDB document fetch: < 10ms
- MongoDB complex aggregation: < 200ms

### 11.1.2 Throughput Requirements

**Personal Use (Phase 1):**
- Support 1 user with ~100 operations/day
- Database writes: ~10/hour during active use
- Database reads: ~100/hour during active use

**Beta Phase (Phase 2):**
- Support 10 concurrent users
- Handle 1,000 API requests/hour
- Process 100 sync operations/minute

**Commercial Launch (Phase 3+):**
- Support 1,000+ concurrent users
- Handle 100,000 API requests/hour
- Process 10,000 sync operations/minute
- Background jobs: Process 1,000 relationship discoveries/hour

### 11.1.3 Resource Usage Limits

**Desktop Application:**
- Memory usage: < 500 MB during normal operation
- Memory usage: < 1 GB peak (with large datasets)
- CPU usage: < 10% idle, < 50% during operations
- Disk space: < 100 MB for application, ~1 GB for local cache per year of data

**Progressive Web App:**
- JavaScript bundle size: < 500 KB gzipped
- Initial download: < 2 MB total
- IndexedDB storage: < 50 MB (automatic cleanup of old data)
- Memory usage: < 150 MB on mobile devices

**Backend API:**
- Memory per request: < 50 MB
- CPU per request: < 100ms CPU time
- Database connection pool: 20-50 connections

## 11.2 Scalability Targets

### 11.2.1 Data Volume

**Per User:**
- Transactions: Support 50,000+ (10 years × ~14/day)
- Workouts: Support 3,650+ (10 years × daily)
- Tasks: Support 10,000+ (including completed)
- Events: Support 10,000+
- Relationships: Support 100,000+ (10x entities)

**System-Wide (Phase 3):**
- Total users: 10,000
- Total transactions: 500 million
- Total Neo4j nodes: 2 billion
- Total Neo4j relationships: 10 billion

### 11.2.2 Horizontal Scaling Strategy

**Backend API:**
- Stateless design allows horizontal scaling
- Deploy multiple API instances behind load balancer
- Each instance can handle 1,000 requests/minute

**Databases:**
- Neo4j: Upgrade to Aura Professional for read replicas
- MongoDB: Use sharding for horizontal scaling
- Redis: Cache layer to reduce database load

**CDN & Assets:**
- Static assets served via CDN (Cloudflare)
- PWA assets cached at edge locations
- Reduces origin load by 80%+

### 11.2.3 Vertical Scaling Thresholds

**Neo4j:**
- Personal use: 8 GB RAM, 2 vCPU sufficient
- 100 users: 16 GB RAM, 4 vCPU
- 1,000 users: 32 GB RAM, 8 vCPU
- 10,000 users: 64 GB RAM, 16 vCPU + read replicas

**MongoDB:**
- Personal use: 2 GB RAM sufficient
- 100 users: 4 GB RAM
- 1,000 users: 16 GB RAM
- 10,000 users: 32 GB RAM + sharding

**Backend API:**
- Personal use: 512 MB RAM per instance
- Production: 2 GB RAM per instance
- Scale horizontally by adding instances

## 11.3 Security Requirements

### 11.3.1 Authentication

**Requirements:**
- Email/password authentication with bcrypt hashing (cost factor: 12)
- OAuth 2.0 support (Google, GitHub)
- JWT tokens for API authentication
  - Access token: 15 minute expiry
  - Refresh token: 30 day expiry, HTTP-only cookie
- Multi-device session management
- Account linking for Alexa (OAuth 2.0 flow)

**Password Policy:**
- Minimum 8 characters
- Must include: uppercase, lowercase, number
- No common passwords (check against breach database)
- Password reset via email with expiring token (1 hour)

### 11.3.2 Authorization

**Access Control:**
- User can only access their own data
- No cross-user data leakage
- Role-based access (future: admin, user)

**API Security:**
- All endpoints require authentication (except /auth/*)
- Rate limiting: 100 requests/minute per user
- Request signing for sensitive operations

### 11.3.3 Data Encryption

**At Rest:**
- MongoDB: Encryption at rest (AES-256)
- Neo4j: Encryption at rest (AES-256)
- Local storage (desktop): Encrypted with user-specific key
- Backups: Encrypted before storage

**In Transit:**
- All API traffic: HTTPS/TLS 1.3
- WebSocket: WSS (WebSocket Secure)
- Database connections: TLS encryption
- Certificate pinning for mobile app

### 11.3.4 Privacy & Data Protection

**Data Ownership:**
- Users own all their data
- Export available in standard formats (JSON, CSV)
- Account deletion removes all user data within 30 days

**Data Minimization:**
- Collect only essential data
- No tracking of user behavior beyond analytics opt-in
- No third-party data sharing

**Logging & Monitoring:**
- Log only necessary info (no sensitive data in logs)
- PII removed from error logs
- Logs retained for 90 days

## 11.4 Reliability

### 11.4.1 Availability Targets

**Phase 1 (Personal Use):**
- Target: 95% uptime (reasonable for self-hosted)
- Acceptable downtime: ~36 hours/month
- Maintenance windows: Announced, off-peak hours

**Phase 2-3 (Beta/Commercial):**
- Target: 99.5% uptime
- Acceptable downtime: ~3.6 hours/month
- Maintenance windows: < 2 hours/month, announced 48 hours ahead

**Phase 4+ (Scale):**
- Target: 99.9% uptime
- Acceptable downtime: ~43 minutes/month
- Zero-downtime deployments

### 11.4.2 Data Integrity

**Backup Strategy:**
- **Neo4j:**
  - Daily full backups (retained 30 days)
  - Point-in-time recovery via transaction logs
  - Backups stored in separate region
  
- **MongoDB:**
  - Continuous backups (Atlas automated)
  - Point-in-time recovery within 7 days
  - Backups stored in separate region

- **Verification:**
  - Weekly backup restoration test
  - Automated integrity checks
  - Checksum verification

**Data Loss Prevention:**
- Target: Zero data loss (RPO = 0)
- Transaction logs ensure consistency
- Sync queue preserved even if app crashes

### 11.4.3 Disaster Recovery

**Recovery Time Objective (RTO):**
- Personal use: 24 hours acceptable
- Commercial: 4 hours max

**Recovery Point Objective (RPO):**
- Personal use: 24 hours of data loss acceptable
- Commercial: < 1 hour of data loss

**Disaster Recovery Plan:**
1. Maintain backups in geographically separate region
2. Document restoration procedures
3. Quarterly DR drills
4. Automated failover (commercial phase)

## 11.5 Maintainability

### 11.5.1 Code Quality Standards

**Linting & Formatting:**
- ESLint for JavaScript/TypeScript
- Prettier for consistent formatting
- Pre-commit hooks enforce standards

**Code Review:**
- All changes require review (even solo: review own code after 24hr)
- Checklist: Tests pass, docs updated, no secrets in code

**Testing Requirements:**
- Unit test coverage: > 70%
- Integration tests for critical paths
- E2E tests for user workflows
- Performance regression tests

### 11.5.2 Documentation

**Code Documentation:**
- JSDoc comments for public APIs
- README in each subdomain directory
- Architecture Decision Records (ADRs) for major decisions

**User Documentation:**
- Getting started guide
- Feature documentation
- Troubleshooting guide
- API documentation (OpenAPI spec)

**Developer Documentation:**
- Setup instructions
- Development workflow
- Deployment procedures
- Database schema documentation

### 11.5.3 Monitoring & Observability

**Application Monitoring:**
- Error tracking: Sentry
- Performance monitoring: Response times, memory usage
- Uptime monitoring: UptimeRobot
- Alerts: Slack notifications for critical errors

**Logging:**
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized log aggregation: Papertrail/Better Stack
- Log retention: 90 days

**Metrics:**
- API request rates and latency
- Database query performance
- Sync success/failure rates
- User engagement metrics (opt-in)

## 11.6 Accessibility

### 11.6.1 WCAG Compliance

**Target: WCAG 2.1 Level AA**

**Perceivable:**
- Text alternatives for images
- Captions for video content (if any)
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- Don't rely solely on color to convey information

**Operable:**
- All functionality accessible via keyboard
- No keyboard traps
- Generous click/tap targets (44×44px minimum on mobile)
- Sufficient time for interactions (no aggressive timeouts)

**Understandable:**
- Clear, simple language
- Consistent navigation
- Error messages explain what went wrong and how to fix
- Labels and instructions for form fields

**Robust:**
- Valid, semantic HTML
- Compatible with assistive technologies
- Graceful degradation for older browsers

### 11.6.2 Internationalization (Future)

**Phase 1:** English only  
**Phase 3+:**
- Support multiple languages (Spanish, French, German, Chinese)
- Date/time formatting per locale
- Currency formatting per locale
- RTL language support (Arabic, Hebrew)

---

# 12. Development Roadmap

## 12.1 Phase 1: Foundation (Months 1-3)

### Month 1: Architecture & Financial Subdomain

**Week 1-2: Setup & Architecture**
- Set up development environment
- Initialize project repositories (desktop, backend, PWA)
- Configure Neo4j and MongoDB (local)
- Implement authentication (JWT)
- Create base UI components library
- Set up CI/CD pipeline (GitHub Actions)

**Week 3-4: Financial Subdomain Core**
- Implement Transaction CRUD (MongoDB + Neo4j)
- Create Account management
- Build Category system
- Desktop: Transaction list with filtering
- Desktop: Transaction detail view
- Basic relationship creation (Transaction → Account → Category)

**Deliverables:**
- ✓ Working authentication
- ✓ Financial subdomain with basic CRUD
- ✓ Desktop app can create and view transactions
- ✓ Data stored in both Neo4j and MongoDB

### Month 2: Carousel & Multi-Subdomain

**Week 5-6: Framework Components**
- Build carousel navigation system
- Implement subdomain registry
- Create relationship sidebar component
- Build global search (basic)
- Implement quick capture modal

**Week 7-8: Health Subdomain**
- Implement Meal CRUD
- Implement Workout CRUD
- Implement BodyMetric CRUD
- Create health dashboard
- Create meal/workout logging forms

**Deliverables:**
- ✓ Carousel navigation working
- ✓ 2 subdomains operational (Financial, Health)
- ✓ Can switch between subdomains
- ✓ Quick capture works for both subdomains

### Month 3: Schedule & Neo4j Relationships

**Week 9-10: Schedule Subdomain**
- Implement Task CRUD
- Implement Event CRUD
- Create calendar view
- Implement recurring tasks
- Build task dependencies

**Week 11-12: Relationship Discovery**
- Implement temporal relationship discovery
- Build relationship discovery background job
- Create relationship explorer (graph viz)
- Implement relationship suggestions
- Test cross-domain relationships

**Deliverables:**
- ✓ 3 subdomains fully operational
- ✓ Relationship discovery working
- ✓ Can explore relationships visually
- ✓ Cross-domain relationships created automatically

**Phase 1 Milestone: Personal MVP**
- All 3 subdomains functional on desktop
- Neo4j relationships working
- Can manage daily personal data
- Ready for daily personal use

---

## 12.2 Phase 2: Expansion (Months 4-6)

### Month 4: PWA Foundation

**Week 13-14: PWA Setup**
- Set up Next.js PWA project
- Implement service worker
- Create mobile-optimized UI components
- Implement IndexedDB storage
- Build offline detection and sync queue

**Week 15-16: PWA Subdomains**
- Port Financial dashboard to PWA
- Port Health dashboard to PWA
- Port Schedule dashboard to PWA
- Implement mobile quick capture
- Test offline functionality

**Deliverables:**
- ✓ PWA installable on mobile
- ✓ All subdomains accessible on mobile
- ✓ Offline mode working
- ✓ Data syncs between desktop and mobile

### Month 5: Sync & Performance

**Week 17-18: Real-Time Sync**
- Implement WebSocket server
- Build WebSocket client for desktop
- Build WebSocket client for PWA
- Implement conflict resolution (LWW)
- Test multi-device sync scenarios

**Week 19-20: Performance Optimization**
- Implement virtual scrolling for large lists
- Add caching layer (Redis)
- Optimize Neo4j queries (indexes, query tuning)
- Implement lazy loading for subdomains
- Performance testing and profiling

**Deliverables:**
- ✓ Real-time sync between devices
- ✓ Handles 10,000+ entities smoothly
- ✓ Dashboard loads in < 500ms
- ✓ Search returns results in < 300ms

### Month 6: Enhanced Features

**Week 21-22: Advanced Financial**
- Implement budget tracking with alerts
- Add net worth tracking over time
- Create spending reports and charts
- Build financial goal tracking
- Add transaction auto-categorization

**Week 23-24: Advanced Health**
- Implement workout streak tracking
- Add calorie goal calculator
- Create health reports (weight trends, workout frequency)
- Build health goal tracking
- Add meal templates

**Deliverables:**
- ✓ Budget tracking fully functional
- ✓ Health goal tracking operational
- ✓ Reports and visualizations working
- ✓ System used daily without friction

**Phase 2 Milestone: Multi-Platform Parity**
- Desktop and PWA feature-complete
- Seamless sync between devices
- 5+ weeks of daily personal use
- Performance targets met

---

## 12.3 Phase 3: Multi-Platform (Months 7-9)

### Month 7: Echo Show Development

**Week 25-26: Alexa Skill Setup**
- Create Alexa skill in Developer Console
- Set up AWS Lambda function
- Implement basic intents (ViewDashboard, DailySummary)
- Build account linking OAuth flow
- Create APL templates for Echo Show

**Week 27-28: Voice Interactions**
- Implement LogExpense intent
- Implement voice-based quick capture
- Build conversation flows
- Create Echo Show visual cards
- Test voice recognition accuracy

**Deliverables:**
- ✓ Alexa skill published (development)
- ✓ Can view dashboards via voice
- ✓ Can log data via voice
- ✓ Echo Show displays visual summaries

### Month 8: Cross-Platform Polish

**Week 29-30: UI/UX Refinement**
- Conduct usability testing (self + 2-3 friends)
- Refine desktop UI based on feedback
- Refine mobile UI based on feedback
- Improve error messages
- Add loading states and skeletons

**Week 31-32: Edge Cases**
- Handle large datasets (10,000+ transactions)
- Improve offline mode edge cases
- Fix sync conflicts scenarios
- Add comprehensive error handling
- Performance tuning

**Deliverables:**
- ✓ UI polished based on feedback
- ✓ Edge cases handled gracefully
- ✓ No critical bugs
- ✓ System stable for daily use

### Month 9: Plugin Architecture

**Week 33-34: Plugin System**
- Design subdomain plugin API
- Implement subdomain registry
- Create example custom subdomain
- Document plugin development guide
- Build subdomain marketplace UI (placeholder)

**Week 35-36: Documentation & Preparation**
- Write user documentation
- Create video tutorials (screen recordings)
- Document API

---

# 13. Testing Strategy

## 13.1 Testing Philosophy for Solo Developer

As a solo developer, comprehensive testing is crucial but must be pragmatic. The strategy balances thorough coverage with development velocity.

**Priorities:**
1. **Automated tests for critical paths** - Prevent regressions in core functionality
2. **Manual testing for UI/UX** - Ensure quality user experience
3. **Integration tests for sync** - Most complex and failure-prone area
4. **Performance benchmarks** - Catch performance regressions early

**Pragmatic Approach:**
- Write tests for code you're likely to break
- Test business logic thoroughly, UI moderately
- Automate repetitive manual tests
- Accept some manual testing is necessary

## 13.2 Unit Testing

### 13.2.1 Tools and Framework

**JavaScript/TypeScript:**
- Framework: Jest
- React Testing: React Testing Library
- Coverage: Istanbul (built into Jest)
- Mocking: Jest mock functions

**Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/types/**/*'
  ]
};
```

### 13.2.2 What to Unit Test

**Business Logic (High Priority):**

```typescript
// utils/budget.test.ts
import { calculateBudgetProgress, getBudgetStatus } from './budget';

describe('Budget calculations', () => {
  describe('calculateBudgetProgress', () => {
    it('should calculate percentage correctly', () => {
      const result = calculateBudgetProgress(750, 1000);
      expect(result).toBe(75);
    });
    
    it('should handle zero budget', () => {
      const result = calculateBudgetProgress(100, 0);
      expect(result).toBe(0);
    });
    
    it('should handle over-budget scenarios', () => {
      const result = calculateBudgetProgress(1200, 1000);
      expect(result).toBe(120);
    });
  });
  
  describe('getBudgetStatus', () => {
    it('should return "on-track" when under 80%', () => {
      expect(getBudgetStatus(700, 1000)).toBe('on-track');
    });
    
    it('should return "warning" when 80-100%', () => {
      expect(getBudgetStatus(900, 1000)).toBe('warning');
    });
    
    it('should return "over-budget" when over 100%', () => {
      expect(getBudgetStatus(1100, 1000)).toBe('over-budget');
    });
  });
});
```

**Data Transformations:**

```typescript
// services/neo4j.test.ts
import { transformNeo4jResult } from './neo4j.service';

describe('Neo4j result transformation', () => {
  it('should transform Neo4j integer to JavaScript number', () => {
    const neo4jResult = {
      records: [{
        get: (key) => neo4j.int(42)
      }]
    };
    
    const result = transformNeo4jResult(neo4jResult);
    expect(result[0]).toBe(42);
    expect(typeof result[0]).toBe('number');
  });
  
  it('should handle null values', () => {
    const neo4jResult = {
      records: [{
        get: (key) => null
      }]
    };
    
    const result = transformNeo4jResult(neo4jResult);
    expect(result[0]).toBeNull();
  });
});
```

**Validation Logic:**

```typescript
// utils/validation.test.ts
import { validateTransaction } from './validation';

describe('Transaction validation', () => {
  const validTransaction = {
    amount: -45.67,
    description: 'Whole Foods',
    date: '2025-10-23',
    accountId: 'account-123'
  };
  
  it('should pass for valid transaction', () => {
    const result = validateTransaction(validTransaction);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should fail when amount is zero', () => {
    const result = validateTransaction({
      ...validTransaction,
      amount: 0
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount cannot be zero');
  });
  
  it('should fail when description is empty', () => {
    const result = validateTransaction({
      ...validTransaction,
      description: ''
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Description is required');
  });
  
  it('should fail for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    const result = validateTransaction({
      ...validTransaction,
      date: futureDate.toISOString().split('T')[0]
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Date cannot be in the future');
  });
});
```

**React Components (Critical UI Logic):**

```typescript
// components/TransactionRow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionRow from './TransactionRow';

describe('TransactionRow', () => {
  const mockTransaction = {
    id: 'txn-123',
    amount: -45.67,
    description: 'Whole Foods',
    date: '2025-10-23',
    category: 'Groceries'
  };
  
  it('should render transaction details', () => {
    render(<TransactionRow transaction={mockTransaction} />);
    
    expect(screen.getByText('Whole Foods')).toBeInTheDocument();
    expect(screen.getByText('$45.67')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });
  
  it('should format negative amounts in red', () => {
    render(<TransactionRow transaction={mockTransaction} />);
    
    const amountElement = screen.getByText('$45.67');
    expect(amountElement).toHaveClass('text-red-600');
  });
  
  it('should call onClick when row is clicked', () => {
    const handleClick = jest.fn();
    render(
      <TransactionRow 
        transaction={mockTransaction} 
        onClick={handleClick} 
      />
    );
    
    fireEvent.click(screen.getByText('Whole Foods'));
    expect(handleClick).toHaveBeenCalledWith(mockTransaction);
  });
  
  it('should show relationship indicator when relationships exist', () => {
    const txnWithRelationships = {
      ...mockTransaction,
      hasRelationships: true
    };
    
    render(<TransactionRow transaction={txnWithRelationships} />);
    expect(screen.getByLabelText('Has relationships')).toBeInTheDocument();
  });
});
```

### 13.2.3 Coverage Goals

**Target Coverage:**
- Business logic: 90%+
- Data transformations: 90%+
- Validation: 90%+
- React components: 70%+
- Utility functions: 80%+
- Overall: 70%+

**What Not to Unit Test:**
- Third-party library code
- Simple getters/setters
- Configuration files
- Types/interfaces
- Trivial functions (e.g., `add(a, b) { return a + b; }`)

## 13.3 Integration Testing

### 13.3.1 Database Integration Tests

**Neo4j Integration:**

```typescript
// services/neo4j.integration.test.ts
import { neo4jService } from './neo4j.service';

describe('Neo4j Integration', () => {
  beforeAll(async () => {
    await neo4jService.connect(
      process.env.NEO4J_TEST_URI,
      process.env.NEO4J_TEST_USER,
      process.env.NEO4J_TEST_PASSWORD
    );
  });
  
  afterAll(async () => {
    await neo4jService.close();
  });
  
  beforeEach(async () => {
    // Clear test database
    await neo4jService.query('MATCH (n) DETACH DELETE n');
  });
  
  describe('Transaction creation', () => {
    it('should create transaction with relationships', async () => {
      // Create user
      await neo4jService.query(`
        CREATE (u:User {id: 'user-test', name: 'Test User'})
      `);
      
      // Create account
      await neo4jService.query(`
        MATCH (u:User {id: 'user-test'})
        CREATE (a:Account {id: 'account-test', name: 'Test Account'})
        CREATE (u)-[:OWNS]->(a)
      `);
      
      // Create transaction
      await neo4jService.query(`
        MATCH (a:Account {id: 'account-test'})
        CREATE (t:Transaction {
          id: 'txn-test',
          amount: -45.67,
          description: 'Test Transaction',
          date: date('2025-10-23')
        })
        CREATE (t)-[:PAID_WITH]->(a)
      `);
      
      // Verify transaction exists with relationship
      const result = await neo4jService.query(`
        MATCH (t:Transaction {id: 'txn-test'})-[:PAID_WITH]->(a:Account)
        RETURN t, a
      `);
      
      expect(result).toHaveLength(1);
      expect(result[0].t.properties.amount).toBe(-45.67);
      expect(result[0].a.properties.name).toBe('Test Account');
    });
    
    it('should handle transaction rollback on error', async () => {
      const session = neo4jService.session();
      const txn = session.beginTransaction();
      
      try {
        await txn.run(`CREATE (t:Transaction {id: 'txn-1'})`);
        // Simulate error
        throw new Error('Simulated error');
      } catch (error) {
        await txn.rollback();
      } finally {
        await session.close();
      }
      
      // Verify transaction was rolled back
      const result = await neo4jService.query(`
        MATCH (t:Transaction {id: 'txn-1'})
        RETURN t
      `);
      
      expect(result).toHaveLength(0);
    });
  });
  
  describe('Relationship discovery', () => {
    it('should find temporal correlations', async () => {
      // Create transaction
      await neo4jService.query(`
        CREATE (t:Transaction {
          id: 'txn-1',
          description: 'Dr. Smith Copay',
          date: date('2025-10-23')
        })
      `);
      
      // Create health event on same date
      await neo4jService.query(`
        CREATE (h:HealthEvent {
          id: 'health-1',
          title: 'Appointment with Dr. Smith',
          date: date('2025-10-23')
        })
      `);
      
      // Run discovery query
      const result = await neo4jService.query(`
        MATCH (t:Transaction)-[:OCCURRED_ON]->(d:Date)
        MATCH (h:HealthEvent)-[:OCCURRED_ON]->(d)
        WHERE t.description CONTAINS 'Dr. Smith'
          AND h.title CONTAINS 'Dr. Smith'
        RETURN t, h, d
      `);
      
      expect(result).toHaveLength(1);
    });
  });
});
```

**MongoDB + Neo4j Consistency:**

```typescript
// services/transaction.integration.test.ts
describe('Transaction Service Integration', () => {
  it('should maintain consistency between MongoDB and Neo4j', async () => {
    const transactionData = {
      amount: -45.67,
      description: 'Test Transaction',
      date: '2025-10-23',
      accountId: 'account-test'
    };
    
    // Create transaction (should write to both databases)
    const transaction = await transactionService.create(transactionData);
    
    // Verify MongoDB
    const mongoDoc = await TransactionModel.findOne({ _id: transaction._id });
    expect(mongoDoc).not.toBeNull();
    expect(mongoDoc.amount).toBe(-45.67);
    
    // Verify Neo4j
    const neo4jResult = await neo4jService.query(`
      MATCH (t:Transaction {id: $id})
      RETURN t
    `, { id: transaction.neo4jId });
    
    expect(neo4jResult).toHaveLength(1);
    expect(neo4jResult[0].t.properties.amount).toBe(-45.67);
    
    // Verify IDs match
    expect(mongoDoc.neo4jId).toBe(transaction.neo4jId);
  });
  
  it('should rollback both databases on failure', async () => {
    // Mock Neo4j to fail
    jest.spyOn(neo4jService, 'query').mockRejectedValueOnce(
      new Error('Neo4j error')
    );
    
    const transactionData = {
      amount: -45.67,
      description: 'Test Transaction',
      date: '2025-10-23',
      accountId: 'account-test'
    };
    
    // Attempt to create (should fail and rollback)
    await expect(
      transactionService.create(transactionData)
    ).rejects.toThrow();
    
    // Verify MongoDB was rolled back
    const mongoDoc = await TransactionModel.findOne({
      description: 'Test Transaction'
    });
    expect(mongoDoc).toBeNull();
  });
});
```

### 13.3.2 API Integration Tests

```typescript
// api/transactions.integration.test.ts
import request from 'supertest';
import app from '../app';

describe('Transactions API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });
    
    authToken = response.body.token;
  });
  
  describe('POST /api/financial/transactions', () => {
    it('should create transaction with valid data', async () => {
      const response = await request(app)
        .post('/api/financial/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -45.67,
          description: 'Test Transaction',
          date: '2025-10-23',
          accountId: 'account-123',
          categoryId: 'category-123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        amount: -45.67,
        description: 'Test Transaction'
      });
    });
    
    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/financial/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 0, // Invalid
          description: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/financial/transactions')
        .send({
          amount: -45.67,
          description: 'Test'
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/financial/transactions/:id', () => {
    it('should return transaction with relationships', async () => {
      // Create transaction first
      const createResponse = await request(app)
        .post('/api/financial/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -45.67,
          description: 'Test',
          date: '2025-10-23',
          accountId: 'account-123'
        });
      
      const transactionId = createResponse.body.data.id;
      
      // Fetch transaction
      const response = await request(app)
        .get(`/api/financial/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: transactionId,
        amount: -45.67,
        description: 'Test'
      });
    });
  });
});
```

### 13.3.3 Sync Integration Tests

**Critical for Multi-Device Support:**

```typescript
// services/sync.integration.test.ts
describe('Sync Service Integration', () => {
  let device1Client: WebSocket;
  let device2Client: WebSocket;
  
  beforeEach(() => {
    device1Client = new WebSocket('ws://localhost:8080?token=test-token');
    device2Client = new WebSocket('ws://localhost:8080?token=test-token');
  });
  
  afterEach(() => {
    device1Client.close();
    device2Client.close();
  });
  
  it('should sync transaction creation across devices', async () => {
    // Wait for connections
    await Promise.all([
      waitForOpen(device1Client),
      waitForOpen(device2Client)
    ]);
    
    // Create transaction on device 1
    const transaction = await createTransaction(device1Client, {
      amount: -45.67,
      description: 'Test Transaction'
    });
    
    // Device 2 should receive update
    const update = await waitForMessage(device2Client);
    
    expect(update.type).toBe('ENTITY_CREATED');
    expect(update.entity).toBe('Transaction');
    expect(update.data.id).toBe(transaction.id);
    expect(update.data.amount).toBe(-45.67);
  });
  
  it('should handle conflict resolution', async () => {
    // Create transaction
    const transaction = await createTransaction(device1Client, {
      amount: -45.67,
      description: 'Original'
    });
    
    // Edit on device 1
    const edit1Promise = updateTransaction(device1Client, {
      id: transaction.id,
      description: 'Device 1 Edit'
    });
    
    // Edit on device 2 simultaneously
    const edit2Promise = updateTransaction(device2Client, {
      id: transaction.id,
      description: 'Device 2 Edit'
    });
    
    await Promise.all([edit1Promise, edit2Promise]);
    
    // Fetch final state
    const finalState = await getTransaction(transaction.id);
    
    // Last write wins (whichever completed last)
    expect(finalState.description).toMatch(/Device [12] Edit/);
  });
  
  it('should sync offline changes when reconnected', async () => {
    // Create transaction offline (device 2 disconnected)
    device2Client.close();
    
    const offlineTransaction = {
      tempId: 'temp-123',
      amount: -45.67,
      description: 'Offline Transaction',
      syncStatus: 'pending'
    };
    
    // Add to sync queue
    await addToSyncQueue(offlineTransaction);
    
    // Reconnect device 2
    device2Client = new WebSocket('ws://localhost:8080?token=test-token');
    await waitForOpen(device2Client);
    
    // Sync should process automatically
    await wait(2000); // Allow time for sync
    
    // Verify transaction was synced
    const transactions = await getAllTransactions();
    const syncedTransaction = transactions.find(
      t => t.description === 'Offline Transaction'
    );
    
    expect(syncedTransaction).toBeDefined();
    expect(syncedTransaction.syncStatus).toBe('synced');
  });
});
```

## 13.4 End-to-End Testing

### 13.4.1 Tools

**Framework:** Playwright (better than Cypress for multi-browser support)

**Why Playwright:**
- Supports Chromium, Firefox, WebKit
- Better for Electron app testing
- Auto-waiting for elements
- Network interception
- Video recording on failure

**Configuration:**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially for data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 }
      }
    }
  ]
});
```

### 13.4.2 Critical User Journeys

**Journey 1: Create Transaction and See in Dashboard:**

```typescript
// e2e/financial-transaction.spec.ts
import { test, expect } from '@playwright/test';

test('create transaction and verify in dashboard', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await expect(page.locator('text=Financial Dashboard')).toBeVisible();
  
  // Open quick capture
  await page.keyboard.press('Control+Shift+N');
  await expect(page.locator('text=Quick Capture')).toBeVisible();
  
  // Fill transaction form
  await page.selectOption('select[name="subdomain"]', 'financial');
  await page.fill('[name="amount"]', '45.67');
  await page.fill('[name="description"]', 'E2E Test Transaction');
  await page.selectOption('[name="category"]', 'groceries');
  
  // Submit
  await page.click('button:has-text("Save")');
  
  // Verify success toast
  await expect(page.locator('text=Transaction saved')).toBeVisible();
  
  // Verify transaction appears in list
  await expect(page.locator('text=E2E Test Transaction')).toBeVisible();
  await expect(page.locator('text=$45.67')).toBeVisible();
});
```

**Journey 2: Cross-Domain Relationship Discovery:**

```typescript
// e2e/relationship-discovery.spec.ts
test('discover cross-domain relationships', async ({ page }) => {
  await login(page);
  
  // Create health event
  await page.goto('/health');
  await page.click('button:has-text("Add Event")');
  await page.fill('[name="title"]', 'Appointment with Dr. Smith');
  await page.fill('[name="date"]', '2025-10-23');
  await page.click('button:has-text("Save")');
  
  // Create related transaction
  await page.goto('/financial');
  await page.keyboard.press('Control+Shift+N');
  await page.fill('[name="amount"]', '30');
  await page.fill('[name="description"]', 'Dr. Smith - Copay');
  await page.fill('[name="date"]', '2025-10-23');
  await page.click('button:has-text("Save")');
  
  // Wait for relationship discovery (background job)
  await page.waitForTimeout(5000);
  
  // View transaction
  await page.click('text=Dr. Smith - Copay');
  
  // Verify relationship sidebar shows health event
  await expect(
    page.locator('.relationship-sidebar >> text=Appointment with Dr. Smith')
  ).toBeVisible();
  
  // Click relationship to navigate
  await page.click('.relationship-sidebar >> text=Appointment with Dr. Smith');
  
  // Verify navigated to health event
  await expect(page).toHaveURL(/.*\/health\/events\/.*/);
  await expect(page.locator('text=Appointment with Dr. Smith')).toBeVisible();
});
```

**Journey 3: Offline Mode and Sync:**

```typescript
// e2e/offline-sync.spec.ts
test('create data offline and sync when online', async ({ page, context }) => {
  await login(page);
  
  // Go offline
  await context.setOffline(true);
  
  // Create transaction while offline
  await page.keyboard.press('Control+Shift+N');
  await page.fill('[name="amount"]', '25.50');
  await page.fill('[name="description"]', 'Offline Transaction');
  await page.click('button:has-text("Save")');
  
  // Verify saved locally
  await expect(page.locator('text=Saved locally, will sync when online')).toBeVisible();
  await expect(page.locator('text=Offline Transaction')).toBeVisible();
  
  // Verify sync queue indicator
  await expect(page.locator('text=1 pending change')).toBeVisible();
  
  // Go back online
  await context.setOffline(false);
  
  // Wait for sync
  await page.waitForTimeout(2000);
  
  // Verify synced
  await expect(page.locator('text=✓ All changes synced')).toBeVisible();
  await expect(page.locator('text=0 pending changes')).toBeVisible();
  
  // Refresh page to verify data persisted
  await page.reload();
  await expect(page.locator('text=Offline Transaction')).toBeVisible();
});
```

### 13.4.3 E2E Test Coverage Goals

**Must Test:**
- User login/logout
- Create transaction (Financial)
- Create workout (Health)
- Create task (Schedule)
- Cross-domain relationship discovery
- Search across subdomains
- Quick capture from any screen
- Offline mode and sync
- Carousel navigation

**Nice to Have:**
- Complex filtering
- Data export
- Settings changes
- Graph visualization interactions

**Target:** Cover 80% of critical user journeys

## 13.5 Neo4j Query Testing

**Cypher Query Tests:**

```typescript
// queries/financial.test.ts
describe('Financial Neo4j Queries', () => {
  it('should calculate spending by category correctly', async () => {
    // Setup test data
    await neo4jService.query(`
      CREATE (u:User {id: 'user-test'})
      CREATE (c1:Category {id: 'cat-groceries', name: 'Groceries'})
      CREATE (c2:Category {id: 'cat-gas', name: 'Gas'})
      CREATE (t1:Transaction {amount: -45.67})-[:CATEGORIZED_AS]->(c1)
      CREATE (t2:Transaction {amount: -23.50})-[:CATEGORIZED_AS]->(c1)
      CREATE (t3:Transaction {amount: -52.30})-[:CATEGORIZED_AS]->(c2)
    `);
    
    // Run query
    const result = await neo4jService.query(`
      MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
      RETURN c.name as category, sum(abs(t.amount)) as total
      ORDER BY total DESC
    `);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      category: 'Groceries',
      total: 69.17
    });
    expect(result[1]).toEqual({
      category: 'Gas',
      total: 52.30
    });
  });
  
  it('should find relationships within 2 hops', async () => {
    // Create graph: Transaction -> HealthEvent -> Person
    await neo4jService.query(`
      CREATE (t:Transaction {id: 'txn-1'})
      CREATE (h:HealthEvent {id: 'health-1'})
      CREATE (p:Person {id: 'person-1', name: 'Dr. Smith'})
      CREATE (t)-[:RELATED_TO]->(h)
      CREATE (h)-[:INVOLVES]->(p)
    `);
    
    // Find all entities within 2 hops of transaction
    const result = await neo4jService.query(`
      MATCH (t:Transaction {id: 'txn-1'})-[*1..2]-(related)
      RETURN DISTINCT related, labels(related) as types
    `);
    
    expect(result).toHaveLength(2); // HealthEvent and Person
    const types = result.flatMap(r => r.types);
    expect(types).toContain('HealthEvent');
    expect(types).toContain('Person');
  });
});
```

## 13.6 Performance Testing

### 13.6.1 Load Testing with k6

```javascript
// performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  }
};

export default function() {
  // Login
  const loginRes = http.post('http://localhost:3000/api/auth/login', JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'login under 200ms': (r) => r.timings.duration < 200
  });
  
  const token = loginRes.json('token');
  
  // Fetch transactions
  const txnRes = http.get('http://localhost:3000/api/financial/transactions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  check(txnRes, {
    'fetch successful': (r) => r.status === 200,
    'fetch under 500ms': (r) => r.timings.duration < 500
  });
  
  // Create transaction
  const createRes = http.post('http://localhost:3000/api/financial/transactions', JSON.stringify({
    amount: -45.67,
    description: 'Load Test Transaction',
    date: '2025-10-23',
    accountId: 'account-test'
  }), {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  check(createRes, {
    'create successful': (r) => r.status === 201,
    'create under 200ms': (r) => r.timings.duration < 200
  });
  
  sleep(1);
}
```

### 13.6.2 Performance Benchmarks

**Automated Performance Tests:**

```typescript
// performance/benchmarks.test.ts
import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  it('should load dashboard in under 500ms', async () => {
    const start = performance.now();
    
    await page.goto('/financial');
    await page.waitForSelector('.dashboard-loaded');
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
  
  it('should handle 10,000 transactions smoothly', async () => {
    // Create 10,000 test transactions
    await seedDatabase(10000);
    
    const start = performance.now();
    
    await page.goto('/financial/transactions');
    await page.waitForSelector('.transaction-list');
    
    const loadTime = performance.now() - start;
    expect(loadTime).toBeLessThan(2000);
    
    // Test scrolling performance
    const scrollStart = performance.now();
    await page.evaluate(() => {
      const list = document.querySelector('.transaction-list');
      list.scrollTop = list.scrollHeight;
    });
    
    const scrollTime = performance.now() - scrollStart;
    expect(scrollTime).toBeLessThan(100);
  });
  
  it('should return search results in under 300ms', async () => {
    await seedDatabase(1000);
    
    await page.goto('/');
    await page.keyboard.press('Control+K');
    
    const start = performance.now();
    await page.fill('[name="search"]', 'medical');
    await page.waitForSelector('.search-results');
    
    const searchTime = performance.now() - start;
    expect(searchTime).toBeLessThan(300);
  });
});
```

### 13.6.3 Memory Leak Detection

```typescript
// performance/memory-leaks.test.ts
describe('Memory Leak Detection', () => {
  it('should not leak memory on repeated navigation', async () => {
    const initialMemory = await page.evaluate(() => {
      return performance.memory.usedJSHeapSize;
    });
    
    // Navigate between subdomains 100 times
    for (let i = 0; i < 100; i++) {
      await page.click('[data-subdomain="financial"]');
      await page.waitForTimeout(100);
      await page.click('[data-subdomain="health"]');
      await page.waitForTimeout(100);
      await page.click('[data-subdomain="schedule"]');
      await page.waitForTimeout(100);
    }
    
    // Force garbage collection (if available)
    await page.evaluate(() => {
      if (global.gc) global.gc();
    });
    
    await page.waitForTimeout(1000);
    
    const finalMemory = await page.evaluate(() => {
      return performance.memory.usedJSHeapSize;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    const percentIncrease = (memoryIncrease / initialMemory) * 100;
    
    // Memory should not increase by more than 20% after 300 navigations
    expect(percentIncrease).toBeLessThan(20);
  });
});
```

## 13.7 Cross-Platform Testing

### 13.7.1 Desktop Testing

**Electron-Specific Tests:**

```typescript
// e2e/electron.spec.ts
import { _electron as electron } from 'playwright';

describe('Electron Desktop App', () => {
  let electronApp;
  let window;
  
  beforeAll(async () => {
    electronApp = await electron.launch({ 
      args: ['./dist/main/main.js'] 
    });
    window = await electronApp.firstWindow();
  });
  
  afterAll(async () => {
    await electronApp.close();
  });
  
  it('should launch with correct window size', async () => {
    const size = await window.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    
    expect(size.width).toBeGreaterThan(1000);
    expect(size.height).toBeGreaterThan(600);
  });
  
  it('should respond to global keyboard shortcut', async () => {
    await window.keyboard.press('Control+Shift+N');
    
    await expect(window.locator('text=Quick Capture')).toBeVisible();
  });
  
  it('should persist data locally', async () => {
    // Create transaction
    await createTransaction(window, {
      amount: -45.67,
      description: 'Persistence Test'
    });
    
    // Restart app
    await electronApp.close();
    electronApp = await electron.launch({ 
      args: ['./dist/main/main.js'] 
    });
    window = await electronApp.firstWindow();
    
    // Verify data persisted
    await expect(window.locator('text=Persistence Test')).toBeVisible();
  });
});
```

### 13.7.2 Mobile PWA Testing

**Device-Specific Tests:**

```typescript
// e2e/mobile.spec.ts
import { test, devices } from '@playwright/test';

test.use(devices['iPhone 13']);

describe('Mobile PWA', () => {
  it('should show mobile-optimized layout', async ({ page }) => {
    await page.goto('/');
    
    // Check for mobile navigation
    await expect(page.locator('.mobile-nav')).toBeVisible();
    await expect(page.locator('.desktop-nav')).not.toBeVisible();
    
    // Check for floating action button
    await expect(page.locator('.fab')).toBeVisible();
  });
  
  it('should support swipe navigation', async ({ page }) => {
    await page.goto('/financial');
    
    // Swipe left
    await page.touchscreen.tap(300, 400);
    await page.touchscreen.swipe(300, 400, 50, 400);
    
    // Should navigate to next subdomain
    await expect(page.locator('text=Health Dashboard')).toBeVisible();
  });
  
  it('should be installable as PWA', async ({ page, context }) => {
    await page.goto('/');
    
    // Check for manifest
    const manifest = await page.evaluate(() => {
      return fetch('/manifest.json').then(r => r.json());
    });
    
    expect(manifest.name).toBe('Personal Dashboards');
    expect(manifest.display).toBe('standalone');
  });
  
  it('should work offline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Should still show cached content
    await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    
    // Can create data offline
    await page.click('.fab');
    await page.fill('[name="amount"]', '25.50');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Saved locally')).toBeVisible();
  });
});
```

### 13.7.3 Browser Compatibility Testing

**Test Matrix:**

| Browser | Desktop | Mobile | Priority |
|---------|---------|--------|----------|
| Chrome | ✓ | ✓ | High |
| Firefox | ✓ | ✓ (Android) | High |
| Safari | ✓ (macOS) | ✓ (iOS) | High |
| Edge | ✓ | - | Medium |

**Automated Browser Tests:**

```typescript
// playwright.config.ts - Multiple browsers
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] }
    }
  ]
});
```

## 13.8 Manual Testing Checklist

### 13.8.1 Pre-Release Checklist

**Functionality:**
- [ ] All subdomains load without errors
- [ ] Can create, edit, delete entities in each subdomain
- [ ] Carousel navigation works (keyboard, mouse, touch)
- [ ] Search returns accurate results
- [ ] Quick capture works from all screens
- [ ] Relationship sidebar shows related entities
- [ ] Graph explorer visualizes relationships
- [ ] Settings can be changed and persist

**Cross-Platform:**
- [ ] Desktop app launches on Windows/Mac/Linux
- [ ] PWA installs on mobile (iOS and Android)
- [ ] Echo Show skill responds to voice commands
- [ ] Data syncs between all platforms
- [ ] No sync conflicts or data loss

**Performance:**
- [ ] Dashboard loads in < 500ms
- [ ] Search returns results in < 300ms
- [ ] Scrolling is smooth (60fps) with large datasets
- [ ] No memory leaks after extended use
- [ ] App remains responsive with 10,000+ entities

**Offline:**
- [ ] Can view cached data offline
- [ ] Can create data offline
- [ ] Sync queue shows pending changes
- [ ] Changes sync when back online
- [ ] No data loss during offline/online transitions

**UI/UX:**
- [ ] All text is readable (contrast, size)
- [ ] Buttons and links are easy to click/tap
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Animations are smooth
- [ ] Dark mode works correctly

**Accessibility:**
- [ ] All functionality accessible via keyboard
- [ ] Screen reader announces important changes
- [ ] Color contrast meets WCAG AA
- [ ] No keyboard traps
- [ ] Focus indicators are visible

### 13.8.2 Exploratory Testing Sessions

**Session 1: Normal Use (2 hours)**
- Use the app as a normal user would
- Track finances for a week
- Log workouts and meals
- Create and complete tasks
- Note any friction points

**Session 2: Edge Cases (1 hour)**
- Enter extreme values (very large amounts, long descriptions)
- Try to break validation
- Test with empty states (no data)
- Test with very old dates
- Try unusual workflows

**Session 3: Error Scenarios (1 hour)**
- Disconnect internet mid-operation
- Fill database to capacity
- Simulate database failures
- Test with invalid tokens
- Try rapid repeated actions

**Session 4: Cross-Device (1 hour)**
- Use on 3 devices simultaneously
- Create conflicts intentionally
- Test sync reliability
- Verify consistency

## 13.9 Continuous Integration

### 13.9.1 CI Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
  integration-tests:
    runs-on: ubuntu-latest
    services:
      neo4j:
        image: neo4j:5.13
        env:
          NEO4J_AUTH: neo4j/testpassword
        ports:
          - 7687:7687
          
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
          
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          NEO4J_URI: bolt://localhost:7687
          NEO4J_USER: neo4j
          NEO4J_PASSWORD: testpassword
          MONGODB_URI: mongodb://localhost:27017/test
          
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Build app
        run: npm run build
        
      - name: Start app
        run: npm run start &
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          
  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
          
      - name: Run load tests
        run: k6 run performance/load-test.js
```

### 13.9.2 Pre-Commit Hooks

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run unit tests for staged files
npm run test:unit -- --bail --findRelatedTests $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx) | xargs)
```

## 13.10 Test Data Management

### 13.10.1 Test Data Fixtures

**Seed Data for Tests:**

```typescript
// tests/fixtures/financial.ts
export const testTransactions = [
  {
    id: 'txn-1',
    amount: -45.67,
    description: 'Whole Foods',
    date: '2025-10-23',
    category: 'Groceries',
    account: 'Chase Sapphire'
  },
  {
    id: 'txn-2',
    amount: -156.32,
    description: 'Target',
    date: '2025-10-23',
    category: 'Home',
    account: 'Chase Sapphire'
  },
  {
    id: 'txn-3',
    amount: 3250.00,
    description: 'Paycheck',
    date: '2025-10-22',
    category: 'Income',
    account: 'Checking'
  }
];

export const testAccounts = [
  {
    id: 'account-1',
    name: 'Chase Sapphire',
    type: 'CREDIT_CARD',
    balance: -2543.18,
    creditLimit: 10000
  },
  {
    id: 'account-2',
    name: 'Checking',
    type: 'CHECKING',
    balance: 5432.10
  }
];
```

**Database Seeder:**

```typescript
// tests/seed-database.ts
export async function seedDatabase(count: number = 100) {
  const userId = 'test-user';
  
  // Create user
  await neo4jService.query(`
    MERGE (u:User {id: $userId})
  `, { userId });
  
  // Create accounts
  for (const account of testAccounts) {
    await createAccount(userId, account);
  }
  
  // Create transactions
  const categories = ['Groceries', 'Gas', 'Dining', 'Entertainment', 'Home'];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    await createTransaction(userId, {
      amount: -(Math.random() * 200).toFixed(2),
      description: `Test Transaction ${i}`,
      date: date.toISOString().split('T')[0],
      category: categories[Math.floor(Math.random() * categories.length)],
      accountId: testAccounts[0].id
    });
  }
}

export async function clearDatabase() {
  await neo4jService.query('MATCH (n) DETACH DELETE n');
  await mongoose.connection.db.dropDatabase();
}
```

### 13.10.2 Test Isolation

```typescript
// tests/setup.ts
beforeEach(async () => {
  // Clear database before each test
  await clearDatabase();
  
  // Seed minimal required data
  await seedDatabase(10);
});

afterEach(async () => {
  // Cleanup
  await clearDatabase();
});
```

## 13.11 Bug Tracking and Regression Prevention

### 13.11.1 Bug Report Template

```markdown
## Bug Report

**Title:** Brief description of the bug

**Severity:** Critical / High / Medium / Low

**Environment:**
- Platform: Desktop / PWA / Echo Show
- OS: Windows 11 / macOS / iOS 17 / Android
- Browser: Chrome 119 / Firefox 120 / Safari 17
- App Version: 1.0.0

**Steps to Reproduce:**
1. Navigate to Financial dashboard
2. Click "Add Transaction"
3. Enter amount: -45.67
4. Click "Save"

**Expected Behavior:**
Transaction should be created and appear in the list

**Actual Behavior:**
Error message appears: "Failed to create transaction"

**Screenshots/Videos:**
[Attach relevant media]

**Console Errors:**
```
TypeError: Cannot read property 'id' of undefined
  at createTransaction (transaction.service.ts:45)
```

**Additional Context:**
- Happens only when offline
- Works fine with positive amounts
```

### 13.11.2 Regression Test Suite

**Add Test for Each Fixed Bug:**

```typescript
// tests/regression/bug-fixes.test.ts
describe('Bug Regression Tests', () => {
  it('[BUG-001] should handle offline transaction creation', async () => {
    // This test ensures bug #001 doesn't regress
    // Bug: Negative amounts caused crash when offline
    
    await goOffline();
    
    const transaction = {
      amount: -45.67,
      description: 'Test',
      date: '2025-10-23'
    };
    
    await expect(
      createTransaction(transaction)
    ).resolves.not.toThrow();
  });
  
  it('[BUG-023] should preserve relationships after sync conflict', async () => {
    // Bug: Relationships were deleted during conflict resolution
    
    const txn = await createTransaction({
      amount: -30,
      description: 'Dr. Smith Copay'
    });
    
    const event = await createHealthEvent({
      title: 'Dr. Smith Appointment'
    });
    
    await createRelationship(txn.id, event.id, 'RELATED_TO');
    
    // Simulate sync conflict
    await simulateConflict(txn.id);
    
    // Verify relationship still exists
    const relationships = await getRelationships(txn.id);
    expect(relationships).toHaveLength(1);
    expect(relationships[0].toId).toBe(event.id);
  });
});
```

---

# 14. Success Metrics & Analytics

## 14.1 Overview

Success metrics are divided into three phases aligned with the development roadmap:
- **Phase 1: Personal Use** - Metrics focused on personal productivity and system stability
- **Phase 2: Beta Testing** - Metrics focused on multi-user validation and usability
- **Phase 3: Commercial Launch** - Metrics focused on growth, retention, and revenue

## 14.2 Personal Use Metrics (Phase 1)

### 14.2.1 Daily Active Use

**Definition:** Days per week the system is actively used for data entry or review.

**Measurement:**
```typescript
// Track in local analytics (privacy-first)
interface UsageSession {
  date: string;
  durationMinutes: number;
  actionsPerformed: number;
  subdomainsVisited: string[];
}

function recordSession() {
  const session = {
    date: new Date().toISOString().split('T')[0],
    durationMinutes: calculateSessionDuration(),
    actionsPerformed: getActionCount(),
    subdomainsVisited: getVisitedSubdomains()
  };
  
  localStorage.setItem('lastSession', JSON.stringify(session));
}
```

**Success Criteria:**
- **Week 4:** 3+ days/week active use
- **Week 8:** 5+ days/week active use
- **Week 12:** 7 days/week active use (daily habit established)

**Dashboard Display:**
```
Weekly Activity
Mon Tue Wed Thu Fri Sat Sun
 ✓   ✓   ✓   ✓   ✓   ✓   ✓

Streak: 47 days 🔥
Longest streak: 47 days
```

### 14.2.2 Subdomains Used Per Session

**Definition:** Average number of different subdomains accessed per session.

**Why It Matters:** Indicates if the carousel/multi-subdomain approach is working. High usage across subdomains validates the integration value proposition.

**Measurement:**
```typescript
function calculateSubdomainDiversity() {
  const sessions = getRecentSessions(30); // Last 30 days
  const avgSubdomains = sessions.reduce((sum, s) => 
    sum + s.subdomainsVisited.length, 0
  ) / sessions.length;
  
  return {
    average: avgSubdomains,
    distribution: {
      financial: sessions.filter(s => s.subdomainsVisited.includes('financial')).length,
      health: sessions.filter(s => s.subdomainsVisited.includes('health')).length,
      schedule: sessions.filter(s => s.subdomainsVisited.includes('schedule')).length
    }
  };
}
```

**Success Criteria:**
- **Week 4:** Average 1.5 subdomains/session (exploring)
- **Week 8:** Average 2.0 subdomains/session (using multiple)
- **Week 12:** Average 2.5 subdomains/session (integrated workflow)

**Target:** All 3 subdomains used at least once per day

### 14.2.3 Relationship Discoveries Acted Upon

**Definition:** Number of cross-domain relationships discovered that led to user action.

**What Qualifies as "Acted Upon":**
- User clicks on a relationship to navigate
- User confirms a suggested relationship
- User manually creates a relationship
- User mentions relationship in notes/comments

**Measurement:**
```typescript
interface RelationshipInteraction {
  relationshipId: string;
  discoveryMethod: 'AUTO' | 'MANUAL' | 'SUGGESTED';
  actionType: 'CLICKED' | 'CONFIRMED' | 'CREATED' | 'NOTED';
  timestamp: string;
  valuable: boolean; // User-rated
}

function trackRelationshipValue(relationshipId: string, action: string) {
  const interaction: RelationshipInteraction = {
    relationshipId,
    discoveryMethod: getDiscoveryMethod(relationshipId),
    actionType: action,
    timestamp: new Date().toISOString(),
    valuable: false // Can be updated later
  };
  
  saveInteraction(interaction);
}
```

**Success Criteria:**
- **Week 4:** 5+ valuable relationship discoveries
- **Week 8:** 10+ valuable relationship discoveries per week
- **Week 12:** 15+ valuable relationship discoveries per week

**Example Valuable Relationships:**
- Medical expense linked to health appointment
- Project task linked to financial budget
- Workout completion linked to schedule reminder
- Grocery expense linked to meal log

### 14.2.4 Cross-Domain Queries Performed

**Definition:** Number of searches or queries that span multiple subdomains.

**Measurement:**
```typescript
interface SearchQuery {
  query: string;
  subdomainsSearched: string[];
  resultsCount: number;
  resultSelected: boolean;
  timestamp: string;
}

function recordSearch(query: string, filters: SearchFilters) {
  const searchLog: SearchQuery = {
    query,
    subdomainsSearched: filters.subdomains || ['all'],
    resultsCount: getResultCount(),
    resultSelected: false, // Updated if user clicks a result
    timestamp: new Date().toISOString()
  };
  
  saveSearchLog(searchLog);
}
```

**Success Criteria:**
- **Week 4:** 5+ cross-domain searches per week
- **Week 8:** 10+ cross-domain searches per week
- **Week 12:** 15+ cross-domain searches per week

**Quality Metric:** % of searches resulting in clicked result
- Target: >70% search success rate

### 14.2.5 Time Saved vs. Previous Tools

**Definition:** Self-reported time saved compared to previous multi-app workflow.

**Measurement Method:**
- Weekly self-assessment questionnaire
- Compare time spent on data management tasks

**Weekly Survey:**
```
How much time did you spend this week on:
1. Financial tracking and budgeting? __ minutes
2. Health and fitness logging? __ minutes
3. Schedule and task management? __ minutes
4. Finding information across tools? __ minutes

Total: __ minutes

Previous multi-app workflow took: ~180 minutes/week
```

**Success Criteria:**
- **Week 4:** 20% time reduction (144 min/week)
- **Week 8:** 40% time reduction (108 min/week)
- **Week 12:** 50%+ time reduction (<90 min/week)

### 14.2.6 System Stability

**Definition:** Metrics tracking crashes, errors, and data loss.

**Measurement:**
```typescript
interface ErrorLog {
  timestamp: string;
  errorType: 'CRASH' | 'API_ERROR' | 'SYNC_FAILURE' | 'DATA_LOSS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context: string;
  resolved: boolean;
}

function logError(error: Error, context: string) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    errorType: classifyError(error),
    severity: calculateSeverity(error),
    context,
    resolved: false
  };
  
  // Send to error tracking service (Sentry)
  Sentry.captureException(error, { contexts: { errorLog } });
}
```

**Success Criteria:**
- **Zero tolerance:** No data loss events
- **Crash rate:** <0.1% of sessions
- **Sync failures:** <5% of sync operations
- **API errors:** <1% of requests

**Key Metrics:**
- Mean Time Between Failures (MTBF): >168 hours (1 week)
- Mean Time To Recovery (MTTR): <1 hour

## 14.3 Technical Metrics (Phase 1)

### 14.3.1 Query Performance

**Neo4j Query Performance:**
```typescript
interface QueryMetrics {
  queryType: string;
  executionTime: number;
  resultCount: number;
  timestamp: string;
}

function measureQuery(queryType: string, queryFn: () => Promise<any>) {
  const start = performance.now();
  
  return queryFn().then(results => {
    const executionTime = performance.now() - start;
    
    recordMetric({
      queryType,
      executionTime,
      resultCount: results.length,
      timestamp: new Date().toISOString()
    });
    
    return results;
  });
}
```

**Targets:**
- Simple traversal (1-2 hops): p95 < 50ms
- Complex traversal (3+ hops): p95 < 200ms
- Full-text search: p95 < 100ms
- Relationship discovery: p95 < 2000ms

**Dashboard:**
```
Query Performance (Last 7 Days)
Simple traversal:    p50: 23ms | p95: 45ms | p99: 67ms ✓
Complex traversal:   p50: 89ms | p95: 178ms | p99: 245ms ✓
Full-text search:    p50: 45ms | p95: 87ms | p99: 134ms ✓
Relationship disc.:  p50: 856ms | p95: 1,678ms | p99: 2,134ms ⚠️
```

### 14.3.2 Sync Success Rate

**Definition:** Percentage of sync operations that complete successfully.

**Measurement:**
```typescript
interface SyncOperation {
  id: string;
  type: 'UPLOAD' | 'DOWNLOAD';
  entityCount: number;
  startTime: string;
  endTime?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  retryCount: number;
}

function trackSyncOperation(operation: SyncOperation) {
  saveSyncMetric(operation);
  
  // Calculate metrics
  const last24h = getSyncOperations(24);
  const successRate = last24h.filter(op => op.status === 'SUCCESS').length / last24h.length;
  
  return {
    successRate,
    avgDuration: calculateAvgDuration(last24h),
    failureReasons: groupFailures(last24h)
  };
}
```

**Targets:**
- Overall sync success rate: >95%
- First-attempt success rate: >90%
- Average sync duration: <2 seconds
- Conflict rate: <5%

**Alert Thresholds:**
- Success rate drops below 90%: Warning
- Success rate drops below 80%: Critical
- 3 consecutive failures: Immediate alert

### 14.3.3 Data Loss Events

**Definition:** Any incident where user data is permanently lost or corrupted.

**Target:** **ZERO tolerance**

**Detection:**
```typescript
interface DataIntegrityCheck {
  timestamp: string;
  mongoCount: number;
  neo4jCount: number;
  inconsistencies: Array<{
    mongoId: string;
    neo4jId: string;
    issue: string;
  }>;
}

async function verifyDataIntegrity() {
  const mongoTransactions = await TransactionModel.countDocuments();
  const neo4jTransactions = await neo4jService.query(`
    MATCH (t:Transaction)
    RETURN count(t) as count
  `);
  
  const check: DataIntegrityCheck = {
    timestamp: new Date().toISOString(),
    mongoCount: mongoTransactions,
    neo4jCount: neo4jTransactions[0].count,
    inconsistencies: []
  };
  
  if (mongoTransactions !== neo4jTransactions[0].count) {
    // Alert! Data inconsistency detected
    await alertDataLoss(check);
  }
  
  return check;
}

// Run integrity check daily
setInterval(verifyDataIntegrity, 24 * 60 * 60 * 1000);
```

**Response Protocol:**
1. Immediate notification to developer
2. Halt all write operations
3. Restore from most recent backup
4. Investigate root cause
5. Implement fix and preventive measures

### 14.3.4 Cache Hit Rate

**Definition:** Percentage of data requests served from cache vs. database.

**Measurement:**
```typescript
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgHitTime: number;
  avgMissTime: number;
}

function trackCacheAccess(cacheKey: string, hit: boolean, duration: number) {
  const metric = {
    key: cacheKey,
    hit,
    duration,
    timestamp: new Date().toISOString()
  };
  
  saveCacheMetric(metric);
}
```

**Targets:**
- Overall cache hit rate: >80%
- Dashboard data: >90% hit rate
- Transaction list: >70% hit rate
- Search results: >60% hit rate

## 14.4 Beta Phase Metrics (Phase 2)

### 14.4.1 User Activation Rate

**Definition:** Percentage of new beta users who complete key onboarding steps.

**Onboarding Funnel:**
1. Account created
2. First subdomain configured
3. First entity created (transaction/workout/task)
4. First cross-domain relationship discovered
5. Used on 3 separate days

**Measurement:**
```typescript
interface UserJourney {
  userId: string;
  accountCreated: string;
  onboardingSteps: {
    subdomainConfigured: boolean;
    firstEntityCreated: boolean;
    firstRelationshipDiscovered: boolean;
    threeDayUse: boolean;
  };
  activationDate?: string;
}

function calculateActivationRate() {
  const users = getAllBetaUsers();
  const activated = users.filter(u => 
    u.onboardingSteps.subdomainConfigured &&
    u.onboardingSteps.firstEntityCreated &&
    u.onboardingSteps.firstRelationshipDiscovered &&
    u.onboardingSteps.threeDayUse
  );
  
  return {
    total: users.length,
    activated: activated.length,
    rate: (activated.length / users.length) * 100
  };
}
```

**Targets:**
- Week 1: 50% activation rate
- Week 4: 60% activation rate
- Week 8: 70% activation rate

### 14.4.2 Feature Adoption

**Definition:** Percentage of users who use each major feature.

**Features to Track:**
- Quick capture
- Cross-domain search
- Relationship explorer
- Graph visualization
- Budget tracking
- Workout streak tracking
- Task dependencies

**Measurement:**
```typescript
interface FeatureUsage {
  featureName: string;
  usersWhoUsed: number;
  totalUsers: number;
  adoptionRate: number;
  avgUsagePerUser: number;
}

function trackFeatureUsage(userId: string, feature: string) {
  recordEvent({
    userId,
    event: 'FEATURE_USED',
    feature,
    timestamp: new Date().toISOString()
  });
}
```

**Targets (after 4 weeks of use):**
- Quick capture: >80% adoption
- Cross-domain search: >70% adoption
- Relationship explorer: >50% adoption
- Graph visualization: >30% adoption
- Advanced features: >20% adoption

### 14.4.3 Retention Cohorts

**Definition:** Percentage of users who return after initial signup.

**Cohort Analysis:**
```
Cohort: Week of Oct 1, 2025 (10 users)
Day 1:  100% (10 users)
Day 7:   80% (8 users)
Day 14:  70% (7 users)
Day 30:  60% (6 users)
Day 90:  50% (5 users)
```

**Measurement:**
```typescript
interface Cohort {
  cohortDate: string;
  totalUsers: number;
  retention: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
    day90: number;
  };
}

function calculateCohortRetention(cohortDate: string) {
  const users = getUsersInCohort(cohortDate);
  const retention = {
    day1: users.length,
    day7: users.filter(u => usedOnDay(u, cohortDate, 7)).length,
    day14: users.filter(u => usedOnDay(u, cohortDate, 14)).length,
    day30: users.filter(u => usedOnDay(u, cohortDate, 30)).length,
    day90: users.filter(u => usedOnDay(u, cohortDate, 90)).length
  };
  
  return {
    cohortDate,
    totalUsers: users.length,
    retention
  };
}
```

**Targets:**
- Day 7 retention: >70%
- Day 30 retention: >50%
- Day 90 retention: >40%

### 14.4.4 Net Promoter Score (NPS)

**Definition:** Likelihood users would recommend the product (0-10 scale).

**Survey:**
```
How likely are you to recommend Personal Dashboards to a friend or colleague?

0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10
(Not at all likely)              (Extremely likely)

Why did you give this score?
[Text field]
```

**Calculation:**
```typescript
function calculateNPS(responses: Array<{score: number, reason: string}>) {
  const promoters = responses.filter(r => r.score >= 9).length;
  const detractors = responses.filter(r => r.score <= 6).length;
  const total = responses.length;
  
  const nps = ((promoters - detractors) / total) * 100;
  
  return {
    nps,
    promoters: (promoters / total) * 100,
    passives: ((total - promoters - detractors) / total) * 100,
    detractors: (detractors / total) * 100,
    feedback: responses.map(r => ({
      score: r.score,
      reason: r.reason
    }))
  };
}
```

**Targets:**
- Beta phase: NPS >30 (acceptable)
- Pre-launch: NPS >50 (good)
- Post-launch: NPS >70 (excellent)

### 14.4.5 Sync Conflict Rate

**Definition:** Percentage of sync operations that result in conflicts requiring resolution.

**Measurement:**
```typescript
interface ConflictMetrics {
  totalSyncOps: number;
  conflictsDetected: number;
  conflictRate: number;
  resolutionMethods: {
    automatic: number;
    userPrompted: number;
  };
  dataLossIncidents: number;
}

function trackConflict(conflictType: string, resolution: string) {
  recordEvent({
    event: 'SYNC_CONFLICT',
    conflictType,
    resolution,
    timestamp: new Date().toISOString()
  });
}
```

**Targets:**
- Overall conflict rate: <5%
- Automatic resolution: >95% of conflicts
- User-prompted resolution: <5% of conflicts
- Data loss from conflicts: 0%

## 14.5 Commercial Launch Metrics (Phase 3)

### 14.5.1 Monthly Active Users (MAU)

**Definition:** Number of unique users who perform at least one action per month.

**Measurement:**
```typescript
function calculateMAU(month: string) {
  const users = getAllUsers();
  const activeUsers = users.filter(user => {
    const sessions = getUserSessions(user.id, month);
    return sessions.length > 0;
  });
  
  return {
    mau: activeUsers.length,
    percentActive: (activeUsers.length / users.length) * 100,
    avgSessionsPerUser: calculateAvgSessions(activeUsers, month)
  };
}
```

**Targets:**
- Month 1: 100 MAU
- Month 3: 500 MAU
- Month 6: 1,000 MAU
- Month 12: 5,000 MAU

**Growth Rate Target:** 20-30% month-over-month

### 14.5.2 Free-to-Paid Conversion Rate

**Definition:** Percentage of free users who upgrade to paid plan.

**Pricing Tiers (Proposed):**
- Free: 2 subdomains, 1,000 entities
- Pro ($9/month): Unlimited subdomains, unlimited entities
- Team ($49/month): Multi-user, shared knowledge graphs

**Conversion Funnel:**
```typescript
interface ConversionFunnel {
  freeSignups: number;
  hitLimits: number; // Users who hit free tier limits
  viewedPricing: number;
  startedCheckout: number;
  completedPayment: number;
  conversionRate: number;
}

function trackConversionEvent(userId: string, event: string) {
  recordEvent({
    userId,
    event: `CONVERSION_${event}`,
    timestamp: new Date().toISOString()
  });
}
```

**Targets:**
- Overall conversion rate: 10-15%
- Conversion from hitting limits: 30-40%
- Conversion from viewing pricing: 20-25%
- Checkout abandonment: <30%

**Time to Conversion:**
- Target: Convert within 30 days of signup
- Track: Days from signup to paid conversion

### 14.5.3 Monthly Recurring Revenue (MRR)

**Definition:** Predictable monthly revenue from subscriptions.

**Calculation:**
```typescript
interface RevenueMetrics {
  mrr: number;
  newMrr: number; // From new subscriptions
  expansionMrr: number; // From upgrades
  contractionMrr: number; // From downgrades
  churnedMrr: number; // From cancellations
  netNewMrr: number;
}

function calculateMRR(month: string) {
  const subscriptions = getActiveSubscriptions(month);
  
  const mrr = subscriptions.reduce((sum, sub) => {
    return sum + (sub.planPrice / (sub.billingCycle === 'ANNUAL' ? 12 : 1));
  }, 0);
  
  return {
    mrr,
    newMrr: calculateNewMRR(month),
    expansionMrr: calculateExpansionMRR(month),
    contractionMrr: calculateContractionMRR(month),
    churnedMrr: calculateChurnedMRR(month),
    netNewMrr: calculateNetNewMRR(month)
  };
}
```

**Targets:**
- Month 3: $500 MRR
- Month 6: $2,500 MRR
- Month 12: $5,000 MRR
- Year 2: $25,000 MRR

**MRR Growth Rate:** 15-25% month-over-month

### 14.5.4 Churn Rate

**Definition:** Percentage of users who cancel their subscription per month.

**Types of Churn:**
- Voluntary: User cancels subscription
- Involuntary: Payment failure

**Measurement:**
```typescript
interface ChurnMetrics {
  totalSubscribersStart: number;
  canceledSubscriptions: number;
  failedPayments: number;
  totalChurned: number;
  churnRate: number;
  averageLifetimeMonths: number;
}

function calculateChurnRate(month: string) {
  const startCount = getSubscriberCount(getMonthStart(month));
  const churned = getChurnedSubscribers(month);
  
  return {
    totalSubscribersStart: startCount,
    canceledSubscriptions: churned.filter(c => c.reason === 'VOLUNTARY').length,
    failedPayments: churned.filter(c => c.reason === 'PAYMENT_FAILED').length,
    totalChurned: churned.length,
    churnRate: (churned.length / startCount) * 100,
    averageLifetimeMonths: calculateAvgLifetime(churned)
  };
}
```

**Targets:**
- Monthly churn rate: <5%
- Annual churn rate: <40%
- Average customer lifetime: >20 months

**Churn Reduction Strategies:**
- Exit surveys to understand why
- Win-back campaigns for voluntary churn
- Payment retry logic for involuntary churn

### 14.5.5 Customer Lifetime Value (LTV)

**Definition:** Total revenue expected from a customer over their lifetime.

**Calculation:**
```typescript
function calculateLTV() {
  const avgMonthlyRevenue = 9; // $9/month Pro plan
  const avgLifetimeMonths = 20; // Target from retention
  const grossMargin = 0.80; // 80% gross margin (SaaS typical)
  
  const ltv = avgMonthlyRevenue * avgLifetimeMonths * grossMargin;
  
  return {
    ltv,
    avgMonthlyRevenue,
    avgLifetimeMonths,
    grossMargin
  };
}

// Result: LTV = $144
```

**Target LTV:CAC Ratio:** 3:1 or higher
- If LTV = $144, then CAC should be ≤ $48

### 14.5.6 Customer Acquisition Cost (CAC)

**Definition:** Average cost to acquire one paying customer.

**Calculation:**
```typescript
interface AcquisitionMetrics {
  totalMarketingSpend: number;
  totalSalesSpend: number;
  newCustomersAcquired: number;
  cac: number;
}

function calculateCAC(month: string) {
  const marketingSpend = getMarketingSpend(month);
  const salesSpend = getSalesSpend(month); // $0 for solo, automated sales
  const newCustomers = getNewPayingCustomers(month).length;
  
  const totalSpend = marketingSpend + salesSpend;
  const cac = newCustomers > 0 ? totalSpend / newCustomers : 0;
  
  return {
    totalMarketingSpend: marketingSpend,
    totalSalesSpend: salesSpend,
    newCustomersAcquired: newCustomers,
    cac
  };
}
```

**Targets:**
- CAC < $48 (to maintain 3:1 LTV:CAC)
- CAC payback period: <12 months
- Organic vs. paid acquisition: 60% organic, 40% paid

**Marketing Channels to Track:**
- Organic search (SEO)
- Product Hunt launch
- Reddit / Hacker News
- Content marketing (blog)
- Paid ads (Google, Facebook)
- Referrals

## 14.6 Analytics Implementation

### 14.6.1 Privacy-First Analytics

**Approach:** Track aggregate metrics without personally identifiable information.

**What We Track:**
- Feature usage counts
- Performance metrics
- Error rates
- Session durations
- Conversion funnels

**What We DON'T Track:**
- Personal data content (transaction amounts, descriptions, etc.)
- Personally identifiable information
- Cross-site tracking
- Third-party data sharing

**Implementation:**
```typescript
// services/analytics.service.ts
class AnalyticsService {
  private userId: string;
  private sessionId: string;
  
  trackEvent(event: string, properties?: Record<string, any>) {
    // Hash user ID for privacy
    const hashedUserId = this.hashUserId(this.userId);
    
    const eventData = {
      event,
      properties: {
        ...properties,
        // No PII
      },
      userId: hashedUserId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };
    
    // Send to analytics service (e.g., Plausible, self-hosted Umami)
    this.send(eventData);
  }
  
  private hashUserId(userId: string): string {
    // One-way hash for anonymity
    return crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(userId)
    ).then(buf => {
      return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    });
  }
}
```

### 14.6.2 Analytics Dashboard

**Daily Metrics View:**
```
Personal Dashboard Analytics - Oct 23, 2025

Today's Activity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active Sessions: 3
Total Duration: 2h 15m
Actions Performed: 47
Subdomains Used: Financial, Health, Schedule

This Week
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active Days: 6/7 (86%)
Avg Session Duration: 25 minutes
Relationships Discovered: 12
Cross-Domain Searches: 8

Performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard Load Time: p95 412ms ✓
Search Response: p95 234ms ✓
Sync Success Rate: 98.5% ✓
Errors: 0 ✓

Goals Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Daily Use Streak: 47 days 🔥
Weekly Subdomain Usage: 100% (all 3 used)
Relationship Discovery: 12/10 (120%) ✓
```

### 14.6.3 Error Tracking

**Integration with Sentry:**
```typescript
// Configure Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Remove PII from error reports
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    
    // Sanitize user data
    if (event.user) {
      event.user = {
        id: hashUserId(event.user.id),
        // No email, name, or other PII
      };
    }
    
    return event;
  },
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true, // Mask all text for privacy
      blockAllMedia: true
    })
  ],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

## 14.7 Reporting Cadence

**Daily (Automated):**
- Active sessions count
- Error rate
- Sync success rate
- Performance metrics (p95 response times)

**Weekly (Manual Review):**
- Usage patterns (which subdomains, features)
- Relationship discovery count and quality
- User feedback and issues
- Performance trends

**Monthly (Comprehensive):**
- All Phase 1 metrics
- User satisfaction assessment
- Feature adoption analysis
- Technical debt review
- Goal progress vs. targets

**Quarterly (Strategic):**
- Phase progression evaluation
- Beta readiness assessment (Phase 2)
- Commercial readiness assessment (Phase 3)
- Competitive analysis update
- Roadmap adjustment

---

# 15. Risk Assessment & Mitigation

## 15.1 Risk Assessment Framework

Each risk is evaluated on:
- **Likelihood:** Low / Medium / High
- **Impact:** Low / Medium / High / Critical
- **Risk Score:** Likelihood × Impact (1-9 scale)
- **Phase:** When risk is most relevant
- **Mitigation Strategy:** How to reduce/eliminate risk
- **Contingency Plan:** What to do if risk materializes

**Risk Priority Matrix:**
```
Impact ↑
Critical │  6  │  8  │  9  │
High     │  4  │  6  │  8  │
Medium   │  2  │  4  │  6  │
Low      │  1  │  2  │  3  │
         └─────┴─────┴─────┘
           Low  Med  High
                    → Likelihood
```

---

## 15.2 Technical Risks

### Risk T1: Neo4j Scaling Limitations

**Description:** Neo4j performance degrades significantly as graph grows beyond expected size.

**Likelihood:** Medium  
**Impact:** High  
**Risk Score:** 6  
**Phase:** Phase 2-3 (as data accumulates)

**Indicators:**
- Query times exceed p95 targets (>500ms for complex queries)
- Memory usage exceeds 16GB
- Graph contains >10M nodes or >50M relationships

**Mitigation Strategy:**
1. **Early Performance Testing**
   - Test with 100K+ nodes in development
   - Benchmark queries on realistic graph sizes
   - Profile memory usage patterns

2. **Query Optimization**
   - Add appropriate indexes on frequently queried properties
   - Use query profiling to identify bottlenecks
   - Implement query result caching

3. **Schema Design**
   - Denormalize frequently accessed data
   - Avoid deep traversals (>4 hops)
   - Use relationship properties to filter early

4. **Infrastructure Planning**
   - Plan upgrade path to larger instances
   - Consider read replicas for query load
   - Budget for Neo4j Aura Professional if needed

**Contingency Plan:**
- **If performance degrades:**
  1. Implement aggressive caching layer (Redis)
  2. Archive old data (>2 years) to separate graph
  3. Optimize critical queries or simplify graph model
  4. Upgrade to larger Neo4j instance
  5. Last resort: Implement graph partitioning by user

**Early Warning System:**
```typescript
// Monitor query performance
async function monitorQueryPerformance() {
  const metrics = await getQueryMetrics('last_7_days');
  
  if (metrics.p95 > 500) {
    alertDeveloper({
      severity: 'WARNING',
      message: 'Neo4j p95 query time exceeds target',
      value: metrics.p95,
      threshold: 500
    });
  }
}
```

---

### Risk T2: Cross-Platform Sync Complexity

**Description:** Sync conflicts, data loss, or inconsistencies between devices become frequent and difficult to debug.

**Likelihood:** High  
**Impact:** Critical  
**Risk Score:** 9  
**Phase:** Phase 1-2

**Indicators:**
- Sync conflict rate >10%
- Users report data missing or incorrect
- Support requests about "changes not syncing"
- Automated tests failing intermittently

**Mitigation Strategy:**
1. **Comprehensive Testing**
   - Extensive integration tests for sync scenarios
   - Test with simulated network failures
   - Test concurrent edits from multiple devices
   - Automated chaos testing

2. **Clear Conflict Resolution**
   - Last-write-wins with clear timestamps
   - User notification for significant conflicts
   - Audit log of all sync operations
   - Ability to view conflict history

3. **Incremental Rollout**
   - Start with single-device only (Phase 1 early)
   - Add desktop-mobile sync (Phase 1 late)
   - Add Echo Show read-only (Phase 2)
   - Add full multi-device write (Phase 2 late)

4. **Monitoring & Debugging**
   - Real-time sync success rate dashboard
   - Detailed logging of all sync operations
   - User-facing sync status indicator
   - One-click "force sync" button

**Contingency Plan:**
- **If sync issues become critical:**
  1. Temporarily disable sync, revert to local-only mode
  2. Restore all users from last known good backup
  3. Implement emergency fix
  4. Gradually re-enable sync with enhanced monitoring
  5. Provide users with manual export/import as backup

**Code Example - Sync Safety:**
```typescript
async function safeSyncOperation(operation: SyncOperation) {
  // Create backup point
  const backupId = await createBackupSnapshot();
  
  try {
    await executeSync(operation);
    await verifyDataIntegrity();
    return { success: true };
  } catch (error) {
    // Rollback to backup
    await restoreFromSnapshot(backupId);
    
    // Log for investigation
    await logSyncFailure(operation, error);
    
    return { 
      success: false, 
      error: 'Sync failed, rolled back to safe state' 
    };
  }
}
```

---

### Risk T3: Mobile/Echo Show Development Learning Curve

**Description:** Inexperience with mobile and Echo Show development causes delays, bugs, or suboptimal implementations.

**Likelihood:** High  
**Impact:** Medium  
**Risk Score:** 6  
**Phase:** Phase 2-3

**Indicators:**
- Taking >2x estimated time for mobile/Echo features
- High bug rate in mobile-specific code
- Poor user experience on mobile (crashes, slow performance)
- Alexa skill rejected during certification

**Mitigation Strategy:**
1. **Structured Learning**
   - Complete tutorials before starting development
   - PWA: Next.js PWA documentation, service worker guides
   - Echo Show: Alexa Skills Kit bootcamp, APL tutorials
   - Budget 2-3 weeks for learning per platform

2. **Start Simple**
   - PWA: Basic offline support first, advanced features later
   - Echo Show: Voice-only first, then add visual displays
   - Iterate based on what works

3. **Leverage Existing Solutions**
   - Use established libraries (next-pwa, workbox)
   - Copy patterns from successful PWAs
   - Use Alexa skill templates as starting point
   - Don't reinvent the wheel

4. **Get Help When Needed**
   - Budget for paid consultation ($500-1000)
   - Post specific questions on Stack Overflow
   - Join Discord/Slack communities for PWA and Alexa
   - Consider hiring contractor for initial setup

**Contingency Plan:**
- **If falling significantly behind:**
  1. De-scope mobile features to essentials only
  2. Launch desktop-first, mobile as v1.1
  3. Delay Echo Show to Phase 4 if necessary
  4. Hire specialist for 1-2 week sprint to unblock

**Learning Resources Checklist:**
- [ ] Complete PWA tutorial (2-3 days)
- [ ] Build simple offline-first app (1 week)
- [ ] Complete Alexa Skills Kit tutorial (2-3 days)
- [ ] Build simple Echo Show skill (1 week)
- [ ] Study 3-5 successful open-source PWAs
- [ ] Study 3-5 successful Alexa skills

---

### Risk T4: Data Loss or Corruption

**Description:** Critical bug causes permanent loss of user data.

**Likelihood:** Low  
**Impact:** Critical  
**Risk Score:** 6  
**Phase:** All phases

**Indicators:**
- Data integrity checks failing
- User reports missing data
- MongoDB and Neo4j counts don't match
- Backup restoration failures

**Mitigation Strategy:**
1. **Preventive Measures**
   - Transaction-based writes (all-or-nothing)
   - Daily automated data integrity checks
   - Extensive testing of CRUD operations
   - Input validation on all writes

2. **Robust Backup Strategy**
   - Automated daily backups of Neo4j and MongoDB
   - Backups stored in separate geographic region
   - Weekly backup restoration tests
   - Point-in-time recovery capability
   - User-initiated export before major operations

3. **Monitoring & Alerts**
   - Real-time data integrity monitoring
   - Immediate alerts for inconsistencies
   - User-facing backup status indicator
   - Automated rollback on detected corruption

4. **User Safety Features**
   - Soft deletes (data marked deleted, not removed)
   - 30-day recovery window for deleted items
   - Version history for critical entities
   - "Undo" functionality for destructive operations

**Contingency Plan:**
- **If data loss occurs:**
  1. IMMEDIATE: Stop all write operations
  2. Notify affected users within 1 hour
  3. Restore from most recent backup (<24hr data loss)
  4. Provide users with backup export if available
  5. Conduct root cause analysis
  6. Implement fix and preventive measures
  7. Public incident report and apology

**Code Example - Safe Delete:**
```typescript
async function safeDelete(entityType: string, entityId: string) {
  // Soft delete instead of hard delete
  await mongodb.updateOne(
    { _id: entityId },
    { 
      deleted: true,
      deletedAt: new Date(),
      deletedBy: getCurrentUser()
    }
  );
  
  // Keep in Neo4j with deleted flag
  await neo4j.run(`
    MATCH (n {id: $id})
    SET n.deleted = true, n.deletedAt = datetime()
  `, { id: entityId });
  
  // Can be recovered within 30 days
  scheduleHardDelete(entityId, 30);
}
```

---

## 15.3 Product Risks

### Risk P1: Value Proposition Validation Failure

**Description:** After extensive development, discover that the graph-powered cross-domain insight approach doesn't provide enough value to justify the complexity.

**Likelihood:** Medium  
**Impact:** Critical  
**Risk Score:** 8  
**Phase:** Phase 1

**Indicators:**
- Not discovering meaningful relationships (< 5/week)
- Rarely using relationship sidebar or graph explorer
- Reverting to single-subdomain use
- Not saving significant time vs. previous tools

**Mitigation Strategy:**
1. **Early Validation**
   - Use for real personal data from Day 1 of development
   - Track relationship discoveries weekly
   - Survey self: "Did I learn something valuable this week?"
   - If no valuable insights by Week 8, pivot

2. **Relationship Quality Focus**
   - Prioritize high-value relationships (financial-health, schedule-tasks)
   - Improve discovery algorithms based on what's actually useful
   - Surface insights proactively, not just passively display
   - Make relationship value obvious in UI

3. **Fallback Value**
   - Ensure each subdomain provides standalone value
   - System should be useful even without cross-domain features
   - "Consolidation value" still legitimate (one app vs. five)

4. **Honest Assessment**
   - Weekly reflection: Is this better than previous workflow?
   - Be willing to pivot if not working
   - Don't fall prey to sunk cost fallacy

**Contingency Plan:**
- **If value proposition fails:**
  1. Pivot to best single-subdomain experience (likely Financial)
  2. Drop Neo4j complexity, simplify to single database
  3. Focus on polish and usability of core features
  4. Position as "best personal finance + health tracker"
  5. OR: Stop development, lessons learned, move on

**Validation Checklist (Week 8):**
- [ ] Discovered 10+ valuable cross-domain relationships
- [ ] Actually use relationship sidebar regularly
- [ ] Found insights I wouldn't have noticed manually
- [ ] Saving 30+ minutes per week vs. previous tools
- [ ] Would recommend to a friend

---

### Risk P2: Feature Bloat and Complexity

**Description:** Adding too many features makes the system overwhelming and difficult to use.

**Likelihood:** Medium  
**Impact:** Medium  
**Risk Score:** 4  
**Phase:** Phase 2-3

**Indicators:**
- Feature adoption rates <30% after 4 weeks
- User feedback: "too complicated"
- Support requests about how to use features
- Spending more time managing the tool than benefiting from it

**Mitigation Strategy:**
1. **Disciplined Prioritization**
   - Follow 80/20 rule: 20% of features provide 80% of value
   - Each new feature must justify its complexity
   - User requests go through strict evaluation
   - Say "no" by default, "yes" only with strong justification

2. **Progressive Disclosure**
   - Hide advanced features by default
   - Simple defaults that work for 80% of users
   - Advanced features behind "Show advanced" toggle
   - Onboarding focuses on 3-5 core features only

3. **Regular Pruning**
   - Quarterly review of feature adoption rates
   - Remove or simplify features used by <10% of users
   - Combine related features
   - Deprecate gracefully with user notification

4. **User Testing**
   - Friend/family beta test for "too complex" feedback
   - Watch someone use the app without guidance
   - If they're confused, simplify

**Contingency Plan:**
- **If complexity becomes overwhelming:**
  1. Conduct feature audit: adoption rate and value
  2. Remove or hide bottom 30% of features
  3. Simplify UI to expose only top 10 actions
  4. Create "Simple Mode" with minimal features
  5. Make advanced features opt-in only

**Feature Addition Checklist:**
```
Before adding any new feature, ask:
□ Does this solve a real problem I personally have?
□ Will 50%+ of users use this feature?
□ Can this be accomplished with existing features?
□ Does the value justify the added complexity?
□ Can this be implemented as an optional plugin later?

If <3 checkboxes: Don't build it
If 3-4 checkboxes: Consider carefully
If 5 checkboxes: Build it
```

---

### Risk P3: Competitive Product Launch

**Description:** A well-funded competitor launches a similar graph-powered PKM tool before commercial launch.

**Likelihood:** Low  
**Impact:** Medium  
**Risk Score:** 2  
**Phase:** Phase 3

**Indicators:**
- Notion/Obsidian announces graph-powered multi-domain features
- New startup raises funding for similar concept
- Major players (Google, Microsoft) add relationship discovery to their tools

**Mitigation Strategy:**
1. **Speed to Market**
   - Focus on Phase 1-2 completion ASAP
   - Minimal viable product > feature-complete
   - Launch in beta quickly to establish presence
   - Build in public, share progress

2. **Differentiation**
   - Neo4j-native architecture (deeper than surface-level linking)
   - Cross-domain by design (not bolted on)
   - Privacy-first (self-hosted option, no data mining)
   - Solo developer story (authenticity, passion)

3. **Community Building**
   - Share development journey (blog, Twitter)
   - Build audience before launch
   - Early adopter community
   - User co-creation of features

4. **Moat Through Execution**
   - Best-in-class implementation
   - Superior UX
   - Reliability and performance
   - Responsive to user feedback

**Contingency Plan:**
- **If major competitor launches:**
  1. Don't panic; niche focus can still succeed
  2. Analyze competitor: what do they do better/worse?
  3. Double down on differentiation (privacy, graph depth)
  4. Target underserved segments (power users, privacy-conscious)
  5. Consider pivot to B2B or specific vertical
  6. Worst case: Open source and move on

**Competitive Analysis (Quarterly):**
```
Review competitors:
- Notion: Any graph features announced?
- Obsidian: Expanding beyond notes?
- Roam: Multi-domain support?
- New entrants: Google Trends for "graph PKM"

Action: Update differentiation strategy
```

---

## 15.4 Business Risks

### Risk B1: Solo Developer Burnout

**Description:** Exhaustion or loss of motivation causes project abandonment.

**Likelihood:** High  
**Impact:** Critical  
**Risk Score:** 9  
**Phase:** All phases (especially months 6-12)

**Indicators:**
- Working >60 hours/week consistently
- Dreading opening the codebase
- Making progress but feeling unmotivated
- Other life areas suffering (health, relationships)
- Diminishing returns on time invested

**Mitigation Strategy:**
1. **Sustainable Pace**
   - Max 40 hours/week on project (track time)
   - Minimum 1 day off per week, no exceptions
   - 2-week break every 3 months
   - Daily exercise, sleep 7-8 hours

2. **Incremental Progress**
   - Small wins celebrated
   - Ship features regularly (bi-weekly)
   - Public progress updates (accountability + motivation)
   - Visible milestone progress

3. **Enjoyment Focus**
   - Work on interesting problems
   - If task feels like drudgery, simplify or skip
   - Use best technologies, not just practical ones
   - Build things you want to use

4. **External Motivation**
   - Share progress publicly (blog, Twitter)
   - Beta testers provide feedback and encouragement
   - Join indie hacker communities
   - Find accountability partner

**Contingency Plan:**
- **If burnout imminent:**
  1. STOP: Take 1-2 week complete break, no code
  2. Reassess: Is this still fun? Still worth it?
  3. Simplify: Cut scope by 50%, focus on essentials
  4. Get help: Hire contractor for tedious tasks
  5. Pivot: Maybe just one subdomain is enough
  6. Exit option: Open source and move on

**Weekly Check-In Questions:**
```
Monday morning:
□ Am I excited to work on this project?
□ Did I rest adequately last week?
□ Am I making meaningful progress?
□ Is this still aligned with my goals?

If 2+ answers are "no": Red flag, adjust course
```

---

### Risk B2: Market Validation Failure

**Description:** After launching commercially, discover insufficient demand to sustain the business.

**Likelihood:** Medium  
**Impact:** High  
**Risk Score:** 6  
**Phase:** Phase 3

**Indicators:**
- <100 signups in first month post-launch
- Free-to-paid conversion <5%
- High churn rate (>10%/month)
- Users not engaging regularly
- Negative or meh feedback

**Mitigation Strategy:**
1. **Pre-Launch Validation**
   - Build waitlist during development
   - Share progress publicly, gauge interest
   - Beta test with 10+ non-friends
   - Product Hunt ship page
   - Target 500+ waitlist before launch

2. **Positioning Testing**
   - Try different value props in marketing
   - A/B test landing pages
   - Test different pricing tiers
   - Survey: What would make this a must-have?

3. **Niche Focus**
   - Don't target "everyone"
   - Specific personas: quantified-self enthusiasts, personal productivity nerds
   - Concentrated marketing to niche communities
   - Under-promise, over-deliver

4. **Lean Launch**
   - Launch with minimal marketing spend (<$1000)
   - Gauge organic interest first
   - Scale marketing only if unit economics work
   - Be prepared for no-traction scenario

**Contingency Plan:**
- **If market doesn't materialize:**
  1. Analyze why: Wrong audience? Wrong positioning? Wrong product?
  2. Try alternative markets (B2B? Specific verticals?)
  3. Pivot to adjacent problem (just financial? just health?)
  4. Keep as free personal tool, don't commercialize
  5. Open source and build community instead
  6. Shut down gracefully, extract learnings

**Launch Readiness Checklist:**
- [ ] 500+ waitlist signups
- [ ] 10+ beta users providing positive feedback
- [ ] NPS >50 from beta users
- [ ] Clear differentiation vs. competitors
- [ ] Working monetization (test with beta users)
- [ ] Sustainable unit economics (theoretical LTV:CAC >3:1)

---

### Risk B3: Pricing Too Low/High

**Description:** Monetization strategy fails because pricing doesn't match perceived value or market expectations.

**Likelihood:** Medium  
**Impact:** Medium  
**Risk Score:** 4  
**Phase:** Phase 3

**Indicators:**
- Too low: High adoption but unprofitable, unsustainable
- Too high: Very few conversions (<5%), users complain about price
- Users frequently downgrade or cancel
- Negative feedback specifically about pricing

**Mitigation Strategy:**
1. **Competitive Analysis**
   - Notion: $8-10/month
   - Obsidian Sync: $8/month
   - Todoist: $4/month
   - MyFitnessPal: $10/month
   - Benchmark: $8-12/month is reasonable range

2. **Flexible Pricing**
   - Start with safe middle price ($9/month)
   - Adjust based on actual conversion data
   - Grandfather early adopters at lower price
   - Test different prices with A/B tests
   - Survey: "What would you pay?"

3. **Value-Based Tiers**
   ```
   Free: 2 subdomains, 1K entities (taste of value)
   Pro: $9/month - All features, unlimited
   Team: $49/month - Multiple users, shared graphs (future)
   ```

4. **Annual Discount**
   - $9/month or $80/year (22% discount)
   - Improves cash flow
   - Higher commitment = better retention

**Contingency Plan:**
- **If pricing is wrong:**
  1. Gather data: Survey users, analyze conversion funnel
  2. Test alternatives: A/B test new pricing
  3. Adjust: Grandfather existing users, new price for new signups
  4. Communicate: Transparent about why changes made
  5. Consider: Usage-based pricing as alternative

---

## 15.5 Risk Summary Matrix

| ID | Risk | Likelihood | Impact | Score | Phase | Priority |
|----|------|------------|--------|-------|-------|----------|
| T1 | Neo4j scaling | Medium | High | 6 | 2-3 | High |
| T2 | Sync complexity | High | Critical | 9 | 1-2 | **CRITICAL** |
| T3 | Learning curve | High | Medium | 6 | 2-3 | Medium |
| T4 | Data loss | Low | Critical | 6 | All | High |
| P1 | Value validation | Medium | Critical | 8 | 1 | **CRITICAL** |
| P2 | Feature bloat | Medium | Medium | 4 | 2-3 | Low |
| P3 | Competition | Low | Medium | 2 | 3 | Low |
| B1 | Burnout | High | Critical | 9 | All | **CRITICAL** |
| B2 | Market validation | Medium | High | 6 | 3 | Medium |
| B3 | Pricing | Medium | Medium | 4 | 3 | Low |

**Top 3 Critical Risks to Monitor:**
1. **Solo Developer Burnout (B1)** - Sustainable pace essential
2. **Sync Complexity (T2)** - Can sink entire product if not handled well
3. **Value Proposition Validation (P1)** - Core assumption must be validated early

---

# 16. Security & Privacy

## 16.1 Data Protection Strategy

**Encryption Standards:**
- **At Rest:** AES-256 encryption for all stored data (Neo4j, MongoDB, local files)
- **In Transit:** TLS 1.3 for all network communications with certificate pinning
- **Application Level:** Additional encryption layer for sensitive fields (financial amounts, personal notes)
- **Key Management:** User-derived encryption keys with PBKDF2 (100,000+ iterations) + Argon2id

**Local Data Protection:**
```typescript
// Local database encryption implementation
class EncryptedStorage {
  private encryptionKey: CryptoKey;
  
  constructor(private userPassword: string, private salt: Uint8Array) {
    this.encryptionKey = await this.deriveKey(userPassword, salt);
  }
  
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    // Use PBKDF2 for key derivation
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const keyMaterial = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      256
    );
    
    return await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encrypt(data: any): Promise<EncryptedData> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      this.encryptionKey,
      encodedData
    );
    
    return {
      data: Array.from(new Uint8Array(encryptedData)),
      iv: Array.from(iv),
      timestamp: Date.now()
    };
  }
  
  async decrypt(encryptedData: EncryptedData): Promise<any> {
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      this.encryptionKey,
      new Uint8Array(encryptedData.data)
    );
    
    const jsonString = new TextDecoder().decode(decryptedData);
    return JSON.parse(jsonString);
  }
}
```

**Cloud Data Protection:**
```typescript
// Zero-knowledge cloud storage
class ZeroKnowledgeCloudStorage {
  async storeEncrypted(userId: string, data: any, userKey: CryptoKey): Promise<void> {
    // Encrypt data with user's key before sending to cloud
    const encryptedData = await this.encryptWithUserKey(data, userKey);
    
    // Server never sees unencrypted data
    await this.cloudStorage.store(userId, encryptedData);
  }
  
  async retrieveAndDecrypt(userId: string, userKey: CryptoKey): Promise<any> {
    const encryptedData = await this.cloudStorage.retrieve(userId);
    
    // Decrypt locally with user's key
    return await this.decryptWithUserKey(encryptedData, userKey);
  }
  
  private async encryptWithUserKey(data: any, userKey: CryptoKey): Promise<EncryptedPayload> {
    // Additional metadata encryption
    const metadata = {
      subdomain_count: this.countSubdomains(data),
      last_modified: Date.now(),
      schema_version: '1.0'
    };
    
    return {
      encrypted_data: await this.encrypt(data, userKey),
      encrypted_metadata: await this.encrypt(metadata, userKey),
      server_metadata: {
        user_id_hash: await this.hashUserId(data.userId),
        storage_size: this.calculateSize(data),
        created_at: Date.now()
      }
    };
  }
}
```

## 16.2 Authentication & Authorization

**Multi-Factor Authentication:**
```typescript
// MFA implementation with TOTP and hardware key support
class MultiFactorAuth {
  async setupTOTP(userId: string): Promise<TOTPSetup> {
    const secret = this.generateTOTPSecret();
    const qrCode = await this.generateQRCode(userId, secret);
    
    // Store encrypted secret
    await this.secureStorage.store(`totp_${userId}`, {
      secret: await this.encrypt(secret),
      backup_codes: await this.generateBackupCodes(),
      created_at: Date.now()
    });
    
    return { qrCode, backupCodes };
  }
  
  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const storedData = await this.secureStorage.retrieve(`totp_${userId}`);
    const secret = await this.decrypt(storedData.secret);
    
    // Verify current and adjacent time windows (to handle clock drift)
    const timeStep = Math.floor(Date.now() / 30000);
    
    for (let i = -1; i <= 1; i++) {
      const expectedToken = this.generateTOTP(secret, timeStep + i);
      if (this.constantTimeCompare(token, expectedToken)) {
        return true;
      }
    }
    
    return false;
  }
  
  async setupWebAuthn(userId: string): Promise<WebAuthnSetup> {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    const createCredentialOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: { name: 'Personal Dashboard', id: 'personaldashboard.com' },
      user: {
        id: new TextEncoder().encode(userId),
        name: `user_${userId}`,
        displayName: 'Dashboard User'
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      }
    };
    
    return { options: createCredentialOptions, challenge };
  }
}
```

**Session Management:**
```typescript
// Secure session management with JWT and refresh tokens
class SessionManager {
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly DESKTOP_SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  
  async createSession(userId: string, platform: Platform, mfaVerified: boolean): Promise<SessionTokens> {
    const sessionId = this.generateSecureId();
    const expiry = platform === 'desktop' ? this.DESKTOP_SESSION_EXPIRY : this.ACCESS_TOKEN_EXPIRY;
    
    const accessToken = await this.signJWT({
      userId,
      sessionId,
      platform,
      mfaVerified,
      permissions: await this.getUserPermissions(userId),
      exp: Math.floor((Date.now() + expiry) / 1000)
    });
    
    const refreshToken = await this.generateRefreshToken(userId, sessionId);
    
    // Store session metadata
    await this.sessionStore.store(sessionId, {
      userId,
      platform,
      created_at: Date.now(),
      last_activity: Date.now(),
      ip_address: await this.hashIP(this.getCurrentIP()),
      user_agent_hash: await this.hashUserAgent(this.getCurrentUserAgent())
    });
    
    return { accessToken, refreshToken, expiresIn: expiry };
  }
  
  async validateSession(token: string): Promise<SessionValidation> {
    try {
      const payload = await this.verifyJWT(token);
      const session = await this.sessionStore.retrieve(payload.sessionId);
      
      // Check session still valid
      if (!session || session.revoked) {
        throw new Error('Session revoked');
      }
      
      // Update last activity
      await this.sessionStore.update(payload.sessionId, {
        last_activity: Date.now()
      });
      
      return { valid: true, userId: payload.userId, permissions: payload.permissions };
      
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionStore.update(sessionId, {
      revoked: true,
      revoked_at: Date.now()
    });
    
    // Add to token blacklist
    await this.tokenBlacklist.add(sessionId);
  }
}
```

## 16.3 Privacy Principles

**Data Minimization:**
- Collect only data essential for functionality
- Automatically purge analytics data after 2 years
- User control over data retention periods
- No tracking of content or personal information details

**User Data Ownership:**
```typescript
// Complete data export functionality
class DataPortability {
  async exportUserData(userId: string, format: 'json' | 'csv' | 'cypher'): Promise<ExportResult> {
    const userData = await this.gatherCompleteUserData(userId);
    
    switch (format) {
      case 'json':
        return await this.exportAsJSON(userData);
      case 'csv':
        return await this.exportAsCSV(userData);
      case 'cypher':
        return await this.exportAsCypher(userData);
    }
  }
  
  private async gatherCompleteUserData(userId: string): Promise<CompleteUserData> {
    // Neo4j data export
    const neo4jData = await this.neo4jExporter.exportUserGraph(userId);
    
    // MongoDB document export
    const mongoData = await this.mongoExporter.exportUserDocuments(userId);
    
    // System metadata
    const systemData = await this.systemExporter.exportUserSystemData(userId);
    
    return {
      graph_data: neo4jData,
      document_data: mongoData,
      system_data: systemData,
      export_metadata: {
        exported_at: new Date().toISOString(),
        export_version: '1.0',
        data_format_version: '1.0'
      }
    };
  }
  
  async deleteUserData(userId: string, verificationToken: string): Promise<DeletionResult> {
    // Verify deletion request
    if (!await this.verifyDeletionToken(userId, verificationToken)) {
      throw new Error('Invalid deletion verification');
    }
    
    const deletionLog = [];
    
    try {
      // Delete from Neo4j
      const neo4jResult = await this.neo4jDeleter.deleteUserData(userId);
      deletionLog.push({ service: 'neo4j', deleted: neo4jResult.nodesDeleted });
      
      // Delete from MongoDB
      const mongoResult = await this.mongoDeleter.deleteUserData(userId);
      deletionLog.push({ service: 'mongodb', deleted: mongoResult.documentsDeleted });
      
      // Delete from cloud storage
      const storageResult = await this.cloudDeleter.deleteUserData(userId);
      deletionLog.push({ service: 'cloud_storage', deleted: storageResult.filesDeleted });
      
      // Anonymize analytics data (don't delete insights, just remove user association)
      await this.analyticsAnonymizer.anonymizeUserData(userId);
      deletionLog.push({ service: 'analytics', anonymized: true });
      
      return {
        success: true,
        deleted_at: new Date().toISOString(),
        deletion_log: deletionLog
      };
      
    } catch (error) {
      // Log partial deletion for manual cleanup
      await this.deletionAudit.logPartialDeletion(userId, deletionLog, error);
      throw error;
    }
  }
}
```

**Privacy-by-Design Architecture:**
```typescript
// Privacy controls built into core data operations
class PrivacyAwareDataProcessor {
  async processUserData(data: any, privacySettings: PrivacySettings): Promise<ProcessedData> {
    // Apply privacy filters before any processing
    const filteredData = this.applyPrivacyFilters(data, privacySettings);
    
    // Process with privacy constraints
    return await this.process(filteredData, {
      anonymize_analytics: privacySettings.analytics_opt_out,
      local_processing_only: privacySettings.cloud_processing_opt_out,
      retention_limit: privacySettings.data_retention_days
    });
  }
  
  private applyPrivacyFilters(data: any, settings: PrivacySettings): any {
    if (settings.financial_data_local_only) {
      data = this.stripFinancialData(data);
    }
    
    if (settings.location_tracking_disabled) {
      data = this.stripLocationData(data);
    }
    
    if (settings.relationship_discovery_opt_out) {
      data = this.disableRelationshipProcessing(data);
    }
    
    return data;
  }
}
```

## 16.4 Compliance Considerations

**GDPR Compliance (Future EU Users):**
- **Lawful Basis:** Legitimate interest for product functionality, consent for analytics
- **Data Subject Rights:** Complete implementation of access, rectification, erasure, portability
- **Privacy by Design:** Built-in privacy controls and data minimization
- **Data Protection Officer:** Designated contact for privacy concerns (future commercial phase)

**CCPA Compliance (Future CA Users):**
- **Consumer Rights:** Right to know, delete, opt-out of sale, non-discrimination
- **Disclosure Requirements:** Clear privacy policy describing data collection and use
- **Opt-Out Mechanisms:** Easy-to-use controls for data sharing preferences

**SOC 2 Type II Preparation (Commercial Phase):**
```typescript
// Audit logging for compliance
class ComplianceAuditLog {
  async logDataAccess(userId: string, accessType: string, dataType: string): Promise<void> {
    await this.auditLog.write({
      timestamp: new Date().toISOString(),
      event_type: 'data_access',
      user_id_hash: await this.hashUserId(userId),
      access_type: accessType,
      data_type: dataType,
      source_ip_hash: await this.hashCurrentIP(),
      session_id: this.getCurrentSessionId(),
      compliance_metadata: {
        retention_policy: 'delete_after_7_years',
        legal_basis: 'legitimate_interest',
        data_classification: 'personal_data'
      }
    });
  }
  
  async logDataModification(userId: string, operation: string, entityType: string): Promise<void> {
    await this.auditLog.write({
      timestamp: new Date().toISOString(),
      event_type: 'data_modification',
      user_id_hash: await this.hashUserId(userId),
      operation: operation,
      entity_type: entityType,
      change_hash: await this.hashChange(operation), // Hash of change without revealing content
      compliance_metadata: {
        data_purpose: 'personal_knowledge_management',
        processing_lawfulness: 'user_consent'
      }
    });
  }
}
```

**Security Incident Response Plan:**
```typescript
// Automated security incident detection and response
class SecurityIncidentResponse {
  async detectAndRespond(event: SecurityEvent): Promise<IncidentResponse> {
    const severity = await this.assessSeverity(event);
    
    switch (severity) {
      case 'CRITICAL':
        return await this.handleCriticalIncident(event);
      case 'HIGH':
        return await this.handleHighSeverityIncident(event);
      case 'MEDIUM':
        return await this.handleMediumSeverityIncident(event);
      default:
        return await this.logAndMonitor(event);
    }
  }
  
  private async handleCriticalIncident(event: SecurityEvent): Promise<IncidentResponse> {
    // Immediate automated response
    await this.immediateContainment(event);
    
    // User notification
    await this.notifyAffectedUsers(event);
    
    // Regulatory notification (if required)
    if (this.requiresRegulatoryNotification(event)) {
      await this.notifyRegulators(event);
    }
    
    return {
      incident_id: this.generateIncidentId(),
      severity: 'CRITICAL',
      contained: true,
      users_notified: true,
      estimated_impact: await this.assessImpact(event)
    };
  }
  
  private async immediateContainment(event: SecurityEvent): Promise<void> {
    switch (event.type) {
      case 'unauthorized_access':
        await this.revokeAllSessions(event.affected_user_id);
        await this.enableAccountLockdown(event.affected_user_id);
        break;
      
      case 'data_breach':
        await this.isolateAffectedSystems(event.affected_systems);
        await this.enableEmergencyEncryption(event.affected_data);
        break;
      
      case 'malware_detected':
        await this.quarantineAffectedSystems(event.affected_systems);
        await this.enableNetworkIsolation(event.network_segments);
        break;
    }
  }
}
```

**Backup Security:**
```typescript
// Secure backup implementation
class SecureBackupSystem {
  async createEncryptedBackup(userId: string, userKey: CryptoKey): Promise<BackupResult> {
    const userData = await this.gatherUserData(userId);
    
    // Encrypt with user's key
    const encryptedData = await this.encryptBackup(userData, userKey);
    
    // Add integrity verification
    const checksum = await this.calculateChecksum(encryptedData);
    
    // Store with versioning
    const backupId = this.generateBackupId();
    await this.backupStorage.store(backupId, {
      encrypted_data: encryptedData,
      checksum: checksum,
      created_at: Date.now(),
      user_id_hash: await this.hashUserId(userId),
      backup_type: 'full',
      encryption_algorithm: 'AES-256-GCM'
    });
    
    return {
      backup_id: backupId,
      size: encryptedData.length,
      integrity_hash: checksum
    };
  }
  
  async verifyBackupIntegrity(backupId: string): Promise<IntegrityResult> {
    const backup = await this.backupStorage.retrieve(backupId);
    const calculatedChecksum = await this.calculateChecksum(backup.encrypted_data);
    
    return {
      valid: backup.checksum === calculatedChecksum,
      original_checksum: backup.checksum,
      calculated_checksum: calculatedChecksum,
      verified_at: Date.now()
    };
  }
  
  async restoreFromBackup(backupId: string, userKey: CryptoKey): Promise<RestoreResult> {
    // Verify integrity first
    const integrityCheck = await this.verifyBackupIntegrity(backupId);
    if (!integrityCheck.valid) {
      throw new Error('Backup integrity verification failed');
    }
    
    const backup = await this.backupStorage.retrieve(backupId);
    const userData = await this.decryptBackup(backup.encrypted_data, userKey);
    
    // Restore to databases
    const restoreResult = await this.restoreUserData(userData);
    
    return {
      restored_entities: restoreResult.entity_count,
      restored_relationships: restoreResult.relationship_count,
      restored_at: Date.now()
    };
  }
}
```

---


## 17. Future Extensibility

### 17.1 Core Extensibility Philosophy

The framework must be designed from day one to accommodate unlimited subdomain expansion while maintaining system coherence. The architecture should support both first-party subdomains (developed by you) and eventual third-party plugins without requiring core system refactoring.

**Key Principles:**

- **Loose Coupling:** Subdomains operate independently but can discover and leverage each other's data through the graph layer
- **Progressive Enhancement:** New subdomains enhance existing ones without breaking them
- **Backward Compatibility:** Schema and API evolution must not break existing subdomains
- **Zero-Trust Integration:** Third-party plugins (future) cannot compromise data security or system stability

### 17.2 Adding New Subdomains

#### 17.2.1 Subdomain Registration Process

Each subdomain must register with the framework core through a standardized manifest:

```javascript
// subdomain-manifest.json
{
  "id": "health-fitness",
  "version": "1.0.0",
  "name": "Health & Fitness Dashboard",
  "description": "Track diet, exercise, and body metrics",
  "author": "core-team",
  "
platforms": ["desktop", "pwa", "echo-show"],
  
  "capabilities": {
    "dataCapture": true,
    "voiceCommands": true,
    "notifications": true,
    "backgroundSync": true
  },
  
  "nodeTypes": [
    {
      "type": "Workout",
      "properties": ["date", "duration", "type", "calories", "notes"],
      "searchableFields": ["type", "notes"],
      "displayName": "Workout Session"
    },
    {
      "type": "Meal",
      "properties": ["timestamp", "description", "calories", "protein", "carbs", "fat"],
      "searchableFields": ["description"],
      "displayName": "Meal Entry"
    },
    {
      "type": "BodyMetric",
      "properties": ["date", "weight", "bodyFat", "muscleMass"],
      "searchableFields": [],
      "displayName": "Body Measurement"
    }
  ],
  
  "relationshipTypes": [
    {
      "type": "BURNED_CALORIES_IN",
      "from": "User",
      "to": "Workout",
      "properties": ["caloriesBurned"]
    },
    {
      "type": "CONSUMED_IN",
      "from": "User",
      "to": "Meal",
      "properties": ["mealType"]
    }
  ],
  
  "crossDomainLinks": {
    "suggestedRelationships": [
      {
        "targetDomain": "financial",
        "targetNodeType": "Transaction",
        "relationship": "EXPENSE_FOR",
        "autoLinkCriteria": {
          "vendorKeywords": ["gym", "whole foods", "supplement", "fitness"]
        }
      },
      {
        "targetDomain": "schedule",
        "targetNodeType": "Appointment",
        "relationship": "SCHEDULED_AS",
        "autoLinkCriteria": {
          "appointmentKeywords": ["workout", "trainer", "doctor", "nutritionist"]
        }
      }
    ]
  },
  
  "ui": {
    "carouselCard": {
      "component": "HealthDashboardCard",
      "icon": "heart-pulse",
      "color": "#4CAF50"
    },
    "routes": [
      "/health",
      "/health/workouts",
      "/health/nutrition",
      "/health/metrics"
    ]
  },
  
  "permissions": {
    "requiredScopes": ["user:read", "user:write"],
    "optionalIntegrations": ["apple-health", "google-fit", "myfitnesspal"]
  },
  
  "dependencies": {
    "framework": ">=2.0.0",
    "otherSubdomains": []
  }
}
```

#### 17.2.2 Subdomain Development Guidelines

**File Structure Standard:**
```
/subdomains
  /health-fitness
    /manifest.json
    /desktop
      /components
      /services
      /hooks
    /pwa
      /components
      /services
    /echo-show
      /skill-handler.js
      /display-templates
    /shared
      /models
      /utils
      /constants
    /tests
    /docs
      /user-guide.md
      /developer-guide.md
```

**Required Implementation Points:**

1. **Data Service Interface**
   - All CRUD operations must go through subdomain's data service
   - Data service handles Neo4j writes, MongoDB writes, and sync coordination
   - Must implement `SubdomainDataService` interface:

```typescript
interface SubdomainDataService {
  // Core CRUD
  create(data: any): Promise<EntityResult>;
  read(id: string): Promise<Entity>;
  update(id: string, data: any): Promise<EntityResult>;
  delete(id: string): Promise<void>;
  
  // Bulk operations
  bulkCreate(items: any[]): Promise<EntityResult[]>;
  
  // Search
  search(query: string, filters?: any): Promise<Entity[]>;
  
  // Graph operations
  getRelationships(entityId: string, depth?: number): Promise<RelationshipGraph>;
  createRelationship(from: string, to: string, type: string, props?: any): Promise<void>;
  
  // Sync coordination
  getSyncStatus(): Promise<SyncStatus>;
  resolveSyncConflict(conflict: SyncConflict): Promise<void>;
}
```

2. **UI Component Requirements**
   - Desktop: Must render in framework-provided container with specified dimensions
   - PWA: Must be responsive and touch-optimized
   - Echo Show: Must provide Alexa skill handler and APL templates
   - All: Must use framework design tokens for consistency

3. **Event Emission**
   - Subdomains emit standardized events for framework to coordinate:
     - `subdomain:data:created`
     - `subdomain:data:updated`
     - `subdomain:data:deleted`
     - `subdomain:relationship:created`
     - `subdomain:insight:discovered`

#### 17.2.3 Schema Evolution & Migration

**Neo4j Schema Versioning:**

Each subdomain maintains a schema version in Neo4j:

```cypher
CREATE (s:SubdomainSchema {
  subdomainId: 'health-fitness',
  version: '1.0.0',
  createdAt: datetime(),
  nodeTypes: ['Workout', 'Meal', 'BodyMetric'],
  relationshipTypes: ['BURNED_CALORIES_IN', 'CONSUMED_IN']
})
```

**Migration Process:**

When a subdomain updates its schema:

```typescript
// migrations/health-fitness/v1.1.0.ts
export const migration = {
  version: '1.1.0',
  up: async (neo4j, mongodb) => {
    // Add new property to existing nodes
    await neo4j.run(`
      MATCH (w:Workout)
      SET w.heartRateAvg = null,
          w.heartRateMax = null
    `);
    
    // Create new index
    await neo4j.run(`
      CREATE INDEX workout_date_idx IF NOT EXISTS
      FOR (w:Workout) ON (w.date)
    `);
    
    // MongoDB schema update
    await mongodb.collection('workouts').updateMany(
      {},
      { $set: { heartRate: { avg: null, max: null } } }
    );
  },
  down: async (neo4j, mongodb) => {
    // Rollback logic
  },
  validate: async (neo4j, mongodb) => {
    // Validation checks
  }
};
```

**Framework-Level Migration Coordination:**

- Framework maintains migration history: `(:MigrationHistory {subdomain, version, appliedAt})`
- On startup, framework checks each subdomain's current vs. required version
- Migrations run in dependency order
- Failed migrations halt system startup with clear error messages
- Rollback capability for failed migrations

### 17.3 Third-Party Plugin Ecosystem (Future)

#### 17.3.1 Plugin Architecture

**Security Boundaries:**

- Plugins run in isolated sandboxes with limited API access
- All data access mediated through framework API (no direct database access)
- Rate limiting enforced per plugin
- Plugins declare required permissions upfront

**Plugin API Surface:**

```typescript
interface PluginAPI {
  // Limited data access
  data: {
    search(subdomainId: string, query: string): Promise<Entity[]>;
    getEntity(subdomainId: string, entityId: string): Promise<Entity>;
    createRelationship(from: string, to: string, type: string): Promise<void>;
    // NO direct write access - must go through user approval
  };
  
  // UI extension points
  ui: {
    registerCarouselCard(config: CardConfig): void;
    registerDetailView(config: ViewConfig): void;
    registerContextMenuItem(config: MenuConfig): void;
  };
  
  // Event listening (read-only)
  events: {
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
  };
  
  // Utility services
  utils: {
    formatDate(date: Date, format: string): string;
    calculateMetric(type: string, data: any): number;
    // Other safe utilities
  };
}
```

**Plugin Review Process (Future):**

1. Developer submits plugin with manifest
2. Automated security scan checks for:
   - Malicious code patterns
   - Excessive permission requests
   - Network access to suspicious domains
3. Manual code review (when scaled)
4. Sandboxed testing environment
5. Approval or rejection with feedback
6. Plugin listing in marketplace

#### 17.3.2 Plugin Marketplace (Future)

**Discovery & Installation:**

- In-app marketplace browsable by category
- Search by functionality or subdomain
- Ratings, reviews, and download counts
- One-click installation with permission approval
- Automatic updates (with user notification)

**Revenue Sharing (If Applicable):**

- Free plugins: No fees
- Paid plugins: 70/30 split (developer/platform)
- Subscription plugins: Recurring revenue share
- Framework handles payment processing and delivery

**Plugin Categories:**

- **Subdomain Extensions:** New complete subdomains (e.g., "Travel Tracker")
- **Integration Plugins:** Connect to external services (e.g., "Mint.com Import")
- **Visualization Plugins:** New chart types or dashboard widgets
- **Relationship Analyzers:** Custom algorithms for discovering connections
- **Export/Report Plugins:** Specialized export formats or reports
- **Theme Plugins:** Visual customization options

### 17.4 API for External Integrations

#### 17.4.1 Public REST API

**Authentication:**

- OAuth 2.0 for third-party applications
- API keys for personal integrations
- Scoped permissions per integration

**Core Endpoints:**

```
POST   /api/v1/auth/token
GET    /api/v1/user/profile

# Subdomain data access
GET    /api/v1/subdomains
GET    /api/v1/subdomains/{subdomain}/entities
GET    /api/v1/subdomains/{subdomain}/entities/{id}
POST   /api/v1/subdomains/{subdomain}/entities
PUT    /api/v1/subdomains/{subdomain}/entities/{id}
DELETE /api/v1/subdomains/{subdomain}/entities/{id}

# Cross-domain queries
POST   /api/v1/graph/query
GET    /api/v1/graph/relationships/{entityId}
POST   /api/v1/graph/relationships

# Search
GET    /api/v1/search?q={query}&subdomains={list}

# Insights
GET    /api/v1/insights
GET    /api/v1/insights/{insightId}

# Webhooks
POST   /api/v1/webhooks
GET    /api/v1/webhooks
DELETE /api/v1/webhooks/{id}
```

**Rate Limiting:**

- Authenticated users: 1000 requests/hour
- API key integrations: 5000 requests/hour
- Burst allowance: 100 requests/minute
- GraphQL queries: Complexity-based limiting

#### 17.4.2 GraphQL API (Alternative)

For complex queries and flexible data fetching:

```graphql
type Query {
  user: User!
  subdomain(id: ID!): Subdomain
  subdomains: [Subdomain!]!
  
  entity(subdomainId: ID!, entityId: ID!): Entity
  searchEntities(
    query: String!
    subdomains: [ID!]
    filters: EntityFilters
  ): EntitySearchResults!
  
  graphQuery(cypher: String!): GraphQueryResult!
  
  insights(
    subdomains: [ID!]
    types: [InsightType!]
    limit: Int
  ): [Insight!]!
}

type Mutation {
  createEntity(subdomainId: ID!, data: JSON!): Entity!
  updateEntity(subdomainId: ID!, entityId: ID!, data: JSON!): Entity!
  deleteEntity(subdomainId: ID!, entityId: ID!): Boolean!
  
  createRelationship(
    fromId: ID!
    toId: ID!
    type: String!
    properties: JSON
  ): Relationship!
}

type Subscription {
  entityCreated(subdomainId: ID!): Entity!
  entityUpdated(subdomainId: ID!): Entity!
  insightDiscovered: Insight!
}
```

#### 17.4.3 Webhook System

**Event-Driven Integrations:**

Allow external systems to react to events in real-time:

```json
{
  "webhookId": "wh_123456",
  "url": "https://zapier.com/hooks/catch/123/xyz",
  "events": [
    "entity.created",
    "entity.updated",
    "insight.discovered",
    "relationship.created"
  ],
  "filters": {
    "subdomains": ["financial", "health-fitness"],
    "entityTypes": ["Transaction", "Workout"]
  },
  "secret": "wh_secret_abc123"
}
```

**Webhook Payload:**

```json
{
  "event": "entity.created",
  "timestamp": "2025-10-23T14:30:00Z",
  "subdomain": "financial",
  "entity": {
    "id": "txn_789",
    "type": "Transaction",
    "properties": {
      "amount": -125.50,
      "vendor": "Whole Foods",
      "category": "Groceries",
      "date": "2025-10-23"
    }
  },
  "relationships": [
    {
      "type": "EXPENSE_FOR",
      "target": {
        "subdomain": "health-fitness",
        "entityId": "meal_456"
      }
    }
  ]
}
```

### 17.5 Export/Import Capabilities

#### 17.5.1 Full Data Export

**User Data Liberation:**

Users must be able to export 100% of their data at any time:

```typescript
interface ExportOptions {
  format: 'json' | 'csv' | 'neo4j-dump' | 'sqlite';
  subdomains: string[] | 'all';
  includeRelationships: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Example export
const export = {
  exportDate: '2025-10-23T14:30:00Z',
  version: '1.0.0',
  user: {
    id: 'user_123',
    email: 'user@example.com'
  },
  subdomains: [
    {
      id: 'financial',
      version: '1.2.0',
      entities: [
        {
          id: 'txn_789',
          type: 'Transaction',
          properties: {...},
          createdAt: '2025-10-20T10:00:00Z',
          updatedAt: '2025-10-20T10:00:00Z'
        }
      ],
      relationships: [
        {
          from: 'txn_789',
          to: 'meal_456',
          type: 'EXPENSE_FOR',
          properties: {...}
        }
      ]
    }
  ],
  insights: [...],
  userPreferences: {...}
}
```

**Export Formats:**

- **JSON:** Complete data with full relationship graph
- **CSV:** Per-subdomain tabular data (relationships as separate files)
- **Neo4j Dump:** Native graph database export for backup/migration
- **SQLite:** Portable database file for offline analysis
- **PDF Report:** Human-readable summary with key insights

#### 17.5.2 Selective Import

**Import from Competitors:**

Build adapters for importing from major PKM tools:

**Notion Import:**
```typescript
interface NotionImportAdapter {
  authenticate(): Promise<void>;
  fetchWorkspaces(): Promise<Workspace[]>;
  mapToSubdomains(workspace: Workspace): SubdomainMapping;
  importPages(mapping: SubdomainMapping): Promise<ImportResult>;
}
```

**Supported Import Sources (Future):**

- Notion (pages → notes, databases → structured data)
- Obsidian (markdown files → knowledge base)
- Roam Research (blocks → notes with relationships)
- Evernote (notes → knowledge base)
- Todoist/Things (tasks → task management subdomain)
- Mint/YNAB (financial data → financial subdomain)
- MyFitnessPal (meals/workouts → health subdomain)
- Google Calendar (events → schedule subdomain)
- Apple Health / Google Fit (health metrics)

**Import Process:**

1. User selects source system
2. Framework authenticates with source API (or file upload)
3. User reviews mapping preview (source data → target subdomains)
4. User adjusts mappings as needed
5. Import runs with progress indicator
6. Review imported data with option to undo
7. Automatic relationship discovery on imported data

#### 17.5.3 Continuous Sync Integrations

**Bi-Directional Sync (High Priority Integrations):**

- Google Calendar ↔ Schedule Subdomain
- Apple Health / Google Fit ↔ Health Subdomain
- GitHub → Task Management Subdomain (issues, PRs)
- Stripe → Financial Subdomain (for business users)

**Integration Architecture:**

```typescript
interface SyncAdapter {
  id: string;
  name: string;
  authenticate(): Promise<void>;
  
  // Pull from external source
  fetchUpdates(since: Date): Promise<ExternalEntity[]>;
  mapToInternal(external: ExternalEntity): InternalEntity;
  
  // Push to external source
  pushUpdate(entity: InternalEntity): Promise<void>;
  
  // Conflict resolution
  resolveConflict(local: Entity, remote: Entity): Promise<Entity>;
  
  // Health check
  testConnection(): Promise<boolean>;
}
```

### 17.6 Migration Path for Users of Competing Tools

#### 17.6.1 Migration Wizard

**Step-by-Step Onboarding:**

```
1. Welcome Screen
   - Brief overview of the system
   - "Import from existing tool" or "Start fresh"

2. Tool Selection
   - List of supported import sources
   - "I'm switching from..." dropdown

3. Authentication
   - OAuth flow for supported services
   - File upload for exports

4. Data Preview
   - Show what will be imported
   - Estimated count by data type
   - Subdomain mappings

5. Customization
   - Adjust subdomain mappings
   - Choose which data to import
   - Set date ranges

6. Import
   - Progress bar with status
   - Estimated time remaining
   - Option to continue using app during import

7. Review & Cleanup
   - Summary of imported data
   - Duplicate detection
   - Option to delete/merge duplicates

8. Guided Tour
   - Highlight key features
   - Show where their data is
   - Explain relationship discovery
```

#### 17.6.2 Competitive Feature Parity Checklist

**Before Commercial Launch, Ensure Parity With:**

**Notion:**
- ✓ Rich text editing
- ✓ Databases with views
- ✓ Embedding content
- ✓ Sharing & collaboration (Phase 5)
- ✗ But Better: Cross-domain relationship discovery

**Obsidian:**
- ✓ Markdown-based notes
- ✓ Graph view
- ✓ Backlinks
- ✓ Plugin ecosystem
- ✗ But Better: Beyond just knowledge - all life data

**Roam Research:**
- ✓ Bidirectional links
- ✓ Daily notes
- ✓ Block references
- ✗ But Better: Structured data support

**Todoist/Things:**
- ✓ Task management
- ✓ Projects & subtasks
- ✓ Due dates & reminders
- ✗ But Better: Tasks linked to broader life context

### 17.7 Extensibility Best Practices

**For First-Party Subdomain Development:**

1. **Start Simple, Extend Later**
   - MVP features first
   - Add complexity based on usage patterns
   - Don't over-engineer

2. **Design for Relationships**
   - Every entity should be linkable
   - Think about cross-domain connections from day one
   - Implement auto-linking where possible

3. **Consistent UI Patterns**
   - Reuse framework components
   - Follow design system
   - Test on all platforms before release

4. **Performance Consciousness**
   - Limit Neo4j query depth
   - Implement caching for expensive queries
   - Profile and optimize hot paths

5. **Documentation First**
   - Write developer guide before coding
   - Maintain up-to-date examples
   - Document common pitfalls

**For Future Third-Party Developers:**

1. **Security First**
   - Never request more permissions than needed
   - Sanitize all inputs
   - No eval() or unsafe code execution

2. **User Trust**
   - Clear privacy policy
   - Explain what data you access and why
   - Provide opt-out mechanisms

3. **Performance Budgets**
   - Adhere to API rate limits
   - Implement efficient queries
   - Don't block the UI thread

4. **Version Management**
   - Semantic versioning
   - Clear changelog
   - Backward compatibility when possible

---

# 18. Competitive Analysis

## 18.1 Traditional PKM Tools Analysis

### Notion (All-in-one workspace)

**Strengths:**
- Flexible database and page structure allows custom workflows
- Strong collaboration features and sharing capabilities
- Rich media support (images, videos, embeds)
- Large template ecosystem and community
- Excellent mobile apps with offline sync
- API for integrations and automations

**Weaknesses:**
- No graph-based relationship discovery - connections are manual
- Single domain focus (knowledge/notes) - doesn't integrate operational life data
- Performance issues with large databases (>10K items)
- Complex interface can be overwhelming for simple use cases
- Limited cross-database relationship queries
- No automatic pattern recognition or insight generation

**Market Position:**
- $10B valuation, millions of users
- Primarily targets knowledge workers and teams
- Pricing: Free tier, $8-16/user/month paid plans

**What We Learn:**
- Users want flexible, customizable interfaces
- Database-style organization resonates with power users
- Mobile parity is essential for adoption
- Template ecosystems drive user engagement

**How We Differentiate:**
- Automatic relationship discovery vs. manual linking
- Multi-domain integration (finance + health + knowledge) vs. knowledge-only
- Graph-powered insights vs. static database queries
- Personal data focus vs. team collaboration focus

### Obsidian (Markdown + Graph)

**Strengths:**
- Local-first approach with user data ownership
- Powerful graph visualization of note connections
- Extensive plugin ecosystem (1000+ community plugins)
- Markdown-based with future-proof file format
- Advanced linking features (backlinks, mentions, tags)
- Strong privacy and security model

**Weaknesses:**
- Limited to text-based knowledge - no operational data integration
- Steep learning curve for advanced features
- Graph visualization is retrospective, not predictive
- No cross-domain data types (transactions, health metrics, etc.)
- Mobile experience weaker than desktop
- Plugin quality varies significantly

**Market Position:**
- 1M+ users, strong enthusiast community
- Targets researchers, writers, and knowledge workers
- Pricing: Free personal use, $50/year commercial

**What We Learn:**
- Local-first architecture builds user trust
- Graph visualization is compelling for knowledge work
- Plugin ecosystems enable powerful customization
- Markdown/text files provide data portability

**How We Differentiate:**
- Multi-data-type graphs vs. text-only graphs
- Predictive relationship suggestions vs. retrospective visualization
- Operational life data vs. knowledge-only data
- Cross-domain insights vs. single-domain connections

### Roam Research (Networked Thought)

**Strengths:**
- Pioneered bi-directional linking in note-taking
- Block-based structure allows granular connections
- Daily notes feature encourages consistent use
- Strong academic and research user base
- Powerful query language for finding connections
- Time-based organization with automatic dating

**Weaknesses:**
- Extremely expensive ($15-500/month) limiting adoption
- Steep learning curve and complex interface
- Performance issues with large graphs
- Limited data types beyond text and basic metadata
- No integration with operational life data
- Weak mobile experience

**Market Position:**
- Smaller user base due to pricing
- Premium positioning for serious researchers
- High churn rate due to complexity and cost

**What We Learn:**
- Bi-directional linking creates powerful connection networks
- Daily notes pattern drives consistent engagement
- Time-based organization is natural for personal data
- Complex interfaces limit mainstream adoption

**How We Differentiate:**
- Affordable pricing vs. premium pricing
- Multi-data-type connections vs. text-only connections
- Automatic discovery vs. manual linking effort
- Operational data integration vs. knowledge-only focus

### Logseq (Outliner + Graph)

**Strengths:**
- Open-source with local-first architecture
- Block-based outliner structure
- Built-in graph database capabilities
- Daily journal feature
- Growing plugin ecosystem
- Privacy-focused approach

**Weaknesses:**
- Smaller community and slower development
- Limited data types and integrations
- Graph features less mature than Obsidian
- No operational data integration
- Primarily developer/technical audience
- Mobile experience still developing

**Market Position:**
- Open-source alternative with growing community
- Targets privacy-conscious users and developers
- Free with optional paid sync services

**What We Learn:**
- Open-source approach attracts privacy-conscious users
- Block-based organization provides flexibility
- Local-first is important for sensitive personal data
- Technical audiences appreciate extensibility

**How We Differentiate:**
- Commercial polish vs. open-source rough edges
- Multi-domain data vs. text-focused structure
- Automatic insights vs. manual organization
- Broader data integration vs. knowledge-only scope

## 18.2 Specialized Productivity Tools

### Personal Capital / Mint (Finance)

**Strengths:**
- Comprehensive financial data aggregation
- Automatic transaction categorization
- Investment tracking and analysis
- Net worth calculations and trending
- Mobile apps with push notifications
- Bank-level security and encryption

**Weaknesses:**
- Single domain (finance only) with no cross-domain insights
- Limited relationship discovery beyond basic categorization
- No integration with health, productivity, or knowledge data
- Advertising-based revenue model affects user trust
- Limited customization and personal workflow adaptation
- No graph-based relationship exploration

**Market Position:**
- Millions of users, acquired by Empower for $1B+
- Freemium model with ads and upsells to advisory services
- Strong market penetration in US financial tracking

**What We Learn:**
- Automatic transaction categorization is essential
- Users want comprehensive financial picture
- Mobile notifications drive engagement
- Security concerns are paramount for financial data

**How We Differentiate:**
- Cross-domain connections (finance + health + schedule) vs. finance-only
- Graph-based relationship discovery vs. simple categorization
- Privacy-first vs. advertising-based model
- Personal insights vs. generic financial advice

### Todoist / Things (Task Management)

**Strengths:**
- Excellent task organization and project structure
- Natural language processing for task creation
- Cross-platform sync and mobile apps
- Collaboration features for shared projects
- Powerful filtering and search capabilities
- Clean, focused interface design

**Weaknesses:**
- Task-only focus with no broader life context
- No connection to financial costs or health impacts of tasks
- Limited relationship discovery between projects and other life domains
- No automatic insight generation from task patterns
- Basic time tracking without cross-domain correlation
- Static organization without dynamic recommendations

**Market Position:**
- Millions of users across both platforms
- Subscription models ($36-60/year typical)
- Strong productivity and professional user base

**What We Learn:**
- Natural language input reduces friction
- Cross-platform consistency is crucial
- Clean interface design drives adoption
- Project hierarchy helps organize complex work

**How We Differentiate:**
- Task costs and ROI tracking vs. task-only focus
- Cross-domain project insights vs. isolated task management
- Automatic relationship discovery vs. manual organization
- Holistic productivity vs. task-focused productivity

### Day One (Journaling)

**Strengths:**
- Beautiful, polished interface design
- Excellent photo and media integration
- Location and weather data automatic capture
- Strong privacy and encryption features
- Multiple journal support for different life areas
- Powerful search and memory features

**Weaknesses:**
- Journaling-only focus without operational data integration
- No automatic relationship discovery between entries and life events
- Limited quantitative data support
- No cross-domain insights or pattern recognition
- Primarily retrospective rather than predictive
- No integration with financial or health tracking

**Market Position:**
- Premium journaling app with loyal user base
- Subscription model ($35/year)
- Strong brand in personal reflection and memory keeping

**What We Learn:**
- Automatic context capture (location, weather) adds value
- Beautiful design matters for personal, intimate apps
- Privacy is crucial for personal reflection tools
- Media integration makes memories more vivid

**How We Differentiate:**
- Quantitative + qualitative data vs. text/media only
- Cross-domain relationship discovery vs. isolated entries
- Predictive insights vs. retrospective reflection only
- Operational data integration vs. reflection-only focus

### Exist.io (Life Tracking + Correlations)

**Strengths:**
- Multi-domain data integration (fitness, mood, productivity, weather)
- Automatic correlation discovery between different life metrics
- Integration with 100+ services and devices
- Statistical analysis and trend identification
- Privacy-focused approach with user data control
- Unique focus on finding patterns across life domains

**Weaknesses:**
- Limited to quantified self metrics - no rich content or knowledge
- Correlation discovery is statistical only, not semantic
- No graph-based relationship exploration
- Limited customization of data types and structures
- Basic interface design and user experience
- No financial data integration or project management

**Market Position:**
- Smaller, niche user base focused on quantified self
- Subscription model ($6-12/month)
- Strong positioning in data correlation and life optimization

**What We Learn:**
- Cross-domain correlation is valuable and under-served
- Automatic pattern recognition has strong appeal
- Privacy-first approach builds trust with personal data
- Statistical insights can drive behavior change

**How We Differentiate:**
- Semantic relationships vs. statistical correlations only
- Rich content integration vs. metrics-only data
- Graph exploration vs. statistical dashboards
- Financial and project data vs. quantified self focus
- Professional interface design vs. basic statistical tools

## 18.3 What They Miss: Market Gap Analysis

**The Missing Integration Layer:**
All existing solutions operate in silos. Users maintain:
- Separate financial tracking (Mint/Personal Capital)
- Separate task management (Todoist/Things)
- Separate knowledge management (Notion/Obsidian)
- Separate health tracking (MyFitnessPal/Apple Health)
- Separate time tracking (RescueTime/Toggl)

**The Missing Relationship Intelligence:**
Current tools offer either:
- Manual linking (Notion, Obsidian) - requires conscious effort
- Statistical correlation (Exist.io) - limited to quantified metrics
- Simple categorization (financial apps) - basic pattern matching

None provide semantic, graph-powered relationship discovery across arbitrary data types.

**The Missing Cross-Domain Insights:**
Examples of valuable insights current tools cannot provide:
- "Your productivity drops 40% in the week following medical expenses >$200"
- "Projects mentioning 'automation' correlate with 15% higher completion rates"
- "Grocery spending increases 25% after workout-heavy weeks"
- "Meeting-heavy days correlate with delayed personal task completion"

**The Missing Unified Interface:**
Users context-switch between 5-10 different apps to manage their digital life. No solution provides:
- Single interface for all personal data domains
- Consistent interaction patterns across data types
- Unified search across all life domains
- Cross-domain filtering and timeline views

## 18.4 Differentiation Strategy

### Core Differentiators

**1. Graph-Powered Cross-Domain Intelligence**
- **Competitors:** Manual linking or statistical correlation only
- **Our Approach:** Neo4j-powered semantic relationship discovery across arbitrary data types
- **User Benefit:** Discover unexpected connections that drive better decision-making

**2. Operational + Knowledge Integration**
- **Competitors:** Focus on single domains (knowledge OR productivity OR finance)
- **Our Approach:** First-class integration of operational life data with knowledge management
- **User Benefit:** Complete picture of how decisions and activities interconnect

**3. Carousel-Based Multi-Domain Interface**
- **Competitors:** Single-purpose interfaces or complex all-in-one workspaces
- **Our Approach:** Specialized domain interfaces with unified relationship discovery
- **User Benefit:** Domain expertise with cross-domain insights

**4. Privacy-First Multi-Platform**
- **Competitors:** Cloud-first with advertising models or local-only limitations
- **Our Approach:** Zero-knowledge cloud sync with full local capability
- **User Benefit:** Access everywhere with complete privacy control

**5. Extensible Plugin Architecture**
- **Competitors:** Fixed feature sets or basic plugin systems
- **Our Approach:** Full subdomain plugin system with schema contribution
- **User Benefit:** Unlimited customization without losing relationship intelligence

### Competitive Positioning

**vs. Notion:** "Notion for your entire life, not just your knowledge"
- Notion organizes what you know; we organize how you live
- Automatic relationship discovery vs. manual database linking
- Multi-domain insights vs. single workspace limitations

**vs. Obsidian:** "Obsidian's graph power applied to all your personal data"
- Text-only graphs vs. multi-data-type relationship networks
- Knowledge connections vs. life pattern discovery
- Local-first philosophy with multi-platform execution

**vs. Personal Capital/Mint:** "Financial tracking that understands your whole life"
- Financial decisions in context vs. isolated financial metrics
- Cross-domain cost analysis vs. simple expense categorization
- Privacy-first vs. advertising-based business model

**vs. Productivity Suites:** "The last productivity app you'll need"
- Integrated approach vs. scattered tool ecosystem
- Automatic insight generation vs. manual organization
- Life optimization vs. task completion focus

### Market Entry Strategy

**Phase 1: Personal Use Validation (Months 1-6)**
- Focus on personal productivity and relationship discovery value
- Build authentic use case and testimonial content
- Document specific insights and decision improvements

**Phase 2: Power User Beta (Months 7-12)**
- Target existing Obsidian, Notion, and quantified-self users
- Emphasize cross-domain relationship discovery as key differentiator
- Build plugin ecosystem with community contributions

**Phase 3: Mainstream Expansion (Months 13-18)**
- Position as "unified personal data platform"
- Emphasize privacy and data ownership benefits
- Target users frustrated with app fragmentation

### Pricing Strategy vs. Competitors

**Competitive Pricing Analysis:**
- Notion: $0-16/month
- Obsidian: $0-50/year
- Personal Capital: Free (ads) + advisory upsells
- Todoist: $0-48/year
- Exist.io: $72-144/year

**Our Positioning:**
- **Free Tier:** Local-only usage with full feature set
- **Sync Tier:** $8/month for cloud sync and mobile access
- **Pro Tier:** $15/month for advanced analytics and plugin marketplace
- **Self-Hosted:** One-time $199 for complete self-hosting package

**Value Justification:**
- Replace 3-5 existing subscriptions (average saving $20-40/month)
- Unique cross-domain insights unavailable elsewhere
- Privacy-first approach with user data ownership
- Extensible architecture future-proofs investment

---

# 19. Go-to-Market Strategy (Future)

## 19.1 Pre-Launch Strategy (Months 1-12)

### 19.1.1 Building in Public

**Content Strategy:**

- **Developer Blog:** Document the journey of building the framework
  - Weekly technical deep-dives
  - Challenges and solutions
  - Architecture decisions and tradeoffs
  - Neo4j optimization tips
  
- **Social Media Presence:**
  - Twitter/X: Daily updates, quick tips, screenshot teasers
  - LinkedIn: Longer-form posts about PKM philosophy
  - Dev.to: Technical tutorials driving to documentation
  - YouTube: Video walkthroughs of features

- **Open Source Components:**
  - Release select components as open source
  - Neo4j schema generator tool
  - Cross-platform sync library
  - Build community goodwill and awareness

**Community Building:**

- Create Discord/Slack community for interested users
- Weekly "office hours" for Q&A
- Share roadmap transparently
- Incorporate community feedback into development

### 19.1.2 Alpha/Beta Testing

**Alpha Phase (Months 10-11):**

- **Audience:** 10-20 tech-savvy friends and family
- **Goals:**
  - Identify critical bugs
  - Validate core user flows
  - Test on diverse devices/platforms
  - Gather qualitative feedback

- **Structure:**
  - Weekly check-ins
  - Bug reporting system (GitHub Issues)
  - Private Discord channel
  - Direct access to developer

**Beta Phase (Months 12-15):**

- **Audience:** 100-200 early adopters from community
- **Recruitment:**
  - Sign-up form on landing page
  - Accept applications with reasons for interest
  - Prioritize diverse use cases

- **Goals:**
  - Stress test infrastructure
  - Validate market positioning
  - Gather testimonials
  - Identify must-have features

- **Incentives:**
  - Free lifetime access (or heavily discounted)
  - Beta tester badge
  - Input on roadmap
  - Early access to new features

## 19.2 Target Market Segmentation

### 19.2.1 Primary Target Segments

**1. Power Users & Productivity Enthusiasts (Initial Focus)**

- **Demographics:**
  - Age: 25-45
  - Occupation: Knowledge workers, entrepreneurs, students
  - Tech-savvy, early adopters
  - Currently using 3+ productivity tools

- **Psychographics:**
  - Values efficiency and optimization
  - Enjoys experimenting with new tools
  - Frustrated by tool fragmentation
  - Willing to invest time in setup for long-term gains

- **Pain Points:**
  - Data scattered across multiple apps
  - Missing connections between different life areas
  - Time wasted context-switching
  - Difficulty maintaining consistent tracking

- **Value Proposition:**
  *"Finally see how everything in your life connects. One framework, unlimited insight."*

**2. Quantified Self Community**

- **Demographics:**
  - Age: 28-50
  - Already tracking health, finance, habits extensively
  - Data-driven decision makers

- **Psychographics:**
  - Obsessive about metrics and self-improvement
  - Frustrated with siloed tracking apps
  - Want deeper analysis beyond simple charts
  - Value privacy and data ownership

- **Pain Points:**
  - No easy way to correlate data across domains
  - Export/import hassles between tools
  - Limited insight generation from existing tools
  - Privacy concerns with cloud services

- **Value Proposition:**
  *"Discover the hidden patterns in your life data. Your insights, your servers, your control."*

**3. PKM Enthusiasts (Notion/Obsidian/Roam Users)**

- **Demographics:**
  - Age: 22-40
  - Students, researchers, writers, content creators
  - Heavy note-takers and knowledge organizers

- **Psychographics:**
  - View knowledge as garden to cultivate
  - Appreciate linking and emergence
  - Willing to invest in their "second brain"
  - Some technical comfort but not developers

- **Pain Points:**
  - Current PKM tools focus only on notes/knowledge
  - Want to integrate tasks, goals, health data too
  - Graph views are limited to notes only
  - Seeking "ultimate" unified system

- **Value Proposition:**
  *"Your second brain, evolved. Not just notes—your entire life, intelligently connected."*

### 19.2.2 Secondary Target Segments (Year 2+)

**4. Small Business Owners & Freelancers**

- Need integrated view of personal and business finances
- Project management tied to time tracking
- Client relationships connected to projects and income

**5. Students & Researchers**

- Academic reading and notes linked to coursework
- Research projects connected to deadlines and resources
- Health and schedule optimization for performance

**6. Health-Conscious Individuals**

- Holistic health view (exercise, nutrition, sleep, mental health)
- Medical expenses tied to health events
- Identify triggers and patterns

## 19.3 Positioning and Messaging

### 19.3.1 Core Positioning Statement

**For** knowledge workers and productivity enthusiasts **who** struggle with data fragmentation across multiple apps, **the Personal Knowledge Management Framework** is a **unified dashboard system** that **reveals surprising connections across all areas of your life through intelligent graph-based relationship discovery**, unlike **traditional PKM tools** that **only connect notes and knowledge, leaving the rest of your life data siloed**.

### 19.3.2 Key Messaging Pillars

**1. Unified Intelligence**
- Headline: *"One Dashboard. Infinite Connections."*
- Message: Stop juggling separate apps for finance, health, tasks, and knowledge. See your whole life in one place with automatic relationship discovery.

**2. Graph-Powered Insights**
- Headline: *"Your Data Knows More Than You Think."*
- Message: Neo4j-powered engine automatically discovers patterns you'd never notice—like how your gym expenses correlate with energy levels, or reading habits influence project outcomes.

**3. Privacy & Ownership**
- Headline: *"Your Data, Your Server, Your Rules."*
- Message: Self-hosted option means complete control. No vendor lock-in, no data mining, no surprise policy changes.

**4. Extensible Framework**
- Headline: *"Start Simple. Extend Forever."*
- Message: Begin with financial tracking, add health monitoring, expand to time management—or build your own custom subdomains. The framework grows with you.

### 19.3.3 Competitive Differentiation Matrix

| Feature | Our Framework | Notion | Obsidian | Roam | Todoist | Mint |
|---------|---------------|--------|----------|------|---------|------|
| **Unified Life Dashboard** | ✓ | Partial | ✗ | ✗ | ✗ | ✗ |
| **Graph-Based Relationships** | ✓ | ✗ | Limited | Limited | ✗ | ✗ |
| **Cross-Domain Insights** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Financial Tracking** | ✓ | Manual | ✗ | ✗ | ✗ | ✓ |
| **Health Integration** | ✓ | Manual | ✗ | ✗ | ✗ | ✗ |
| **Task Management** | ✓ | ✓ | Plugins | ✗ | ✓ | ✗ |
| **Knowledge Base** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Self-Hosted Option** | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Extensible Plugins** | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Multi-Platform** | ✓ | ✓ | ✓ | Web Only | ✓ | ✓ |
| **Offline-First** | ✓ | Partial | ✓ | ✗ | Partial | ✗ |

**Key Differentiator Summary:**

*"We're the only platform that treats your finances, health, tasks, and knowledge as equally important, interconnected parts of one system—with a graph database automatically discovering the patterns between them."*

## 19.4 Pricing Models

### 19.4.1 Freemium Model (Recommended)

**Free Tier:**
- Core framework with 3 subdomains
- Desktop and PWA access
- Up to 10,000 entities
- Neo4j Community Edition backend
- Community support
- Data export capabilities

**Pro Tier - $9.99/month or $99/year:**
- Unlimited subdomains
- Echo Show integration
- Unlimited entities
- Advanced relationship discovery algorithms
- Priority support
- Custom subdomains development tools
- Neo4j Enterprise features
- 50GB cloud storage for attachments

**Team Tier - $49/month (Future):**
- Everything in Pro
- Up to 10 users
- Shared dashboards
- Collaboration features
- Team admin controls
- 500GB shared storage

**Enterprise Tier - Custom Pricing (Future):**
- Custom deployment
- On-premise installation support
- SLA guarantees
- Dedicated success manager
- Custom integrations
- Unlimited storage

**Self-Hosted Option:**
- One-time purchase: $199
- Includes all Pro features
- Your own infrastructure
- Technical support via community
- Optional paid support packages

### 19.4.2 Alternative: Premium-Only Model

**Single Tier - $14.99/month or $149/year:**
- All features included
- No artificial limitations
- Simpler messaging
- Higher quality user base
- 14-day free trial

**Rationale:**
- Avoids freemium support burden for solo dev
- Filters for serious users
- More predictable revenue
- Focus on paying customers

**Recommendation:** Start with premium-only during beta, transition to freemium at v1.0 if user acquisition is slow.

#### 19.4.3 Revenue Projections

**Conservative 18-Month Scenario:**

| Month | Beta Users | Paid Users | MRR | Notes |
|-------|-----------|------------|-----|-------|
| 12 | 200 | 0 | $0 | Beta launch |
| 15 | 500 | 50 | $500 | v1.0, paid launch |
| 18 | 1000 | 200 | $2,000 | Word of mouth |
| 24 | 2500 | 600 | $6,000 | First marketing push |
| 36 | 8000 | 2000 | $20,000 | Established product |

**Assumptions:**
- $9.99/month average (mix of monthly/annual)
- 20% beta → paid conversion
- 5% monthly growth after launch
- No paid marketing initially

## 19.5 Distribution Channels

### 19.5.1 Direct Channels

**1. Product Website:**
- **URL:** personalframeworks.com (or similar)
- **Key Pages:**
  - Homepage: Clear value prop, demo video, feature highlights
  - Features: Detailed subdomain descriptions
  - Pricing: Transparent comparison table
  - Download: Desktop installers, PWA install instructions
  - Docs: Comprehensive user guides
  - Blog: SEO-focused content, updates
  - Community: Forum or Discord link

**2. Landing Pages:**
- Specific pages for each target segment:
  - `/for-productivity-enthusiasts`
  - `/for-quantified-self`
  - `/notion-alternative`
  - `/obsidian-alternative`
  - Each optimized for segment-specific keywords and pain points

**3. Desktop App Stores:**
- **Microsoft Store:** For Windows users
- **Mac App Store:** For macOS users (requires Apple Developer account)
- **Snap Store / Flathub:** For Linux users

**4. PWA Discoverability:**
- Submit to PWA directories
- Optimize for "Add to Home Screen" prompts
- Ensure lighthouse scores are excellent

### 19.5.2 Community & Content Channels

**1. Content Marketing:**

**Blog Topics (SEO-Focused):**
- "Best Notion Alternatives for [Use Case]"
- "How to Build a Personal Knowledge Management System"
- "Quantified Self: Ultimate Guide to Tracking Your Life"
- "Neo4j for Personal Use: Discovering Life Patterns"
- Case studies: "How I Discovered [Insight] Using Life Data"

**2. YouTube:**
- Product walkthroughs and tutorials
- "Building in Public" development vlogs
- Integration guides (e.g., "Import Your Notion Data")
- Power user tips and workflows

**3. Podcast Appearances:**
- Pitch to productivity and PKM podcasts
- Developer/indie hacker shows
- Quantified Self community podcasts

**4. Guest Posts:**
- Write for:
  - Product Hunt blog
  - Indie Hackers
  - Dev.to
  - PKM community blogs

**5. Social Communities:**
- **Reddit:**
  - r/productivity
  - r/datacurator
  - r/QuantifiedSelf
  - r/ObsidianMD (gently promote as alternative)
  - r/selfhosted
  - r/opensource

- **Hacker News:**
  - "Show HN" launch post
  - Technical deep-dives about architecture
  - Open-source component releases

- **Product Hunt:**
  - Launch with well-coordinated timing
  - Prepare assets (screenshots, demo video, FAQs)
  - Rally beta testers for launch day support

### 19.5.3 Partnership Opportunities

**1. Integration Partners:**
- Partner with complementary tools:
  - Zapier: Build official Zapier integration
  - IFTTT: Create applets
  - Health apps: Official Apple Health / Google Fit integration
  - Financial APIs: Plaid partnership for bank connections

**2. Affiliate Programs:**
- Offer 20% recurring commission to:
  - PKM influencers and YouTubers
  - Productivity bloggers
  - App review sites

**3. Educational Institutions:**
- Offer free/discounted plans for students
- Create educational content on data analysis
- Sponsor PKM workshops or courses

**4. Developer Communities:**
- Sponsor Neo4j community events
- Present at graph database conferences
- Collaborate with React/Next.js community

## 19.6 Marketing Tactics

### 19.6.1 Pre-Launch (Months 10-15)

**Objective:** Build anticipation and early user base

**Tactics:**
1. **Waitlist Campaign:**
   - Landing page with email signup
   - Early bird discount for first 500 signups
   - Regular updates to waitlist
   - Share progress milestones

2. **Building in Public:**
   - Daily tweets about development
   - Weekly blog posts
   - Behind-the-scenes look at challenges

3. **Beta Tester Recruitment:**
   - Targeted outreach to power users
   - Pitch PKM communities
   - Emphasize exclusive early access

4. **Content Seeding:**
   - Publish 20+ blog posts before launch
   - Create 10+ tutorial videos
   - Optimize for SEO

### 19.6.2 Launch (Month 15-16)

**Objective:** Maximize visibility and initial conversions

**Tactics:**
1. **Coordinated Launch:**
   - Product Hunt (aim for #1 of the day)
   - Hacker News "Show HN"
   - Reddit posts in relevant communities
   - Twitter announcement thread
   - Email waitlist with special offer

2. **Press Outreach:**
   - Pitch to tech bloggers (TechCrunch, The Verge)
   - Productivity tool review sites
   - Niche PKM publications

3. **Influencer Seeding:**
   - Provide free Pro accounts to PKM influencers
   - Ask for honest reviews
   - No payment, just exposure

4. **Launch Promotion:**
   - 30% off annual plans for first month
   - Limited-time lifetime deal option (risky but generates buzz)
   - Free t-shirt for first 100 paying customers

### 19.6.3 Growth Phase (Months 17-24)

**Objective:** Sustainable user acquisition and retention

**Tactics:**
1. **SEO Content Machine:**
   - 2-3 blog posts per week
   - Target long-tail keywords
   - Comparison pages for competitors
   - Regular updates to existing content

2. **User-Generated Content:**
   - Encourage users to share setups
   - Feature "Dashboard of the Week"
   - User testimonials and case studies
   - Video testimonials from power users

3. **Referral Program:**
   - Give 1 month free for each referral
   - Referred user gets 20% off first year
   - Gamify with leaderboard

4. **Community Engagement:**
   - Active presence in Discord/forums
   - Weekly office hours or Q&A
   - Feature requests voting
   - Rapid response to feedback

5. **Paid Advertising (If Needed):**
   - Start small: $500/month budget
   - Google Ads: Target high-intent keywords
   - Reddit Ads: Target niche communities
   - Twitter Ads: Promoted tweets to specific audiences
   - Track CAC vs. LTV carefully

### 19.6.4 Retention & Expansion

**Objective:** Keep users engaged and increase LTV

**Tactics:**
1. **Onboarding Excellence:**
   - Interactive tutorial on first use
   - Email drip campaign with tips
   - "Quick wins" checklist
   - Personal check-in after 1 week

2. **Feature Announcements:**
   - Monthly newsletter with updates
   - In-app notifications for new features
   - Changelog blog posts

3. **User Success Stories:**
   - Case studies showing real value
   - "How I use..." series from users
   - Quantified results (time saved, insights discovered)

4. **Upsell Opportunities:**
   - Email campaigns to free users highlighting Pro benefits
   - In-app prompts when users hit limits
   - Special upgrade offers (e.g., annual plan discount)

5. **Community Champions:**
   - Identify power users and super fans
   - Create ambassador program
   - Exclusive access to beta features
   - Spotlight their work

## 19.7 Launch Timeline & Milestones

### 19.7.1 Pre-Launch Milestones

**Month 10-11 (Alpha):**
- [ ] 20 alpha testers actively using product
- [ ] Core bugs resolved
- [ ] Documentation drafted
- [ ] Landing page live with waitlist

**Month 12 (Beta Launch):**
- [ ] 100+ beta testers accepted
- [ ] Beta launch blog post published
- [ ] Discord community active (50+ members)
- [ ] First 10 blog posts published

**Month 13-14 (Beta Iteration):**
- [ ] Waitlist reaches 500+
- [ ] Weekly blog post cadence established
- [ ] Beta feedback incorporated
- [ ] Pricing finalized

**Month 15 (v1.0 Launch):**
- [ ] Public launch on Product Hunt
- [ ] All launch content ready (videos, screenshots, FAQs)
- [ ] Payment processing configured
- [ ] Support system ready (email, Discord)

### 19.7.2 Post-Launch Milestones

**Month 16-18 (Early Growth):**
- [ ] 200+ paying customers
- [ ] MRR reaches $2,000
- [ ] First case studies published
- [ ] Referral program launched

**Month 19-24 (Scaling):**
- [ ] 1,000+ paying customers
- [ ] MRR reaches $10,000
- [ ] First paid marketing experiments
- [ ] Consider hiring first employee / contractor

## 19.8 Success Metrics (KPIs)

### 19.8.1 Acquisition Metrics

- **Website Traffic:** Target 10,000 monthly visitors by Month 18
- **Conversion Rate (Free Trial):** Target 5%
- **Trial-to-Paid Conversion:** Target 25%
- **Customer Acquisition Cost (CAC):** Target < $50 (3x LTV target)
- **Waitlist Growth Rate:** 50+ signups per week pre-launch

### 19.8.2 Activation Metrics

- **Onboarding Completion:** Target 80% complete tutorial
- **Time to First Value:** Target < 15 minutes (first entity created)
- **Subdomain Activation:** Target 2+ subdomains enabled within first week
- **Cross-Domain Query:** Target 1+ relationship discovery viewed within first month

### 19.8.3 Retention Metrics

- **Day 7 Retention:** Target 60%
- **Day 30 Retention:** Target 40%
- **Churn Rate:** Target < 5% monthly
- **Net Promoter Score (NPS):** Target > 50

### 19.8.4 Revenue Metrics

- **Monthly Recurring Revenue (MRR):** Track growth rate
- **Annual Recurring Revenue (ARR):** Target $24,000 by Month 18
- **Customer Lifetime Value (LTV):** Target $150+ (15 months avg. lifetime)
- **LTV:CAC Ratio:** Target 3:1 or higher
- **Expansion Revenue:** Track upgrades from Free → Pro

### 19.8.5 Engagement Metrics

- **Daily Active Users (DAU):** Target 60% of user base
- **Entities Created per User:** Track weekly
- **Cross-Domain Queries per Session:** Track average
- **Session Duration:** Track median
- **Features Used per Session:** Target 3+ different subdomains per week

## 19.9 Marketing Budget (First 18 Months)

**Assumption:** Bootstrapped, minimal budget

**Month 12-15 (Pre-Launch):**
- **Total:** $1,500
  - Landing page design: $500
  - Email marketing tool: $300 ($25/mo x 12)
  - Stock images/assets: $200
  - Domain & hosting: $500 (annual)

**Month 15-18 (Launch):**
- **Total:** $3,000
  - Product Hunt promotion: $500
  - Demo video production: $1,000
  - Influencer outreach (free accounts): $0
  - Social media ads testing: $1,000 ($250/mo x 4)
  - PR/press outreach tools: $500

**Month 18-24 (Growth):**
- **Total:** $6,000 (or 30% of MRR, whichever is higher)
  - Content marketing (freelance writers): $2,000
  - Paid advertising: $3,000
  - Tools (analytics, SEO, etc.): $1,000

**Total 18-Month Investment:** $10,500

## 19.10 Competitive Advantages to Emphasize

**Technical Advantages:**
1. **Neo4j at the Core:** No other PKM tool uses a graph database for all data types
2. **True Cross-Domain Intelligence:** Automatic pattern discovery across disparate life areas
3. **Offline-First PWA:** Works without internet, syncs when connected
4. **Multi-Platform Native:** Not just web wrapper—optimized for each platform

**Product Advantages:**
1. **Unified Life Dashboard:** One place for everything, not just knowledge
2. **Extensible Framework:** Users can add custom subdomains
3. **Privacy-First:** Self-hosted option, no data mining
4. **Open Ecosystem:** Will support plugins from community

**Business Advantages:**
1. **First-Mover:** No direct competitor in this specific niche
2. **Passionate Developer:** Authentic story of scratching own itch
3. **Community-Driven:** Built in public with user input
4. **Sustainable Pricing:** Fair pricing, no VC pressure to exit

## 19.11 Messaging Refinement by Channel

**Product Hunt:**
- Headline: *"Your Entire Life, Intelligently Connected | Personal Dashboard Framework"*
- Tagline: *"The first productivity system that treats your finances, health, tasks, and knowledge as one interconnected graph. Discover patterns you never knew existed."*
- First Comment: Technical deep-dive into Neo4j implementation and why it matters

**Hacker News:**
- Title: *"Show HN: Personal Dashboard Framework with Neo4j-powered relationship discovery"*
- Focus: Technical architecture, self-hosted option, open-source components
- Tone: Technical, humble, focused on solving real problem

**Reddit (r/productivity):**
- Title: *"I built a dashboard that automatically discovers connections between my finances, health, and tasks"*
- Focus: Personal story, specific insights discovered, how it improved life
- Tone: Personal, relatable, avoid promotional language

**Twitter Launch Thread:**
- Hook: *"After 18 months of development, I'm launching the personal dashboard system I wish existed. Here's why it's different 🧵"*
- Focus: Quick wins, visual demos, graph visualizations
- Tone: Enthusiastic but authentic, technical but accessible

## 19.12 Contingency Plans

**If Initial Traction is Slow:**

**Plan A: Pivot to Niche**
- Focus on single vertical (e.g., "The Ultimate Health Dashboard")
- Simplify messaging
- Target specific community aggressively

**Plan B: Open Source Core**
- Release framework core as open source
- Build community through contributions
- Monetize through hosting, support, premium subdomains

**Plan C: Enterprise Pivot**
- Reposition as team collaboration tool
- Focus on small businesses and remote teams
- Higher pricing, fewer users, more support-intensive

**If Scaling Too Fast:**
- Enable paid tier earlier to slow free users
- Increase infrastructure spending
- Consider temporary waitlist for free tier
- Hire contractor for support

**If Competition Emerges:**
- Emphasize technical superiority (Neo4j graph)
- Focus on extensibility advantage
- Build moat through community and ecosystem
- Consider strategic partnerships

---

# 18. Learning Resources & Implementation Guides

## 18.1 Echo Show Development Resources

**[BEGINNER LEARNING PATH: Alexa Skills Kit from zero to production]**

### Phase 1: Alexa Skills Kit Fundamentals (Week 1-2)

**Essential Reading:**
- [Alexa Skills Kit Official Documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)
- [Voice User Interface Design Guide](https://developer.amazon.com/en-US/docs/alexa/alexa-design/voice-interface-design.html)
- [ASK SDK for Node.js Quick Start](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/overview.html)

**Hands-On Tutorials:**
```bash
# Start with official Hello World tutorial
npm install -g ask-cli
ask configure
ask new --template "Hello World" --skill-name "my-first-skill"
cd my-first-skill
ask deploy
ask dialog --locale en-US

# Practice conversation:
# User: "open my first skill"
# Alexa: "Hello! Welcome to my first skill..."
```

**Key Concepts to Master:**
1. **Invocation Names:** How users start your skill ("Alexa, open personal dashboard")
2. **Intents:** User intentions mapped to functions (ShowSummaryIntent, AddExpenseIntent)
3. **Slots:** Variable data in user utterances (amounts, categories, dates)
4. **Session Management:** Keeping conversation state between user turns
5. **Lambda Functions:** Backend processing for skill logic

### Phase 2: Voice Interaction Design (Week 3-4)

**Advanced Voice UX Concepts:**
```javascript
// Multi-turn conversation example
const AddExpenseIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddExpenseIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // Check what information we're missing
    if (!slots.Amount || !slots.Amount.value) {
      sessionAttributes.collectingExpense = true;
      sessionAttributes.missingSlot = 'amount';
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      
      return handlerInput.responseBuilder
        .speak("What was the amount of the expense?")
        .reprompt("How much did you spend?")
        .getResponse();
    }
    
    if (!slots.Category || !slots.Category.value) {
      sessionAttributes.amount = slots.Amount.value;
      sessionAttributes.missingSlot = 'category';
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      
      return handlerInput.responseBuilder
        .speak(`Got it, ${slots.Amount.value} dollars. What category was that for?`)
        .reprompt("What category should I use for this expense?")
        .getResponse();
    }
    
    // All information collected, process the expense
    return this.processCompleteExpense(handlerInput, slots);
  }
};
```

**Voice Design Best Practices:**
1. **Conversational Confirmations:** "I've added a $25 medical expense. Anything else?"
2. **Error Recovery:** "Sorry, I didn't catch that. Could you repeat the amount?"
3. **Context Awareness:** "I noticed you have a doctor appointment today - should I link them?"
4. **Progressive Disclosure:** Start simple, add complexity as users become comfortable

### Phase 3: APL Visual Design (Week 5-6)

**APL (Alexa Presentation Language) Essentials:**
```json
{
  "type": "APL",
  "version": "2023.3",
  "theme": "dark",
  "import": [
    {
      "name": "alexa-layouts",
      "version": "1.7.0"
    }
  ],
  "mainTemplate": {
    "parameters": ["payload"],
    "item": {
      "type": "Container",
      "items": [
        {
          "type": "Text",
          "text": "${payload.title}",
          "style": "textStyleDisplay1",
          "textAlign": "center"
        },
        {
          "type": "GridSequence",
          "data": "${payload.listItems}",
          "numColumns": 3,
          "item": {
            "type": "Container",
            "items": [
              {
                "type": "Text",
                "text": "${data.title}",
                "style": "textStyleHeadline2"
              },
              {
                "type": "Text", 
                "text": "${data.value}",
                "style": "textStyleDisplay2",
                "color": "${data.color}"
              }
            ]
          }
        }
      ]
    }
  }
}
```

**Visual Design Principles:**
- **Large Text:** Echo Show viewed from distance, use 24pt+ fonts
- **High Contrast:** Dark theme with bright accent colors
- **Grid Layouts:** Information cards work better than complex layouts
- **Minimal Animation:** Subtle transitions, avoid distracting motion
- **Touch Targets:** 44dp minimum for interactive elements

### Phase 4: Integration with Backend API (Week 7-8)

**API Integration Pattern:**
```typescript
// Lambda function calling your main API
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

export class PersonalDashboardAPI {
  async getSummary(userId: string): Promise<DashboardSummary> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/summary`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-User-Id': userId
        },
        timeout: 5000 // 5 second timeout
      });
      
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error('Unable to fetch dashboard summary');
    }
  }
  
  async addExpense(userId: string, expense: ExpenseData): Promise<void> {
    const response = await axios.post(`${API_BASE_URL}/api/financial/expenses`, 
      { ...expense, userId }, 
      { 
        headers: { 'Authorization': `Bearer ${API_KEY}` },
        timeout: 10000 
      }
    );
    
    if (response.status !== 201) {
      throw new Error('Failed to create expense');
    }
  }
}
```

**Error Handling for Voice:**
```typescript
const ErrorHandler = {
  canHandle() { return true; },
  handle(handlerInput, error) {
    console.error('Skill error:', error);
    
    // User-friendly error messages
    let speechText = "Sorry, something went wrong. ";
    
    if (error.message.includes('timeout')) {
      speechText += "The service is taking too long to respond. Please try again in a moment.";
    } else if (error.message.includes('network')) {
      speechText += "I'm having trouble connecting right now. Please check back later.";
    } else {
      speechText += "Please try again, and if the problem continues, check the app on your phone.";
    }
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("Is there anything else I can help you with?")
      .getResponse();
  }
};
```

**Recommended Learning Resources:**
- [Voice Design Guide](https://developer.amazon.com/en-US/docs/alexa/alexa-design/get-started.html)
- [APL Documentation](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-overview.html)
- [Alexa Skills Kit Tutorials](https://developer.amazon.com/en-US/alexa/alexa-skills-kit/get-deeper/tutorials-code-samples)
- [Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html)

## 18.2 Mobile PWA Advanced Patterns

**[INTERMEDIATE TO ADVANCED: Building Production PWAs]**

### Service Worker Mastery

**Advanced Caching Strategies:**
```typescript
// Sophisticated caching with Workbox
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// API responses with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Static assets with cache-first strategy
registerRoute(
  ({ request }) => 
    request.destination === 'image' || 
    request.destination === 'style' ||
    request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Background sync for mutations
import { BackgroundSync } from 'workbox-background-sync';

const bgSync = new BackgroundSync('expense-queue', {
  maxRetentionTime: 24 * 60 // 24 hours
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && 
      event.request.url.includes('/api/expenses')) {
    
    // Try network first
    event.respondWith(
      fetch(event.request.clone()).catch(() => {
        // If network fails, add to background sync queue
        return bgSync.registerSync();
      })
    );
  }
});
```

**Advanced IndexedDB Patterns:**
```typescript
// Sophisticated offline data management
class OfflineDataManager {
  private db: IDBDatabase;
  
  async initialize(): Promise<void> {
    this.db = await this.openDatabase();
  }
  
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PersonalDashboard', 3);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores with indexes
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
          transactionStore.createIndex('amount', 'amount', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('relationships')) {
          const relationshipStore = db.createObjectStore('relationships', { keyPath: 'id' });
          relationshipStore.createIndex('sourceId', 'sourceId', { unique: false });
          relationshipStore.createIndex('targetId', 'targetId', { unique: false });
        }
      };
    });
  }
  
  async storeWithRelationships(entity: any, relationships: Relationship[]): Promise<void> {
    const transaction = this.db.transaction(['transactions', 'relationships'], 'readwrite');
    
    try {
      // Store main entity
      await this.putInObjectStore(transaction.objectStore('transactions'), entity);
      
      // Store relationships
      const relationshipStore = transaction.objectStore('relationships');
      for (const relationship of relationships) {
        await this.putInObjectStore(relationshipStore, relationship);
      }
      
      await this.waitForTransaction(transaction);
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }
  
  async queryWithRelationships(entityId: string): Promise<EntityWithRelationships> {
    const transaction = this.db.transaction(['transactions', 'relationships'], 'readonly');
    
    // Get main entity
    const entity = await this.getFromObjectStore(
      transaction.objectStore('transactions'), 
      entityId
    );
    
    // Get related entities
    const relationshipStore = transaction.objectStore('relationships');
    const sourceIndex = relationshipStore.index('sourceId');
    const targetIndex = relationshipStore.index('targetId');
    
    const [sourceRelationships, targetRelationships] = await Promise.all([
      this.getAllFromIndex(sourceIndex, entityId),
      this.getAllFromIndex(targetIndex, entityId)
    ]);
    
    return {
      entity,
      relationships: [...sourceRelationships, ...targetRelationships]
    };
  }
}
```

### Advanced React Patterns for PWAs

**Optimistic Updates with Rollback:**
```typescript
// Custom hook for optimistic mutations
function useOptimisticMutation<T, P>(
  mutationFn: (params: P) => Promise<T>,
  optimisticUpdateFn: (currentData: T[], params: P) => T[],
  rollbackFn: (currentData: T[], params: P) => T[]
) {
  const [data, setData] = useState<T[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Map<string, P>>(new Map());
  
  const mutate = useCallback(async (params: P) => {
    const operationId = generateId();
    
    try {
      // Optimistic update
      setData(current => optimisticUpdateFn(current, params));
      setPendingOperations(current => new Map(current).set(operationId, params));
      
      // Actual mutation
      const result = await mutationFn(params);
      
      // Remove from pending operations
      setPendingOperations(current => {
        const updated = new Map(current);
        updated.delete(operationId);
        return updated;
      });
      
      return result;
      
    } catch (error) {
      // Rollback optimistic update
      setData(current => rollbackFn(current, params));
      setPendingOperations(current => {
        const updated = new Map(current);
        updated.delete(operationId);
        return updated;
      });
      
      throw error;
    }
  }, [mutationFn, optimisticUpdateFn, rollbackFn]);
  
  return { data, mutate, pendingOperations: pendingOperations.size > 0 };
}

// Usage in component
const ExpenseList: React.FC = () => {
  const { data: expenses, mutate: addExpense, pendingOperations } = useOptimisticMutation(
    // Actual API call
    (expense: Expense) => api.createExpense(expense),
    
    // Optimistic update
    (current: Expense[], newExpense: Expense) => [newExpense, ...current],
    
    // Rollback function
    (current: Expense[], failedExpense: Expense) => 
      current.filter(expense => expense.id !== failedExpense.id)
  );
  
  return (
    <div>
      {pendingOperations && <div className="sync-indicator">Syncing...</div>}
      {expenses.map(expense => (
        <ExpenseCard 
          key={expense.id} 
          expense={expense}
          isPending={pendingOperations}
        />
      ))}
    </div>
  );
};
```

## 18.3 Neo4j Optimization Resources

**[INTERMEDIATE TO ADVANCED: Production Neo4j Performance]**

### Query Optimization Techniques

**Index Strategy for Personal Data:**
```cypher
-- Essential indexes for performance
CREATE INDEX user_entities IF NOT EXISTS FOR (u:User) ON (u.id);
CREATE INDEX transaction_dates IF NOT EXISTS FOR (t:Transaction) ON (t.date);
CREATE INDEX health_event_dates IF NOT EXISTS FOR (h:HealthEvent) ON (h.date);
CREATE INDEX calendar_event_dates IF NOT EXISTS FOR (c:CalendarEvent) ON (c.start_time);

-- Composite indexes for common query patterns
CREATE INDEX user_transaction_date IF NOT EXISTS FOR (t:Transaction) ON (t.userId, t.date);
CREATE INDEX relationship_confidence IF NOT EXISTS FOR ()-[r:RELATED_TO]-() ON (r.confidence);

-- Full-text search indexes
CREATE FULLTEXT INDEX entity_search IF NOT EXISTS 
FOR (t:Transaction|h:HealthEvent|c:CalendarEvent|n:Note) 
ON EACH [t.description, h.description, c.title, n.content];
```

**Optimized Relationship Discovery Queries:**
```cypher
-- Efficient temporal correlation discovery
MATCH (u:User {id: $userId})-[:INCURRED]->(t:Transaction)
MATCH (u)-[:EXPERIENCED]->(h:HealthEvent)
WHERE t.date >= date($startDate) 
  AND t.date <= date($endDate)
  AND abs(duration.between(t.date, h.date).days) <= $maxDaysDifference
  AND NOT (t)-[:RELATED_TO]-(h)
WITH t, h, duration.between(t.date, h.date) as timeDiff
ORDER BY abs(timeDiff.days)
LIMIT $maxSuggestions
RETURN t.id as transactionId, 
       h.id as healthEventId,
       timeDiff,
       'temporal_correlation' as suggestionType,
       CASE 
         WHEN abs(timeDiff.days) = 0 THEN 0.9
         WHEN abs(timeDiff.days) = 1 THEN 0.7  
         ELSE 0.5
       END as confidence;

-- Efficient semantic similarity discovery
MATCH (u:User {id: $userId})-[:CREATED|INCURRED|EXPERIENCED]->(e1)
MATCH (u)-[:CREATED|INCURRED|EXPERIENCED]->(e2)
WHERE id(e1) < id(e2) // Avoid duplicate pairs
  AND NOT (e1)-[:RELATED_TO]-(e2)
  AND (
    // Shared keywords in descriptions
    any(word IN split(toLower(e1.description), ' ') 
        WHERE word IN split(toLower(e2.description), ' ') 
        AND length(word) > 3)
    OR
    // Shared locations
    (exists(e1.location) AND exists(e2.location) 
     AND e1.location = e2.location)
    OR
    // Shared people (from mentions or relationships)
    exists((e1)-[:MENTIONS|INVOLVES]->(p:Person)<-[:MENTIONS|INVOLVES]-(e2))
  )
RETURN e1.id, e2.id, 
       'semantic_similarity' as suggestionType,
       0.6 as confidence
LIMIT $maxSuggestions;
```

**Memory-Efficient Large Dataset Queries:**
```cypher
-- Use PERIODIC COMMIT for large data imports
:auto USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM 'file:///transactions.csv' AS row
MERGE (u:User {id: row.userId})
CREATE (t:Transaction {
  id: row.id,
  amount: toFloat(row.amount),
  date: date(row.date),
  description: row.description,
  category: row.category
})
MERGE (u)-[:INCURRED]->(t);

-- Efficient pagination for large result sets
MATCH (u:User {id: $userId})-[:INCURRED]->(t:Transaction)
WHERE t.date >= date($startDate)
ORDER BY t.date DESC
SKIP $offset
LIMIT $limit
RETURN t;

-- Memory-conscious relationship traversal
MATCH path = (start:Transaction {id: $transactionId})-[*1..2]-(connected)
WHERE NOT start = connected
WITH connected, 
     length(path) as depth,
     [rel in relationships(path) | type(rel)] as relationshipTypes
ORDER BY depth, id(connected)
LIMIT 20
RETURN connected, depth, relationshipTypes;
```

**Performance Monitoring:**
```cypher
-- Query performance analysis
PROFILE
MATCH (u:User {id: $userId})-[:INCURRED]->(t:Transaction)
WHERE t.date >= date('2024-01-01')
RETURN count(t);

-- Check index usage
SHOW INDEXES YIELD name, type, entityType, properties, state;

-- Monitor database statistics
CALL dbms.queryJmx("org.neo4j:instance=kernel#0,name=*") 
YIELD attributes
WHERE attributes.Name CONTAINS "Transaction";
```

**Recommended Learning Resources:**
- [Neo4j Performance Tuning Guide](https://neo4j.com/developer/guide-performance-tuning/)
- [Cypher Query Tuning](https://neo4j.com/developer/cypher-query-tuning/)
- [Neo4j Operations Manual](https://neo4j.com/docs/operations-manual/current/)
- [Graph Data Science Library](https://neo4j.com/docs/graph-data-science/)

## 18.4 Cross-Platform Sync Patterns

**[ADVANCED: Distributed Systems Patterns for Personal Apps]**

### Conflict-Free Replicated Data Types (CRDTs)

**CRDT Implementation for Personal Data:**
```typescript
// Last-Writer-Wins Register for simple fields
class LWWRegister<T> {
  constructor(
    private value: T,
    private timestamp: number,
    private nodeId: string
  ) {}
  
  update(newValue: T, timestamp: number, nodeId: string): LWWRegister<T> {
    if (timestamp > this.timestamp || 
        (timestamp === this.timestamp && nodeId > this.nodeId)) {
      return new LWWRegister(newValue, timestamp, nodeId);
    }
    return this;
  }
  
  merge(other: LWWRegister<T>): LWWRegister<T> {
    return this.update(other.value, other.timestamp, other.nodeId);
  }
}

// OR-Set for collections (like tags, categories)
class ORSet<T> {
  private added = new Map<T, Set<string>>();  // element -> set of unique tags
  private removed = new Map<T, Set<string>>();
  
  add(element: T, uniqueTag: string): ORSet<T> {
    const newSet = this.clone();
    if (!newSet.added.has(element)) {
      newSet.added.set(element, new Set());
    }
    newSet.added.get(element)!.add(uniqueTag);
    return newSet;
  }
  
  remove(element: T): ORSet<T> {
    const newSet = this.clone();
    if (this.added.has(element)) {
      const tags = this.added.get(element)!;
      newSet.removed.set(element, new Set(tags));
    }
    return newSet;
  }
  
  contains(element: T): boolean {
    const addedTags = this.added.get(element) || new Set();
    const removedTags = this.removed.get(element) || new Set();
    
    // Element exists if it has added tags not in removed tags
    return [...addedTags].some(tag => !removedTags.has(tag));
  }
  
  merge(other: ORSet<T>): ORSet<T> {
    const merged = this.clone();
    
    // Merge added elements
    for (const [element, tags] of other.added) {
      if (!merged.added.has(element)) {
        merged.added.set(element, new Set());
      }
      for (const tag of tags) {
        merged.added.get(element)!.add(tag);
      }
    }
    
    // Merge removed elements
    for (const [element, tags] of other.removed) {
      if (!merged.removed.has(element)) {
        merged.removed.set(element, new Set());
      }
      for (const tag of tags) {
        merged.removed.get(element)!.add(tag);
      }
    }
    
    return merged;
  }
}

// CRDT-based Transaction entity
class CRDTTransaction {
  constructor(
    public id: string,
    public amount: LWWRegister<number>,
    public description: LWWRegister<string>,
    public tags: ORSet<string>,
    public relationships: ORSet<string> // IDs of related entities
  ) {}
  
  updateAmount(newAmount: number, timestamp: number, nodeId: string): CRDTTransaction {
    return new CRDTTransaction(
      this.id,
      this.amount.update(newAmount, timestamp, nodeId),
      this.description,
      this.tags,
      this.relationships
    );
  }
  
  addTag(tag: string, uniqueId: string): CRDTTransaction {
    return new CRDTTransaction(
      this.id,
      this.amount,
      this.description,
      this.tags.add(tag, uniqueId),
      this.relationships
    );
  }
  
  merge(other: CRDTTransaction): CRDTTransaction {
    if (this.id !== other.id) {
      throw new Error('Cannot merge transactions with different IDs');
    }
    
    return new CRDTTransaction(
      this.id,
      this.amount.merge(other.amount),
      this.description.merge(other.description),
      this.tags.merge(other.tags),
      this.relationships.merge(other.relationships)
    );
  }
}
```

### Vector Clocks for Causality

**Vector Clock Implementation:**
```typescript
class VectorClock {
  constructor(private clock: Map<string, number> = new Map()) {}
  
  increment(nodeId: string): VectorClock {
    const newClock = new Map(this.clock);
    newClock.set(nodeId, (newClock.get(nodeId) || 0) + 1);
    return new VectorClock(newClock);
  }
  
  update(other: VectorClock): VectorClock {
    const newClock = new Map(this.clock);
    
    for (const [nodeId, time] of other.clock) {
      newClock.set(nodeId, Math.max(newClock.get(nodeId) || 0, time));
    }
    
    return new VectorClock(newClock);
  }
  
  compareWith(other: VectorClock): 'before' | 'after' | 'concurrent' {
    let thisGreater = false;
    let otherGreater = false;
    
    const allNodes = new Set([...this.clock.keys(), ...other.clock.keys()]);
    
    for (const nodeId of allNodes) {
      const thisTime = this.clock.get(nodeId) || 0;
      const otherTime = other.clock.get(nodeId) || 0;
      
      if (thisTime > otherTime) thisGreater = true;
      if (otherTime > thisTime) otherGreater = true;
    }
    
    if (thisGreater && !otherGreater) return 'after';
    if (otherGreater && !thisGreater) return 'before';
    return 'concurrent';
  }
}

// Event with vector clock
interface SyncEvent {
  id: string;
  data: any;
  vectorClock: VectorClock;
  nodeId: string;
}

class EventLog {
  private events: SyncEvent[] = [];
  private vectorClock: VectorClock = new VectorClock();
  
  constructor(private nodeId: string) {}
  
  addEvent(data: any): SyncEvent {
    this.vectorClock = this.vectorClock.increment(this.nodeId);
    
    const event: SyncEvent = {
      id: generateId(),
      data,
      vectorClock: this.vectorClock,
      nodeId: this.nodeId
    };
    
    this.events.push(event);
    return event;
  }
  
  mergeEvents(remoteEvents: SyncEvent[]): void {
    for (const remoteEvent of remoteEvents) {
      // Update our vector clock
      this.vectorClock = this.vectorClock.update(remoteEvent.vectorClock);
      
      // Add event if we don't have it
      if (!this.events.some(e => e.id === remoteEvent.id)) {
        this.events.push(remoteEvent);
      }
    }
    
    // Sort events by causality
    this.events.sort((a, b) => {
      const comparison = a.vectorClock.compareWith(b.vectorClock);
      if (comparison === 'before') return -1;
      if (comparison === 'after') return 1;
      return a.id.localeCompare(b.id); // Deterministic ordering for concurrent events
    });
  }
}
```

**Recommended Advanced Learning:**
- [Conflict-Free Replicated Data Types](https://crdt.tech/)
- [Designing Data-Intensive Applications](https://dataintensive.net/) - Chapter 5 on Replication
- [Local-First Software](https://www.inkandswitch.com/local-first.html) - Research paper on local-first architectures
- [Building Mobile Apps with Ionic & Angular](https://ionicframework.com/docs) - Alternative mobile approach
- [Apache CouchDB Guide](https://guide.couchdb.org/) - Document database with built-in sync

---

# Appendices

## Appendix A: Glossary

**APL (Alexa Presentation Language):** Amazon's markup language for creating visual displays on Echo Show devices, combining voice responses with rich visual elements.

**CRDT (Conflict-Free Replicated Data Type):** Data structures that can be updated on multiple devices simultaneously and merged without conflicts, essential for offline-first applications.

**Cross-Domain Relationship:** A connection between data entities from different subdomains (e.g., a medical expense linked to a health event).

**Cypher:** Neo4j's declarative graph query language, similar to SQL but optimized for traversing relationships between nodes.

**Echo Show:** Amazon's smart display device that combines Alexa voice assistant with visual screen interface.

**Graph Traversal:** The process of visiting nodes and edges in a graph database, typically following relationship paths to discover connections.

**IndexedDB:** Browser-based database API for storing large amounts of structured data locally, supporting offline functionality in PWAs.

**Neo4j:** Graph database management system that stores data as nodes and relationships, optimized for complex relationship queries.

**Node (Neo4j):** A data entity in a graph database, representing things like users, transactions, or health events.

**Offline-First:** Design philosophy where applications work fully offline and sync when connectivity is available.

**Plugin Architecture:** System design that allows third-party extensions to add functionality without modifying core code.

**Progressive Web App (PWA):** Web application that uses modern web capabilities to deliver app-like experiences, including offline functionality.

**Relationship Discovery Engine:** Algorithm that automatically identifies potential connections between data entities across different domains.

**Service Worker:** JavaScript that runs in the background of web applications, enabling offline functionality and background sync.

**Subdomain:** A specific area of personal life data (financial, health, schedule) with specialized interface and data types.

**tRPC:** TypeScript-first RPC framework that provides end-to-end type safety between client and server.

**Vector Clock:** Distributed systems concept for tracking causality and ordering of events across multiple devices.

**WebAuthn:** Web standard for passwordless authentication using hardware security keys or biometric verification.

**Zero-Knowledge Architecture:** System design where the service provider cannot access user data even when storing it in the cloud.

## Appendix B: Cypher Query Examples

### Basic Relationship Queries

**Find all expenses related to health events:**
```cypher
MATCH (u:User {id: $userId})-[:INCURRED]->(t:Transaction)-[:RELATED_TO]->(h:HealthEvent)
RETURN t.description, t.amount, h.description, h.date
ORDER BY h.date DESC;
```

**Discover potential temporal correlations:**
```cypher
MATCH (u:User {id: $userId})-[:INCURRED]->(t:Transaction)
MATCH (u)-[:EXPERIENCED]->(h:HealthEvent) 
WHERE abs(duration.between(t.date, h.date).days) <= 3
  AND NOT (t)-[:RELATED_TO]-(h)
RETURN t, h, duration.between(t.date, h.date) as timeDiff
ORDER BY abs(timeDiff.days);
```

**Find spending patterns by location:**
```cypher
MATCH (u:User {id: $userId})-[:INCURRED]->(t:Transaction)-[:OCCURRED_AT]->(l:Location)
WITH l, collect(t) as transactions, sum(t.amount) as totalSpent
WHERE size(transactions) >= 3
RETURN l.name, size(transactions) as transactionCount, totalSpent
ORDER BY totalSpent DESC;
```

### Advanced Cross-Domain Analysis

**Project cost analysis across domains:**
```cypher
MATCH (u:User {id: $userId})-[:ASSIGNED_TO]->(task:Task)-[:PART_OF]->(p:Project)
OPTIONAL MATCH (task)-[:REQUIRES]->(expense:Transaction)
OPTIONAL MATCH (u)-[:SCHEDULED]->(meeting:Meeting)-[:RELATED_TO]->(p)
WITH p, 
     collect(DISTINCT task) as tasks,
     collect(DISTINCT expense) as expenses,
     collect(DISTINCT meeting) as meetings
RETURN p.name,
       size(tasks) as taskCount,
       sum([e IN expenses | e.amount]) as totalCost,
       size(meetings) as meetingCount,
       duration.between(p.start_date, p.end_date).days as projectDuration;
```

**Health impact correlation analysis:**
```cypher
MATCH (u:User {id: $userId})-[:EXPERIENCED]->(h:HealthEvent)
MATCH (h)-[:CAUSED]->(medical:Transaction {category: 'medical'})
OPTIONAL MATCH (h)-[:FOLLOWED_BY]->(recovery:HealthEvent)
WITH h, medical, recovery,
     [(h)-[:RELATED_TO]->(other) | other] as relatedEvents
RETURN h.type, 
       h.severity,
       medical.amount as medicalCost,
       recovery.date - h.date as recoveryTime,
       size(relatedEvents) as impactScope
ORDER BY h.severity DESC, medicalCost DESC;
```

**Productivity pattern analysis:**
```cypher
MATCH (u:User {id: $userId})-[:COMPLETED]->(task:Task)
MATCH (task)-[:COMPLETED_ON]->(date:Date)
OPTIONAL MATCH (u)-[:PERFORMED]->(workout:Workout)
WHERE workout.date = date
WITH date, 
     count(task) as tasksCompleted,
     count(workout) as workoutsPerformed,
     avg(task.estimated_duration) as avgTaskDuration
RETURN date,
       tasksCompleted,
       workoutsPerformed,
       avgTaskDuration,
       CASE WHEN workoutsPerformed > 0 THEN 'workout_day' ELSE 'rest_day' END as dayType
ORDER BY date DESC;
```

### Relationship Discovery Algorithms

**Semantic similarity detection:**
```cypher
MATCH (u:User {id: $userId})-[:CREATED|INCURRED|EXPERIENCED]->(e1)
MATCH (u)-[:CREATED|INCURRED|EXPERIENCED]->(e2)
WHERE id(e1) < id(e2) 
  AND NOT (e1)-[:RELATED_TO]-(e2)
  AND any(word IN split(toLower(e1.description), ' ') 
          WHERE word IN split(toLower(e2.description), ' ') 
          AND length(word) > 3)
WITH e1, e2, 
     [word IN split(toLower(e1.description), ' ') 
      WHERE word IN split(toLower(e2.description), ' ') AND length(word) > 3] as commonWords
RETURN e1.id, e2.id, commonWords, size(commonWords) as similarity
ORDER BY similarity DESC
LIMIT 10;
```

**Location-based relationship discovery:**
```cypher
MATCH (u:User {id: $userId})-[:INCURRED|EXPERIENCED|ATTENDED]->(e1)-[:OCCURRED_AT]->(loc:Location)
MATCH (u)-[:INCURRED|EXPERIENCED|ATTENDED]->(e2)-[:OCCURRED_AT]->(loc)
WHERE id(e1) < id(e2)
  AND NOT (e1)-[:RELATED_TO]-(e2)
  AND abs(duration.between(e1.date, e2.date).hours) <= 24
WITH e1, e2, loc, duration.between(e1.date, e2.date) as timeDiff
RETURN e1.id, e2.id, loc.name, timeDiff,
       CASE 
         WHEN abs(timeDiff.hours) <= 1 THEN 0.9
         WHEN abs(timeDiff.hours) <= 6 THEN 0.7
         ELSE 0.5
       END as confidence
ORDER BY confidence DESC;
```

### Performance Optimization Queries

**Efficient relationship traversal with path length:**
```cypher
MATCH path = (start:Transaction {id: $startId})-[*1..3]-(connected)
WHERE NOT start = connected
WITH connected, length(path) as depth, path
ORDER BY depth, id(connected)
LIMIT 20
RETURN connected, depth, 
       [rel in relationships(path) | type(rel)] as relationshipTypes,
       [node in nodes(path)[1..-1] | labels(node)[0]] as nodeTypes;
```

**Aggregated cross-domain metrics:**
```cypher
MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[:INCURRED]->(t:Transaction)
WHERE t.date >= date($startDate) AND t.date <= date($endDate)
OPTIONAL MATCH (u)-[:EXPERIENCED]->(h:HealthEvent)
WHERE h.date >= date($startDate) AND h.date <= date($endDate)
OPTIONAL MATCH (u)-[:COMPLETED]->(task:Task)
WHERE task.completed_date >= date($startDate) AND task.completed_date <= date($endDate)
RETURN {
  financial: {
    totalSpent: sum([tx IN collect(t) WHERE tx.amount < 0 | tx.amount]),
    totalIncome: sum([tx IN collect(t) WHERE tx.amount > 0 | tx.amount]),
    transactionCount: count(t)
  },
  health: {
    eventCount: count(h),
    severityAvg: avg(h.severity)
  },
  productivity: {
    tasksCompleted: count(task),
    avgDuration: avg(task.actual_duration)
  }
} as summary;
```

## Appendix C: User Flow Diagrams (Textual Descriptions)

### Desktop Application User Flows

**Flow 1: Daily Morning Review**
```
User Flow: Daily Morning Review
Platform: Desktop
Duration: 5-10 minutes

1. User opens desktop app (automatic launch on system startup)
   → App loads with Financial dashboard active (last used)
   → Relationship sidebar shows 3 pending suggestions from overnight processing

2. User reviews financial summary
   → Notices budget alert: "Medical category 85% spent"
   → Clicks on medical expenses to view details

3. User examines medical expense details  
   → Sees $150 urgent care expense from yesterday
   → Relationship sidebar suggests connection to "Lower back pain" health event
   → User clicks suggestion to confirm relationship

4. User navigates to Health dashboard (Ctrl+2)
   → Reviews health events timeline
   → Notices pattern: back pain episodes correlate with work stress periods
   → User adds note to health event linking to work project deadline

5. User performs global search (Ctrl+K)
   → Searches "back pain" 
   → Results show 3 health events, 2 medical expenses, 1 physical therapy appointment
   → User identifies trend: incidents increase during Q4 project cycles

6. User sets reminder for ergonomic desk assessment
   → Uses quick capture (Ctrl+Shift+A)
   → Creates task in Schedule subdomain
   → Links to health pattern for context
```

**Flow 2: Expense Entry with Relationship Discovery**
```
User Flow: Expense Entry with Relationship Discovery  
Platform: Desktop
Duration: 2-3 minutes

1. User receives receipt notification on phone
   → Opens desktop app to Financial dashboard
   → Clicks "Add Transaction" button

2. User enters transaction details
   → Amount: $87.50
   → Description: "Whole Foods - Organic produce"  
   → Category auto-suggests: "Groceries" (95% confidence)
   → Location auto-fills from GPS data: "Whole Foods Market"

3. System processes entry and discovers relationships
   → Relationship sidebar immediately shows suggestion:
   → "Connect to meal prep goals? (Today's health entry mentions meal planning)"
   → User clicks to view health entry details

4. User confirms relationship
   → System creates SUPPORTS relationship between expense and health goal
   → Sidebar updates with additional suggestions:
   → "Similar healthy grocery trips: 3 this month (+$45 vs budget)"

5. User explores relationship insights
   → Clicks "View All Related" in sidebar
   → Relationship explorer opens showing:
     - Health goal progress (75% complete this month)
     - Budget impact (grocery category trending +15% due to organic focus)
     - Schedule correlation (grocery trips always follow weekend meal prep sessions)

6. User adds note and closes
   → Adds note: "Continuing organic focus, budget impact acceptable for health goals"
   → Returns to dashboard with updated metrics reflecting new data
```

### Mobile PWA User Flows

**Flow 3: Mobile Quick Capture While Traveling**
```
User Flow: Mobile Quick Capture While Traveling
Platform: PWA (Mobile)
Duration: 1-2 minutes

1. User is at airport, wants to log travel expense
   → Opens PWA from home screen
   → Currently offline (airplane mode enabled)
   → App displays offline indicator but remains functional

2. User taps Quick Capture button (+)
   → Quick capture modal opens
   → Financial tab auto-selected (most common capture type)
   → GPS location cached from last online session: "Denver International Airport"

3. User takes photo of receipt
   → Camera interface opens within app
   → User captures Uber receipt image
   → OCR processing begins locally (Tesseract.js)

4. OCR extracts information
   → Amount: $45.50 detected
   → Merchant: "Uber" identified
   → Date: Current date auto-filled
   → Category: "Transportation" suggested

5. User reviews and confirms
   → Adjusts description to "Airport transfer - DEN"
   → Confirms category and amount
   → Taps "Save" - entry queued for sync with offline indicator

6. User goes online later
   → PWA automatically syncs queued entries
   → Relationship discovery runs on server
   → Push notification: "Travel expense connected to Denver business trip"
   → User taps notification to view relationship details
```

**Flow 4: Health Tracking with Cross-Domain Insights**
```
User Flow: Health Tracking with Cross-Domain Insights
Platform: PWA (Mobile) 
Duration: 3-5 minutes

1. User completes workout at gym
   → Opens PWA, swipes to Health dashboard
   → Taps "Log Workout" quick action

2. User enters workout details
   → Exercise type: "Strength Training" (dropdown)
   → Duration: 45 minutes
   → Location: Auto-detected "Planet Fitness" 
   → Energy level: 8/10 (slider input)

3. System provides immediate insights
   → "Great job! This is your 3rd workout this week"
   → "Your productivity typically increases 25% on workout days"
   → Cross-domain insight appears: "Gym membership cost: $2.50 per workout this month"

4. User explores productivity correlation
   → Taps on productivity insight
   → Relationship drawer slides up from bottom
   → Shows tasks completed on workout days vs. rest days
   → Graph visualization adapted for mobile screen

5. User reviews related schedule
   → Swipes to Schedule dashboard
   → Sees today's remaining tasks with energy-based recommendations:
   → "High energy task suggested: Finish quarterly report (estimated 2 hours)"
   → "Save low-energy tasks for tomorrow: Email cleanup, file organization"

6. User plans rest of day
   → Adjusts task priorities based on energy level
   → Sets reminder for post-workout meal (connects back to health goals)
   → Returns to main dashboard with updated cross-domain metrics
```

### Echo Show User Flows

**Flow 5: Morning Ambient Information Display**
```
User Flow: Morning Ambient Information Display
Platform: Echo Show
Duration: Passive background awareness

1. User enters kitchen at 7:00 AM
   → Echo Show automatically displays Personal Dashboard home card
   → No voice activation required (ambient display mode)
   → Visual shows: Financial summary, Health goals, Today's priorities

2. User notices budget alert on display
   → Red indicator shows: "Dining budget: $45 remaining (3 days left)"
   → User speaks: "Alexa, show my dining expenses"
   → Voice activates detailed financial view

3. Echo Show responds with voice + visual
   → Alexa: "You've spent $155 on dining this month. Here are your recent expenses."
   → Visual updates to show detailed expense list with dates and amounts
   → APL template displays restaurant names, amounts, dates in easy-to-read format

4. User asks follow-up question
   → User: "How does that compare to last month?"
   → Alexa: "Last month you spent $98 on dining, so you're up $57 this month."
   → Visual shows comparison chart with trend indicators

5. User gets actionable recommendation
   → Alexa: "Based on your pattern, you typically spend more during project deadlines. You have 2 major deadlines this week."
   → Cross-domain insight connects dining spending to work schedule
   → Visual shows correlation timeline

6. User takes action
   → User: "Add a reminder to prep meals this weekend"
   → Alexa: "I've added 'Meal prep for busy week' to your Sunday schedule."
   → Confirmation shown on screen with link to full schedule
```

**Flow 6: Voice-Controlled Expense Addition**
```
User Flow: Voice-Controlled Expense Addition
Platform: Echo Show  
Duration: 2-3 minutes

1. User returns from grocery shopping
   → Hands full with bags, uses voice activation
   → User: "Alexa, add an expense"
   → Echo Show activates with expense entry interface

2. Multi-turn conversation for data collection
   → Alexa: "What was the amount?"
   → User: "Eighty seven dollars and fifty cents"
   → Alexa: "Got it, $87.50. What category?"
   → User: "Groceries"

3. System provides smart suggestions
   → Alexa: "I'll add a $87.50 grocery expense. I noticed you mentioned meal prep in your health goals. Should I connect them?"
   → Visual shows both the expense details and health goal for context
   → User: "Yes, connect them"

4. Cross-domain relationship created
   → Alexa: "Great! I've linked this expense to your healthy eating goals. Your grocery budget is now 78% used for the month."
   → Visual updates showing budget progress and goal connection
   → User sees immediate feedback on financial and health impact

5. Additional insights provided
   → Alexa: "This is your second large grocery trip this week. You're trending 15% higher than usual. Should I remind you about your monthly budget review?"
   → Proactive suggestion based on spending patterns
   → User: "Yes, remind me Friday"

6. Session concludes with summary
   → Alexa: "Perfect. I've added the expense, connected it to your health goals, and set a budget review reminder for Friday. Anything else?"
   → Visual shows confirmation of all actions taken
   → User: "That's all, thank you"
   → Display returns to ambient mode with updated information
```

## Appendix D: Schema Evolution Patterns

### Version Migration Strategies

**Schema Version 1.0 → 1.1: Adding Confidence Scores to Relationships**
```cypher
// Migration script for adding confidence scores
MATCH ()-[r:RELATED_TO]-()
WHERE NOT exists(r.confidence)
SET r.confidence = 0.8,  // Default confidence for existing relationships
    r.created_by = 'user',  // Assume user-created for existing
    r.schema_version = '1.1';

// Add constraints for new properties
CREATE CONSTRAINT relationship_confidence 
IF NOT EXISTS 
FOR ()-[r:RELATED_TO]-() 
REQUIRE r.confidence IS NOT NULL;
```

**Schema Version 1.1 → 1.2: Introducing Time-based Relationships**
```cypher
// Create new relationship type with temporal properties
MATCH (a)-[old:RELATED_TO]->(b)
WHERE old.type = 'temporal_correlation'
CREATE (a)-[new:OCCURRED_WITHIN]->(b)
SET new = old,
    new.time_window = duration({days: 1}),  // Default 1 day window
    new.schema_version = '1.2'
DELETE old;

// Update plugin schema registry
MERGE (schema:SchemaVersion {version: '1.2'})
SET schema.changes = [
  'Added OCCURRED_WITHIN relationship type',
  'Migrated temporal correlations from RELATED_TO'
];
```

### Plugin Schema Registration

**Plugin Schema Contribution Pattern:**
```typescript
// Financial plugin schema contribution
class FinancialPluginSchema implements PluginSchemaContributor {
  getSchemaVersion(): string {
    return '1.0.0';
  }
  
  getNodeTypes(): NodeTypeDefinition[] {
    return [
      {
        label: 'Account',
        properties: {
          id: { type: 'string', required: true, unique: true },
          name: { type: 'string', required: true },
          type: { type: 'enum', values: ['checking', 'savings', 'credit', 'investment'] },
          balance: { type: 'float', default: 0 },
          currency: { type: 'string', default: 'USD' }
        },
        indexes: [
          { properties: ['id'], type: 'unique' },
          { properties: ['type'], type: 'range' }
        ]
      }
    ];
  }
  
  getRelationshipTypes(): RelationshipTypeDefinition[] {
    return [
      {
        type: 'OWNS',
        from: ['User'],
        to: ['Account'],
        properties: {
          since: { type: 'date', required: true }
        }
      }
    ];
  }
  
  getMigrations(): Migration[] {
    return [
      {
        version: '1.0.1',
        description: 'Add institution field to Account',
        up: `
          MATCH (a:Account) 
          WHERE NOT exists(a.institution)
          SET a.institution = 'Unknown'
        `,
        down: `
          MATCH (a:Account)
          REMOVE a.institution
        `
      }
    ];
  }
}
```

**Schema Registry Implementation:**
```typescript
class SchemaRegistry {
  private plugins = new Map<string, PluginSchemaContributor>();
  private appliedMigrations = new Set<string>();
  
  async registerPlugin(plugin: PluginSchemaContributor): Promise<void> {
    const pluginName = plugin.constructor.name;
    
    // Apply schema changes
    await this.applyNodeTypes(plugin.getNodeTypes());
    await this.applyRelationshipTypes(plugin.getRelationshipTypes());
    
    // Run any pending migrations
    await this.runMigrations(pluginName, plugin.getMigrations());
    
    this.plugins.set(pluginName, plugin);
  }
  
  private async applyNodeTypes(nodeTypes: NodeTypeDefinition[]): Promise<void> {
    for (const nodeType of nodeTypes) {
      // Create constraints
      for (const property of Object.keys(nodeType.properties)) {
        const propDef = nodeType.properties[property];
        
        if (propDef.unique) {
          await this.neo4jSession.run(`
            CREATE CONSTRAINT ${nodeType.label}_${property}_unique 
            IF NOT EXISTS 
            FOR (n:${nodeType.label}) 
            REQUIRE n.${property} IS UNIQUE
          `);
        }
        
        if (propDef.required) {
          await this.neo4jSession.run(`
            CREATE CONSTRAINT ${nodeType.label}_${property}_required
            IF NOT EXISTS
            FOR (n:${nodeType.label})
            REQUIRE n.${property} IS NOT NULL
          `);
        }
      }
      
      // Create indexes
      for (const index of nodeType.indexes || []) {
        const indexName = `${nodeType.label}_${index.properties.join('_')}_index`;
        await this.neo4jSession.run(`
          CREATE INDEX ${indexName}
          IF NOT EXISTS
          FOR (n:${nodeType.label})
          ON (${index.properties.map(p => `n.${p}`).join(', ')})
        `);
      }
    }
  }
  
  private async runMigrations(pluginName: string, migrations: Migration[]): Promise<void> {
    for (const migration of migrations) {
      const migrationKey = `${pluginName}_${migration.version}`;
      
      if (!this.appliedMigrations.has(migrationKey)) {
        console.log(`Running migration: ${migrationKey}`);
        
        try {
          await this.neo4jSession.run(migration.up);
          
          // Record successful migration
          await this.neo4jSession.run(`
            MERGE (m:Migration {key: $key})
            SET m.applied_at = datetime(),
                m.description = $description
          `, { key: migrationKey, description: migration.description });
          
          this.appliedMigrations.add(migrationKey);
          
        } catch (error) {
          console.error(`Migration ${migrationKey} failed:`, error);
          
          // Attempt rollback
          try {
            await this.neo4jSession.run(migration.down);
          } catch (rollbackError) {
            console.error(`Rollback failed for ${migrationKey}:`, rollbackError);
          }
          
          throw error;
        }
      }
    }
  }
}
```

### Backward Compatibility Patterns

**Version Detection and Handling:**
```cypher
// Check current schema version
MATCH (schema:SchemaVersion)
RETURN schema.version, schema.last_updated
ORDER BY schema.last_updated DESC
LIMIT 1;

// Handle version-specific queries
WITH '1.2' as currentVersion
MATCH (t:Transaction)
WHERE 
  CASE currentVersion
    WHEN '1.0' THEN NOT exists(t.confidence)
    WHEN '1.1' THEN exists(t.confidence)
    ELSE true
  END
RETURN t;
```

**Data Format Evolution:**
```typescript
// Backward-compatible data serialization
interface VersionedData {
  schema_version: string;
  data: any;
  created_at: string;
  migration_applied?: string[];
}

class DataVersionManager {
  async serializeForExport(data: any): Promise<VersionedData> {
    return {
      schema_version: this.getCurrentSchemaVersion(),
      data: this.normalizeData(data),
      created_at: new Date().toISOString(),
      migration_applied: this.getAppliedMigrations()
    };
  }
  
  async deserializeFromImport(versionedData: VersionedData): Promise<any> {
    const currentVersion = this.getCurrentSchemaVersion();
    
    if (versionedData.schema_version === currentVersion) {
      return versionedData.data;
    }
    
    // Apply version migrations
    return this.migrateData(
      versionedData.data, 
      versionedData.schema_version, 
      currentVersion
    );
  }
  
  private async migrateData(data: any, fromVersion: string, toVersion: string): Promise<any> {
    const migrationPath = this.findMigrationPath(fromVersion, toVersion);
    
    let migratedData = data;
    for (const migration of migrationPath) {
      migratedData = await migration.transform(migratedData);
    }
    
    return migratedData;
  }
}
```

## Appendix E: MongoDB Collection Schemas

### Core Collections Structure

**Users Collection:**
```json
{
  "_id": "ObjectId",
  "user_id": "uuid_string",
  "email": "user@example.com",
  "created_at": "ISO_date",
  "updated_at": "ISO_date",
  "preferences": {
    "theme": "dark|light",
    "default_subdomain": "financial|health|schedule",
    "privacy_settings": {
      "analytics_opt_out": false,
      "relationship_discovery": true,
      "cloud_sync": true
    },
    "notification_settings": {
      "sync_conflicts": true,
      "relationship_suggestions": true,
      "daily_summary": false
    }
  },
  "subscription": {
    "tier": "free|sync|pro",
    "expires_at": "ISO_date",
    "features": ["cloud_sync", "mobile_access", "advanced_analytics"]
  }
}
```

**Transactions Collection (Financial Subdomain):**
```json
{
  "_id": "ObjectId",
  "id": "uuid_string",
  "user_id": "uuid_string",
  "account_id": "uuid_string",
  "amount": -87.50,
  "description": "Whole Foods - Organic produce",
  "category": "groceries",
  "date": "ISO_date",
  "location": {
    "name": "Whole Foods Market",
    "address": "123 Main St, City, State",
    "coordinates": [40.7128, -74.0060]
  },
  "tags": ["organic", "meal_prep", "healthy"],
  "receipt": {
    "image_url": "https://storage/receipts/uuid.jpg",
    "ocr_text": "extracted_text",
    "confidence": 0.95
  },
  "metadata": {
    "created_at": "ISO_date",
    "updated_at": "ISO_date",
    "created_by": "user|import|api",
    "sync_status": "synced|pending|error",
    "neo4j_synced_at": "ISO_date"
  },
  "relationships": [
    {
      "target_id": "health_event_uuid",
      "target_type": "HealthEvent",
      "relationship_type": "SUPPORTS",
      "confidence": 0.8,
      "created_at": "ISO_date",
      "confirmed_by_user": true
    }
  ]
}
```

**Health Events Collection:**
```json
{
  "_id": "ObjectId", 
  "id": "uuid_string",
  "user_id": "uuid_string",
  "type": "illness|injury|checkup|wellness|exercise",
  "title": "Lower back strain",
  "description": "Sharp pain in lower back after moving furniture",
  "severity": 6,
  "date": "ISO_date",
  "duration": {
    "start": "ISO_date",
    "end": "ISO_date",
    "estimated": false
  },
  "symptoms": [
    {
      "name": "lower_back_pain",
      "severity": 7,
      "notes": "Worse when sitting"
    }
  ],
  "treatments": [
    {
      "type": "medication",
      "name": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "every_8_hours",
      "duration_days": 3
    }
  ],
  "healthcare_providers": [
    {
      "name": "Dr. Smith",
      "type": "primary_care",
      "contact": "555-0123"
    }
  ],
  "metadata": {
    "created_at": "ISO_date",
    "updated_at": "ISO_date", 
    "resolved": true,
    "resolved_at": "ISO_date",
    "sync_status": "synced"
  }
}
```

**Calendar Events Collection:**
```json
{
  "_id": "ObjectId",
  "id": "uuid_string", 
  "user_id": "uuid_string",
  "title": "Doctor Appointment - Back Pain Follow-up",
  "description": "Follow-up appointment for lower back strain",
  "start_time": "ISO_datetime",
  "end_time": "ISO_datetime",
  "all_day": false,
  "location": {
    "name": "Medical Center",
    "address": "456 Health St",
    "coordinates": [40.7589, -73.9851]
  },
  "attendees": [
    {
      "name": "Dr. Smith",
      "email": "dr.smith@medical.com",
      "role": "organizer"
    }
  ],
  "recurrence": {
    "pattern": "weekly|monthly|yearly",
    "interval": 1,
    "end_date": "ISO_date",
    "occurrences": 5
  },
  "reminders": [
    {
      "minutes_before": 1440,
      "type": "notification|email"
    }
  ],
  "metadata": {
    "created_at": "ISO_date",
    "updated_at": "ISO_date",
    "source": "user|import|sync",
    "calendar_id": "external_calendar_id"
  }
}
```

### Sync and Cache Collections

**Sync Queue Collection:**
```json
{
  "_id": "ObjectId",
  "id": "uuid_string",
  "user_id": "uuid_string", 
  "operation": "CREATE|UPDATE|DELETE",
  "entity_type": "Transaction|HealthEvent|CalendarEvent",
  "entity_id": "uuid_string",
  "data": {
    // Full entity data for CREATE/UPDATE
    // null for DELETE
  },
  "created_at": "ISO_date",
  "scheduled_at": "ISO_date",
  "attempts": 0,
  "max_attempts": 3,
  "status": "pending|processing|completed|failed",
  "error_message": "string",
  "platform": "desktop|pwa|echo_show"
}
```

**Relationship Cache Collection:**
```json
{
  "_id": "ObjectId",
  "user_id": "uuid_string",
  "source_id": "uuid_string",
  "target_id": "uuid_string", 
  "relationship_type": "RELATED_TO|CAUSED_BY|SUPPORTS",
  "confidence": 0.85,
  "discovery_method": "temporal|semantic|location|user_created",
  "metadata": {
    "discovered_at": "ISO_date",
    "confirmed_by_user": true,
    "confirmed_at": "ISO_date", 
    "last_updated": "ISO_date"
  },
  "context": {
    "temporal_window_days": 1,
    "semantic_keywords": ["medical", "appointment"],
    "location_match": true,
    "user_feedback": "positive|negative|neutral"
  }
}
```

**Analytics Events Collection:**
```json
{
  "_id": "ObjectId",
  "user_id_hash": "hashed_user_id",
  "session_id": "uuid_string",
  "event_name": "subdomain_viewed|relationship_confirmed|search_performed",
  "properties": {
    "subdomain": "financial|health|schedule",
    "relationship_type": "CAUSED_BY",
    "confidence_bucket": "0.8-0.9",
    "query_type": "cross_domain",
    "platform": "desktop|pwa|echo_show"
  },
  "timestamp": "ISO_date",
  "platform": "desktop|pwa|echo_show",
  "app_version": "1.2.3"
}
```

### Index Strategies

**Performance Indexes:**
```javascript
// Users collection
db.users.createIndex({ "user_id": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Transactions collection  
db.transactions.createIndex({ "user_id": 1, "date": -1 });
db.transactions.createIndex({ "user_id": 1, "category": 1 });
db.transactions.createIndex({ "amount": -1 });
db.transactions.createIndex({ "location.coordinates": "2dsphere" });

// Health events collection
db.health_events.createIndex({ "user_id": 1, "date": -1 });
db.health_events.createIndex({ "user_id": 1, "type": 1 });
db.health_events.createIndex({ "severity": -1 });

// Calendar events collection
db.calendar_events.createIndex({ "user_id": 1, "start_time": 1 });
db.calendar_events.createIndex({ "user_id": 1, "end_time": 1 });
db.calendar_events.createIndex({ "location.coordinates": "2dsphere" });

// Sync queue collection
db.sync_queue.createIndex({ "user_id": 1, "status": 1, "scheduled_at": 1 });
db.sync_queue.createIndex({ "status": 1, "attempts": 1 });

// Relationship cache collection
db.relationship_cache.createIndex({ "user_id": 1, "source_id": 1 });
db.relationship_cache.createIndex({ "user_id": 1, "confidence": -1 });

// Analytics events collection
db.analytics_events.createIndex({ "user_id_hash": 1, "timestamp": -1 });
db.analytics_events.createIndex({ "event_name": 1, "timestamp": -1 });
db.analytics_events.createIndex(
  { "timestamp": 1 }, 
  { expireAfterSeconds: 63072000 } // Auto-delete after 2 years
);
```
