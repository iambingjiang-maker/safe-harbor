import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Moon,
  VolumeX,
  X,
} from 'lucide-react';
import { CONTEXT_TAGS, TRIGGERS } from '../data/strategies';

export default function QuickLogSheet({
  initialData,
  allStrategies,
  profile,
  activeParentName,
  onSave,
  onClose,
}) {
  const [triggerId, setTriggerId] = useState(initialData?.triggerId || 'boundaries');
  const [strategyId, setStrategyId] = useState(
    initialData?.strategyId || 'custom-other'
  );
  const [customStrategyTitle, setCustomStrategyTitle] = useState(
    initialData?.strategyId === 'custom-other' ? initialData?.strategyTitle || '' : ''
  );
  const [outcome, setOutcome] = useState(initialData?.outcome || 'helped');
  const [wasTired, setWasTired] = useState(Boolean(initialData?.wasTired));
  const [wasFlooded, setWasFlooded] = useState(
    Boolean(
      initialData?.wasFlooded ??
        (initialData?.triggerId === 'flooded' || initialData?.triggerId === 'dfk')
    )
  );
  const [parentName, setParentName] = useState(activeParentName || profile.parent1Name);
  const [contextTags, setContextTags] = useState(initialData?.contextTags || []);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const toggleTag = (tag) => {
    setContextTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const matched = allStrategies.find((s) => s.id === strategyId);
    const title =
      strategyId === 'custom-other'
        ? customStrategyTitle.trim() || 'Something else we tried'
        : matched?.title || initialData?.strategyTitle || 'Strategy';

    onSave({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      parentName,
      triggerId,
      strategyId: strategyId === 'custom-other' ? `other-${Date.now()}` : strategyId,
      strategyTitle: title,
      outcome,
      wasTired,
      wasFlooded,
      contextTags,
      notes: notes.trim(),
    });
  };

  return (
    <div className="sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <form
        className="sheet-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">Log This Moment</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close logger"
          >
            <X size={18} />
          </button>
        </div>

        {/* Outcome Picker */}
        <div className="field-group">
          <span className="field-label">How did it go?</span>
          <div className="outcome-btn-row">
            <button
              type="button"
              className={`outcome-btn helped ${outcome === 'helped' ? 'selected' : ''}`}
              onClick={() => setOutcome('helped')}
            >
              <CheckCircle2 size={15} />
              Helped
            </button>
            <button
              type="button"
              className={`outcome-btn somewhat ${outcome === 'somewhat' ? 'selected' : ''}`}
              onClick={() => setOutcome('somewhat')}
            >
              <MinusCircle size={15} />
              Somewhat
            </button>
            <button
              type="button"
              className={`outcome-btn escalated ${outcome === 'escalated' ? 'selected' : ''}`}
              onClick={() => setOutcome('escalated')}
            >
              <AlertTriangle size={15} />
              Escalated
            </button>
          </div>
        </div>

        {/* Trigger & Strategy */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <label className="field-group">
            <span className="field-label">What triggered it?</span>
            <select
              id="log-trigger-select"
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
            <span className="field-label">What did you try?</span>
            <select
              id="log-strategy-select"
              className="select-input"
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
            >
              {allStrategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
              <option value="custom-other">Something else we tried…</option>
            </select>
          </label>

          {strategyId === 'custom-other' && (
            <label className="field-group">
              <span className="field-label">Describe what you tried</span>
              <input
                type="text"
                className="text-input"
                placeholder="e.g., Offered cold water + sat quietly on steps"
                value={customStrategyTitle}
                onChange={(e) => setCustomStrategyTitle(e.target.value)}
                required
              />
            </label>
          )}
        </div>

        {/* Quick State Toggles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className={`filter-chip ${wasTired ? 'active' : ''}`}
            onClick={() => setWasTired((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Moon size={14} />
            He was tired
          </button>
          <button
            type="button"
            className={`filter-chip ${wasFlooded ? 'active' : ''}`}
            onClick={() => setWasFlooded((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <VolumeX size={14} />
            Couldn’t hear us (flooded)
          </button>
        </div>

        {/* Context Tags */}
        <div className="field-group">
          <span className="field-label">When / context (optional)</span>
          <div className="chip-wrap">
            {CONTEXT_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`filter-chip ${contextTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Parent & Notes */}
        <div className="field-group">
          <span className="field-label">Logged by</span>
          <div className="chip-wrap">
            {[profile.parent1Name || 'Mom', profile.parent2Name || 'Dad'].map((p) => (
              <button
                key={p}
                type="button"
                className={`filter-chip ${parentName === p ? 'active' : ''}`}
                onClick={() => setParentName(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="field-group">
          <span className="field-label">Quick note for next time (optional)</span>
          <textarea
            id="log-notes-input"
            className="text-area"
            placeholder={`What specifically helped or set ${profile.childName || 'him'} off?`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button type="submit" id="log-save-btn" className="btn-primary">
          Save to Shared Family Log
        </button>
      </form>
    </div>
  );
}
