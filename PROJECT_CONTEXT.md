# Salesforce Study Hub — Project Context & Documentation

> **Last Updated:** October 2026  
> **Repository:** `salesforce-learning` (Salesforce Study Hub)  
> **Status:** Active Development  

---

## 1. Project Overview & Mission

**Salesforce Study Hub** is a modern, responsive, zero-backend web application built to master Salesforce certifications and complex architectural patterns through two primary experiences:

1. **Certification Courses (e.g., Salesforce Administrator):**
   - Curated study guides, exam revision tips, domain breakdowns, and scenario-based learning.
   - Built-in Markdown reader with frontmatter parsing, auto-generated table of contents, breadcrumbs, sequential reading paths, and custom diagram DSLs (`flow` and `sequence`).

2. **Interactive Labs (NPC Volunteer Management Lab):**
   - A fully functional, client-side, schema-driven Salesforce org simulator replicating the **Salesforce Nonprofit Cloud (NPC) Volunteer Management** data model.
   - Includes real-time validation, automatic field population, record creation/editing/cascading deletion, polymorphic lookups, matching algorithms (skills, availability, location), capacity tracking, and relationship graph visualization.
   - 100% pure client-side architecture with local storage persistence (`sfsh.vm.store.v1`) and zero external server dependencies.

---

## 2. Technology Stack & Key Libraries

| Layer / Concern | Technology | Notes |
|---|---|---|
| **Language & Runtime** | JavaScript (ES Modules, Browser native) | Node.js (v18+) used for local dev and CLI validation script |
| **Framework** | **React 19.2** & **React DOM 19.2** | Functional components, hooks, React Context (`VmStoreContext`) |
| **Bundler & Dev Server** | **Vite 8.3** | Lightning-fast HMR, `@vitejs/plugin-react` |
| **Routing** | **React Router DOM 6.30** | Future flags enabled (`v7_startTransition`, `v7_relativeSplatPath`) |
| **Markdown & Frontmatter** | `react-markdown` 10.1, `remark-gfm` 4.0, `gray-matter` 4.0 | Build-time Markdown bundling via `import.meta.glob`; browser buffer shim |
| **Styling** | Vanilla CSS (`src/styles.css`, ~87 KB) | Comprehensive design token system, light/dark mode, glassmorphism, responsive |
| **Linter** | **Oxlint 1.81** | Fast Rust-based linter configured via `.oxlintrc.json` |
| **Persistence** | `localStorage` with in-memory fallback | Multi-tab synchronization via `window.addEventListener('storage')` |
| **Testing / Schema Assertions** | Node.js test script (`scripts/vm-validate.js`) | Schema validation, relationship integrity checks, seed record assertions |

---

