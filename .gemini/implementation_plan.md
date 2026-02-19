# CollabSphere Refactoring — Implementation Plan

## Executive Summary

After a complete audit of the codebase (61 source files across `src/`), this plan organizes the refactoring into **6 phases** to be executed sequentially. Each phase is self-contained and leaves the codebase in a working state.

---

## Current Architecture Overview

```
src/
├── App.tsx                          # Router + Layout
├── main.tsx                         # Entry point
├── components/
│   ├── Layout.tsx                   # Shell: navbar + outlet
│   └── ui/                          # shadcn-style primitives (button, input, label, textarea, toast)
├── features/
│   ├── auth/                        # AuthProvider, LoginPage
│   ├── pages/                       # LandingPage (orphaned location)
│   ├── profile/                     # Profile CRUD (api, hook, page, types)
│   ├── projects/                    # Project Bazaar (pages, hooks, api, components)
│   ├── join-teams/                  # Explore Teams (pages, hooks, components, service)
│   └── notifications/              # Notification bell + invite hooks
├── services/
│   ├── credibility/                 # 5-pillar credibility engine
│   ├── github/                      # GitHub API + caching
│   ├── invites/                     # Project invite service
│   ├── matching/                    # Compatibility + teammate scoring
│   ├── suggestions/                 # Teammate suggestion orchestrator
│   └── teams/                       # exploreTeamsService (explore teams data)
└── lib/                             # supabase client, utils
```

---

## Phase 1: Remove Dead Code & Duplicates

**Goal:** Eliminate unused components, duplicate patterns, and orphaned code.

### 1.1 — Delete `CreateTeam.tsx` and its supporting components
- **`features/projects/pages/CreateTeam.tsx`** — A completely non-functional hackathon registration form. It uses `FormSection`, `InputField`, and `RadioGroup` but none of them are wired to any state or API. Route `/create-team` exists in `App.tsx` and a "Create Team" button in the navbar (Layout.tsx line 74-82) points to it.
- **`features/projects/components/FormSection.tsx`** — Only used by `CreateTeam.tsx`. Uses hardcoded `bg-white` (violates dark-mode theming).
- **`features/projects/components/InputField.tsx`** — Only used by `CreateTeam.tsx`. Uncontrolled, no `onChange`/`value` props.
- **`features/projects/components/RadioGroup.tsx`** — Only used by `CreateTeam.tsx`. Uncontrolled, no state.

**Action:** Delete all 4 files. Remove `/create-team` route from `App.tsx`. Remove "Create Team" button from `Layout.tsx`.

### 1.1b — Clean up navbar (Layout.tsx)
- **"My Profile" text link** (Layout.tsx lines 57-66): Duplicates the user icon button already present at lines 100-106. Remove the text link from the nav, keep only the icon button.
- **"Create Team" button** (Layout.tsx lines 74-82): Points to `/create-team` which will be deleted. Remove entirely.

### 1.2 — Delete `features/join-teams/components/TeamCard.tsx`
- This is an old, hardcoded plain-HTML team card. It uses a different `Team` interface (`id: number`, `hackathon`, `mode`, `roleNeeded`, etc.) that doesn't match the Supabase schema at all.
- **`ExploreTeamCard.tsx`** is the active, fully-functional replacement that uses the real `ExploreTeam` type.

**Action:** Delete `TeamCard.tsx`. Verify no imports reference it.

### 1.3 — Deduplicate matching type systems
- `matching/types.ts` defines `MatchScore`, `MatchScoreDetails`, `SCORE_WEIGHTS`, `getScoreLabel` — for **project-user** matching.
- `matching/teammate-types.ts` defines `MatchResult`, `TeammateMatchDetails`, `TEAMMATE_SCORE_WEIGHTS` — for **teammate** matching.
- Both define identical `getScoreLabel`-style logic and near-identical `label: 'Excellent' | 'Good' | 'Fair' | 'Low'`.

**Action:** Extract shared types into `matching/shared-types.ts`:
```typescript
export type MatchLabel = 'Excellent' | 'Good' | 'Fair' | 'Low';
export const getMatchLabel = (score: number): MatchLabel => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Low';
};
```
Update both `types.ts` and `teammate-types.ts` to import from shared.

---

## Phase 2: Unify Navigation & Feature Organization

**Goal:** Fix orphaned page locations and simplify the feature folder hierarchy.

### 2.1 — Move `LandingPage` into the correct feature boundary
- Currently at `features/pages/LandingPage.tsx` — the `features/pages/` folder is a catch-all that doesn't belong.

**Action:** Move to `features/home/pages/LandingPage.tsx`. Update import in `App.tsx`.

### 2.2 — Normalize the `join-teams` feature naming
- `features/join-teams/` is about "Explore Teams" — a discovery feature.
- This name conflicts with the *actual* join-a-team action which is handled by `join_requests` in the projects feature.

