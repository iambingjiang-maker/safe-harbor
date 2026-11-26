import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Moon,
  PlusCircle,
  Sparkles,
  Trash2,
  VolumeX,
} from 'lucide-react';
import { getTriggerById } from '../data/strategies';
import { computeOverallInsights, formatRelativeTime } from '../lib/insights';

export default function InsightsView({
  profile,
  childrenList = [],
  activeChild = null,
  logs,
  onOpenLogSheet,
  onDeleteLog,
  onLoadSampleData,
}) {
  const kids =
    childrenList.length > 0
      ? childrenList
      : [{ id: 'child1', name: profile.childName || 'Liam', age: String(profile.childAge || '4') }];
  const [childScope, setChildScope] = useState(activeChild?.id || 'child1'); // 'child1' | 'child2' | 'all'
  const [filter, setFilter] = useState('all'); // 'all' | 'helped' | 'escalated' | 'tired' | parent1 | parent2

  const scopedLogs = useMemo(() => {
    if (childScope === 'all') return logs;
    return logs.filter((l) => (l.childId || 'child1') === childScope);
  }, [logs, childScope]);

  const activeScopeChild = kids.find((k) => k.id === childScope);
  const scopeLabel =
    childScope === 'all'
      ? kids.map((k) => k.name).join(' & ')
      : activeScopeChild?.name || profile.childName || 'Liam';

  const insights = useMemo(() => computeOverallInsights(scopedLogs), [scopedLogs]);

  const filteredLogs = useMemo(() => {
    const sorted = [...scopedLogs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted.filter((l) => {
      if (filter === 'all') return true;
      if (filter === 'helped') return l.outcome === 'helped';
      if (filter === 'escalated') return l.outcome === 'escalated';
      if (filter === 'tired') return l.wasTired;
      if (filter === 'parent1') return l.parentName === (profile.parent1Name || 'Mom');
      if (filter === 'parent2') return l.parentName === (profile.parent2Name || 'Dad');
      return true;
    });
  }, [scopedLogs, filter, profile.parent1Name, profile.parent2Name]);

  return (
    <>
      <div className="section-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-intro">
          <h1 className="page-title">Log & Insights</h1>
          <p className="page-subtitle">
            What actually works for {scopeLabel} across both parents.
          </p>
        </div>
        <button
          type="button"
          id="insights-log-btn"
          className="btn-secondary"
          style={{ minHeight: 38, padding: '0 12px', flexShrink: 0 }}
          onClick={() =>
            onOpenLogSheet({
              triggerId: 'boundaries',
              outcome: 'helped',
              childId: childScope === 'all' ? activeChild?.id || 'child1' : childScope,
            })
          }
        >
          <PlusCircle size={16} />
          Log
        </button>
      </div>

      {kids.length > 1 && (
        <div className="chip-wrap" role="group" aria-label="Filter insights by child">
          {kids.map((kid) => (
            <button
              key={kid.id}
              type="button"
              className={`filter-chip ${childScope === kid.id ? 'active' : ''}`}
              onClick={() => setChildScope(kid.id)}
            >
              {kid.name} ({kid.age})
            </button>
          ))}
          <button
            type="button"
            className={`filter-chip ${childScope === 'all' ? 'active' : ''}`}
            onClick={() => setChildScope('all')}
          >
            Both boys
          </button>
        </div>
      )}

      {scopedLogs.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={26} color="var(--sage-600)" />
          <div className="empty-title">
            {logs.length === 0
              ? 'Your shared pattern log starts here'
              : `No moments logged for ${scopeLabel} yet`}
          </div>
          <p className="empty-sub">
            After a tough moment, tap <strong>Helped</strong>, <strong>Somewhat</strong>, or{' '}
            <strong>Escalated</strong> on any strategy. Over just a few days, Safe Harbor learns what calms{' '}
            {scopeLabel} fastest—especially when he’s tired or testing boundaries.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 6 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                onOpenLogSheet({
                  triggerId: 'boundaries',
                  outcome: 'helped',
                  childId: childScope === 'all' ? activeChild?.id || 'child1' : childScope,
                })
              }
            >
              Log a moment for {childScope === 'all' ? kids[0].name : scopeLabel}
            </button>
            {logs.length === 0 && (
              <button
                type="button"
                id="load-sample-logs-btn"
                className="btn-secondary"
                onClick={onLoadSampleData}
              >
                Preview with 6 sample moments
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Co-Parent Handoff Card */}
          {insights.latestLog && (
            <section className="handoff-card" aria-label="Latest co-parent update">
              <div className="section-header">
                <span className="reframe-kicker">Latest Co-Parent Handoff</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                  {formatRelativeTime(insights.latestLog.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-primary)', lineHeight: 1.45 }}>
                <strong>{insights.latestLog.parentName}</strong> logged{' '}
                <strong>{getTriggerById(insights.latestLog.triggerId).shortLabel}</strong>
                {insights.latestLog.wasTired ? ' (tired)' : ''} →{' '}
                <em>{insights.latestLog.strategyTitle}</em>{' '}
                <span className={`outcome-badge ${insights.latestLog.outcome}`}>
                  {insights.latestLog.outcome}
                </span>
              </p>
              {insights.latestLog.notes && (
                <p style={{ fontSize: '0.83rem', color: 'var(--ink-secondary)' }}>
                  “{insights.latestLog.notes}”
                </p>
              )}
            </section>
          )}

          {/* Top 3 Metrics */}
          <div className="stats-strip">
            <div className="stat-cell">
              <span className="stat-value">{insights.total}</span>
              <span className="stat-label">Moments logged</span>
            </div>
            <div className="stat-cell">
              <span className="stat-value" style={{ color: 'var(--sage-700)' }}>
                {insights.helpedPercent}%
              </span>
              <span className="stat-label">Helped calm</span>
            </div>
            <div className="stat-cell">
              <span className="stat-value" style={{ color: 'var(--amber-700)' }}>
                {insights.tiredPercent}%
              </span>
              <span className="stat-label">While tired</span>
            </div>
          </div>

          {/* What Works Best Leaderboard */}
          {insights.topStrategies.length > 0 && (
            <section className="surface-card">
              <div className="section-header">
                <span className="section-label">
                  What Works Best for {scopeLabel}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {insights.topStrategies.map((s) => {
                  const helpedW = (s.helped / s.total) * 100;
                  const somewhatW = (s.somewhat / s.total) * 100;
                  const escalatedW = (s.escalated / s.total) * 100;
                  return (
                    <div key={s.strategyId} className="insight-bar-row">
                      <div className="insight-bar-top">
                        <span className="insight-bar-title">{s.strategyTitle}</span>
                        <span className="insight-bar-meta">
                          {s.helped}/{s.total} helped
                        </span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-seg helped" style={{ width: `${helpedW}%` }} />
                        <div className="progress-seg somewhat" style={{ width: `${somewhatW}%` }} />
                        <div className="progress-seg escalated" style={{ width: `${escalatedW}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {insights.tiredWinners.length > 0 && (
                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-hairline)' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--amber-700)',
                      marginBottom: 6,
                    }}
                  >
                    <Moon size={13} />
                    Top picks when he’s overtired:
                  </div>
                  <div className="chip-wrap">
                    {insights.tiredWinners.map((tw) => (
                      <span key={tw.strategyId} className="meta-tag tired">
                        {tw.strategyTitle} ({tw.helped}×)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Watch-Out Strategies */}
          {insights.watchOutStrategies.length > 0 && (
            <section
              className="surface-card"
              style={{ background: 'var(--terra-100)', borderColor: 'hsl(18, 45%, 86%)' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--terra-600)',
                }}
              >
                <AlertTriangle size={14} />
                Watch Out — Tended to Escalate
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {insights.watchOutStrategies.map((w) => (
                  <div
                    key={w.strategyId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.88rem',
                      color: 'var(--ink-primary)',
                    }}
                  >
                    <strong>{w.strategyTitle}</strong>
                    <span style={{ color: 'var(--terra-600)', fontWeight: 600 }}>
                      Escalated {w.escalated}/{w.total}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>
                Tip: If talking or validating escalates {profile.childName || 'him'}, switch to{' '}
                <strong>Fewest Words</strong> or <strong>Silent Sturdy Anchor</strong> next time.
              </p>
            </section>
          )}

          {/* Trigger Breakdown */}
          {insights.triggerBreakdown.length > 0 && (
            <section className="surface-card">
              <span className="section-label">Most Common Triggers</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.triggerBreakdown.slice(0, 5).map((t) => (
                  <div key={t.id} className="insight-bar-row">
                    <div className="insight-bar-top">
                      <span className="insight-bar-title">{t.label}</span>
                      <span className="insight-bar-meta">
                        {t.count}× ({t.percent}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-seg helped" style={{ width: `${t.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Shared History Timeline */}
          <section className="surface-card">
            <div className="section-header">
              <span className="section-label">Shared History ({filteredLogs.length})</span>
            </div>

            <div className="chip-scroll">
              {[
                { id: 'all', label: 'All' },
                { id: 'helped', label: 'Helped' },
                { id: 'escalated', label: 'Escalated' },
                { id: 'tired', label: 'Tired' },
                { id: 'parent1', label: profile.parent1Name || 'Mom' },
                { id: 'parent2', label: profile.parent2Name || 'Dad' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`filter-chip ${filter === item.id ? 'active' : ''}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              {filteredLogs.length === 0 ? (
                <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', padding: '12px 0' }}>
                  No moments match this filter.
                </p>
              ) : (
                filteredLogs.map((log) => {
                  const trigger = getTriggerById(log.triggerId);
                  return (
                    <div key={log.id} className="log-item">
                      <div className="log-item-top">
                        <span className="log-item-strategy">{log.strategyTitle}</span>
                        <span className={`outcome-badge ${log.outcome}`}>{log.outcome}</span>
                      </div>

                      <div className="strategy-meta-row" style={{ marginBottom: 0 }}>
                        <span className="meta-tag">{trigger.shortLabel}</span>
                        {log.wasTired && (
                          <span className="meta-tag tired" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Moon size={11} /> Tired
                          </span>
                        )}
                        {log.wasFlooded && (
                          <span className="meta-tag warn" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <VolumeX size={11} /> Flooded
                          </span>
                        )}
                        {Array.isArray(log.contextTags) &&
                          log.contextTags.map((tag) => (
                            <span key={tag} className="meta-tag">
                              {tag}
                            </span>
                          ))}
                      </div>

                      {log.notes && <p className="log-item-note">{log.notes}</p>}

                      <div className="log-item-footer">
                        <span>
                          {log.parentName} · {formatRelativeTime(log.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--ink-muted)',
                            fontSize: '0.75rem',
                          }}
                          aria-label="Delete log entry"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
