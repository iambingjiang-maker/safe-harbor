import { getActiveSupabaseConfig, getSupabaseClient } from './supabase';
import { getActiveSheetsConfig, sheetsGet, sheetsPost } from './sheetsSync';

const LOCAL_STATE_KEY = 'sturdy_family_state_v1';
const DEVICE_PREFS_KEY = 'sturdy_device_prefs_v1';

export const DEFAULT_PROFILE = {
  familyCode: 'our-family',
  pin: '0901',
  parent1Pin: '0527',
  parent2Pin: '0901',
  parent1Name: 'Mom',
  parent2Name: 'Dad',
  childName: 'Liam',
  childAge: 4,
};

export function getActiveCloudProvider() {
  if (getActiveSheetsConfig().source) return 'sheets';
  if (getActiveSupabaseConfig().source) return 'supabase';
  return null;
}

export function loadLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY);
    if (!raw) {
      return {
        profile: { ...DEFAULT_PROFILE },
        logs: [],
        customScripts: [],
        favorites: ['calm-body-fewest-words', 'true-boundary-what-i-will-do', 'two-things-are-true'],
      };
    }
    const parsed = JSON.parse(raw);
    const savedProfile = parsed.profile || {};
    const migratedChildName =
      !savedProfile.childName || savedProfile.childName === 'Buddy'
        ? DEFAULT_PROFILE.childName
        : savedProfile.childName;
    const rawP2Pin = savedProfile.parent2Pin || savedProfile.pin;
    const migratedP2Pin = !rawP2Pin || rawP2Pin === '1234' ? DEFAULT_PROFILE.parent2Pin : rawP2Pin;
    return {
      profile: {
        ...DEFAULT_PROFILE,
        ...savedProfile,
        childName: migratedChildName,
        parent1Pin: savedProfile.parent1Pin || DEFAULT_PROFILE.parent1Pin,
        parent2Pin: migratedP2Pin,
        pin: migratedP2Pin,
      },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      customScripts: Array.isArray(parsed.customScripts) ? parsed.customScripts : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    return {
      profile: { ...DEFAULT_PROFILE },
      logs: [],
      customScripts: [],
      favorites: [],
    };
  }
}

