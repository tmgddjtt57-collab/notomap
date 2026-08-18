/**
 * ESSプラシフト - スプレッドシートの読み書き
 *
 * ここから下は Google のサービスに依存する。ロジックは 00〜11 側に置き、
 * このファイルはデータの出し入れに徹する。
 */

var SHEET = {
  ROSTER: '名簿',
  SHIFT: 'シフト',
  DETAIL: 'シフト明細',
  WARNING: '警告',
  CONFIG: '設定',
  HISTORY: '担当履歴'
};

var ROSTER_HEADER = [
  'memberId', '氏名', '性別', '経験者・役職者', '参加可能コマ', '備考', '過去担当回数', '回答日時'
];

var DETAIL_HEADER = ['学期ID', 'puraId', '種別', 'コマ', 'memberId', '氏名'];

var WARNING_HEADER = ['重大度', 'コード', '内容'];

var HISTORY_HEADER = ['学期ID', 'memberId', '氏名', '加算回数', '記録日時'];

var CONFIG_HEADER = ['項目', '値', '説明'];

var STATUS = {
  DRAFT: '仮',
  CONFIRMED: '確定'
};

var CONFIG_KEYS = {
  SEMESTER_ID: '現在の学期ID',
  SEMESTER_LABEL: '学期名',
  STATUS: '状態',
  CONFIRMED_AT: '確定日時',
  FORM_URL: 'フォームURL',
  MIN_SIZE: '最小人数',
  MAX_SIZE: '最大人数',
  TARGET_SIZE: '目標人数',
  W_SIZE: '重み_人数',
  W_VETERAN: '重み_経験者',
  W_GENDER: '重み_男女比',
  W_ACTIVITY: '重み_活動数',
  W_FAIRNESS: '重み_公平性',
  ITERATIONS: '反復回数',
  RESTARTS: '再試行回数',
  SEED: '乱数シード'
};

var CONFIG_DEFAULTS = [
  [CONFIG_KEYS.SEMESTER_ID, '', '例: 2026-fall'],
  [CONFIG_KEYS.SEMESTER_LABEL, '', '例: 2026年度後期'],
  [CONFIG_KEYS.STATUS, '', STATUS.DRAFT + ' / ' + STATUS.CONFIRMED],
  [CONFIG_KEYS.CONFIRMED_AT, '', '確定した日時（自動）'],
  [CONFIG_KEYS.FORM_URL, '', 'フォーム作成時に自動で入る'],
  [CONFIG_KEYS.MIN_SIZE, DEFAULT_CONFIG.minSize, '1プラの下限人数'],
  [CONFIG_KEYS.MAX_SIZE, DEFAULT_CONFIG.maxSize, '1プラの上限人数'],
  [CONFIG_KEYS.TARGET_SIZE, DEFAULT_CONFIG.targetSize, 'プラ数の見積もりに使う1プラあたりの人数'],
  [CONFIG_KEYS.W_SIZE, DEFAULT_CONFIG.weights.size, '人数逸脱の重み'],
  [CONFIG_KEYS.W_VETERAN, DEFAULT_CONFIG.weights.veteran, '経験者不足の重み'],
  [CONFIG_KEYS.W_GENDER, DEFAULT_CONFIG.weights.gender, '男女比の偏りの重み'],
  [CONFIG_KEYS.W_ACTIVITY, DEFAULT_CONFIG.weights.activity, '2活動に入れない人数の重み'],
  [CONFIG_KEYS.W_FAIRNESS, DEFAULT_CONFIG.weights.fairness, '担当回数の偏りの重み'],
  [CONFIG_KEYS.ITERATIONS, DEFAULT_CONFIG.iterations, '局所探索の反復回数。実行時間が6分を超えるなら減らす'],
  [CONFIG_KEYS.RESTARTS, DEFAULT_CONFIG.restarts, '初期解を変えて試す回数'],
  [CONFIG_KEYS.SEED, DEFAULT_CONFIG.seed, '乱数シード。同じ値なら同じ編成になる']
];

