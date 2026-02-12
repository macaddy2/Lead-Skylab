# Lead Skylab - Implementation Plan

## Executive Summary

This plan addresses the critical gaps identified in Lead Skylab: disconnected integrations, simulated AI, missing UX patterns, accessibility failures, and mobile breakage. Changes are organized into 7 phases, ordered by impact and dependency.

---

## Phase 1: Activate Gemini AI in Content Generator
**Impact: HIGH | Effort: LOW | Files: 1**

The Gemini client (`src/lib/gemini.ts`) is fully implemented with 5 functions but the Content Generator UI (`src/pages/ContentStudio/Generator.tsx`) uses hardcoded templates instead.

### Changes:
- Replace `setTimeout` simulation (lines 72-98) with actual `generateContent()` call
- Add `isAIConfigured()` check with graceful fallback to templates when no API key
- Add error handling with user-visible toast on failure
- Wire `generateHashtags()` to auto-suggest hashtags after content generation

---

## Phase 2: Reusable UI Components
**Impact: HIGH | Effort: MEDIUM | Files: 3 new, 5+ edited**

Replace `window.confirm()`, add toast notifications, and create shared form components.

### New Components:
1. **`src/components/ui/Toast.tsx`** - Toast notification system (success/error/warning/info)
   - Context-based: `useToast()` hook
   - Auto-dismiss with configurable duration
   - Stacks multiple toasts

2. **`src/components/ui/ConfirmDialog.tsx`** - Branded modal confirmation
   - Replaces all `window.confirm()` calls
   - Supports destructive action styling (red confirm button)
   - Keyboard accessible (Escape to cancel, Enter to confirm)

3. **`src/components/ui/FormField.tsx`** - Consistent form inputs
   - Wraps label + input + error message
   - Built-in `aria-required`, `aria-invalid`, `aria-describedby`
   - Variants: text, email, select, textarea

### Edits:
- `src/pages/Leads/index.tsx` - Replace `window.confirm()` with ConfirmDialog
- `src/App.tsx` - Wrap with ToastProvider
- All pages with forms - Use FormField component

---

## Phase 3: Wire Supabase API to DataContext
**Impact: CRITICAL | Effort: MEDIUM | Files: 1 major, all pages benefit**

The app has two disconnected data layers. This phase creates a sync middleware.

### Architecture:
```
dispatch(action) -> reducer updates localStorage (instant UI)
                 -> middleware calls api.* (async Supabase sync)
                 -> on failure: queue retry + show toast
```

### Changes to `src/store/DataContext.tsx`:
- Add `useSupabaseSync` hook that intercepts dispatches
- On `ADD_LEAD` -> also call `leadsApi.create()`
- On `UPDATE_LEAD` -> also call `leadsApi.update()`
- On `DELETE_LEAD` -> also call `leadsApi.delete()`
- Same pattern for all entity types
- On initial load (authenticated user): fetch from Supabase, merge with localStorage
- Add sync status indicator: "Synced" / "Syncing..." / "Offline"

### Fallback behavior:
- If Supabase is unreachable, localStorage continues working (offline-first)
- No data loss - localStorage is always written first

---

## Phase 4: Real Dashboard Metrics
**Impact: HIGH | Effort: LOW | Files: 1**

Dashboard metrics are hardcoded. Compute them from actual app data.

### Changes to `src/pages/Dashboard/index.tsx`:
- **Lead Pipeline**: Already computed from real leads (keep)
- **NPS Score**: Calculate from survey responses (average of NPS-type answers)
- **Activation Rate**: Derive from leads that moved past "new" stage
- **Retention**: Compute from lead `lastActivityAt` timestamps
- **MRR**: Keep as manually-set metric (no payment integration yet)
- **Revenue chart**: Replace mock data with computed trend from metrics history
- **Retention curve**: Compute from actual lead cohort data

---

## Phase 5: Accessibility (WCAG AA)
**Impact: HIGH | Effort: MEDIUM | Files: 6+**

### Changes:

#### `src/components/Layout/Sidebar.tsx`:
- Add `<nav aria-label="Main navigation">`
- Add `role="menuitem"` to nav links
- Add `aria-current="page"` to active link
- Add `aria-expanded` and `aria-label` to collapse button

#### `src/components/Layout/Header.tsx`:
- Add `role="banner"` to header
- Add `aria-label="Search leads, pages, experiments"` to search input
- Add `aria-haspopup="true"` and `aria-expanded` to user menu button
- Add `role="menu"` to dropdown, `role="menuitem"` to items
- Trap focus in dropdown when open

#### `src/App.tsx`:
- Add `<main role="main">` semantic element
- Add skip-to-content link

#### All modals:
- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trap (Tab cycles within modal)
- Escape key closes modal
- Return focus to trigger element on close

---

## Phase 6: Mobile Responsiveness
**Impact: MEDIUM | Effort: MEDIUM | Files: 3**

### Changes:

#### `src/components/Layout/Sidebar.tsx`:
- Add hamburger menu button (visible below 768px)
- Sidebar becomes overlay drawer on mobile
- Backdrop click closes sidebar
- Auto-close on navigation

#### `src/index.css`:
- Add breakpoint for `max-width: 640px`
- Make `.grid-cols-2`, `.grid-cols-3`, `.grid-cols-4` stack to single column on mobile
- Make modals full-width on mobile
- Make kanban board horizontally scrollable with snap points

#### `src/components/Layout/Header.tsx`:
- Adjust `left` offset when sidebar is hidden on mobile
- Hide PMF score badge on small screens
- Make search bar collapsible on mobile

---

## Phase 7: Functional Search & Notifications
**Impact: MEDIUM | Effort: MEDIUM | Files: 3**

### Command Palette (Cmd+K):
- New component: `src/components/ui/CommandPalette.tsx`
- Searches across: leads (by name/email), landing pages (by title), experiments, surveys
- Keyboard navigation: arrow keys to select, Enter to navigate
- Mounted at App level, triggered by Cmd+K or clicking search bar

### Notification System:
- Wire existing `state.notifications` to toast system
- Auto-create notifications on: lead created, experiment completed, survey response

---

## Dependency Graph

```
Phase 2 (UI Components) ─────┐
                              ├──> Phase 1 (AI activation - uses Toast)
                              ├──> Phase 3 (Supabase sync - uses Toast)
                              ├──> Phase 5 (Accessibility - uses FormField)
                              └──> Phase 7 (Search - uses CommandPalette)

Phase 4 (Dashboard) ──────────── Independent
Phase 6 (Mobile) ─────────────── Independent
```

**Recommended execution order**: 2 -> 1 -> 3 -> 4 -> 5 -> 6 -> 7

---

## Files Changed Summary

| Phase | New Files | Modified Files |
|-------|-----------|---------------|
| 1     | 0         | 1 (Generator.tsx) |
| 2     | 3         | 5+ (App.tsx, Leads, etc.) |
| 3     | 1         | 1 (DataContext.tsx) |
| 4     | 0         | 1 (Dashboard/index.tsx) |
| 5     | 0         | 6+ (Sidebar, Header, App, modals) |
| 6     | 0         | 3 (Sidebar, Header, index.css) |
| 7     | 1         | 2 (Header, App) |
| **Total** | **5** | **~19** |
