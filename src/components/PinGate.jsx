import { useState } from 'react';
import { Delete, ShieldCheck } from 'lucide-react';

export default function PinGate({
  profile,
  activeParentSlot,
  onSelectParentSlot,
  onUnlock,
}) {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const activeParentName =
    activeParentSlot === 'parent2'
      ? profile.parent2Name || 'Dad'
      : profile.parent1Name || 'Mom';
  const expectedPin =
    activeParentSlot === 'parent2'
      ? profile.parent2Pin || profile.pin || '1234'
      : profile.parent1Pin || '0527';
  const showDefaultHint = activeParentSlot === 'parent2' && expectedPin === '1234';

  const handleSelectSlot = (slot) => {
    setDigits('');
    setError(false);
    onSelectParentSlot(slot);
  };

  const handleDigit = (d) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setError(false);

    if (next.length === 4) {
      if (next === expectedPin) {
        onUnlock(rememberDevice);
      } else {
        setError(true);
        setTimeout(() => {
          setDigits('');
          setError(false);
        }, 550);
      }
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
    setError(false);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="app-viewport">
      <div className="pin-screen">
        <div className="pin-hero">
          <img src="./icon.svg" alt="Sturdy emblem" className="pin-logo" />
          <h1 className="page-title">Sturdy</h1>
          <p className="page-subtitle">
            Good Inside companion for {profile.childName || 'Buddy'} ({profile.childAge || 4})
          </p>

          <div style={{ marginTop: 8, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span className="section-label">Who’s using this phone?</span>
            <div className="parent-pick-row">
              <button
                type="button"
                id="pin-parent-1"
                className={`parent-pick-btn ${activeParentSlot === 'parent1' ? 'active' : ''}`}
                onClick={() => handleSelectSlot('parent1')}
              >
                {profile.parent1Name || 'Mom'}
              </button>
              <button
                type="button"
                id="pin-parent-2"
                className={`parent-pick-btn ${activeParentSlot === 'parent2' ? 'active' : ''}`}
                onClick={() => handleSelectSlot('parent2')}
              >
                {profile.parent2Name || 'Dad'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="field-label" style={{ marginBottom: 6 }}>
              Enter {activeParentName}’s 4-digit PIN
            </div>
            <div className="pin-dots" aria-label={`Entered ${digits.length} of 4 digits`}>
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`pin-dot ${idx < digits.length ? 'filled' : ''} ${error ? 'error' : ''}`}
                />
              ))}
            </div>
            {error ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--terra-600)', marginTop: 4 }}>
                Incorrect PIN — try again
              </p>
            ) : showDefaultHint ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                Default PIN is <strong>1234</strong> (change anytime in Family Settings)
              </p>
            ) : null}
          </div>

          <div className="pin-keypad">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                id={`pin-key-${k}`}
                className="pin-key"
                onClick={() => handleDigit(k)}
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              className="pin-key muted"
              onClick={() => setDigits('')}
              aria-label="Clear PIN"
            >
              Clear
            </button>
            <button
              type="button"
              id="pin-key-0"
              className="pin-key"
              onClick={() => handleDigit('0')}
            >
              0
            </button>
            <button
              type="button"
              className="pin-key muted"
              onClick={handleBackspace}
              aria-label="Backspace"
            >
              <Delete size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
              color: 'var(--ink-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--sage-600)' }}
            />
            Keep this phone unlocked for fast SOS access
          </label>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.74rem',
              color: 'var(--ink-muted)',
            }}
          >
            <ShieldCheck size={14} />
            Private family space
          </div>
        </div>
      </div>
    </div>
  );
}