function getSs_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(name, header) {
  var ss = getSs_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (header && header.length) {
    var current = sheet.getRange(1, 1, 1, header.length).getValues()[0];
    var mismatch = false;
    for (var i = 0; i < header.length; i++) {
      if (String(current[i]) !== header[i]) mismatch = true;
    }
    if (mismatch) {
      sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function clearBelowHeader_(sheet) {
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, sheet.getMaxColumns()).clearContent();
}

// ---------------------------------------------------------------- 設定

function ensureConfigSheet_() {
  var sheet = getOrCreateSheet_(SHEET.CONFIG, CONFIG_HEADER);
  if (sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, CONFIG_DEFAULTS.length, 3).setValues(CONFIG_DEFAULTS);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(3, 380);
  }
  return sheet;
}

function readSettings() {
  var sheet = ensureConfigSheet_();
  var last = sheet.getLastRow();
  var settings = {};
  if (last < 2) return settings;
  var values = sheet.getRange(2, 1, last - 1, 2).getValues();
  for (var i = 0; i < values.length; i++) {
    var key = String(values[i][0]).trim();
    if (key) settings[key] = values[i][1];
  }
  return settings;
}

function getSetting_(key) {
  var settings = readSettings();
  return settings[key];
}

function setSetting_(key, value) {
  var sheet = ensureConfigSheet_();
  var last = sheet.getLastRow();
  var values = last >= 2 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) {
      sheet.getRange(i + 2, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value, '']);
}

/** 設定シートの値を solve() / validateShift() が受け取る形へ組み替える */
function readConfigFromSettings() {
  var s = readSettings();
  return mergeConfig({
    minSize: s[CONFIG_KEYS.MIN_SIZE],
    maxSize: s[CONFIG_KEYS.MAX_SIZE],
    targetSize: s[CONFIG_KEYS.TARGET_SIZE],
    iterations: s[CONFIG_KEYS.ITERATIONS],
    restarts: s[CONFIG_KEYS.RESTARTS],
    seed: s[CONFIG_KEYS.SEED],
    weights: {
      size: s[CONFIG_KEYS.W_SIZE],
      veteran: s[CONFIG_KEYS.W_VETERAN],
      gender: s[CONFIG_KEYS.W_GENDER],
      activity: s[CONFIG_KEYS.W_ACTIVITY],
      fairness: s[CONFIG_KEYS.W_FAIRNESS]
    }
  });
}

// ---------------------------------------------------------------- 名簿

function readRoster() {
  var sheet = getOrCreateSheet_(SHEET.ROSTER, ROSTER_HEADER);
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var values = sheet.getRange(2, 1, last - 1, ROSTER_HEADER.length).getValues();
  var members = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var name = String(row[1] || '').trim();
    if (!name) continue;
    members.push({
      memberId: String(row[0] || '').trim() || 'M' + (i + 1),
      name: name,
      gender: genderFromLabel_(row[2]),
      isVeteran: row[3] === true || String(row[3]).trim() === 'はい',
      availableSlots: parseSlotList(row[4]),
      note: String(row[5] || ''),
      pastAssignmentCount: Number(row[6]) || 0,
      submittedAt: row[7] || null,
      rowIndex: i + 2
    });
  }
  return members;
}

function writeRoster(members) {
  var sheet = getOrCreateSheet_(SHEET.ROSTER, ROSTER_HEADER);
  clearBelowHeader_(sheet);
  if (!members.length) return;
  var rows = members.map(function (m) {
    return [
      m.memberId,
      m.name,
      genderToLabel_(m.gender),
      m.isVeteran ? 'はい' : 'いいえ',
      formatSlotList(m.availableSlots),
      m.note || '',
      Number(m.pastAssignmentCount) || 0,
      m.submittedAt || ''
    ];
  });
  sheet.getRange(2, 1, rows.length, ROSTER_HEADER.length).setValues(rows);
}

// ---------------------------------------------------------------- シフト明細

