/**
 * ESSプラシフト - 学期シフトの生成・確定・解除
 *
 * 仮シフトは回答が届くたびに作り直してよい。確定シフトは学期中固定し、
 * 確定した時点で担当回数を加算して次学期の公平化へ引き継ぐ。
 */

function currentSemester_() {
  var settings = readSettings();
  return {
    id: String(settings[CONFIG_KEYS.SEMESTER_ID] || '').trim(),
    label: String(settings[CONFIG_KEYS.SEMESTER_LABEL] || '').trim(),
    status: String(settings[CONFIG_KEYS.STATUS] || '').trim()
  };
}

/** 学期を新しく作る。既存の確定シフトは担当履歴として残る。 */
function createSemester() {
  var ui = SpreadsheetApp.getUi();
  var current = currentSemester_();

  if (current.id && current.status === STATUS.DRAFT) {
    var proceed = ui.alert(
      '仮シフトが残っています',
      current.label + '（' + current.id + '）は未確定です。\n'
        + '確定せずに新しい学期を作ると、この仮シフトは破棄され担当回数にも反映されません。\n\n続けますか。',
      ui.ButtonSet.YES_NO
    );
    if (proceed !== ui.Button.YES) return;
  }

  var labelInput = ui.prompt('学期を作成', '学期名を入力してください（例: 2026年度後期）', ui.ButtonSet.OK_CANCEL);
  if (labelInput.getSelectedButton() !== ui.Button.OK) return;
  var label = labelInput.getResponseText().trim();
  if (!label) {
    ui.alert('学期名が空です。');
    return;
  }

  var idInput = ui.prompt('学期を作成', '学期IDを入力してください（例: 2026-fall）', ui.ButtonSet.OK_CANCEL);
  if (idInput.getSelectedButton() !== ui.Button.OK) return;
  var id = idInput.getResponseText().trim();
  if (!id) {
    ui.alert('学期IDが空です。');
    return;
  }

  setSetting_(CONFIG_KEYS.SEMESTER_ID, id);
  setSetting_(CONFIG_KEYS.SEMESTER_LABEL, label);
  setSetting_(CONFIG_KEYS.STATUS, STATUS.DRAFT);
  setSetting_(CONFIG_KEYS.CONFIRMED_AT, '');

  ui.alert(label + '（' + id + '）を作成しました。\n仮シフトを再計算すると編成が表示されます。');
  recalculateDraft(true);
}

/**
 * 仮シフトを再計算する。
 * @param {boolean} silent トリガーからの呼び出しではダイアログを出さない
 */
function recalculateDraft(silent) {
  var semester = currentSemester_();
  if (!semester.id) {
    if (!silent) SpreadsheetApp.getUi().alert('学期が未作成です。先に「学期を作成」を実行してください。');
    return null;
  }
  if (semester.status === STATUS.CONFIRMED) {
    if (!silent) {
      SpreadsheetApp.getUi().alert(
        semester.label + ' は確定済みです。\n再計算するには先に「確定を解除」を実行してください。'
      );
    }
    return null;
  }

  var members = readRoster();
  var config = readConfigFromSettings();
  var result = solve(members, config);

  var warnings = validateShift(members, result.puras, config)
    .concat(validateResponses(members))
    .concat(validateDuplicateNames(members));

  writeShiftDetail(semester.id, result.puras, members);
  renderShiftMatrix(
    result.puras,
    members,
    semester.label + '（仮シフト） 最終更新: ' + Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm'
    )
  );
  writeWarnings(warnings);

  if (!silent) {
    var counts = countBySeverity(warnings);
    SpreadsheetApp.getUi().alert(
      '仮シフトを更新しました',
      'プラ数: ' + result.puras.length + '\n'
        + '重大: ' + counts[SEVERITY.CRITICAL] + '件 / '
        + '警告: ' + counts[SEVERITY.WARNING] + '件 / '
        + '情報: ' + counts[SEVERITY.INFO] + '件\n\n'
        + '内容は「警告」シートで確認できます。',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }

  return { puras: result.puras, warnings: warnings };
}

/**
 * シフトを確定する。
 * 確定した時点で担当回数を加算し、加算内容を担当履歴へ残す（解除時に取り消すため）。
 */
