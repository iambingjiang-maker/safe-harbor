import { TRIGGERS } from '../data/strategies';

/**
 * Computes family-specific strategy performance and meltdown patterns
 * from the shared co-parent moment log.
 */
export function computeStrategyStats(logs, { triggerId = null, tiredOnly = false } = {}) {
  const filtered = logs.filter((log) => {
    if (triggerId && log.triggerId !== triggerId) return false;
    if (tiredOnly && !log.wasTired) return false;
    return true;
  });

  const map = new Map();
  for (const log of filtered) {
    const key = log.strategyId;
    if (!map.has(key)) {
      map.set(key, {
        strategyId: key,
        strategyTitle: log.strategyTitle,
        helped: 0,
        somewhat: 0,
        escalated: 0,
        total: 0,
        lastUsedAt: log.createdAt,
        lastOutcome: log.outcome,
      });
    }
    const stat = map.get(key);
    stat[log.outcome] = (stat[log.outcome] || 0) + 1;
    stat.total += 1;
    if (new Date(log.createdAt) > new Date(stat.lastUsedAt)) {
      stat.lastUsedAt = log.createdAt;
      stat.lastOutcome = log.outcome;
    }
  }

  // Score: helped = +1, somewhat = +0.4, escalated = -0.75
  for (const stat of map.values()) {
    stat.winRate = stat.total > 0 ? Math.round((stat.helped / stat.total) * 100) : 0;
    stat.helpfulRate =
      stat.total > 0
        ? Math.round(((stat.helped + stat.somewhat * 0.5) / stat.total) * 100)
        : 0;
    stat.score = stat.helped * 1.0 + stat.somewhat * 0.35 - stat.escalated * 0.85;
  }

  return map;
}

export function getRankedStrategiesForMoment(
  allStrategies,
  logs,
  favorites,
  { triggerId, isTired }
) {
  const matching = allStrategies.filter(
    (s) => s.triggers.includes(triggerId) || s.triggerId === triggerId
  );

  // Pull both context-specific stats and overall stats
  const triggerStats = computeStrategyStats(logs, { triggerId });
  const tiredTriggerStats = isTired
    ? computeStrategyStats(logs, { triggerId, tiredOnly: true })
    : new Map();
  const overallStats = computeStrategyStats(logs);

  return matching
    .map((strategy) => {
      const ctxStat = tiredTriggerStats.get(strategy.id) || triggerStats.get(strategy.id);
      const genStat = overallStats.get(strategy.id);
      const isFav = favorites.includes(strategy.id);

      let rank = 0;
      if (ctxStat) rank += ctxStat.score * 4;
      if (genStat) rank += genStat.score * 1.5;
      if (isFav) rank += 2.2;
      if (isTired && strategy.worksWhenTired) rank += 2.5;
      if (isTired && strategy.lowWords) rank += 1.5;
      if ((triggerId === 'flooded' || triggerId === 'dfk') && strategy.lowWords) {
        rank += 2.0;
      }
      // Put repair card slightly lower during active meltdown unless it's been logged positively
      if (strategy.id === 'after-storm-repair') rank -= 3.5;

      return {
        strategy,
        stat: ctxStat || genStat || null,
        isTriggerSpecific: Boolean(ctxStat),
        isFav,
        rank,
      };
    })
    .sort((a, b) => b.rank - a.rank);
}

export function computeOverallInsights(logs) {
  const total = logs.length;
  if (total === 0) {
    return {
      total: 0,
      helpedCount: 0,
      tiredPercent: 0,
      floodedPercent: 0,
      topStrategies: [],
      watchOutStrategies: [],
      triggerBreakdown: [],
      latestLog: null,
      tiredWinners: [],
    };
  }

  const helpedCount = logs.filter((l) => l.outcome === 'helped').length;
  const tiredCount = logs.filter((l) => l.wasTired).length;
  const floodedCount = logs.filter((l) => l.wasFlooded).length;

  const overallMap = computeStrategyStats(logs);
  const allStats = Array.from(overallMap.values());

  const topStrategies = allStats
    .filter((s) => s.helped > 0)
    .sort((a, b) => b.score - a.score || b.helped - a.helped)
    .slice(0, 5);

  const watchOutStrategies = allStats
    .filter((s) => s.escalated > 0 && s.escalated >= s.helped)
    .sort((a, b) => b.escalated - a.escalated)
    .slice(0, 3);

  const tiredMap = computeStrategyStats(logs, { tiredOnly: true });
  const tiredWinners = Array.from(tiredMap.values())
    .filter((s) => s.helped > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const triggerCounts = new Map();
  for (const log of logs) {
    triggerCounts.set(log.triggerId, (triggerCounts.get(log.triggerId) || 0) + 1);
  }

  const triggerBreakdown = TRIGGERS.map((t) => ({
    ...t,
    count: triggerCounts.get(t.id) || 0,
    percent: Math.round(((triggerCounts.get(t.id) || 0) / total) * 100),
  }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const sortedByDate = [...logs].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    total,
    helpedCount,
    helpedPercent: Math.round((helpedCount / total) * 100),
    tiredPercent: Math.round((tiredCount / total) * 100),
    floodedPercent: Math.round((floodedCount / total) * 100),
    topStrategies,
    watchOutStrategies,
    triggerBreakdown,
    latestLog: sortedByDate[0] || null,
    tiredWinners,
  };
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
