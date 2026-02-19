/**
 * ═══════════════════════════════════════════════════════════════
 * Service Barrel Export
 * ═══════════════════════════════════════════════════════════════
 *
 * Central re-export of all shared services.
 * Feature-specific services live inside their feature folders.
 *
 * Architecture pattern:
 *   Services → ALWAYS throw on error (never toast)
 *   Hooks    → Catch errors from services, show toasts
 *   Components → Never call supabase directly
 */

// ─── Matching ─────────────────────────────────────────────────
export { calculateCompatibility } from './matching/compatibility';
export { scoreCandidate, rankCandidates, extractKeywords } from './matching/teammate-engine';
export { getMatchLabel } from './matching/shared-types';
export type { MatchLabel } from './matching/shared-types';
export type { MatchScore, MatchUser, MatchProject } from './matching/types';
export type { MatchResult, MatchCandidate } from './matching/teammate-types';

// ─── GitHub ───────────────────────────────────────────────────
export { GithubService } from './github/api';

// ─── Credibility ──────────────────────────────────────────────
export { getUserCredibility, getUserCredibilitySummary, getBatchCredibilitySummaries } from './credibility';

// ─── Invites ──────────────────────────────────────────────────
export { inviteService } from './invites/service';

// ─── Suggestions ──────────────────────────────────────────────
export { getSuggestedTeammates } from './suggestions/service';
