/**
 * ESSプラシフト - 定数と設定
 *
 * このファイルは Google のサービスに依存しない。Node からも読み込んでテストできる。
 */

var DAYS = ['月', '火', '水', '木', '金', '土'];
var PERIODS = [1, 2, 3, 4, 5];

var PURA_TYPES = ['debate', 'summary'];

var PURA_TYPE_LABEL = {
  debate: 'ディベートプラ',
  summary: 'サマリープラ'
};

var GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

/** 男女比の偏りを警告する差の閾値 */
var GENDER_GAP_THRESHOLD = 3;

var DEFAULT_CONFIG = {
  minSize: 4,
  maxSize: 6,
  targetSize: 5,
  weights: {
    size: 3,
    veteran: 5,
    gender: 1,
    activity: 2,
    fairness: 1
  },
  iterations: 2000,
  restarts: 3,
  seed: 20260401
};

/** フォームの設問文。生成側と解析側で必ず同じ値を使う。 */
var FORM = {
  TITLE: 'ESSプラシフト 参加可能コマ調査',
  Q_NAME: '氏名',
  Q_GENDER: '性別',
  Q_VETERAN: '経験者・役職者ですか',
  Q_NOTE: '参加できない日・備考',
  GENDER_CHOICES: ['男性', '女性', '回答しない'],
  VETERAN_CHOICES: ['はい', 'いいえ']
};

function dayQuestionTitle(day) {
  return day + '曜に参加できる時限';
}

function periodChoices() {
  return PERIODS.map(function (p) {
    return p + '限';
  });
}

function makeSlotId(dayIndex, period) {
  return dayIndex + '-' + period;
}

function allSlotIds() {
  var ids = [];
  for (var d = 0; d < DAYS.length; d++) {
    for (var p = 0; p < PERIODS.length; p++) {
      ids.push(makeSlotId(d, PERIODS[p]));
    }
  }
  return ids;
}

function slotLabel(id) {
  var parts = String(id).split('-');
  return DAYS[Number(parts[0])] + '曜' + parts[1] + '限';
}

function parseSlotId(id) {
  var parts = String(id).split('-');
  return { dayIndex: Number(parts[0]), period: Number(parts[1]) };
}

/** 名簿シートに書く短い表記。「月2」のように読める形にする。 */
function compactSlotLabel(id) {
  var parts = String(id).split('-');
  return DAYS[Number(parts[0])] + parts[1];
}

/** 「月2,月3,水1」を slotId の配列へ戻す。読めない要素は捨てる。 */
function parseSlotList(text) {
  if (!text) return [];
  var tokens = String(text).split(/[,、\s]+/);
  var slots = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i].trim();
    if (!token) continue;
    var dayIndex = DAYS.indexOf(token.charAt(0));
    var period = Number(token.slice(1).replace('限', ''));
    if (dayIndex < 0 || !period || PERIODS.indexOf(period) < 0) continue;
    var id = makeSlotId(dayIndex, period);
    if (slots.indexOf(id) < 0) slots.push(id);
  }
  return slots;
}

function formatSlotList(slotIds) {
  var sorted = (slotIds || []).slice().sort(function (a, b) {
    var sa = parseSlotId(a);
    var sb = parseSlotId(b);
    if (sa.dayIndex !== sb.dayIndex) return sa.dayIndex - sb.dayIndex;
    return sa.period - sb.period;
  });
  return sorted.map(compactSlotLabel).join(',');
}

function genderFromLabel_(label) {
  var text = String(label || '').trim();
  if (text === '男性' || text === GENDER.MALE) return GENDER.MALE;
  if (text === '女性' || text === GENDER.FEMALE) return GENDER.FEMALE;
  return GENDER.OTHER;
}

function genderToLabel_(gender) {
  if (gender === GENDER.MALE) return '男性';
  if (gender === GENDER.FEMALE) return '女性';
  return '回答しない';
}

/** 部分的な設定を既定値へ重ねる。sheet から読んだ値の欠落を吸収する。 */
function mergeConfig(config) {
  var merged = {
    minSize: DEFAULT_CONFIG.minSize,
    maxSize: DEFAULT_CONFIG.maxSize,
    targetSize: DEFAULT_CONFIG.targetSize,
    iterations: DEFAULT_CONFIG.iterations,
    restarts: DEFAULT_CONFIG.restarts,
    seed: DEFAULT_CONFIG.seed,
    weights: {
      size: DEFAULT_CONFIG.weights.size,
      veteran: DEFAULT_CONFIG.weights.veteran,
      gender: DEFAULT_CONFIG.weights.gender,
      activity: DEFAULT_CONFIG.weights.activity,
      fairness: DEFAULT_CONFIG.weights.fairness
    }
  };
  if (!config) return merged;

  var keys = ['minSize', 'maxSize', 'targetSize', 'iterations', 'restarts', 'seed'];
  for (var i = 0; i < keys.length; i++) {
    var v = config[keys[i]];
    if (v !== undefined && v !== null && v !== '' && !isNaN(Number(v))) {
      merged[keys[i]] = Number(v);
    }
  }
  if (config.weights) {
    var wKeys = ['size', 'veteran', 'gender', 'activity', 'fairness'];
    for (var j = 0; j < wKeys.length; j++) {
      var wv = config.weights[wKeys[j]];
      if (wv !== undefined && wv !== null && wv !== '' && !isNaN(Number(wv))) {
        merged.weights[wKeys[j]] = Number(wv);
      }
    }
  }
  return merged;
}
