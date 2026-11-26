import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudOff,
  Copy,
  Download,
  ExternalLink,
  Lock,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  FAMILY_SHEET_URL,
  getActiveSheetsConfig,
  getEnvSheetsConfig,
  saveRuntimeSheetsConfig,
} from '../lib/sheetsSync';
import {
  getActiveSupabaseConfig,
  getEnvSupabaseConfig,
  saveRuntimeSupabaseConfig,
} from '../lib/supabase';

const QUICK_SQL_SNIPPET = `-- Run supabase/schema.sql in Supabase -> SQL Editor
-- Tables: families, moment_logs, custom_scripts, strategy_favorites`;

export default function FamilyView({
  profile,
  syncStatus,
  syncError,
  logsCount,
  onSaveProfile,
  onLockApp,
  onManualSync,
  onConnectSheets,
  onExportJson,
  onImportJson,
  onLoadSampleData,
  onClearAllLogs,
}) {
  const [parent1Name, setParent1Name] = useState(profile.parent1Name || 'Mom');
  const [parent2Name, setParent2Name] = useState(profile.parent2Name || 'Dad');
  const [childName, setChildName] = useState(profile.childName || 'Liam');
  const [childAge, setChildAge] = useState(String(profile.childAge || 4));
  const [familyCode, setFamilyCode] = useState(profile.familyCode || 'our-family');
  const [parent1Pin, setParent1Pin] = useState(profile.parent1Pin || '0527');
  const [parent2Pin, setParent2Pin] = useState(profile.parent2Pin || profile.pin || '0901');

  const envSheetsCfg = getEnvSheetsConfig();
  const activeSheetsCfg = getActiveSheetsConfig();
  const [sheetsUrl, setSheetsUrl] = useState(activeSheetsCfg.url || '');

  const envCfg = getEnvSupabaseConfig();
  const activeCfg = getActiveSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(activeCfg.url || '');
  const [sbKey, setSbKey] = useState(activeCfg.anonKey || '');
  const [supabaseOpen, setSupabaseOpen] = useState(Boolean(activeCfg.source && !activeSheetsCfg.source));
  const [copiedCode, setCopiedCode] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const cleanPin1 = parent1Pin.replace(/\D/g, '').slice(0, 4);
    const cleanPin2 = parent2Pin.replace(/\D/g, '').slice(0, 4);
    if (cleanPin1.length !== 4 || cleanPin2.length !== 4) {
      alert('Please enter a 4-digit PIN for each parent.');
      return;
    }
    onSaveProfile({
      familyCode: (familyCode || 'our-family').trim().toLowerCase().replace(/\s+/g, '-'),
      pin: cleanPin2,
      parent1Pin: cleanPin1,
      parent2Pin: cleanPin2,
      parent1Name: parent1Name.trim() || 'Mom',
      parent2Name: parent2Name.trim() || 'Dad',
      childName: childName.trim() || 'Liam',
      childAge: Math.max(1, Math.min(18, Number(childAge) || 4)),
    });
  };

  const handleSaveSheets = (e) => {
    e.preventDefault();
    saveRuntimeSheetsConfig(sheetsUrl);
    if (onConnectSheets) {
      onConnectSheets();
    } else {
      onManualSync();
    }
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    saveRuntimeSupabaseConfig(sbUrl, sbKey);
    onManualSync();
  };

  const handleCopyFamilyCode = async () => {
    try {
      await navigator.clipboard.writeText(familyCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImportJson(parsed);
      } catch {
        alert('Could not read backup file. Please choose a valid Sturdy JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="page-intro">
        <h1 className="page-title">Family & Sync</h1>
        <p className="page-subtitle">
          Personalize names for every script and keep both phones synced to your Google Sheet.
        </p>
      </div>

      {/* Family Profile & PIN */}
      <form className="surface-card" onSubmit={handleProfileSubmit}>
        <div className="section-header">
          <span className="section-label">Family Names & PINs</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ minHeight: 34, padding: '0 10px', fontSize: '0.78rem' }}
            onClick={onLockApp}
          >
            <Lock size={13} />
            Lock App
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="field-group">
            <span className="field-label">Parent 1</span>
            <input
              id="settings-parent1"
              type="text"
              className="text-input"
              value={parent1Name}
              onChange={(e) => setParent1Name(e.target.value)}
              placeholder="Mom"
            />
          </label>
          <label className="field-group">
            <span className="field-label">Parent 2</span>
            <input
              id="settings-parent2"
              type="text"
              className="text-input"
              value={parent2Name}
              onChange={(e) => setParent2Name(e.target.value)}
              placeholder="Dad"
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <label className="field-group">
            <span className="field-label">Child’s name (used in scripts)</span>
            <input
              id="settings-child-name"
              type="text"
              className="text-input"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Liam"
            />
          </label>
          <label className="field-group">
            <span className="field-label">Age</span>
            <input
              type="number"
              min="1"
              max="12"
              className="text-input"
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
            />
          </label>
        </div>

        <label className="field-group">
          <span className="field-label">Shared Family Code</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              className="text-input"
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value)}
              placeholder="our-family"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={handleCopyFamilyCode}
              title="Copy family code"
              style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)' }}
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="field-group">
            <span className="field-label">{parent1Name || 'Mom'}’s 4-Digit PIN</span>
            <input
              id="settings-pin-parent1"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="text-input"
              value={parent1Pin}
              onChange={(e) => setParent1Pin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0527"
            />
          </label>
          <label className="field-group">
            <span className="field-label">{parent2Name || 'Dad'}’s 4-Digit PIN</span>
            <input
              id="settings-pin-parent2"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="text-input"
              value={parent2Pin}
              onChange={(e) => setParent2Pin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0901"
            />
          </label>
        </div>

        <button type="submit" id="settings-save-profile-btn" className="btn-primary">
          Save Family Settings
        </button>
      </form>

      {/* Google Sheets Cloud Sync Card (Primary) */}
      <form className="surface-card" onSubmit={handleSaveSheets}>
        <div className="section-header">
          <span className="section-label">Google Sheet Cloud Sync</span>
          <span
            className={`meta-tag ${syncStatus === 'synced' ? 'helped' : syncStatus === 'error' ? 'warn' : 'tired'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            {syncStatus === 'synced' ? <Cloud size={12} /> : <CloudOff size={12} />}
            {syncStatus === 'synced'
              ? 'Synced'
              : syncStatus === 'syncing'
                ? 'Syncing…'
                : syncStatus === 'error'
                  ? 'Sync error'
                  : 'Not connected'}
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', lineHeight: 1.48 }}>
          Every moment logged on {parent1Name}’s or {parent2Name}’s phone saves safely to your
          private <strong>Sturdy Data</strong> Google Sheet and stays synced across devices.
        </p>

        <a
          href={FAMILY_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          <ExternalLink size={15} />
          Open “Sturdy Data” Google Sheet
        </a>

        {envSheetsCfg.source === 'env' && !sheetsUrl ? (
          <div className="reframe-banner">
            <span className="reframe-kicker">Google Sheet Connected</span>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
              Connected automatically to your family’s Google Sheet.
            </p>
          </div>
        ) : (
          <label className="field-group">
            <span className="field-label">Apps Script Web App URL</span>
            <input
              id="settings-sheets-url"
              type="url"
              className="text-input"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
            />
          </label>
        )}

        {syncError && (
          <p style={{ fontSize: '0.8rem', color: 'var(--terra-600)' }}>
            Sync notice: {syncError}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            Connect & Sync
          </button>
          <button type="button" className="btn-secondary" onClick={onManualSync}>
            <RefreshCw size={15} />
            Sync Now
          </button>
        </div>
      </form>

      {/* Optional Alternative: Supabase Sync */}
      <div className="surface-card" style={{ padding: '13px 15px' }}>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--ink-secondary)',
          }}
          onClick={() => setSupabaseOpen((o) => !o)}
        >
          <span className="section-label">Alternative: Supabase Sync</span>
          {supabaseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {supabaseOpen && (
          <form
            onSubmit={handleSaveSupabase}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: 1.48 }}>
              Optional alternative if you ever switch from Google Sheets to a Supabase database.
            </p>

            {envCfg.source === 'env' ? (
              <div className="reframe-banner">
                <span className="reframe-kicker">Environment Connected</span>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
                  Supabase credentials are configured via environment variables.
                </p>
              </div>
            ) : (
              <>
                <label className="field-group">
                  <span className="field-label">Supabase Project URL</span>
                  <input
                    type="url"
                    className="text-input"
                    placeholder="https://xxxxx.supabase.co"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Supabase Publishable / Anon Key</span>
                  <input
                    type="password"
                    className="text-input"
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                  />
                </label>
              </>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {envCfg.source !== 'env' && (
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Connect Supabase
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={onManualSync}
                style={{ flex: envCfg.source === 'env' ? 1 : undefined }}
              >
                <RefreshCw size={15} />
                Sync Now
              </button>
            </div>

            <div className="code-block">{QUICK_SQL_SNIPPET}</div>
          </form>
        )}
      </div>

      {/* Data Backup & Demo Controls */}
      <section className="surface-card">
        <span className="section-label">Data & Backup ({logsCount} moments)</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={onExportJson}>
            <Download size={15} />
            Export JSON
          </button>
          <label className="btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={15} />
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="divider-line" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ minHeight: 38, fontSize: '0.82rem' }}
            onClick={onLoadSampleData}
          >
            Load 6 sample moments
          </button>

          {logsCount > 0 && (
            <button
              type="button"
              className="btn-ghost-danger"
              onClick={() => {
                if (window.confirm('Clear all logged moments on this device?')) {
                  onClearAllLogs();
                }
              }}
            >
              <Trash2 size={14} />
              Clear all logs
            </button>
          )}
        </div>
      </section>
    </>
  );
}
