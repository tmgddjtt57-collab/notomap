/**
 * ESSプラシフト - 検証と警告生成
 *
 * 条件を満たせない箇所を黙って通さず、警告として列挙する。
 * このファイルは Google のサービスに依存しない。Node からも読み込んでテストできる。
 */

var SEVERITY = {
  CRITICAL: '重大',
  WARNING: '警告',
  INFO: '情報'
};

/**
 * @param {Array} members 名簿
 * @param {Array} puras 編成結果
 * @param {Object} config 設定
 * @return {Array<{code:string, severity:string, message:string}>}
 */
function validateShift(members, puras, config) {
  var cfg = mergeConfig(config);
  var ctx = buildContext_(members || []);
  var list = puras || [];
  var warnings = [];

  var assignedCount = {};
  for (var i = 0; i < list.length; i++) {
    var pura = list[i];
    var label = slotLabel(pura.slotId) + ' ' + PURA_TYPE_LABEL[pura.type];
    var n = pura.memberIds.length;
    var veterans = 0;
    var male = 0;
    var female = 0;

    for (var j = 0; j < n; j++) {
      var member = ctx.byId[pura.memberIds[j]];
      if (!member) continue;
      if (member.isVeteran) veterans++;
      if (member.gender === GENDER.MALE) male++;
      else if (member.gender === GENDER.FEMALE) female++;
      assignedCount[member.memberId] = (assignedCount[member.memberId] || 0) + 1;
    }

    if (n < cfg.minSize) {
      warnings.push({
        code: 'SHORTAGE',
        severity: SEVERITY.WARNING,
        message: label + ': ' + n + '人（人数不足 / 下限' + cfg.minSize + '人）'
      });
    } else if (n > cfg.maxSize) {
      warnings.push({
        code: 'OVERFLOW',
        severity: SEVERITY.WARNING,
        message: label + ': ' + n + '人（人数超過 / 上限' + cfg.maxSize + '人）'
      });
    }

    if (n > 0 && veterans === 0) {
      warnings.push({
        code: 'NO_VETERAN',
        severity: SEVERITY.CRITICAL,
        message: label + ': 経験者・役職者が0人'
      });
    }

    if (Math.abs(male - female) >= GENDER_GAP_THRESHOLD) {
      warnings.push({
        code: 'GENDER_IMBALANCE',
        severity: SEVERITY.INFO,
        message: label + ': 男性' + male + '人・女性' + female + '人（男女比の偏り）'
      });
    }
  }

  // 開催コマの確保状況。1つもプラを立てられない場合は個別の未配置警告より
  // 「どのコマも人数が足りない」ことを1件で伝えるほうが原因が分かる。
  var counts = slotAvailability(ctx);
  var eligibleSlots = allSlotIds().filter(function (id) {
    return counts[id] >= cfg.minSize;
  });
  var needed = ctx.members.length ? Math.max(1, Math.ceil(ctx.members.length / cfg.targetSize)) : 0;
  var noPuraAtAll = ctx.members.length > 0 && list.length === 0;

  if (noPuraAtAll) {
    var bestSlot = 0;
    for (var slot in counts) if (counts[slot] > bestSlot) bestSlot = counts[slot];
    warnings.push({
      code: 'NO_ELIGIBLE_SLOT',
      severity: SEVERITY.CRITICAL,
      message: '参加可能者が' + cfg.minSize + '人以上のコマが1つもありません' +
        '（最も多いコマで' + bestSlot + '人）。プラを開催できません'
    });
  } else if (list.length > 0 && eligibleSlots.length < needed) {
    warnings.push({
      code: 'SLOT_SHORTAGE',
      severity: SEVERITY.WARNING,
      message: '開催できるコマが不足しています（1タイプあたり必要' + needed + 'コマ / 確保' +
        eligibleSlots.length + 'コマ）。1プラの人数が上限を超えやすくなります'
    });
  }

  // メンバー単位の警告
  for (var k = 0; k < ctx.members.length; k++) {
    var m = ctx.members[k];
    var c = assignedCount[m.memberId] || 0;
    if (c === 0) {
      if (noPuraAtAll) continue; // 原因は NO_ELIGIBLE_SLOT 側で報告済み
      warnings.push({
        code: 'UNASSIGNED',
        severity: SEVERITY.CRITICAL,
        message: m.name + ': どのプラにも配置できませんでした' +
          (m.availableSlots.length === 0 ? '（参加可能コマの回答が0件）' : '')
      });
    } else if (c < PURA_TYPES.length) {
      warnings.push({
        code: 'SINGLE_ACTIVITY',
        severity: SEVERITY.INFO,
        message: m.name + ': 空きコマの都合で1活動のみ'
      });
    }
  }

  return warnings;
}

/** 名簿にいるが未回答のメンバーを警告する。回答済み判定は submittedAt の有無で行う。 */
function validateResponses(members) {
  var warnings = [];
  var list = members || [];
  for (var i = 0; i < list.length; i++) {
    if (!list[i].submittedAt) {
      warnings.push({
        code: 'NO_RESPONSE',
        severity: SEVERITY.WARNING,
        message: list[i].name + ': フォーム未回答'
      });
    }
  }
  return warnings;
}

/** 同姓同名の可能性。自動では区別できないため管理者へ提示する。 */
function validateDuplicateNames(members) {
  var seen = {};
  var warnings = [];
  var list = members || [];
  for (var i = 0; i < list.length; i++) {
    var key = list[i].name;
    if (seen[key]) {
      warnings.push({
        code: 'DUPLICATE_NAME',
        severity: SEVERITY.WARNING,
        message: key + ': 同じ氏名が複数登録されています（同姓同名か重複回答の可能性）'
      });
    }
    seen[key] = true;
  }
  return warnings;
}

function countBySeverity(warnings) {
  var result = {};
  result[SEVERITY.CRITICAL] = 0;
  result[SEVERITY.WARNING] = 0;
  result[SEVERITY.INFO] = 0;
  for (var i = 0; i < (warnings || []).length; i++) {
    var s = warnings[i].severity;
    result[s] = (result[s] || 0) + 1;
  }
  return result;
}
