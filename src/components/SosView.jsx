import { useMemo, useState } from 'react';
import { ArrowLeft, Moon, PlusCircle, Sparkles } from 'lucide-react';
import { TRIGGERS, formatScript, getTriggerById } from '../data/strategies';
import { getRankedStrategiesForMoment } from '../lib/insights';
import BreathingAnchor from './BreathingAnchor';
import StrategyCard from './StrategyCard';

export default function SosView({
  profile,
  allStrategies,
  logs,
  favorites,
  onToggleFav,
  onOpenLogSheet,
  onDeleteCustomScript,
}) {
  const [selectedTriggerId, setSelectedTriggerId] = useState(null);
  const [isTired, setIsTired] = useState(false);

  const activeTrigger = selectedTriggerId ? getTriggerById(selectedTriggerId) : null;

  const triggerCounts = useMemo(() => {
    const counts = {};
    for (const log of logs) {
      counts[log.triggerId] = (counts[log.triggerId] || 0) + 1;
    }
    return counts;
  }, [logs]);

  const ranked = useMemo(() => {
    if (!selectedTriggerId) return [];
    return getRankedStrategiesForMoment(allStrategies, logs, favorites, {
      triggerId: selectedTriggerId,
      isTired,
    });
  }, [selectedTriggerId, allStrategies, logs, favorites, isTired]);

  const bestForTrigger = useMemo(() => {
    const winner = ranked.find(
      (r) => r.isTriggerSpecific && r.stat && r.stat.helped > 0 && r.stat.score > 0
    );
    return winner || null;
  }, [ranked]);

  return (
    <>
      <BreathingAnchor childName={profile.childName} />

      {!activeTrigger ? (
        <>
          <div className="page-intro">
            <h1 className="page-title">What’s happening right now?</h1>
            <p className="page-subtitle">
              Tap the closest moment for fast, calm scripts tailored to {profile.childName || 'Buddy'}.
            </p>
          </div>

          {/* Tired Modifier Toggle */}
          <button
            type="button"
            id="sos-tired-toggle"
            className={`modifier-row ${isTired ? 'active' : ''}`}
            onClick={() => setIsTired((v) => !v)}
            aria-pressed={isTired}
          >
            <div className="modifier-left">
              <Moon size={19} color={isTired ? 'var(--amber-700)' : 'var(--ink-secondary)'} />
              <div style={{ textAlign: 'left' }}>
                <div className="modifier-title">He’s tired / low battery</div>
                <div className="modifier-desc">
                  Prioritizes fewer words & lower demands
                </div>
              </div>
            </div>
            <span className={`toggle-switch ${isTired ? 'on' : ''}`}>
              <span className="toggle-thumb" />
            </span>
          </button>

          {/* 8 Trigger Grid */}
          <div className="trigger-grid" role="list">
            {TRIGGERS.map((trigger) => {
              const count = triggerCounts[trigger.id] || 0;
              return (
                <button
                  key={trigger.id}
                  type="button"
                  id={`trigger-${trigger.id}`}
                  className={`trigger-tile ${trigger.urgency === 'high' ? 'urgent' : ''}`}
                  onClick={() => setSelectedTriggerId(trigger.id)}
                >
                  <div className="trigger-tile-top">
                    <span className="trigger-tile-title">{trigger.label}</span>
                    {count > 0 && (
                      <span className="trigger-count-pill">{count}</span>
                    )}
                  </div>
                  <span className="trigger-tile-sub">{trigger.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Direct quick log button for after a storm */}
          <button
            type="button"
            id="sos-standalone-log-btn"
            className="btn-secondary"
            onClick={() =>
              onOpenLogSheet({
                triggerId: isTired ? 'overtired' : 'boundaries',
                wasTired: isTired,
                outcome: 'helped',
              })
            }
          >
            <PlusCircle size={17} />
            Storm just passed? Log what happened
          </button>
        </>
      ) : (
        <>
          <div className="back-bar">
            <button
              type="button"
              id="sos-back-btn"
              className="back-btn"
              onClick={() => setSelectedTriggerId(null)}
            >
              <ArrowLeft size={16} />
              All moments
            </button>

            <button
              type="button"
              className={`filter-chip ${isTired ? 'active' : ''}`}
              onClick={() => setIsTired((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Moon size={13} />
              {isTired ? 'Tired mode ON' : 'He’s tired?'}
            </button>
          </div>

          <div className="page-intro">
            <h1 className="page-title">{activeTrigger.label}</h1>
          </div>

          {/* Good Inside Reframe */}
          <div className="reframe-banner">
            <span className="reframe-kicker">Good Inside Reframe</span>
            <p className="reframe-text">
              {formatScript(activeTrigger.reframe, profile.childName)}
            </p>
          </div>

          {/* Family-Specific Winner Callout */}
          {bestForTrigger && (
            <div className="winner-callout">
              <div>
                <div className="winner-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Sparkles size={13} />
                  Works best for {profile.childName || 'Buddy'}
                  {isTired ? ' when tired' : ''}
                </div>
                <div className="winner-name">{bestForTrigger.strategy.title}</div>
              </div>
              <span className="winner-rate">
                {bestForTrigger.stat.helped}/{bestForTrigger.stat.total} helped
              </span>
            </div>
          )}

          {/* Ranked Strategy Cards */}
          <div className="strategy-list">
            {ranked.map(({ strategy, stat, isTriggerSpecific, isFav }) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                childName={profile.childName}
                stat={stat}
                isTriggerSpecific={isTriggerSpecific}
                isFav={isFav}
                defaultLowWords={isTired || activeTrigger.defaultLowWords}
                onToggleFav={onToggleFav}
                onDeleteCustom={onDeleteCustomScript}
                onQuickLog={(strat, outcome) =>
                  onOpenLogSheet({
                    triggerId: activeTrigger.id,
                    strategyId: strat.id,
                    strategyTitle: strat.title,
                    outcome,
                    wasTired: isTired || activeTrigger.id === 'overtired',
                    wasFlooded:
                      activeTrigger.id === 'flooded' || activeTrigger.id === 'dfk',
                  })
                }
              />
            ))}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              onOpenLogSheet({
                triggerId: activeTrigger.id,
                strategyId: 'custom-other',
                wasTired: isTired,
                wasFlooded:
                  activeTrigger.id === 'flooded' || activeTrigger.id === 'dfk',
              })
            }
          >
            <PlusCircle size={17} />
            Tried something else? Log it here
          </button>
        </>
      )}
    </>
  );
}
