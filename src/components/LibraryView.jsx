import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Plus, Search, Star, X } from 'lucide-react';
import { CORE_PILLARS, TRIGGERS } from '../data/strategies';
import { computeStrategyStats } from '../lib/insights';
import StrategyCard from './StrategyCard';

export default function LibraryView({
  profile,
  activeParentName,
  allStrategies,
  logs,
  favorites,
  onToggleFav,
  onOpenLogSheet,
  onAddCustomScript,
  onDeleteCustomScript,
}) {
  const [query, setQuery] = useState('');
  const [filterKey, setFilterKey] = useState('all'); // 'all' | 'starred' | 'custom' | triggerId
  const [pillarsOpen, setPillarsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Add script form state
  const [title, setTitle] = useState('');
  const [triggerId, setTriggerId] = useState('boundaries');
  const [scriptFlooded, setScriptFlooded] = useState('');
  const [scriptStandard, setScriptStandard] = useState('');
  const [bodyAction, setBodyAction] = useState('');
  const [avoidTip, setAvoidTip] = useState('');

  const overallStats = useMemo(() => computeStrategyStats(logs), [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allStrategies.filter((s) => {
      if (filterKey === 'starred' && !favorites.includes(s.id)) return false;
      if (filterKey === 'custom' && !s.isCustom) return false;
      if (
        filterKey !== 'all' &&
        filterKey !== 'starred' &&
        filterKey !== 'custom' &&
        !s.triggers.includes(filterKey)
      ) {
        return false;
      }

      if (!q) return true;
      const haystack = [
        s.title,
        s.principle,
        s.scriptStandard,
        s.scriptFlooded,
        s.bodyAction,
        s.mgi,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allStrategies, favorites, filterKey, query]);

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!title.trim() || !scriptStandard.trim()) return;

    onAddCustomScript({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: activeParentName,
      triggerId,
      triggers: [triggerId],
      title: title.trim(),
      principle: 'Our Family Script',
      worksWhenTired: true,
      lowWords: Boolean(scriptFlooded.trim()),
      mgi: `Saved by ${activeParentName} for what works in our home.`,
      scriptFlooded: scriptFlooded.trim() || scriptStandard.trim(),
      scriptStandard: scriptStandard.trim(),
      bodyAction: bodyAction.trim(),
      avoid: avoidTip.trim() ? [avoidTip.trim()] : [],
      isCustom: true,
    });

    setTitle('');
    setScriptFlooded('');
    setScriptStandard('');
    setBodyAction('');
    setAvoidTip('');
    setAddOpen(false);
  };

  return (
    <>
      <div className="section-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-intro">
          <h1 className="page-title">Scripts & Playbook</h1>
          <p className="page-subtitle">
            Good Inside tools tailored to age {profile.childAge || 4}, plus your family’s own go-to scripts.
          </p>
        </div>
        <button
          type="button"
          id="library-add-script-btn"
          className="btn-secondary"
          style={{ minHeight: 38, padding: '0 12px', flexShrink: 0 }}
          onClick={() => setAddOpen(true)}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Collapsible Good Inside Core Pillars Cheat Sheet */}
      <div className="surface-card" style={{ padding: '13px 15px' }}>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            textAlign: 'left',
          }}
          onClick={() => setPillarsOpen((o) => !o)}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.9rem' }}>
            <BookOpen size={17} color="var(--sage-700)" />
            6 Good Inside Pillars (Quick Refresher)
          </span>
          {pillarsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {pillarsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 }}>
            {CORE_PILLARS.map((pillar) => (
              <div key={pillar.title} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontSize: '0.86rem', color: 'var(--sage-700)' }}>
                  {pillar.title}
                </strong>
                <span style={{ fontSize: '0.83rem', color: 'var(--ink-secondary)', lineHeight: 1.44 }}>
                  {pillar.summary}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="search-wrap">
        <Search size={16} className="search-icon" />
        <input
          type="search"
          id="library-search-input"
          className="search-input"
          placeholder="Search scripts (e.g. hitting, silent, bedtime, choices)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="chip-scroll">
        <button
          type="button"
          className={`filter-chip ${filterKey === 'all' ? 'active' : ''}`}
          onClick={() => setFilterKey('all')}
        >
          All ({allStrategies.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterKey === 'starred' ? 'active' : ''}`}
          onClick={() => setFilterKey('starred')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Star size={13} />
          Go-Tos ({favorites.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterKey === 'custom' ? 'active' : ''}`}
          onClick={() => setFilterKey('custom')}
        >
          Our Scripts
        </button>
        {TRIGGERS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`filter-chip ${filterKey === t.id ? 'active' : ''}`}
            onClick={() => setFilterKey(t.id)}
          >
            {t.shortLabel}
          </button>
        ))}
      </div>

      {/* Strategy List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No matching scripts</div>
          <p className="empty-sub">
            Try clearing your search, or save a custom script that works well for {profile.childName || 'Buddy'}.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setQuery('');
              setFilterKey('all');
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="strategy-list">
          {filtered.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              childName={profile.childName}
              stat={overallStats.get(strategy.id) || null}
              isFav={favorites.includes(strategy.id)}
              onToggleFav={onToggleFav}
              onDeleteCustom={onDeleteCustomScript}
              onQuickLog={(strat, outcome) =>
                onOpenLogSheet({
                  triggerId: strat.triggers[0] || 'boundaries',
                  strategyId: strat.id,
                  strategyTitle: strat.title,
                  outcome,
                  wasTired: strat.triggers[0] === 'overtired',
                })
              }
            />
          ))}
        </div>
      )}

      {/* Add Custom Family Script Sheet */}
      {addOpen && (
        <div className="sheet-backdrop" onClick={() => setAddOpen(false)}>
          <form
            className="sheet-panel"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCustom}
          >
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h2 className="sheet-title">Add Family Script</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setAddOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
              Save a phrase, playful game, or boundary script that works uniquely well for{' '}
              {profile.childName || 'Buddy'}. Both parents will see it in SOS mode.
            </p>

            <label className="field-group">
              <span className="field-label">Strategy name</span>
              <input
                type="text"
                className="text-input"
                placeholder="e.g., Dinosaur Stomp to Bed"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="field-group">
              <span className="field-label">Best for which moment?</span>
              <select
                className="select-input"
                value={triggerId}
                onChange={(e) => setTriggerId(e.target.value)}
              >
                {TRIGGERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Exact script to say</span>
              <textarea
                className="text-area"
                placeholder={`e.g., "Two things are true, {child}: playtime is done, and you're mad. Want to stomp upstairs like a T-Rex?"`}
                value={scriptStandard}
                onChange={(e) => setScriptStandard(e.target.value)}
                required
              />
            </label>

            <label className="field-group">
              <span className="field-label">Ultra-short / flooded version (optional)</span>
              <input
                type="text"
                className="text-input"
                placeholder="e.g., Time for bed. T-Rex stomp or carry?"
                value={scriptFlooded}
                onChange={(e) => setScriptFlooded(e.target.value)}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Body / action tip (optional)</span>
              <input
                type="text"
                className="text-input"
                placeholder="e.g., Get down on one knee and let him roar first"
                value={bodyAction}
                onChange={(e) => setBodyAction(e.target.value)}
              />
            </label>

            <label className="field-group">
              <span className="field-label">What to avoid (optional)</span>
              <input
                type="text"
                className="text-input"
                placeholder="e.g., Don't rush him once he starts stomping"
                value={avoidTip}
                onChange={(e) => setAvoidTip(e.target.value)}
              />
            </label>

            <button type="submit" className="btn-primary">
              Save Script for Both Parents
            </button>
          </form>
        </div>
      )}
    </>
  );
}