**Action:** Rename folder from `join-teams` to `explore-teams` for clarity. Update all imports (5-8 files affected).

### 2.3 — Move `exploreTeamsService.ts` into the feature
- Currently at `services/teams/exploreTeamsService.ts` but it's only used by `features/join-teams/`.

**Action:** Move to `features/explore-teams/services/exploreTeamsService.ts`. Update imports.

### 2.4 — Audit Layout navigation links
- Current navbar: Home, Projects, Explore Teams, Profile, Login/Logout.
- Verify all links work and map to actual routes.

---

## Phase 3: Service Layer Consolidation

**Goal:** Centralize Supabase queries, remove inline queries from hooks, and create a clean service boundary.

### 3.1 — Extract inline Supabase queries from `useProjectDetail.ts`
- `loadMessages()` (lines 34-47) — direct `supabase.from('messages')` query
- `loadJoinRequests()` (lines 49-57) — direct `supabase.from('join_requests')` query
- `subscribeToMessages()` (lines 59-75) — direct realtime subscription
- `sendMessage()` (lines 77-93) — direct insert
- `submitJoinRequest()` (lines 95-117) — direct insert
- `respondToJoinRequest()` (lines 119-139) — direct update

**Action:** Create `features/projects/services/projectDetailService.ts` and move all Supabase interactions there. The hook becomes a thin state-management layer.

### 3.2 — Consolidate project-related services
- `features/projects/api.ts` handles CRUD for projects table.
- `services/invites/service.ts` handles invite CRUD.
- `services/suggestions/service.ts` orchestrates teammate suggestions.

**Decision:** Keep these separate since they have distinct concerns. But:
- Add a barrel `services/index.ts` that re-exports key services.
- Ensure consistent error handling patterns across all services.

### 3.3 — Standardize error handling
Currently mixed patterns:
- Some throw errors (`api.ts`)
- Some console.error and swallow (`useProjectDetail.ts`)
- Some show toasts in hooks
- Some show toasts in services

**Action:** Establish pattern:
- **Services** → always throw (never toast)
- **Hooks** → catch and show toasts
- **Components** → never call supabase directly

---

## Phase 4: Component Design System Cleanup

**Goal:** Ensure consistent component patterns, proper theming support, and eliminate hardcoded styles.

### 4.1 — Audit all components for dark-mode compatibility
Files with hardcoded light-only colors:
- `FormSection.tsx` — `bg-white` (**will be deleted in Phase 1**)
- `InputField.tsx` — `text-gray-700`, `border-gray-300` (**will be deleted in Phase 1**)
- `RadioGroup.tsx` — `text-gray-700` (**will be deleted in Phase 1**)
- `TeamCard.tsx` — `bg-white`, `text-gray-600` (**will be deleted in Phase 1**)
- `CreateTeam.tsx` — `bg-gray-100` (**will be deleted in Phase 1**)

After Phase 1 deletions, remaining files use `bg-card`, `text-muted-foreground`, etc. → No issues.

### 4.2 — Create shared `SkillBadge` component
Skills are rendered in 5+ places with slightly different styles:
- `ProjectCard.tsx` — `bg-primary/5 text-primary border-primary/20`
- `ExploreTeamCard.tsx` — `bg-primary/5 text-primary border-primary/20`
- `ProfilePage.tsx` — `bg-primary/10 text-primary border-primary/20`
- `TeammateSuggestions.tsx` — `bg-emerald-500/10 text-emerald-600 border-emerald-500/20` (matched skills)
- `ProjectDetailPage.tsx` — various inline skill badges

**Action:** Create `components/ui/skill-badge.tsx`:
```typescript
interface SkillBadgeProps {
    skill: string;
    variant?: 'default' | 'matched' | 'missing' | 'removable';
    onRemove?: () => void;
}
```

### 4.3 — Create shared `MatchScoreBadge` component
Match scores displayed in both `ProjectCard` and `ExploreTeamCard` with identical logic but slightly different markup.

**Action:** Create `components/ui/match-score-badge.tsx` with a unified display.

### 4.4 — Create shared `EmptyState` component
Empty states exist in:
- `ExploreEmptyState.tsx` — full-featured (variants, skeleton, error)
- `ProfilePage.tsx` — inline empty state for projects
- `ProjectsPage.tsx` — likely has its own

**Action:** Promote `ExploreEmptyState.tsx` patterns to `components/ui/empty-state.tsx` as a generic component.

### 4.5 — Create shared `ScoreBar` component
The `ScoreBar` component inside `TeammateSuggestions.tsx` can be useful elsewhere (credibility display, skill match details).

**Action:** Extract to `components/ui/score-bar.tsx`.

---

## Phase 5: Feature Completion Audit ✅ DONE

**Goal:** Verify all advertised features work end-to-end.

### 5.1 — Tech Profiles ✅ No changes needed
### 5.2 — Matchmaking Algorithm ✅ No changes needed
### 5.3 — Project Bazaar ✅ No changes needed