function confirmShift() {
  var ui = SpreadsheetApp.getUi();
  var semester = currentSemester_();

  if (!semester.id) {
    ui.alert('学期が未作成です。');
    return;
  }
  if (semester.status === STATUS.CONFIRMED) {
    ui.alert(semester.label + ' はすでに確定済みです。');
    return;
  }

  var members = readRoster();
  var config = readConfigFromSettings();
  var counts = countAssignmentsFromDetail(semester.id);
  if (!Object.keys(counts).length) {
    ui.alert('確定できるシフトがありません。先に「仮シフトを再計算」を実行してください。');
    return;
  }

  var detailWarnings = readWarningsForConfirm_(members, config, semester.id);
  var severity = countBySeverity(detailWarnings);

  var message = semester.label + ' のシフトを確定します。\n\n'
    + '重大: ' + severity[SEVERITY.CRITICAL] + '件 / '
    + '警告: ' + severity[SEVERITY.WARNING] + '件 / '
    + '情報: ' + severity[SEVERITY.INFO] + '件\n\n'
    + '確定すると学期中は固定され、以降の回答では自動更新されなくなります。\n'
    + '各メンバーの担当回数にも加算されます。続けますか。';

  if (ui.alert('シフトを確定', message, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  // 担当回数の加算。履歴を残すので解除時に正確に取り消せる。
  for (var i = 0; i < members.length; i++) {
    var add = counts[members[i].memberId] || 0;
    if (add) members[i].pastAssignmentCount = (Number(members[i].pastAssignmentCount) || 0) + add;
  }
  writeRoster(members);
  writeHistory(semester.id, counts, members);

  setSetting_(CONFIG_KEYS.STATUS, STATUS.CONFIRMED);
  setSetting_(CONFIG_KEYS.CONFIRMED_AT, new Date());

  renderShiftMatrix(
    readPurasFromDetail_(semester.id),
    members,
    semester.label + '（確定シフト） 確定日時: ' + Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm'
    )
  );

  ui.alert(semester.label + ' のシフトを確定しました。');
}

/** 確定を解除して仮シフトへ戻す。担当回数の加算も取り消す。 */
function unconfirmShift() {
  var ui = SpreadsheetApp.getUi();
  var semester = currentSemester_();

  if (semester.status !== STATUS.CONFIRMED) {
    ui.alert('確定済みのシフトがありません。');
    return;
  }

  if (ui.alert(
    '確定を解除',
    semester.label + ' の確定を解除します。\n加算済みの担当回数も元に戻します。続けますか。',
    ui.ButtonSet.YES_NO
  ) !== ui.Button.YES) return;

  var history = readHistory(semester.id);
  var members = readRoster();
  var byId = {};
  members.forEach(function (m) {
    byId[m.memberId] = m;
  });

  for (var i = 0; i < history.length; i++) {
    var member = byId[history[i].memberId];
    if (!member) continue;
    member.pastAssignmentCount = Math.max(
      0,
      (Number(member.pastAssignmentCount) || 0) - history[i].count
    );
  }

  writeRoster(members);
  deleteHistory(semester.id);
  setSetting_(CONFIG_KEYS.STATUS, STATUS.DRAFT);
  setSetting_(CONFIG_KEYS.CONFIRMED_AT, '');

  ui.alert('確定を解除しました。仮シフトとして再計算できます。');
}

/** 明細シートから編成を復元する */
function readPurasFromDetail_(semesterId) {
  var sheet = getOrCreateSheet_(SHEET.DETAIL, DETAIL_HEADER);
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var values = sheet.getRange(2, 1, last - 1, DETAIL_HEADER.length).getValues();

  var byPuraId = {};
  var order = [];
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) !== String(semesterId)) continue;
    var puraId = String(values[i][1]);
    if (!byPuraId[puraId]) {
      byPuraId[puraId] = {
        puraId: puraId,
        type: String(values[i][2]) === PURA_TYPE_LABEL.debate ? 'debate' : 'summary',
        slotId: slotIdFromLabel_(String(values[i][3])),
        memberIds: []
      };
      order.push(puraId);
    }
    byPuraId[puraId].memberIds.push(String(values[i][4]));
  }
  return order.map(function (id) {
    return byPuraId[id];
  });
}

/** 「月曜2限」を slotId へ戻す */
function slotIdFromLabel_(label) {
  var match = String(label).match(/^(.)曜(\d)限$/);
  if (!match) return '0-1';
  var dayIndex = DAYS.indexOf(match[1]);
  return makeSlotId(dayIndex < 0 ? 0 : dayIndex, Number(match[2]));
}

function readWarningsForConfirm_(members, config, semesterId) {
  return validateShift(members, readPurasFromDetail_(semesterId), config)
    .concat(validateResponses(members))
    .concat(validateDuplicateNames(members));
}
