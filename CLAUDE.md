# Lead Skylab

Lead Skylab is a comprehensive product-market fit (PMF) engine and lead generation SaaS application built with React, TypeScript, and Vite.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API with `useReducer`
- **Charts**: Recharts
- **Routing**: React Router v6
- **Styling**: Custom CSS Design System (glassmorphism, dark mode)
- **Persistence**: localStorage

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Sidebar.tsx      # Navigation sidebar
│       └── Header.tsx       # Top header with search
├── pages/
│   ├── Dashboard/           # PMF metrics dashboard
│   ├── LandingPages/        # Landing page builder
│   │   ├── index.tsx        # List view
│   │   └── Editor.tsx       # Page editor
│   ├── Leads/               # Lead management
│   │   ├── index.tsx        # Table/Kanban view
│   │   └── LeadDetail.tsx   # Lead detail
│   ├── Audience/            # Audience segmentation
│   ├── Experiments/         # A/B testing
│   │   ├── index.tsx        # Experiments list
│   │   └── ExperimentDetail.tsx
│   └── Surveys/             # Survey builder
│       ├── index.tsx        # Survey list
│       └── SurveyBuilder.tsx
├── store/
│   └── DataContext.tsx      # Global state management
├── types/
│   └── index.ts             # TypeScript interfaces
├── App.tsx                  # Main app with routing
├── main.tsx                 # Entry point
└── index.css                # Design system
```

## Key Features

### 1. PMF Dashboard
- Overall PMF score display
- Key metrics: NPS, Activation Rate, Retention, MRR
- Lead pipeline visualization
- Retention curve chart
- Active experiments summary
- Recent activity feed

### 2. Landing Pages
- Create/edit landing pages
- Hero section and form builder
- Live preview mode
- SEO settings
- Publish/unpublish workflow
- Analytics per page

### 3. Lead Management
- Table and Kanban views
- Lead scoring algorithm
- Filter by stage/source
- Bulk operations
- Export to CSV
- Detailed lead profiles

### 4. Audience Segmentation
- Create segments with criteria
- Automatic lead count
- Pre-built segment templates
- Export segments

### 5. A/B Experiments
- Create A/B tests
- Track variants
- Statistical significance
- Winner detection
- Conversion analytics

### 6. Surveys
- PMF survey template (Sean Ellis test)
- NPS survey template
- Custom survey builder
- Question types: NPS, Rating, Choice, Open-ended
- Response analytics

## State Management

The app uses React Context (`DataContext`) with `useReducer` for global state:

```typescript
const { state, dispatch } = useData();

// Add a lead
dispatch({ type: 'ADD_LEAD', payload: lead });

// Update metrics
dispatch({ type: 'UPDATE_METRICS', payload: { npsScore: 45 } });
```

## Design System

The CSS design system in `index.css` provides:

- CSS custom properties for colors, spacing, typography
- Dark mode with glassmorphism effects
- Responsive grid system
- Pre-built components: buttons, cards, inputs, badges, tables
- Utility classes for flex, spacing, typography
- Animations and transitions

## Development Guidelines

1. **Adding new pages**: Create in `src/pages/`, add route in `App.tsx`
2. **Adding new features**: Extend types in `types/index.ts`, update `DataContext.tsx`
3. **Styling**: Use CSS custom properties from `index.css`, avoid inline styles for reusable elements
4. **State**: All persistent data goes through DataContext

## Data Persistence

Data is persisted to localStorage under the key `lead_skylab_state`. The app loads from localStorage on mount and saves on every state change.

To reset to demo data:
```typescript
dispatch({ type: 'RESET_STATE' });
```
