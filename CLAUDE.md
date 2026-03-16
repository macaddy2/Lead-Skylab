# Lead Skylab (Golden Skylab)

Lead Skylab is a comprehensive PMF (Product-Market Fit) engine and lead generation SaaS platform. It helps founders validate product-market fit through lead management, landing page builders, A/B experiments, surveys, AI-powered content generation, and automated launch planning.

## Tech Stack

- **Frontend**: React 19 + TypeScript (strict)
- **Build**: Vite 7
- **State**: React Context + `useReducer` (DataContext), React Query (TanStack) for server state
- **Backend**: Supabase (Auth, PostgreSQL, RLS)
- **AI**: Google Gemini API (content generation, product analysis)
- **Charts**: Recharts 3
- **Routing**: React Router v7
- **Styling**: Custom CSS design system (`index.css`) — dark glassmorphism theme
- **IDs**: UUID v4

## Quick Start

```bash
npm install
npm run dev        # Start dev server (Vite)
npm run build      # Production build (vite build)
npm run typecheck  # TypeScript check (tsc --noEmit)
npm run lint       # ESLint
```

## Project Structure

```
src/
├── components/Layout/     # Sidebar, Header (app shell)
├── pages/
│   ├── Auth/              # Login (email/password + magic link)
│   ├── Dashboard/         # PMF metrics overview
│   ├── LandingPages/      # Page builder + editor
│   ├── Leads/             # Lead table/kanban + detail views
│   ├── Audience/          # Segment builder
│   ├── Experiments/       # A/B testing
│   ├── Surveys/           # Survey builder (NPS/PMF/custom)
│   ├── ContentStudio/     # AI content generator, campaigns, templates
│   └── LaunchAutopilot/   # Launch planner, content queue, kanban
├── store/
│   ├── AuthContext.tsx     # Supabase auth state
│   └── DataContext.tsx     # App state (leads, pages, experiments, etc.)
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── api.ts              # Data-layer CRUD functions
│   ├── gemini.ts           # Gemini AI integration
│   └── database.types.ts   # Auto-generated Supabase types
├── types/index.ts          # App-level TypeScript interfaces
├── App.tsx                 # Routing + providers
├── main.tsx                # Entry point
└── index.css               # Design system (1280+ lines)
```

## Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

## Design System Rules

### ✅ DO
- Use CSS custom properties from `index.css` `:root` for all colors, spacing, and typography
- Use the `--color-*` prefix for semantic colors: `var(--color-primary)`, `var(--color-bg-secondary)`
- Use `--space-*` tokens for spacing: `var(--space-4)`, `var(--space-8)`
- Use `--font-size-*` tokens for typography: `var(--font-size-sm)`, `var(--font-size-xl)`
- Use utility classes from the design system: `.btn`, `.card`, `.badge`, `.input`, `.grid`, `.flex`
- Add new reusable classes to `index.css` when a pattern repeats across 2+ files
- Use `Lucide React` for icons (once migrated — current code still uses inline SVGs)

### 🚫 DON'T
- **NEVER** use `var(--primary)` — the correct token is `var(--color-primary)`
- **NEVER** use `var(--accent)` — use `var(--color-accent)`
- **NEVER** add `<style>{...}</style>` JSX blocks — put styles in `index.css` or CSS modules
- **NEVER** use `style={{…}}` for layout/theming — create CSS classes instead
- **NEVER** use hardcoded hex/rgba colors (e.g., `#f87171`) — use design tokens
- **NEVER** put CSS in `App.css` — this file should not exist
- Avoid `--spacing-*` tokens — they are deprecated aliases; use `--space-*`

### Token Quick Reference

| Category | Prefix | Example |
|----------|--------|---------|
| Background | `--color-bg-*` | `var(--color-bg-primary)` |
| Text | `--color-text-*` | `var(--color-text-secondary)` |
| Brand | `--color-*` | `var(--color-primary)`, `var(--color-success)` |
| Gray scale | `--gray-*` | `var(--gray-700)` |
| Spacing | `--space-*` | `var(--space-4)` = 1rem |
| Font size | `--font-size-*` | `var(--font-size-sm)` = 0.875rem |
| Radius | `--radius-*` | `var(--radius-lg)` |
| Shadow | `--shadow-*` | `var(--shadow-md)` |
| Glass | `--glass-*` | `var(--glass-bg)`, `var(--glass-border)` |

## State Management

```typescript
const { state, dispatch } = useData();

// Leads
dispatch({ type: 'ADD_LEAD', payload: lead });
dispatch({ type: 'UPDATE_LEAD', payload: { id, updates } });

// Metrics
dispatch({ type: 'UPDATE_METRICS', payload: { npsScore: 45 } });

// Reset
dispatch({ type: 'RESET_STATE' });
```

Data persists to `localStorage` under `lead_skylab_state`. Loads on mount, saves on every change.

## Development Guidelines

1. **New pages**: Create in `src/pages/<Feature>/`, add route in `App.tsx`, add nav item in `Sidebar.tsx`
2. **New types**: Add to `types/index.ts`, update `DataContext.tsx` if adding state
3. **Styling**: Always use `index.css` classes or CSS custom properties — never inline
4. **Auth**: All routes wrap in `<ProtectedRoute>`, login at `/login`
5. **API calls**: Use functions from `lib/api.ts` with Supabase client from `lib/supabase.ts`
6. **AI features**: Use `lib/gemini.ts` for Gemini API integration

## Supabase Schema

Database has these tables with full RLS policies:
`users`, `leads`, `landing_pages`, `experiments`, `experiment_variants`, `surveys`, `survey_responses`, `audiences`, `content_pieces`, `content_campaigns`, `product_profiles`, `launch_plans`, `launch_phases`, `content_queue_items`, `activities`

All tables have `updated_at` auto-update triggers. User profiles auto-create on signup.

## Known Issues (March 2026)

- Some files still use broken tokens (`--primary`, `--accent`) instead of `--color-primary`
- `App.css` is a Vite template leftover — conflicts with design system `.card` class
- 10 component files embed `<style>` JSX blocks instead of using `index.css`
- `--gray-950` token is referenced but never defined in `:root`
- All page files use inline `style={{…}}` objects for layout
- Sidebar/Header use inline SVG icons (should migrate to Lucide React)
- No test suite configured