### 5.4 — Real-Time Chat ✅ FIXED (Phase 1)
- Subscription cleanup now properly returned from useEffect
- Optimistic message insertion in sendMessage()
- Auto-scroll with useRef + scrollIntoView
- Messages fetched with profile join for sender name/avatar
- Chat UI updated with sender name display

### 5.5 — Invite System ✅ No changes needed
### 5.6 — Explore Teams ✅ No changes needed

### 5.7 — Additional Fixes (Phase 5 Audit)
- **404 page**: Replaced plain `<div>` with `EmptyState` component + "Go Home" action
- **Auth loading**: Replaced raw "Loading auth..." text with centered spinner
- **ExploreEmptyState**: Fixed `window.location.href` → `useNavigate()` (prevents full page reload)
- **No stale imports**: Verified zero references to deleted `join-teams` folder
- **No broken dark mode**: All `text-gray-*` / status/urgency configs have `dark:` counterparts
- **`@ts-ignore` audit**: ~35 remaining, all for Supabase type gaps (acceptable, would need `supabase gen types` to fix)

**Status:** All features verified complete. Zero TypeScript errors.

---

## Phase 6: Final Polish & Safety ✅ DONE

**Goal:** Polish UX, ensure safety constraints, clean up remaining issues.

### 6.1 — Loading skeletons ✅
- **ProjectsPage**: Already had skeleton card grid — no change needed
- **ProfilePage**: Replaced basic CSS spinner with structured skeleton (avatar, name, bio, skills, projects grid)
- **ProjectDetailPage**: Replaced basic spinner with structured 3-column skeleton mirroring the actual layout
- **ExploreTeamsPage**: Already had full skeleton via `ExploreSkeletonGrid` — no change needed
- **Auth loading**: Replaced raw "Loading auth..." text with centered `Loader2` spinner

### 6.2 — Error boundaries ✅
- Created `ErrorBoundary` class component in `components/shared/ErrorBoundary.tsx`
- Shows user-friendly error card with "Try Again" and "Go Home" actions
- Shows error message in development mode for debugging
- Wrapped all routes inside `<ErrorBoundary>` in App.tsx

### 6.3 — Type safety audit ✅
- ~35 `@ts-ignore` comments remain, all for Supabase type inference gaps
- These are acceptable (Supabase generated types don't cover all custom tables)
- Would require `supabase gen types typescript` to fix, which needs Supabase CLI + project access
- `tsc --noEmit` passes with zero errors
- `vite build` produces successful production bundle

### 6.4 — Safety constraints preservation ✅
- [x] Auth system: `AuthProvider` with OAuth (Google, GitHub) + email
- [x] Database schema: preserved in `supabase/schema.sql`
- [x] Supabase client: single instance in `lib/supabase.ts`
- [x] RLS policies: defined in schema
- [x] Environment variables: validated on startup

---

## Execution Order

| Step | Phase | Files Affected | Risk |
|------|-------|----------------|------|
| 1 | 1.1 | Delete 4 files | 🟢 None (dead code) |
| 2 | 1.2 | Delete 1 file | 🟢 None (dead code) |
| 3 | 1.3 | Create 1 file, modify 2 | 🟡 Low |
| 4 | 2.1 | Move 1 file, modify 1 import | 🟢 None |
| 5 | 2.2 | Rename folder, update 6-8 imports | 🟡 Medium |
| 6 | 2.3 | Move 1 file, update 1 import | 🟢 None |
| 7 | 3.1 | Create 1 file, modify 1 hook | 🟡 Medium |
| 8 | 3.3 | Modify 5-8 files | 🟡 Medium |
| 9 | 4.2 | Create 1 component, modify 5+ files | 🟡 Medium |
| 10 | 4.3 | Create 1 component, modify 2 files | 🟡 Low |
| 11 | 4.4 | Create 1 component | 🟡 Low |
| 12 | 4.5 | Extract 1 component | 🟢 None |
| 13 | 5.4 | Modify 1 hook | 🟡 Low |
| 14 | 6.1-6.3 | Various polish | 🟡 Low |

**Estimated total:** ~15-20 file modifications, ~6-8 new files, ~5 deletions.

---

## Files to Delete (Safe — verified unused)

1. `src/features/projects/pages/CreateTeam.tsx`
2. `src/features/projects/components/FormSection.tsx`
3. `src/features/projects/components/InputField.tsx`
4. `src/features/projects/components/RadioGroup.tsx`
5. `src/features/join-teams/components/TeamCard.tsx`

## New Files to Create

1. `src/services/matching/shared-types.ts`
2. `src/features/home/pages/LandingPage.tsx` (moved)
3. `src/features/projects/services/projectDetailService.ts`
4. `src/components/ui/skill-badge.tsx`
5. `src/components/ui/match-score-badge.tsx`
6. `src/components/ui/empty-state.tsx`
7. `src/components/ui/score-bar.tsx`
