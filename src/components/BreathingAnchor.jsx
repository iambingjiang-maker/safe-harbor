import { useEffect, useState } from 'react';
import { RefreshCw, Wind, X } from 'lucide-react';
import { PARENT_MANTRAS, formatScript } from '../data/strategies';

export default function BreathingAnchor({ childName }) {
  const [mantraIdx, setMantraIdx] = useState(0);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale (4s) -> exhale (6s)
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (!breathingOpen) return;
    setPhase('inhale');
    setSecondsLeft(4);

    let currentPhase = 'inhale';
    let remaining = 4;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'exhale';
          remaining = 6;
        } else {
          currentPhase = 'inhale';
          remaining = 4;
        }
        setPhase(currentPhase);
      }
      setSecondsLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingOpen]);

  const mantra = PARENT_MANTRAS[mantraIdx % PARENT_MANTRAS.length];

  return (
    <section className="anchor-card" aria-label="Parent grounding anchor">
      <div className="anchor-top">
        <div className="anchor-mantra-wrap">
          <div className="anchor-kicker">Your Anchor First</div>
          <p className="anchor-mantra">{formatScript(mantra.text, childName)}</p>
        </div>

        <div className="anchor-actions">
          <button
            type="button"
            id="anchor-next-mantra"
            className="anchor-icon-btn"
            onClick={() => setMantraIdx((i) => (i + 1) % PARENT_MANTRAS.length)}
            title="Another reminder"
            aria-label="Next parent mantra"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            id="anchor-breathe-toggle"
            className="anchor-btn"
            onClick={() => setBreathingOpen((o) => !o)}
          >
            {breathingOpen ? <X size={15} /> : <Wind size={15} />}
            {breathingOpen ? 'Done' : 'Breathe'}
          </button>
        </div>
      </div>

      {breathingOpen && (
        <div className="breathe-panel">
          <div className={`breathe-orb-wrap ${phase}`}>
            <div className="breathe-orb-outer" />
            <div className="breathe-orb-inner">{secondsLeft}</div>
          </div>
          <div className="breathe-copy">
            <div className="breathe-phase">
              {phase === 'inhale' ? 'Breathe in slowly…' : 'Long, steady exhale…'}
            </div>
            <p className="breathe-sub">
              {formatScript(mantra.sub, childName)} Drop your shoulders. Unclench your jaw.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