function writeShiftDetail(semesterId, puras, members) {
  var sheet = getOrCreateSheet_(SHEET.DETAIL, DETAIL_HEADER);
  clearBelowHeader_(sheet);
  var nameById = {};
  members.forEach(function (m) {
    nameById[m.memberId] = m.name;
  });

  var rows = [];
  puras.forEach(function (pura) {
    pura.memberIds.forEach(function (id) {
      rows.push([
        semesterId,
        pura.puraId,
        PURA_TYPE_LABEL[pura.type],
        slotLabel(pura.slotId),
        id,
        nameById[id] || id
      ]);
    });
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, DETAIL_HEADER.length).setValues(rows);
}

/** 明細シートから当該学期の配置数を memberId ごとに数える */
function countAssignmentsFromDetail(semesterId) {
  var sheet = getOrCreateSheet_(SHEET.DETAIL, DETAIL_HEADER);
  var last = sheet.getLastRow();
  var counts = {};
  if (last < 2) return counts;
  var values = sheet.getRange(2, 1, last - 1, DETAIL_HEADER.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) !== String(semesterId)) continue;
    var id = String(values[i][4]);
    if (!id) continue;
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------- シフト表示

/** 曜日 × 時限のマトリクスとして人が読める形に描く */
function renderShiftMatrix(puras, members, header) {
  var sheet = getOrCreateSheet_(SHEET.SHIFT, null);
  sheet.clear();

  var nameById = {};
  members.forEach(function (m) {
    nameById[m.memberId] = m.name;
  });

  sheet.getRange(1, 1).setValue(header).setFontWeight('bold').setFontSize(12);

  var top = 3;
  var titleRow = ['時限'].concat(DAYS.map(function (d) {
    return d + '曜';
  }));
  sheet.getRange(top, 1, 1, titleRow.length).setValues([titleRow]).setFontWeight('bold');

  var byCell = {};
  puras.forEach(function (pura) {
    var parsed = parseSlotId(pura.slotId);
    var key = parsed.dayIndex + ':' + parsed.period;
    var names = pura.memberIds.map(function (id) {
      return nameById[id] || id;
    });
    var text = PURA_TYPE_LABEL[pura.type] + '（' + names.length + '人）\n' + names.join('、');
    byCell[key] = byCell[key] ? byCell[key] + '\n\n' + text : text;
  });

  var body = [];
  for (var p = 0; p < PERIODS.length; p++) {
    var row = [PERIODS[p] + '限'];
    for (var d = 0; d < DAYS.length; d++) {
      row.push(byCell[d + ':' + PERIODS[p]] || '');
    }
    body.push(row);
  }
  sheet.getRange(top + 1, 1, body.length, titleRow.length).setValues(body).setVerticalAlignment('top').setWrap(true);
  sheet.setColumnWidth(1, 60);
  for (var c = 2; c <= titleRow.length; c++) sheet.setColumnWidth(c, 170);
  sheet.setFrozenRows(top);
  return sheet;
}

function writeWarnings(warnings) {
  var sheet = getOrCreateSheet_(SHEET.WARNING, WARNING_HEADER);
  clearBelowHeader_(sheet);
  if (!warnings.length) {
    sheet.getRange(2, 1).setValue('警告はありません');
    return;
  }
  var order = {};
  order[SEVERITY.CRITICAL] = 0;
  order[SEVERITY.WARNING] = 1;
  order[SEVERITY.INFO] = 2;
  var sorted = warnings.slice().sort(function (a, b) {
    return order[a.severity] - order[b.severity];
  });
  var rows = sorted.map(function (w) {
    return [w.severity, w.code, w.message];
  });
  sheet.getRange(2, 1, rows.length, WARNING_HEADER.length).setValues(rows);
  sheet.setColumnWidth(3, 520);
}

function appendWarningRow(severity, code, message) {
  var sheet = getOrCreateSheet_(SHEET.WARNING, WARNING_HEADER);
  sheet.appendRow([severity, code, message]);
}

// ---------------------------------------------------------------- 担当履歴

function writeHistory(semesterId, counts, members) {
  var sheet = getOrCreateSheet_(SHEET.HISTORY, HISTORY_HEADER);
  var nameById = {};
  members.forEach(function (m) {
    nameById[m.memberId] = m.name;
  });
  var now = new Date();
  var rows = [];
  for (var id in counts) {
    rows.push([semesterId, id, nameById[id] || id, counts[id], now]);
  }
  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HISTORY_HEADER.length).setValues(rows);
  }
}

function readHistory(semesterId) {
  var sheet = getOrCreateSheet_(SHEET.HISTORY, HISTORY_HEADER);
  var last = sheet.getLastRow();
  var entries = [];
  if (last < 2) return entries;
  var values = sheet.getRange(2, 1, last - 1, HISTORY_HEADER.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) !== String(semesterId)) continue;
    entries.push({ memberId: String(values[i][1]), count: Number(values[i][3]) || 0, rowIndex: i + 2 });
  }
  return entries;
}

function deleteHistory(semesterId) {
  var sheet = getOrCreateSheet_(SHEET.HISTORY, HISTORY_HEADER);
  var last = sheet.getLastRow();
  if (last < 2) return;
  var values = sheet.getRange(2, 1, last - 1, 1).getValues();
  // 下から消さないと行番号がずれる
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]) === String(semesterId)) sheet.deleteRow(i + 2);
  }
}
