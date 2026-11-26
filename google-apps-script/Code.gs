/**
 * Sturdy — Good Inside Family Companion
 * Google Sheets Cloud Sync Backend (Google Apps Script)
 * Supports both boys (Liam & Arlo) with per-child logging & insights.
 *
 * SETUP (one-time, ~2 minutes):
 * 1. Open your "Sturdy Data" Google Sheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any placeholder code in Code.gs and paste this entire file.
 * 4. Click Deploy -> New deployment -> Type: Web app
 *    - Description: Sturdy Sync
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, authorize when prompted, and copy the Web App URL (ends in /exec).
 */

const SHEET_ID = '1muskxFgMmqYRWx85OnRsV34spQ98_jzEVXkBsiJUwSE';

const TABS = {
  moments: {
    name: 'Moments',
    headers: [
      'id',
      'created_at',
      'parent_name',
      'trigger_id',
      'strategy_id',
      'strategy_title',
      'outcome',
      'was_tired',
      'was_flooded',
      'context_tags',
      'notes',
      'child_id',
      'child_name',
    ],
  },
  scripts: {
    name: 'CustomScripts',
    headers: [
      'id',
      'created_at',
      'created_by',
      'trigger_id',
      'title',
      'script_flooded',
      'script_standard',
      'body_action',
      'avoid_tip',
      'child_id',
    ],
  },
  favorites: {
    name: 'Favorites',
    headers: ['strategy_id', 'updated_at'],
  },
  profile: {
    name: 'Profile',
    headers: ['key', 'value'],
  },
};

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SHEET_ID);
}

function getOrCreateSheet_(spec) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(spec.name);
  if (!sheet) {
    sheet = ss.insertSheet(spec.name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, spec.headers.length).setValues([spec.headers]);
  }
  return sheet;
}

function jsonOut_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function formatPin_(val, fallback) {
  if (val === null || val === undefined || val === '') return fallback;
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return fallback;
  return digits.length < 4 ? digits.padStart(4, '0') : digits.slice(0, 4);
}

function toBool_(val) {
  if (typeof val === 'boolean') return val;
  return String(val).toLowerCase() === 'true';
}

function readAllData_() {
  // 1. Profile
  const profileSheet = getOrCreateSheet_(TABS.profile);
  const profileRows = profileSheet.getDataRange().getValues();
  const profileMap = {};
  for (let i = 1; i < profileRows.length; i++) {
    const k = String(profileRows[i][0] || '').trim();
    if (k) profileMap[k] = profileRows[i][1];
  }
  const profile = {
    familyCode: String(profileMap.familyCode || 'our-family').trim(),
    parent1Name: String(profileMap.parent1Name || 'Mom').trim(),
    parent2Name: String(profileMap.parent2Name || 'Dad').trim(),
    parent1Pin: formatPin_(profileMap.parent1Pin, '0527'),
    parent2Pin: formatPin_(profileMap.parent2Pin, '0901'),
    pin: formatPin_(profileMap.parent2Pin, '0901'),
    childName: String(profileMap.childName || 'Liam').trim(),
    childAge: String(profileMap.childAge || '4').trim(),
    child2Name: String(profileMap.child2Name || 'Arlo').trim(),
    child2Age: String(profileMap.child2Age || '1y 3m').trim(),
  };

  // 2. Moments
  const momentsSheet = getOrCreateSheet_(TABS.moments);
  const momentRows = momentsSheet.getDataRange().getValues();
  const logs = [];
  for (let i = 1; i < momentRows.length; i++) {
    const r = momentRows[i];
    if (!r[0]) continue;
    let tags = [];
    if (r[9]) {
      try {
        const parsed = JSON.parse(String(r[9]));
        tags = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        tags = String(r[9])
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    const childId = String(r[11] || 'child1').trim() || 'child1';
    const fallbackChildName = childId === 'child2' ? profile.child2Name : profile.childName;
    logs.push({
      id: String(r[0]),
      createdAt: r[1] instanceof Date ? r[1].toISOString() : String(r[1] || ''),
      parentName: String(r[2] || 'Mom'),
      triggerId: String(r[3] || 'boundaries'),
      strategyId: String(r[4] || ''),
      strategyTitle: String(r[5] || ''),
      outcome: String(r[6] || 'helped'),
      wasTired: toBool_(r[7]),
      wasFlooded: toBool_(r[8]),
      contextTags: tags,
      notes: String(r[10] || ''),
      childId: childId,
      childName: String(r[12] || fallbackChildName).trim(),
    });
  }
  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 3. CustomScripts
  const scriptsSheet = getOrCreateSheet_(TABS.scripts);
  const scriptRows = scriptsSheet.getDataRange().getValues();
  const customScripts = [];
  for (let i = 1; i < scriptRows.length; i++) {
    const r = scriptRows[i];
    if (!r[0]) continue;
    const triggerId = String(r[3] || 'boundaries');
    const createdBy = String(r[2] || 'Mom');
    const scriptFlooded = String(r[5] || '');
    const scriptStandard = String(r[6] || '');
    const avoidTip = String(r[8] || '');
    customScripts.push({
      id: String(r[0]),
      createdAt: r[1] instanceof Date ? r[1].toISOString() : String(r[1] || ''),
      createdBy: createdBy,
      triggerId: triggerId,
      triggers: [triggerId],
      title: String(r[4] || ''),
      principle: 'Our Family Script',
      worksWhenTired: true,
      lowWords: Boolean(scriptFlooded),
      mgi: 'Saved by ' + createdBy + ' for what works in our home.',
      scriptFlooded: scriptFlooded || scriptStandard,
      scriptStandard: scriptStandard,
      bodyAction: String(r[7] || ''),
      avoid: avoidTip ? [avoidTip] : [],
      childId: String(r[9] || 'all').trim() || 'all',
      isCustom: true,
    });
  }
  customScripts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 4. Favorites
  const favSheet = getOrCreateSheet_(TABS.favorites);
  const favRows = favSheet.getDataRange().getValues();
  const favorites = [];
  for (let i = 1; i < favRows.length; i++) {
    const id = String(favRows[i][0] || '').trim();
    if (id && favorites.indexOf(id) === -1) favorites.push(id);
  }

  return { ok: true, profile: profile, logs: logs, customScripts: customScripts, favorites: favorites };
}

function upsertRowById_(sheet, id, rowValues) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return;
    }
  }
  sheet.appendRow(rowValues);
}

