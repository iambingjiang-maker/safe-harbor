import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  MinusCircle,
  Star,
  Trash2,
} from 'lucide-react';
import { formatScript } from '../data/strategies';

export default function StrategyCard({
  strategy,
  childName,
  stat = null,
  isTriggerSpecific = false,
  isFav = false,
  defaultLowWords = false,
  showShortHint = false,
  onToggleFav,
  onQuickLog,
  onDeleteCustom = null,
}) {
  const [lowWordsMode, setLowWordsMode] = useState(Boolean(defaultLowWords));
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setLowWordsMode(Boolean(defaultLowWords));
  }, [defaultLowWords]);

  const hasShortVariant =
    Boolean(strategy.scriptFlooded) && strategy.scriptFlooded !== strategy.scriptStandard;

  const activeScript = lowWordsMode
    ? strategy.scriptFlooded || strategy.scriptStandard
    : strategy.scriptStandard;

  const hasEscalatedOften = stat && stat.escalated > 0 && stat.escalated >= stat.helped;

  return (
    <article className="strategy-card">
      <div className="strategy-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="strategy-meta-row">
            <span className="meta-tag">{strategy.principle}</span>
            {strategy.worksWhenTired && (
              <span className="meta-tag tired">Tired-friendly</span>
            )}
            {stat && stat.helped > 0 && !hasEscalatedOften && (
              <span className="meta-tag helped">
                Helped {stat.helped}/{stat.total}
                {isTriggerSpecific ? ' here' : ''}
              </span>
            )}
            {hasEscalatedOften && (
              <span className="meta-tag warn">
                Escalated {stat.escalated}× recently
              </span>
            )}
          </div>
          <h3 className="strategy-title">{strategy.title}</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {strategy.isCustom && onDeleteCustom && (
            <button
              type="button"
              className="star-btn"
              onClick={() => onDeleteCustom(strategy.id)}
              title="Delete custom script"
              aria-label="Delete custom script"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            type="button"
            className={`star-btn ${isFav ? 'starred' : ''}`}
            onClick={() => onToggleFav(strategy.id)}
            title={isFav ? 'Remove from go-to strategies' : 'Pin as a go-to strategy'}
            aria-label={isFav ? 'Unstar strategy' : 'Star strategy'}
          >
            <Star size={18} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Exact Script Block */}
      <div className="script-box">
        <div className="script-mode-row">
          <span className="script-mode-label">Say This</span>
          {hasShortVariant && (
            <div className="segmented-mini" role="group" aria-label="Script length">
              <button
                type="button"
                className={!lowWordsMode ? 'active' : ''}
                onClick={() => setLowWordsMode(false)}
              >
                Full script
              </button>
              <button
                type="button"
                className={lowWordsMode ? 'active' : ''}
                onClick={() => setLowWordsMode(true)}
              >
                Fewest words
              </button>
            </div>
          )}
        </div>
        <p className="script-quote">{formatScript(activeScript, childName)}</p>
        {showShortHint && !lowWordsMode && hasShortVariant && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px dashed var(--border-soft)',
              fontSize: '0.82rem',
              color: 'var(--amber-700)',
              lineHeight: 1.4,
            }}
          >
            <strong>Low-battery short version:</strong>{' '}
            {formatScript(strategy.scriptFlooded, childName)}
          </div>
        )}
      </div>

      {/* Body & Presence Cue — Always visible because body language matters most at age 4 */}
      {strategy.bodyAction && (
        <div className="strategy-detail">
          <div className="detail-heading">Body & Presence</div>
          <p className="detail-text">{formatScript(strategy.bodyAction, childName)}</p>
        </div>
      )}

      {/* Collapsible Why + Avoid */}
      <button
        type="button"
        className="expand-toggle"
        onClick={() => setDetailsOpen((o) => !o)}
      >
        {detailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {detailsOpen ? 'Hide why it works & what to avoid' : 'Why it works & what to avoid'}
      </button>

      {detailsOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {strategy.mgi && (
            <div className="strategy-detail">
              <div className="detail-heading">Most Generous Interpretation</div>
              <p className="detail-text">{formatScript(strategy.mgi, childName)}</p>
            </div>
          )}
          {Array.isArray(strategy.avoid) && strategy.avoid.length > 0 && (
            <div className="strategy-detail">
              <div className="detail-heading">Avoid Mid-Storm</div>
              <ul className="avoid-list">
                {strategy.avoid.map((item, idx) => (
                  <li key={idx}>{formatScript(item, childName)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 1-Tap Outcome Logger */}
      <div className="card-log-bar">
        <div className="card-log-prompt">Tried this? Record how it went:</div>
        <div className="outcome-btn-row">
          <button
            type="button"
            className="outcome-btn helped"
            onClick={() => onQuickLog(strategy, 'helped')}
          >
            <CheckCircle2 size={15} />
            Helped
          </button>
          <button
            type="button"
            className="outcome-btn somewhat"
            onClick={() => onQuickLog(strategy, 'somewhat')}
          >
            <MinusCircle size={15} />
            Somewhat
          </button>
          <button
            type="button"
            className="outcome-btn escalated"
            onClick={() => onQuickLog(strategy, 'escalated')}
          >
            <AlertTriangle size={15} />
            Escalated
          </button>
        </div>
      </div>
    </article>
  );
}