export function saveLocalState(state) {
  try {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

export function loadDevicePrefs() {
  try {
    const raw = localStorage.getItem(DEVICE_PREFS_KEY);
    if (!raw) {
      return {
        activeParentSlot: 'parent1',
        trustedDevice: false,
        pinDismissedBanner: false,
      };
    }
    return {
      activeParentSlot: 'parent1',
      trustedDevice: false,
      pinDismissedBanner: false,
      ...JSON.parse(raw),
    };
  } catch {
    return {
      activeParentSlot: 'parent1',
      trustedDevice: false,
      pinDismissedBanner: false,
    };
  }
}

export function saveDevicePrefs(prefs) {
  try {
    localStorage.setItem(DEVICE_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// ── Row mappers between camelCase UI state and snake_case Supabase ──

function mapLogFromDb(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    parentName: row.parent_name,
    triggerId: row.trigger_id,
    strategyId: row.strategy_id,
    strategyTitle: row.strategy_title,
    outcome: row.outcome,
    wasTired: Boolean(row.was_tired),
    wasFlooded: Boolean(row.was_flooded),
    contextTags: Array.isArray(row.context_tags) ? row.context_tags : [],
    notes: row.notes || '',
  };
}

function mapLogToDb(log, familyCode) {
  return {
    id: log.id,
    family_code: familyCode,
    created_at: log.createdAt,
    parent_name: log.parentName,
    trigger_id: log.triggerId,
    strategy_id: log.strategyId,
    strategy_title: log.strategyTitle,
    outcome: log.outcome,
    was_tired: Boolean(log.wasTired),
    was_flooded: Boolean(log.wasFlooded),
    context_tags: Array.isArray(log.contextTags) ? log.contextTags : [],
    notes: log.notes || '',
  };
}

function mapScriptFromDb(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    triggerId: row.trigger_id,
    triggers: [row.trigger_id],
    title: row.title,
    principle: 'Our Family Script',
    worksWhenTired: true,
    lowWords: Boolean(row.script_flooded),
    mgi: `Saved by ${row.created_by} for what works in our home.`,
    scriptFlooded: row.script_flooded || row.script_standard,
    scriptStandard: row.script_standard,
    bodyAction: row.body_action || '',
    avoid: row.avoid_tip ? [row.avoid_tip] : [],
    isCustom: true,
  };
}

function mapScriptToDb(script, familyCode) {
  return {
    id: script.id,
    family_code: familyCode,
    created_at: script.createdAt,
    created_by: script.createdBy,
    trigger_id: script.triggerId,
    title: script.title,
    script_flooded: script.scriptFlooded || '',
    script_standard: script.scriptStandard,
    body_action: script.bodyAction || '',
    avoid_tip: Array.isArray(script.avoid) ? script.avoid[0] || '' : script.avoidTip || '',
  };
}

// ── Cloud sync helpers (Google Sheets primary, Supabase optional fallback) ──

export async function pullFamilyFromCloud(familyCode, fallbackProfile) {
  const provider = getActiveCloudProvider();
  if (!provider) return { connected: false, provider: null };

  if (provider === 'sheets') {
    const data = await sheetsGet();
    return {
      connected: true,
      provider: 'sheets',
      profile: {
        ...DEFAULT_PROFILE,
        ...(fallbackProfile || {}),
        ...(data.profile || {}),
      },
      logs: Array.isArray(data.logs) ? data.logs : [],
      customScripts: Array.isArray(data.customScripts) ? data.customScripts : [],
      favorites: Array.isArray(data.favorites) ? data.favorites : [],
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { connected: false, provider: null };

  const code = (familyCode || 'our-family').trim().toLowerCase();

  // Fetch or bootstrap family row
  let { data: familyRow, error: famErr } = await supabase
    .from('families')
    .select('*')
    .eq('family_code', code)
    .maybeSingle();

  if (famErr) throw famErr;

  if (!familyRow) {
    const insertPayload = {
      family_code: code,
      pin: fallbackProfile.parent2Pin || fallbackProfile.pin || '0901',
      parent1_pin: fallbackProfile.parent1Pin || '0527',
      parent2_pin: fallbackProfile.parent2Pin || fallbackProfile.pin || '0901',
      parent1_name: fallbackProfile.parent1Name || 'Mom',
      parent2_name: fallbackProfile.parent2Name || 'Dad',
      child_name: fallbackProfile.childName || 'Liam',
      child_age: fallbackProfile.childAge || 4,
    };
    const { data: created, error: createErr } = await supabase
      .from('families')
      .upsert(insertPayload)
      .select()
      .single();
    if (createErr) throw createErr;
    familyRow = created;
  }

  const [logsRes, scriptsRes, favsRes] = await Promise.all([
    supabase
      .from('moment_logs')
      .select('*')
      .eq('family_code', code)
      .order('created_at', { ascending: false })
      .limit(250),
    supabase
      .from('custom_scripts')
      .select('*')
      .eq('family_code', code)
      .order('created_at', { ascending: false }),
    supabase
      .from('strategy_favorites')
      .select('strategy_id')
      .eq('family_code', code),
  ]);

  if (logsRes.error) throw logsRes.error;
  if (scriptsRes.error) throw scriptsRes.error;
  if (favsRes.error) throw favsRes.error;

  return {
    connected: true,
    provider: 'supabase',
    profile: {
      familyCode: familyRow.family_code,
      pin: familyRow.pin || familyRow.parent2_pin || '0901',
      parent1Pin: familyRow.parent1_pin || fallbackProfile.parent1Pin || '0527',
      parent2Pin: familyRow.parent2_pin || familyRow.pin || fallbackProfile.parent2Pin || '0901',
      parent1Name: familyRow.parent1_name,
      parent2Name: familyRow.parent2_name,
      childName: familyRow.child_name,
      childAge: familyRow.child_age,
    },
    logs: (logsRes.data || []).map(mapLogFromDb),
    customScripts: (scriptsRes.data || []).map(mapScriptFromDb),
    favorites: (favsRes.data || []).map((f) => f.strategy_id),
  };
}

export async function pushBulkToCloud(localState) {
  if (getActiveCloudProvider() !== 'sheets') return null;
  const data = await sheetsPost({
    action: 'pushBulk',
    logs: localState.logs || [],
    customScripts: localState.customScripts || [],
    favorites: localState.favorites || [],
  });
  return {
    connected: true,
    provider: 'sheets',
    profile: {
      ...DEFAULT_PROFILE,
      ...(localState.profile || {}),
      ...(data.profile || {}),
    },
    logs: Array.isArray(data.logs) ? data.logs : [],
    customScripts: Array.isArray(data.customScripts) ? data.customScripts : [],
    favorites: Array.isArray(data.favorites) ? data.favorites : [],
  };
}

export async function pushProfileToCloud(profile) {
  const provider = getActiveCloudProvider();
  if (!provider) return false;
  if (provider === 'sheets') {
    await sheetsPost({ action: 'pushProfile', profile });
    return true;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const code = (profile.familyCode || 'our-family').trim().toLowerCase();
  const { error } = await supabase.from('families').upsert({
    family_code: code,
    pin: profile.parent2Pin || profile.pin || '0901',
    parent1_pin: profile.parent1Pin || '0527',
    parent2_pin: profile.parent2Pin || profile.pin || '0901',
    parent1_name: profile.parent1Name,
    parent2_name: profile.parent2Name,
    child_name: profile.childName,
    child_age: Number(profile.childAge) || 4,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return true;
}

export async function pushLogToCloud(log, familyCode) {
  const provider = getActiveCloudProvider();
  if (!provider) return false;
  if (provider === 'sheets') {
    await sheetsPost({ action: 'pushLog', log });
    return true;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const code = (familyCode || 'our-family').trim().toLowerCase();
  const { error } = await supabase.from('moment_logs').upsert(mapLogToDb(log, code));
  if (error) throw error;
  return true;
}

export async function deleteLogFromCloud(logId, familyCode) {
  const provider = getActiveCloudProvider();
  if (!provider) return false;
  if (provider === 'sheets') {
    await sheetsPost({ action: 'deleteLog', logId });
    return true;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const code = (familyCode || 'our-family').trim().toLowerCase();
  const { error } = await supabase
    .from('moment_logs')
    .delete()
    .eq('id', logId)
    .eq('family_code', code);
  if (error) throw error;
  return true;
}

export async function pushCustomScriptToCloud(script, familyCode) {
  const provider = getActiveCloudProvider();
  if (!provider) return false;
  if (provider === 'sheets') {
    await sheetsPost({ action: 'pushScript', script });
    return true;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const code = (familyCode || 'our-family').trim().toLowerCase();
  const { error } = await supabase
    .from('custom_scripts')
    .upsert(mapScriptToDb(script, code));
  if (error) throw error;
  return true;
}

export async function deleteCustomScriptFromCloud(scriptId, familyCode) {
  const provider = getActiveCloudProvider();
  if (!provider) return false;
  if (provider === 'sheets') {
    await sheetsPost({ action: 'deleteScript', scriptId });
    return true;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const code = (familyCode || 'our-family').trim().toLowerCase();
  const { error } = await supabase
    .from('custom_scripts')
    .delete()
    .eq('id', scriptId)
    .eq('family_code', code);
  if (error) throw error;
  return true;
}

export async function syncFavoriteToCloud(strategyId, isFav, familyCode) {
  const provider = getActiveCloudProvider();
  if (!provider) return false;
  if (provider === 'sheets') {
    await sheetsPost({ action: 'syncFavorite', strategyId, isFav });
    return true;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const code = (familyCode || 'our-family').trim().toLowerCase();
  if (isFav) {
    const { error } = await supabase
      .from('strategy_favorites')
      .upsert({ family_code: code, strategy_id: strategyId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('strategy_favorites')
      .delete()
      .eq('family_code', code)
      .eq('strategy_id', strategyId);
    if (error) throw error;
  }
  return true;
}

export function subscribeToFamilyRealtime(familyCode, onChange) {
  const provider = getActiveCloudProvider();
  if (!provider) return () => {};

  if (provider === 'sheets') {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        onChange();
      }
    }, 30000);
    return () => clearInterval(interval);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return () => {};
  const code = (familyCode || 'our-family').trim().toLowerCase();

  const channel = supabase
    .channel(`family-sync-${code}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'moment_logs', filter: `family_code=eq.${code}` },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'custom_scripts', filter: `family_code=eq.${code}` },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'families', filter: `family_code=eq.${code}` },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'strategy_favorites', filter: `family_code=eq.${code}` },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