function deleteRowById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function saveProfile_(profile) {
  const sheet = getOrCreateSheet_(TABS.profile);
  const entries = [
    ['familyCode', String(profile.familyCode || 'our-family').trim()],
    ['parent1Name', String(profile.parent1Name || 'Mom').trim()],
    ['parent2Name', String(profile.parent2Name || 'Dad').trim()],
    ['parent1Pin', "'" + formatPin_(profile.parent1Pin, '0527')],
    ['parent2Pin', "'" + formatPin_(profile.parent2Pin || profile.pin, '0901')],
    ['childName', String(profile.childName || 'Liam').trim()],
    ['childAge', String(profile.childAge || '4').trim()],
    ['child2Name', String(profile.child2Name || 'Arlo').trim()],
    ['child2Age', String(profile.child2Age || '1y 3m').trim()],
  ];
  for (let i = 0; i < entries.length; i++) {
    upsertRowById_(sheet, entries[i][0], entries[i]);
  }
}

function saveLog_(log) {
  const sheet = getOrCreateSheet_(TABS.moments);
  const row = [
    String(log.id),
    String(log.createdAt || new Date().toISOString()),
    String(log.parentName || 'Mom'),
    String(log.triggerId || 'boundaries'),
    String(log.strategyId || ''),
    String(log.strategyTitle || ''),
    String(log.outcome || 'helped'),
    Boolean(log.wasTired),
    Boolean(log.wasFlooded),
    JSON.stringify(Array.isArray(log.contextTags) ? log.contextTags : []),
    String(log.notes || ''),
    String(log.childId || 'child1'),
    String(log.childName || 'Liam'),
  ];
  upsertRowById_(sheet, log.id, row);
}

function saveScript_(script) {
  const sheet = getOrCreateSheet_(TABS.scripts);
  const avoidTip = Array.isArray(script.avoid)
    ? script.avoid[0] || ''
    : String(script.avoidTip || '');
  const row = [
    String(script.id),
    String(script.createdAt || new Date().toISOString()),
    String(script.createdBy || 'Mom'),
    String(script.triggerId || 'boundaries'),
    String(script.title || ''),
    String(script.scriptFlooded || ''),
    String(script.scriptStandard || ''),
    String(script.bodyAction || ''),
    String(avoidTip),
    String(script.childId || 'all'),
  ];
  upsertRowById_(sheet, script.id, row);
}

function syncFavorite_(strategyId, isFav) {
  const sheet = getOrCreateSheet_(TABS.favorites);
  if (isFav) {
    upsertRowById_(sheet, strategyId, [String(strategyId), new Date().toISOString()]);
  } else {
    deleteRowById_(sheet, strategyId);
  }
}

function doGet(e) {
  try {
    return jsonOut_(readAllData_());
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;

    if (action === 'pushLog' && body.log) {
      saveLog_(body.log);
      return jsonOut_({ ok: true });
    }
    if (action === 'deleteLog' && body.logId) {
      deleteRowById_(getOrCreateSheet_(TABS.moments), body.logId);
      return jsonOut_({ ok: true });
    }
    if (action === 'pushScript' && body.script) {
      saveScript_(body.script);
      return jsonOut_({ ok: true });
    }
    if (action === 'deleteScript' && body.scriptId) {
      deleteRowById_(getOrCreateSheet_(TABS.scripts), body.scriptId);
      return jsonOut_({ ok: true });
    }
    if (action === 'syncFavorite' && body.strategyId) {
      syncFavorite_(body.strategyId, Boolean(body.isFav));
      return jsonOut_({ ok: true });
    }
    if (action === 'pushProfile' && body.profile) {
      saveProfile_(body.profile);
      return jsonOut_({ ok: true });
    }
    if (action === 'pushBulk') {
      if (Array.isArray(body.logs)) {
        body.logs.forEach(function (l) {
          if (l && l.id) saveLog_(l);
        });
      }
      if (Array.isArray(body.customScripts)) {
        body.customScripts.forEach(function (s) {
          if (s && s.id) saveScript_(s);
        });
      }
      if (Array.isArray(body.favorites)) {
        body.favorites.forEach(function (id) {
          if (id) syncFavorite_(id, true);
        });
      }
      return jsonOut_(readAllData_());
    }

    return jsonOut_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}
