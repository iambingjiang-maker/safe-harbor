import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  Users,
} from 'lucide-react';
import { STRATEGIES, createSampleLogs } from './data/strategies';
import {
  deleteCustomScriptFromCloud,
  deleteLogFromCloud,
  getActiveCloudProvider,
  getChildrenList,
  loadDevicePrefs,
  loadLocalState,
  pullFamilyFromCloud,
  pushBulkToCloud,
  pushCustomScriptToCloud,
  pushLogToCloud,
  pushProfileToCloud,
  saveDevicePrefs,
  saveLocalState,
  subscribeToFamilyRealtime,
  syncFavoriteToCloud,
} from './lib/storage';
import PinGate from './components/PinGate';
import SosView from './components/SosView';
import LibraryView from './components/LibraryView';
import InsightsView from './components/InsightsView';
import FamilyView from './components/FamilyView';
import QuickLogSheet from './components/QuickLogSheet';

export default function App() {
  const [familyState, setFamilyState] = useState(() => loadLocalState());
  const [devicePrefs, setDevicePrefs] = useState(() => loadDevicePrefs());
  const [unlocked, setUnlocked] = useState(() => loadDevicePrefs().trustedDevice);
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'library' | 'insights' | 'family'
  const [logSheetData, setLogSheetData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(() =>
    getActiveCloudProvider() ? 'syncing' : 'local'
  );
  const [syncError, setSyncError] = useState('');
  const [toast, setToast] = useState('');

  const toastTimerRef = useRef(null);
  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 2600);
  }, []);

  // Persist local family state on every change
  useEffect(() => {
    saveLocalState(familyState);
  }, [familyState]);

  // Persist device prefs on every change
  useEffect(() => {
    saveDevicePrefs(devicePrefs);
  }, [devicePrefs]);

  const { profile, logs, customScripts, favorites } = familyState;
  const latestStateRef = useRef(familyState);
  useEffect(() => {
    latestStateRef.current = familyState;
  }, [familyState]);

  const childrenList = useMemo(() => getChildrenList(profile), [profile]);
  const activeChild = useMemo(
    () => childrenList.find((c) => c.id === devicePrefs.activeChildId) || childrenList[0],
    [childrenList, devicePrefs.activeChildId]
  );
  const activeChildProfile = useMemo(
    () => ({
      ...profile,
      childName: activeChild.name,
      childAge: activeChild.age,
    }),
    [profile, activeChild]
  );
  const activeChildLogs = useMemo(
    () => logs.filter((l) => (l.childId || 'child1') === activeChild.id),
    [logs, activeChild.id]
  );

  const activeParentName =
    devicePrefs.activeParentSlot === 'parent2'
      ? profile.parent2Name || 'Dad'
      : profile.parent1Name || 'Mom';

  const allStrategies = useMemo(
    () => [...customScripts, ...STRATEGIES],
    [customScripts]
  );

  // Pull from Google Sheets (or Supabase fallback) if configured
  const syncFromCloud = useCallback(
    async ({ silent = false, pushLocalFirst = false } = {}) => {
      const provider = getActiveCloudProvider();
      if (!provider) {
        setSyncStatus('local');
        setSyncError('');
        return;
      }

      setSyncStatus('syncing');
      setSyncError('');
      try {
        const current = latestStateRef.current;
        const result =
          pushLocalFirst &&
          provider === 'sheets' &&
          (current.logs.length > 0 || current.customScripts.length > 0)
            ? await pushBulkToCloud(current)
            : await pullFamilyFromCloud(current.profile.familyCode, current.profile);
        if (result && result.connected) {
          setFamilyState((prev) => ({
            profile: result.profile || prev.profile,
            logs: result.logs,
            customScripts: result.customScripts,
            favorites: result.favorites.length > 0 ? result.favorites : prev.favorites,
          }));
          setSyncStatus('synced');
          if (!silent) {
            showToast(
              result.provider === 'sheets'
                ? 'Synced with Sturdy Data Google Sheet'
                : 'Synced with family cloud'
            );
          }
        } else {
          setSyncStatus('local');
        }
      } catch (err) {
        setSyncStatus('error');
        setSyncError(err?.message || 'Could not reach cloud sync');
      }
    },
    [showToast]
  );

  // Initial pull, background polling / realtime subscription, and iOS resume sync
  useEffect(() => {
    if (!getActiveCloudProvider()) return;
    syncFromCloud({ silent: true });

    const unsub = subscribeToFamilyRealtime(profile.familyCode, () => {
      syncFromCloud({ silent: true });
    });

    const handleFocus = () => syncFromCloud({ silent: true });
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud({ silent: true });
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsub();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [profile.familyCode, syncFromCloud]);

  // Handlers
  const handleUnlock = (rememberDevice) => {
    setUnlocked(true);
    setDevicePrefs((prev) => ({ ...prev, trustedDevice: rememberDevice }));
  };

  const handleLockApp = () => {
    setUnlocked(false);
    setDevicePrefs((prev) => ({ ...prev, trustedDevice: false }));
  };

  const handleSwitchChild = () => {
    if (childrenList.length < 2) return;
    const idx = childrenList.findIndex((c) => c.id === activeChild.id);
    const next = childrenList[(idx + 1) % childrenList.length];
    setDevicePrefs((prev) => ({ ...prev, activeChildId: next.id }));
    showToast(`Switched to ${next.name} (${next.age})`);
  };

  const handleSaveLog = async (newLog) => {
    setFamilyState((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs],
    }));
    setLogSheetData(null);
    showToast('Saved to shared family log');

    try {
      await pushLogToCloud(newLog, profile.familyCode);
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err?.message || 'Saved locally; cloud sync failed');
    }
  };

  const handleDeleteLog = async (logId) => {
    setFamilyState((prev) => ({
      ...prev,
      logs: prev.logs.filter((l) => l.id !== logId),
    }));
    showToast('Removed entry');
    try {
      await deleteLogFromCloud(logId, profile.familyCode);
    } catch {
      // keep local delete
    }
  };

  const handleToggleFav = async (strategyId) => {
    const currentlyFav = favorites.includes(strategyId);
    const nextFavs = currentlyFav
      ? favorites.filter((id) => id !== strategyId)
      : [...favorites, strategyId];

    setFamilyState((prev) => ({ ...prev, favorites: nextFavs }));
    try {
      await syncFavoriteToCloud(strategyId, !currentlyFav, profile.familyCode);
    } catch {
      // local state already updated
    }
  };

  const handleAddCustomScript = async (script) => {
    setFamilyState((prev) => ({
      ...prev,
      customScripts: [script, ...prev.customScripts],
    }));
    showToast('Saved custom script for both parents');
    try {
      await pushCustomScriptToCloud(script, profile.familyCode);
    } catch (err) {
      setSyncError(err?.message || 'Saved locally; cloud sync failed');
    }
  };

  const handleDeleteCustomScript = async (scriptId) => {
    setFamilyState((prev) => ({
      ...prev,
      customScripts: prev.customScripts.filter((s) => s.id !== scriptId),
    }));
    showToast('Deleted custom script');
    try {
      await deleteCustomScriptFromCloud(scriptId, profile.familyCode);
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = async (nextProfile) => {
    setFamilyState((prev) => ({ ...prev, profile: nextProfile }));
    showToast('Family settings saved');
    try {
      const pushed = await pushProfileToCloud(nextProfile);
      if (pushed) {
        setSyncStatus('synced');
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err?.message || 'Saved locally; could not sync profile');
    }
  };

  const handleLoadSampleData = async () => {
    const samples = createSampleLogs(profile.parent1Name, profile.parent2Name);
    setFamilyState((prev) => ({
      ...prev,
      logs: [...samples, ...prev.logs],
    }));
    showToast('Added 6 sample moments to preview Insights');
  };

  const handleClearAllLogs = () => {
    setFamilyState((prev) => ({ ...prev, logs: [] }));
    showToast('Cleared local log history');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(familyState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sturdy-family-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON backup');
  };

  const handleImportJson = (parsed) => {
    if (!parsed || typeof parsed !== 'object') return;
    setFamilyState((prev) => ({
      profile: { ...prev.profile, ...(parsed.profile || {}) },
      logs: Array.isArray(parsed.logs) ? parsed.logs : prev.logs,
      customScripts: Array.isArray(parsed.customScripts)
        ? parsed.customScripts
        : prev.customScripts,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : prev.favorites,
    }));
    showToast('Restored family backup');
  };

  // PIN Lock Gate
  if (!unlocked) {
    return (
      <PinGate
        profile={profile}
        activeParentSlot={devicePrefs.activeParentSlot}
        onSelectParentSlot={(slot) =>
          setDevicePrefs((prev) => ({ ...prev, activeParentSlot: slot }))
        }
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        {/* Sticky Header */}
        <header className="app-header">
          <div className="brand-lockup">
            <img src="./icon.svg" alt="Sturdy" className="brand-mark" />
            <div>
              <div className="brand-title">Sturdy</div>
              <div className="brand-sub">
                <span
                  className={`sync-dot ${
                    syncStatus === 'synced'
                      ? 'synced'
                      : syncStatus === 'syncing'
                        ? 'syncing'
                        : 'local'
                  }`}
                />
                {childrenList.length > 1 ? (
                  <button
                    type="button"
                    id="header-child-switcher"
                    onClick={handleSwitchChild}
                    title="Tap to switch child"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'inherit',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textUnderlineOffset: 2,
                    }}
                  >
                    {activeChild.name} ({activeChild.age})
                  </button>
                ) : (
                  <span>
                    {activeChild.name} ({activeChild.age})
                  </span>
                )}
                <span>
                  ·{' '}
                  {syncStatus === 'synced'
                    ? 'Synced'
                    : syncStatus === 'syncing'
                      ? 'Syncing…'
                      : 'Local'}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div
              id="header-parent-badge"
              className="parent-switcher"
              style={{ cursor: 'default' }}
              aria-label={`Signed in as ${activeParentName}`}
            >
              <span className="parent-avatar">
                {(activeParentName || 'P').slice(0, 1).toUpperCase()}
              </span>
              <span>{activeParentName}</span>
            </div>
          </div>
        </header>

        {/* Toast Feedback */}
        {toast && (
          <div className="toast-banner" role="status" aria-live="polite">
            <CheckCircle2 size={15} />
            {toast}
          </div>
        )}

        {/* Active View */}
        <main className="app-main">
          {activeTab === 'sos' && (
            <SosView
              profile={activeChildProfile}
              allStrategies={allStrategies}
              logs={activeChildLogs}
              favorites={favorites}
              onToggleFav={handleToggleFav}
              onOpenLogSheet={(data) =>
                setLogSheetData({ ...data, childId: activeChild.id })
              }
              onDeleteCustomScript={handleDeleteCustomScript}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              profile={activeChildProfile}
              activeParentName={activeParentName}
              allStrategies={allStrategies}
              logs={activeChildLogs}
              favorites={favorites}
              onToggleFav={handleToggleFav}
              onOpenLogSheet={(data) =>
                setLogSheetData({ ...data, childId: activeChild.id })
              }
              onAddCustomScript={handleAddCustomScript}
              onDeleteCustomScript={handleDeleteCustomScript}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              profile={profile}
              childrenList={childrenList}
              activeChild={activeChild}
              logs={logs}
              onOpenLogSheet={(data) => setLogSheetData(data)}
              onDeleteLog={handleDeleteLog}
              onLoadSampleData={handleLoadSampleData}
            />
          )}

          {activeTab === 'family' && (
            <FamilyView
              profile={profile}
              syncStatus={syncStatus}
              syncError={syncError}
              logsCount={logs.length}
              onSaveProfile={handleSaveProfile}
              onLockApp={handleLockApp}
              onManualSync={() => syncFromCloud({ silent: false })}
              onConnectSheets={() => syncFromCloud({ silent: false, pushLocalFirst: true })}
              onExportJson={handleExportJson}
              onImportJson={handleImportJson}
              onLoadSampleData={handleLoadSampleData}
              onClearAllLogs={handleClearAllLogs}
            />
          )}
        </main>

        {/* Sticky Bottom Navigation */}
        <nav className="bottom-nav" aria-label="Main navigation">
          <button
            type="button"
            id="nav-sos"
            className={`nav-item sos-tab ${activeTab === 'sos' ? 'active' : ''}`}
            onClick={() => setActiveTab('sos')}
          >
            <HeartHandshake size={21} />
            <span>SOS</span>
          </button>
          <button
            type="button"
            id="nav-library"
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <BookOpen size={21} />
            <span>Scripts</span>
          </button>
          <button
            type="button"
            id="nav-insights"
            className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <BarChart3 size={21} />
            <span>Insights</span>
          </button>
          <button
            type="button"
            id="nav-family"
            className={`nav-item ${activeTab === 'family' ? 'active' : ''}`}
            onClick={() => setActiveTab('family')}
          >
            <Users size={21} />
            <span>Family</span>
          </button>
        </nav>

        {/* Quick Log Bottom Sheet */}
        {logSheetData && (
          <QuickLogSheet
            initialData={logSheetData}
            allStrategies={allStrategies}
            profile={profile}
            childrenList={childrenList}
            activeChild={activeChild}
            activeParentName={activeParentName}
            onSave={handleSaveLog}
            onClose={() => setLogSheetData(null)}
          />
        )}
      </div>
    </div>
  );
}
