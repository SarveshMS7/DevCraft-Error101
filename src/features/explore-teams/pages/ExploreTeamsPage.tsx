/**
 * ═══════════════════════════════════════════════════════════════
 * EXPLORE TEAMS PAGE — Smart Discovery Surface
 * ═══════════════════════════════════════════════════════════════
 *
 * A polished, first-class exploration page matching the design
 * language of ProjectsPage and LandingPage.
 *
 * Features:
 *   - Hero header with gradient
 *   - Smart sorting (recent, most active, open roles, best match)
 *   - Skill, status, domain filters
 *   - Debounced keyword search
 *   - Personalized match scores (logged-in users)
 *   - Skeleton loading states
 *   - Clean empty states
 *   - Infinite scroll / Load More pagination
 *   - Framer Motion animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Users, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';
import { useExploreTeams } from '@/features/explore-teams/hooks/useExploreTeams';
import { ExploreTeamCard } from '@/features/explore-teams/components/ExploreTeamCard';
import { ExploreSearchBar } from '@/features/explore-teams/components/ExploreSearchBar';
import { ExploreFiltersBar } from '@/features/explore-teams/components/ExploreFiltersBar';
import { ExploreEmptyState, ExploreSkeletonGrid } from '@/features/explore-teams/components/ExploreEmptyState';

export default function ExploreTeamsPage() {
  const { user } = useAuth();
  const {
    teams,
    filters,
    pagination,
    loading,
    initialLoad,
    hasActiveFilters,
    updateSearch,
    updateSort,
    updateStatus,
    updateDomain,
    toggleSkillFilter,
    clearFilters,
    loadMore,
    refresh,
  } = useExploreTeams();

  return (
    <div className="space-y-8">
      {/* ─── Hero Header ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-10"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Explore Teams
              </h1>
            </div>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Discover active teams looking for collaborators. Find projects that match your skills,
              interests, and availability — then join the ones that inspire you.
            </p>
            {user && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Personalized matches enabled
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Users className="w-4 h-4" />
              <span className="font-semibold text-foreground">{pagination.total}</span>
              <span>teams</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Search + Sort ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <ExploreSearchBar
          search={filters.search}
          sort={filters.sort}
          onSearchChange={updateSearch}
          onSortChange={updateSort}
          resultCount={teams.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          isPersonalized={!!(user)}
        />
      </motion.div>

      {/* ─── Filters ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <ExploreFiltersBar
          activeSkills={filters.skills}
          activeStatus={filters.status}
          activeDomain={filters.domain}
          onToggleSkill={toggleSkillFilter}
          onStatusChange={updateStatus}
          onDomainChange={updateDomain}
        />
      </motion.div>

      {/* ─── Grid ───────────────────────────────────────── */}
      {initialLoad ? (
        <ExploreSkeletonGrid />
      ) : teams.length > 0 ? (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <ExploreTeamCard team={team} index={index} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={loading}
                className="rounded-full px-8"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                Load More Teams
              </Button>
            </div>
          )}
        </>
      ) : (
        <ExploreEmptyState
          type={hasActiveFilters ? 'no-results' : 'empty'}
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
