import { createClient } from '@supabase/supabase-js';

const RUNTIME_CONFIG_KEY = 'sturdy_supabase_runtime_v1';

export function getEnvSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
  return { url, anonKey, source: url && anonKey ? 'env' : null };
}

export function getRuntimeSupabaseConfig() {
  try {
    const raw = localStorage.getItem(RUNTIME_CONFIG_KEY);
    if (!raw) return { url: '', anonKey: '', source: null };
    const parsed = JSON.parse(raw);
    const url = (parsed.url || '').trim();
    const anonKey = (parsed.anonKey || '').trim();
    return { url, anonKey, source: url && anonKey ? 'manual' : null };
  } catch {
    return { url: '', anonKey: '', source: null };
  }
}

export function saveRuntimeSupabaseConfig(url, anonKey) {
  const cleanUrl = (url || '').trim();
  const cleanKey = (anonKey || '').trim();
  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem(RUNTIME_CONFIG_KEY);
  } else {
    localStorage.setItem(
      RUNTIME_CONFIG_KEY,
      JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
    );
  }
  cachedClient = null;
  cachedSig = '';
}

export function getActiveSupabaseConfig() {
  const env = getEnvSupabaseConfig();
  if (env.url && env.anonKey) return env;
  return getRuntimeSupabaseConfig();
}

let cachedClient = null;
let cachedSig = '';

export function getSupabaseClient() {
  const { url, anonKey } = getActiveSupabaseConfig();
  if (!url || !anonKey) return null;
  const sig = `${url}|${anonKey}`;
  if (cachedClient && cachedSig === sig) return cachedClient;

  cachedClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 4 } },
  });
  cachedSig = sig;
  return cachedClient;
}