## 3. Architecture & Core Concepts

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Salesforce Study Hub UI                         │
├───────────────────────────────────┬────────────────────────────────────┤
│     Certification Course Hub      │   NPC Volunteer Management Lab     │
│   (e.g., /salesforce-admin/*)     │              (/vm/*)               │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Static Content Loader           │ • Declarative Schema Engine        │
│   (import.meta.glob + gray-matter)│   (35 objects, 5 areas, 49 rels)   │
│ • Custom Flow & Sequence Diagrams │ • In-memory / LocalStorage Store   │
│ • Domain / Topic / Subtopic Trees │ • Relationship Resolver & Graph    │
│ • Reading Sequence & "Jump To"    │ • Matching & Capacity Engines      │
│ • Theme & Last-Visited Memory     │ • Scenarios & Use Case Runner      │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 3.1 Course Architecture
- **Navigation Model:** Hierarchical: `Course → Topic (Domain) → Subtopic` (or standalone Course Pages).
  - Defined declaratively in [`src/data/navigation.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/data/navigation.js).
- **Content Loading:** Build-time bundling via `import.meta.glob('../content/**/*.md', { eager: true, query: '?raw' })` in [`src/lib/content.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/lib/content.js).
- **Markdown Enhancements:** [`src/components/Markdown.jsx`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/components/Markdown.jsx) renders standard GitHub-flavored markdown and translates custom code block languages:
  - ````flow````: Vertical flowchart rows separated by arrows (`↓`), side-by-side nodes (`|`), highlights (`!`), and subtitles (`::`).
  - ````sequence````: Horizontal ordered sequence steps (`1 → 2 → 3`).

### 3.2 NPC Volunteer Management Lab Architecture
- **Schema-Driven Engine:** Metadata lives in [`src/data/npc-vm/`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/data/npc-vm/):
  - `areas.js`: 5 functional ERD groupings (Application, Action Plans, Program Management, Volunteer, Volunteer Management).
  - `objects.js`: 35 standard and industry cloud objects.
  - `relationships.js`: 49 relationships specifying cardinality, master-detail vs lookup, official names, and target types.
  - `fields.js`: Field definitions, types (text, number, date, time, picklist, email, checkbox), required flags, and ID prefixes.
  - `index.js`: Dynamically generates relationship fields, handles polymorphic lookups (e.g., Qualification Reference Record), and validates schema integrity.
- **Store & State Management:** [`src/lib/vm/store.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/lib/vm/store.js) is a pure functional store:
  - Supports `createRecord`, `updateRecord`, `deleteRecord`, `deletePlan`, `resetToSeed`, and `resetToEmpty`.
  - Atomic refusals: operations that violate schema or relational constraints fail cleanly without mutating state.
- **Engines:**
  - **Matching (`matching.js`):** Evaluates volunteer eligibility by comparing Volunteer Competency levels (QL), availability (via Operating Hours and Time Slots), and job position locations.
  - **Capacity (`capacity.js`):** Tracks shift capacity against confirmed assignments (`MaximumAttendeesCount - ActiveAssignments`).
  - **Metrics (`metrics.js`):** Computes live counts and KPIs for the dashboard.
  - **Resolver (`records.js`):** Builds parent hierarchies, dynamic child related lists, and directional graphs.

---

## 4. Directory & Folder Structure

```
salesforce-learning/
├── .gitignore
├── .oxlintrc.json                 # Oxlint rule configuration
├── index.html                     # HTML root with viewport, fonts & app container
├── package.json                   # Dependencies, scripts, and package metadata
├── package-lock.json              # Deterministic lockfile
├── vite.config.js                 # Vite config (React plugin + buffer shim alias)
├── README.md                      # Template README
├── PROJECT_CONTEXT.md             # This comprehensive project context documentation
│
├── docs/                          # Architectural and data model design documentation
│   ├── vm-architecture.md         # Detailed NPC VM Lab architectural specifications
│   ├── vm-erd.png                 # Nonprofit Cloud Volunteer Management ERD diagram
│   ├── vm-model-reconciliation.md # ERD reconciliation against official Salesforce docs
│   ├── vm-schema-notes.md         # Historical notes (superseded by reconciliation doc)
│   └── vm-use-cases.md            # Lab scenarios, learning concepts, and Dhaka seed org
│
├── scripts/                       # CLI build and verification utilities
│   └── vm-validate.js             # Node script to validate VM schema, rules, and seed data
│
└── src/
    ├── main.jsx                   # React application entry point (StrictMode + root)
    ├── App.jsx                    # Top-level React Router configuration and route trees
    ├── styles.css                 # Comprehensive CSS design tokens and component styles
    │
    ├── components/                # Reusable UI components
    │   ├── BeforeExam.jsx         # Exam tips and pre-exam checklist component
    │   ├── Breadcrumbs.jsx        # Breadcrumb trail navigation
    │   ├── ComingSoon.jsx         # Placeholder for topics/courses under construction
    │   ├── ContentCallout.jsx     # Visual callouts (notes, warnings, tips, memory tricks)
    │   ├── ContentPage.jsx        # Shell layout for course content pages
    │   ├── ContentToc.jsx         # Dynamic Table of Contents extracted from headings
    │   ├── CourseCard.jsx         # Catalog preview card on the home page
    │   ├── CourseSwitcher.jsx     # Header dropdown to switch between courses/labs
    │   ├── Header.jsx             # Global header with branding, navigation, and theme toggle
    │   ├── JumpTo.jsx             # Quick search modal (palette) across all courses and topics
    │   ├── Layout.jsx             # Base app layout wrapping Header and content area
    │   ├── Markdown.jsx           # ReactMarkdown wrapper with custom flow/sequence diagrams
    │   ├── ScenarioCard.jsx       # Interactive scenario card for admin practice
    │   ├── Sidebar.jsx            # Course sidebar with collapsible topics and links
    │   ├── SidebarTopic.jsx       # Collapsible topic section inside the sidebar
    │   ├── ThemeToggle.jsx        # Light/Dark mode switcher button
    │   ├── TopicCard.jsx          # Domain card shown on course overview pages
    │   │
    │   └── vm/                    # NPC Volunteer Management Lab UI components
    │       ├── AreaOverview.jsx   # Card displaying an ERD area and its objects
    │       ├── CapacityMeter.jsx  # Visual progress meter for shift attendance/capacity
    │       ├── DeleteButton.jsx   # Deletion trigger showing cascading delete impact modal
    │       ├── FieldInput.jsx     # Dynamic input control based on field data type
    │       ├── FieldValue.jsx     # Formatted field value renderer (lookup link, badge, date)
    │       ├── FocusMap.jsx       # Interactive focal diagram of related objects
    │       ├── LookupField.jsx    # Searchable lookup input with "+ New" record popup
    │       ├── MatchPanel.jsx     # Volunteer matching result inspection panel
    │       ├── RecordForm.jsx     # Generic record creation and edit form
    │       ├── RecordGraph.jsx    # Visual parent/child node graph of record relationships
    │       ├── RecordTable.jsx    # Sortable, filterable table for object records
    │       ├── RelatedLists.jsx   # Dynamically resolved child record related lists
    │       ├── SourceBadge.jsx    # Badge indicating official vs demo/learning source
    │       ├── VmAppBar.jsx       # Sub-header bar for the lab (org switcher, reset, stats)
    │       ├── VmBadges.jsx       # Badges for record origin (demo vs user), types, status
    │       ├── VmLayout.jsx       # Layout wrapper for all `/vm/*` routes with VmStoreProvider
    │       ├── VmSidebar.jsx      # Navigation sidebar for the VM lab
    │       ├── VmStoreContext.jsx # React Context providing store state and dispatchers
    │       └── WhyPanel.jsx       # Contextual educational explainer ("Why does this exist?")
    │
    ├── content/                   # Markdown study materials (bundled at build time)
    │   ├── npc-vm/
    │   │   └── how-to-read.md     # Guide on interpreting the NPC data model
    │   └── salesforce-admin/
    │       ├── introduction.md    # Admin course introduction & foundational concepts
    │       └── automation/
    │           └── flows.md       # Comprehensive deep dive on Salesforce Flow Builder
    │
    ├── data/                      # Static metadata and catalog definitions
    │   ├── navigation.js          # Central course catalog, topic trees, and route builders
    │   │
    │   └── npc-vm/                # Declarative metadata for the Volunteer Management schema
    │       ├── areas.js           # 5 ERD functional areas with color themes
    │       ├── fields.js          # Object field definitions, data types, and ID prefixes
    │       ├── index.js           # Schema compiler, relationship synthesizer, and validator
    │       ├── learning.js        # Educational rationale text for objects and fields
    │       ├── objects.js         # 35 objects metadata (API name, label, area, standard flag)
    │       ├── processes.js       # Lifecycle flows (e.g., Onboarding, Shift Fulfillment)
    │       ├── relationships.js   # 49 relationships (cardinality, delete rules, field names)
    │       ├── seedData.js        # Initial 91 records (Dhaka Community Programs demo org)
    │       └── useCases.js        # 12 interactive scenarios with guided steps
    │
    ├── lib/                       # Pure utility modules and business engines
    │   ├── buffer-shim.js         # Minimal Buffer shim for gray-matter browser execution
    │   ├── content.js             # Markdown parser, frontmatter reader, slug generator
    │   ├── jumpIndex.js           # Search index builder for the "Jump To" modal
    │   ├── platform.js            # Platform/OS detection utilities
    │   ├── theme.js               # Theme detection, persistence, and last-visited tracking
    │   │
    │   └── vm/                    # NPC Volunteer Management core engines
    │       ├── capacity.js        # Shift capacity computation and validation rules
    │       ├── matching.js        # Multi-factor volunteer matching algorithm
    │       ├── metrics.js         # Dashboard KPI calculation engine
    │       ├── records.js         # Record name resolver, related list derivation, graph builder
    │       ├── store.js           # Immutable store actions (create, edit, delete, reset)
    │       ├── storeContext.js    # Context interface definitions
    │       └── validation.js      # Type validation, required field checks, foreign key checks
    │
    └── pages/                     # Routed view components
        ├── CourseOverview.jsx     # Course landing page showing all topics and exam overview
        ├── Home.jsx               # Site homepage listing available courses and labs
        ├── NotFound.jsx           # 404 handler with return home navigation
        ├── SubtopicPage.jsx       # Study page rendering subtopic Markdown content
        ├── TopicPage.jsx          # Topic overview page listing all subtopics
        │
        └── vm/                    # NPC Volunteer Management Lab views
            ├── VmDashboard.jsx    # Real-time metrics, capacity summaries, and health checks
            ├── VmFindVolunteers.jsx # Interactive volunteer matching tool with criteria filters
            ├── VmHome.jsx         # Lab overview, getting started guide, and reset controls
            ├── VmModel.jsx        # Visual ERD / Data Model Explorer (Focus, Area, Full views)
            ├── VmObjectDetails.jsx # Object schema inspector (fields, relationships, why it exists)
            ├── VmObjectExplorer.jsx # Searchable directory of all 35 data model objects
            ├── VmProcesses.jsx    # Step-by-step walkthroughs of business processes
            ├── VmRecordDetail.jsx # Salesforce-style record detail page with related lists
            ├── VmRecordEdit.jsx   # Form to create new records or update existing ones
            ├── VmRecordList.jsx   # Record list view with filters (all, user, demo)
            ├── VmScenarios.jsx    # Guided interactive practice scenarios
            └── VmUseCase.jsx      # Step-by-step scenario execution runner
```

---

## 5. Routing & URL Mapping

All routing is handled via `react-router-dom` in [`src/App.jsx`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/App.jsx):

### 5.1 Certification Courses
| Route Path | Component | Description |
|---|---|---|
| `/` | `Home` | Site homepage and catalog |
| `/:courseSlug` | `CourseOverview` | Course overview, exam details, and topic list |
| `/:courseSlug/:sectionSlug` | `ContentPage` or `TopicPage` | Course-level standalone page (e.g., Introduction) or Topic domain page |
| `/:courseSlug/:sectionSlug/:subtopicSlug` | `SubtopicPage` | Focused study page rendering Markdown content |

### 5.2 NPC Volunteer Management Lab
| Route Path | Component | Description |
|---|---|---|
| `/vm` | `VmHome` | Lab homepage, quick start, and demo controls |
| `/vm/dashboard` | `VmDashboard` | Operational metrics and capacity gauges |
| `/vm/objects` | `VmObjectExplorer` | Catalog of all 35 objects grouped by area |
| `/vm/objects/:apiName` | `VmObjectDetails` | Object schema, relationships, fields, and educational context |
| `/vm/objects/:apiName/records` | `VmRecordList` | Filterable list view of records for an object |
| `/vm/objects/:apiName/records/new` | `VmRecordEdit` | Record creation form with lookup prefill support |
| `/vm/objects/:apiName/records/:recordId` | `VmRecordDetail` | Record view with parent references and related lists |
| `/vm/objects/:apiName/records/:recordId/edit`| `VmRecordEdit` | Record update form |
| `/vm/find-volunteers` | `VmFindVolunteers` | Live volunteer matching tool (skills, time, location) |
| `/vm/model` | `VmModel` | Data model visualizer (`?view=focus\|area\|full\|record`) |
| `/vm/processes` | `VmProcesses` | End-to-end business lifecycle guides |
| `/vm/scenarios` | `VmScenarios` | Catalog of 12 guided learning scenarios |
| `/vm/use-cases/:useCaseId` | `VmUseCase` | Interactive scenario runner with validation checkpoints |

---

## 6. NPC Volunteer Management Schema & Data Model

The lab models **35 objects** organized across **5 functional areas**, connected by **49 relationships** (40 lookups, 8 master-detail, 1 standard link):

### 6.1 The 5 Functional Areas
1. **Application (6 objects):** Intake and qualification processing (`ApplicationForm`, `ApplicationFormEvaluation`, `ApplicationFormQuestion`, `ApplicationFormRelation`, `IntakeFormSection`, `IntakeFormSectionQuestion`).
2. **Action Plans (6 objects):** Onboarding workflows and tasks (`ActionPlan`, `ActionPlanItem`, `ActionPlanItemDependency`, `ActionPlanTemplate`, `ActionPlanTemplateItem`, `ActionPlanTemplateVersion`).
3. **Program Management (1 object):** High-level mission and impact grouping (`Initiative`).
4. **Volunteer — WHO (10 objects):** Volunteer profiles, skills, availability, and scheduling (`Account` [Person Account], `Contact`, `Competency`, `PersonCompetency`, `Examination`, `PersonExamination`, `Location`, `OperatingHours`, `TimeSlot`, `PersonLocationAvailability`).
5. **Volunteer Management — WHAT & WHEN (12 objects):** Roles, shifts, requirements, matching, and attendance (`Position`, `JobPosition`, `JobPositionShift`, `JobPositionAssignment`, `PositionQualification`, `JobPositionQualification`, `VolunteerProjectRecurrenceSchedule`, `JobPositionAttendance`, `JobPositionAttendanceSummary`, `VolunteerApplicationStageHistory`, `VolunteerPositionEngagementSummary`, `VolunteerEngagementMetricSummary`).

### 6.2 Key Relational Patterns
- **Unique ID Prefixes:** Every object has a distinctive 3-character prefix (e.g., `ACC` for Account, `CON` for Contact, `JPS` for JobPositionShift, `JPA` for JobPositionAssignment).
- **Polymorphic Lookups:** Handled via the Qualification Reference Record pattern — `PositionQualification` and `JobPositionQualification` can point to either a `Competency` or an `Examination`.
- **Master-Detail Integrity:** Master-detail relationships enforce mandatory parentage and cascading deletes (deleting an `ActionPlanTemplate` cascades to `ActionPlanTemplateVersion`, which cascades to `ActionPlanTemplateItem`).
- **Standard Account-Contact Link:** In accordance with Salesforce Person Accounts, creating or deleting a Person Account synchronizes with its corresponding Contact record.

---

## 7. Development Scripts & Workflow

All commands run from the workspace root:

```bash
# Start local development server with Vite HMR (default port 5173)
npm run dev

# Build production bundle to dist/
npm run build

# Preview production build locally
npm preview

# Run Oxlint for fast static analysis across JavaScript files
npm run lint

# Validate NPC Volunteer Management schema, relationships, and seed data
npm run vm:validate
```

### Verification Script (`npm run vm:validate`)
Runs directly in Node.js against the schema metadata and seed records. It asserts:
- Exact object count (35) and relationship count (49).
- Absence of orphan objects.
- Absence of invalid or duplicate field names and ID prefixes.
- Pure validation of all 91 demo records.
- Deterministic behavior of the volunteer matching engine against test scenarios.

---

## 8. Design System & Theming

The application features a custom, zero-dependency design system implemented in [`src/styles.css`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/styles.css):

- **Theme Engine:** Dark and light modes supported via CSS variables mapped to `[data-theme='dark']` and `[data-theme='light']`.
- **System Theme Sync:** Automatically monitors `(prefers-color-scheme: dark)` unless overridden by the user.
- **Color Palette:**
  - Neutral tones: Slate, charcoal, and warm off-white.
  - Accent colors: Salesforce Blue (`#00a1e0` / `#0176d3`), Emerald Green, Amber Warning, Rose Destructive.
  - Area colors: Color-coded pills and accents for each of the 5 ERD domains.
- **Component Styling:** Glassmorphism headers, subtle borders, collapsible sidebars, custom code blocks, cards, and animated interactive diagrams.

---

## 9. Content Authoring & Extension Guide

### 9.1 Adding Course Content
1. Ensure the course, topic, and subtopic are registered in [`src/data/navigation.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/data/navigation.js).
2. Create the corresponding Markdown file under `src/content/<courseSlug>/<topicSlug>/<subtopicSlug>.md`.
3. Include frontmatter at the top of the file:
   ```markdown
   ---
   title: Topic Title
   summary: A short one-sentence explanation of what is covered.
   tags:
     - admin
     - automation
   ---
   ```
4. Write Markdown using standard syntax, tables, and custom diagrams (`flow` or `sequence`).

### 9.2 Custom Diagram DSL
```flow
Node A :: Subtitle or description
Node B | Node C :: Parallel nodes on same row
!Highlighted Node :: Emphasized step
> Caption text explaining the diagram
```

```sequence
Step 1 :: Initiate process
Step 2 :: Evaluate criteria
!Step 3 :: Execute action
```

### 9.3 Extending the VM Lab
To introduce a new object or field into the interactive lab:
1. Register the object in [`src/data/npc-vm/objects.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/data/npc-vm/objects.js).
2. Define any relationships in [`src/data/npc-vm/relationships.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/data/npc-vm/relationships.js).
3. Specify field properties (type, required flag, options) and ID prefix in [`src/data/npc-vm/fields.js`](file:///Users/abidkhannishat/Projects/salesforce-learning/src/data/npc-vm/fields.js).
4. Run `npm run vm:validate` to ensure schema constraints and relationships pass validation.
5. The UI dynamically detects the new metadata and generates forms, tables, and graph nodes automatically.
