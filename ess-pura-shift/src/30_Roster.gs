/**
 * ESSプラシフト - フォーム回答の取り込みと名簿の更新
 *
 * 回答送信をトリガーに呼ばれ、名簿へ登録したうえで仮シフトを再計算する。
 * 管理者が名簿を1人ずつ入力する必要をなくすのがこのファイルの役割。
 */

/** 前後の空白除去と全角スペースの統一のみ行う。それ以上は勝手に触らない。 */
function normalizeName(name) {
  return String(name || '')
    .replace(/　/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 「1限, 2限」を数値の配列にする */
function parsePeriodAnswer_(answer) {
  if (!answer) return [];
  var text = Array.isArray(answer) ? answer.join(',') : String(answer);
  var periods = [];
  var tokens = text.split(/[,、\s]+/);
  for (var i = 0; i < tokens.length; i++) {
    var n = Number(String(tokens[i]).replace('限', '').trim());
    if (n && PERIODS.indexOf(n) >= 0 && periods.indexOf(n) < 0) periods.push(n);
  }
  return periods;
}

function firstValue_(namedValues, key) {
  var v = namedValues[key];
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.length ? String(v[0]) : '';
  return String(v);
}

/**
 * フォーム回答（namedValues 形式）を名簿レコードへ変換する。
 * 氏名が空の回答は取り込まない。
 */
function parseFormResponse(namedValues, submittedAt) {
  var name = normalizeName(firstValue_(namedValues, FORM.Q_NAME));
  if (!name) return null;

  var slots = [];
  for (var d = 0; d < DAYS.length; d++) {
    var periods = parsePeriodAnswer_(namedValues[dayQuestionTitle(DAYS[d])]);
    for (var p = 0; p < periods.length; p++) slots.push(makeSlotId(d, periods[p]));
  }

  return {
    name: name,
    gender: genderFromLabel_(firstValue_(namedValues, FORM.Q_GENDER)),
    isVeteran: firstValue_(namedValues, FORM.Q_VETERAN).trim() === 'はい',
    availableSlots: slots,
    note: firstValue_(namedValues, FORM.Q_NOTE),
    submittedAt: submittedAt || new Date()
  };
}

/** FormResponse を namedValues 相当のオブジェクトへ変換する（一括取り込み用） */
function namedValuesFromFormResponse_(formResponse) {
  var namedValues = {};
  var items = formResponse.getItemResponses();
  for (var i = 0; i < items.length; i++) {
    var title = items[i].getItem().getTitle();
    var response = items[i].getResponse();
    namedValues[title] = Array.isArray(response) ? [response.join(', ')] : [String(response)];
  }
  return namedValues;
}

function nextMemberId_(members) {
  var max = 0;
  for (var i = 0; i < members.length; i++) {
    var n = Number(String(members[i].memberId).replace(/^M/, ''));
    if (!isNaN(n) && n > max) max = n;
  }
  return 'M' + (max + 1);
}

/**
 * 氏名をキーに名簿へ登録または上書きする。
 * 同一人物の複数回答は最新で上書きし、過去担当回数は引き継ぐ。
 */
function upsertMember(record) {
  var members = readRoster();
  var key = normalizeName(record.name);
  var existing = null;
  for (var i = 0; i < members.length; i++) {
    if (normalizeName(members[i].name) === key) {
      existing = members[i];
      break;
    }
  }

  if (existing) {
    // 先に届いた回答で後の回答を上書きしない
    if (existing.submittedAt && record.submittedAt &&
        new Date(record.submittedAt) < new Date(existing.submittedAt)) {
      return existing;
    }
    existing.gender = record.gender;
    existing.isVeteran = record.isVeteran;
    existing.availableSlots = record.availableSlots;
    existing.note = record.note;
    existing.submittedAt = record.submittedAt;
  } else {
    existing = {
      memberId: nextMemberId_(members),
      name: record.name,
      gender: record.gender,
      isVeteran: record.isVeteran,
      availableSlots: record.availableSlots,
      note: record.note,
      pastAssignmentCount: 0,
      submittedAt: record.submittedAt
    };
    members.push(existing);
  }

  writeRoster(members);
  return existing;
}

/**
 * フォーム回答送信トリガーの入口。
 * スプレッドシート側のトリガーとして登録する（e.namedValues が渡る）。
 */
function onFormSubmitHandler(e) {
  if (!e || !e.namedValues) return;
  var record = parseFormResponse(e.namedValues, e.values ? new Date() : new Date());
  if (!record) return;

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    // ロックが取れなくても回答は取り込む。同時送信が重なった場合は
    // 後述の「回答を再取り込み」で復旧できる。
  }

  try {
    upsertMember(record);

    if (String(getSetting_(CONFIG_KEYS.STATUS)).trim() === STATUS.CONFIRMED) {
      // 確定後は自動再計算しない。名簿にだけ反映し管理者へ知らせる。
      appendWarningRow(
        SEVERITY.WARNING,
        'LATE_RESPONSE',
        record.name + ': 確定後に回答が届きました（シフトは自動更新されていません）'
      );
    } else {
      recalculateDraft(true);
    }
  } finally {
    try {
      lock.releaseLock();
    } catch (err2) {
      // ロックを取得できていない場合は何もしない
    }
  }
}

/**
 * トリガー設置前に届いた回答を拾い直す。
 * フォームの全回答を読み、名簿へ反映する。
 */
function importAllResponses() {
  var ui = SpreadsheetApp.getUi();
  var url = String(getSetting_(CONFIG_KEYS.FORM_URL) || '').trim();
  if (!url) {
    ui.alert('フォームURLが設定シートにありません。先に「フォームを作成」を実行してください。');
    return;
  }

  var form = FormApp.openByUrl(url);
  var responses = form.getResponses();
  var imported = 0;
  for (var i = 0; i < responses.length; i++) {
    var record = parseFormResponse(
      namedValuesFromFormResponse_(responses[i]),
      responses[i].getTimestamp()
    );
    if (record) {
      upsertMember(record);
      imported++;
    }
  }

  ui.alert(imported + '件の回答を名簿へ取り込みました。');
}

/** 回答状況の一覧を出す */
function showRosterStatus() {
  var members = readRoster();
  var warnings = validateResponses(members).concat(validateDuplicateNames(members));
  var answered = members.filter(function (m) {
    return !!m.submittedAt;
  }).length;

  var lines = [
    '名簿: ' + members.length + '人',
    '回答済み: ' + answered + '人',
    '未回答: ' + (members.length - answered) + '人'
  ];
  if (warnings.length) {
    lines.push('');
    lines.push('確認事項:');
    for (var i = 0; i < Math.min(warnings.length, 20); i++) lines.push('・' + warnings[i].message);
    if (warnings.length > 20) lines.push('ほか' + (warnings.length - 20) + '件');
  }
  SpreadsheetApp.getUi().alert(lines.join('\n'));
}
