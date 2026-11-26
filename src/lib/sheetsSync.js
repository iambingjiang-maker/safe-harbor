const RUNTIME_SHEETS_KEY = 'sturdy_sheets_webapp_url_v1';

export const FAMILY_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1muskxFgMmqYRWx85OnRsV34spQ98_jzEVXkBsiJUwSE/edit';

// Optional baked-in Web App URL (set via Vite env or once deployed in Apps Script)
export const DEFAULT_SHEETS_WEBAPP_URL =
  (import.meta.env.VITE_SHEETS_WEBAPP_URL || '').trim();

export function getEnvSheetsConfig() {
  const url = DEFAULT_SHEETS_WEBAPP_URL;
  return { url, source: url ? 'env' : null };
}

export function getRuntimeSheetsConfig() {
  try {
    const url = (localStorage.getItem(RUNTIME_SHEETS_KEY) || '').trim();
    return { url, source: url ? 'manual' : null };
  } catch {
    return { url: '', source: null };
  }
}

export function saveRuntimeSheetsConfig(url) {
  const clean = (url || '').trim();
  if (!clean) {
    localStorage.removeItem(RUNTIME_SHEETS_KEY);
  } else {
    localStorage.setItem(RUNTIME_SHEETS_KEY, clean);
  }
}

export function getActiveSheetsConfig() {
  const runtime = getRuntimeSheetsConfig();
  if (runtime.url) return runtime;
  return getEnvSheetsConfig();
}

export async function sheetsGet() {
  const { url } = getActiveSheetsConfig();
  if (!url) return null;
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}action=pull&_t=${Date.now()}`, {
    method: 'GET',
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Google Sheet sync returned HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data || data.ok === false) {
    throw new Error(data?.error || 'Could not read Google Sheet');
  }
  return data;
}

export async function sheetsPost(payload) {
  const { url } = getActiveSheetsConfig();
  if (!url) return null;
  // Use text/plain so browsers treat this as a simple CORS request (no OPTIONS preflight)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Google Sheet save returned HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data || data.ok === false) {
    throw new Error(data?.error || 'Could not write to Google Sheet');
  }
  return data;
}
