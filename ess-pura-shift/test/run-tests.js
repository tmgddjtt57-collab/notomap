/**
 * ESSプラシフト - 編成アルゴリズムのテスト
 *
 * Apps Script に依存しない .gs ファイルだけを vm へ読み込んで検証する。
 *   node test/run-tests.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
// Google のサービスをトップレベルで参照しないファイルだけを読み込む。
// 30_Roster.gs は関数の中でしか SpreadsheetApp に触れないため、
// 純粋な解析関数（parseFormResponse / normalizeName）だけを呼ぶ分には読み込める。
const PURE_FILES = ['00_Constants.gs', '10_Solver.gs', '11_Validator.gs', '30_Roster.gs'];

const sandbox = { Math, JSON, isNaN, Number, String, Array, Object, Date, RegExp, console };
vm.createContext(sandbox);
for (const file of PURE_FILES) {
  vm.runInContext(fs.readFileSync(path.join(SRC, file), 'utf8'), sandbox, { filename: file });
}

let failures = 0;
let checks = 0;

// Apps Script は全ファイルを1つのグローバルスコープへ読み込むので、
// 実行しないファイルも含めて構文だけは全部確かめておく。
{
  const all = fs.readdirSync(SRC).filter((f) => f.endsWith('.gs')).sort();
  console.log('# 構文チェック');
  for (const file of all) {
    checks++;
    try {
      new vm.Script(fs.readFileSync(path.join(SRC, file), 'utf8'), { filename: file });
    } catch (err) {
      failures++;
      console.error('  NG  ' + file + ': ' + err.message);
    }
  }
  console.log('  ' + all.length + 'ファイルをパース: ' + all.join(', '));
}

function check(condition, label) {
  checks++;
  if (!condition) {
    failures++;
    console.error('  NG  ' + label);
  }
}

function section(name) {
  console.log('\n# ' + name);
}

/** ハード制約 H1〜H3 を編成結果に対して直接確かめる */
function assertHardConstraints(members, puras, label) {
  const byId = {};
  members.forEach((m) => {
    byId[m.memberId] = m;
  });

  let availabilityOk = true;
  let noSlotClash = true;
  let noTypeDuplicate = true;

  const seenSlot = new Set();
  const seenType = new Set();

  for (const pura of puras) {
    for (const id of pura.memberIds) {
      const member = byId[id];
      if (!member || member.availableSlots.indexOf(pura.slotId) < 0) availabilityOk = false;
      const slotKey = id + '@' + pura.slotId;
      if (seenSlot.has(slotKey)) noSlotClash = false;
      seenSlot.add(slotKey);
      const typeKey = id + '#' + pura.type;
      if (seenType.has(typeKey)) noTypeDuplicate = false;
      seenType.add(typeKey);
    }
  }

  check(availabilityOk, label + ': H1 参加可能コマ以外への配置がない');
  check(noSlotClash, label + ': H2 同一コマでの掛け持ちがない');
  check(noTypeDuplicate, label + ': H3 同一タイプの重複配置がない');
}

/** 再現性のある擬似メンバー生成 */
function makeMembers(count, opts) {
  const options = opts || {};
  const availabilityRate = options.availabilityRate === undefined ? 0.4 : options.availabilityRate;
  const veteranRate = options.veteranRate === undefined ? 0.3 : options.veteranRate;
  const rng = sandbox.createRng(options.seed || 12345);
  const slots = sandbox.allSlotIds();
  const members = [];

  for (let i = 0; i < count; i++) {
    const available = slots.filter(() => rng() < availabilityRate);
    members.push({
      memberId: 'M' + (i + 1),
      name: 'メンバー' + (i + 1),
      gender: rng() < 0.5 ? 'male' : 'female',
      isVeteran: rng() < veteranRate,
      availableSlots: available,
      pastAssignmentCount: Math.floor(rng() * 5),
      submittedAt: new Date('2026-04-01')
    });
  }
  return members;
}

function summarize(members, result) {
  const sizes = result.puras.map((p) => p.memberIds.length);
  const assigned = {};
  result.puras.forEach((p) => p.memberIds.forEach((id) => {
    assigned[id] = (assigned[id] || 0) + 1;
  }));
  const two = members.filter((m) => (assigned[m.memberId] || 0) === 2).length;
  const one = members.filter((m) => (assigned[m.memberId] || 0) === 1).length;
  const zero = members.filter((m) => !assigned[m.memberId]).length;
  const noVeteran = result.puras.filter(
    (p) => p.memberIds.length > 0 && !p.memberIds.some((id) => members.find((m) => m.memberId === id).isVeteran)
  ).length;

  return {
    puraCount: result.puras.length,
    sizes: sizes.join(','),
    inRange: sizes.filter((n) => n >= 4 && n <= 6).length + '/' + sizes.length,
    twoActivities: two,
    oneActivity: one,
    unassigned: zero,
    puraWithoutVeteran: noVeteran,
    score: Math.round(result.score * 100) / 100
  };
}

// ---------------------------------------------------------------- 標準的な規模

section('標準的な規模（30人・参加可能率40%）');
{
  const members = makeMembers(30, { seed: 1001 });
  const result = sandbox.solve(members, null);
  const stats = summarize(members, result);
  console.log('  ' + JSON.stringify(stats));

  assertHardConstraints(members, result.puras, '30人');
  check(result.puras.length > 0, '30人: プラが生成される');
  check(stats.unassigned === 0, '30人: 未配置のメンバーがいない');
  check(stats.puraWithoutVeteran === 0, '30人: 経験者0人のプラがない');

  const sizes = result.puras.map((p) => p.memberIds.length);
  check(sizes.every((n) => n >= 4 && n <= 6), '30人: すべてのプラが4〜6人に収まる');
}

// ---------------------------------------------------------------- 大人数

section('大人数（100人・参加可能率30%）');
{
  const members = makeMembers(100, { seed: 2002, availabilityRate: 0.3 });
  const started = Date.now();
  const result = sandbox.solve(members, null);
  const elapsed = Date.now() - started;
  const stats = summarize(members, result);
  console.log('  ' + JSON.stringify(stats));
  console.log('  実行時間: ' + elapsed + 'ms');

  assertHardConstraints(members, result.puras, '100人');
  check(elapsed < 300000, '100人: Apps Script の6分制限に収まる');
  check(stats.puraWithoutVeteran === 0, '100人: 経験者0人のプラがない');
}

// ---------------------------------------------------------------- 経験者が少ない

section('経験者が不足（20人中2人だけ経験者）');
{
  const members = makeMembers(20, { seed: 3003, veteranRate: 0 });
  members[0].isVeteran = true;
  members[1].isVeteran = true;
  const result = sandbox.solve(members, null);
  const warnings = sandbox.validateShift(members, result.puras, null);
  const noVeteran = warnings.filter((w) => w.code === 'NO_VETERAN');
  console.log('  ' + JSON.stringify(summarize(members, result)));
  console.log('  NO_VETERAN 警告: ' + noVeteran.length + '件');

  assertHardConstraints(members, result.puras, '経験者不足');
  check(noVeteran.length > 0, '経験者不足: 経験者0人のプラが警告される');
  check(
    noVeteran.every((w) => w.severity === '重大'),
    '経験者不足: 重大として分類される'
  );
}

// ---------------------------------------------------------------- 参加可能コマが極端に少ない

section('参加可能コマを1つも回答しなかったメンバーがいる');
{
  const members = makeMembers(20, { seed: 4004, availabilityRate: 0.5 });
  members[0].availableSlots = [];
  const result = sandbox.solve(members, null);
  const warnings = sandbox.validateShift(members, result.puras, null);
  console.log('  ' + JSON.stringify(summarize(members, result)));
  console.log('  警告: ' + JSON.stringify(sandbox.countBySeverity(warnings)));

  assertHardConstraints(members, result.puras, '無回答者あり');
  check(result.puras.length > 0, '無回答者あり: 他のメンバーでプラは成立する');
  const unassigned = warnings.filter((w) => w.code === 'UNASSIGNED');
  check(
    unassigned.some((w) => w.message.indexOf('メンバー1:') === 0),
    '無回答者あり: 参加可能コマ0件のメンバーが UNASSIGNED として警告される'
  );
  check(
    unassigned.length === 1,
    '無回答者あり: 未配置はそのメンバー1人だけ'
  );
}

section('どのコマも下限に届かない');
{
  // 全員がばらばらの1コマだけ空いている状態。どのコマも参加可能者1人しかいない。
  const members = makeMembers(12, { seed: 4104 });
  const slots = sandbox.allSlotIds();
  members.forEach((m, i) => {
    m.availableSlots = [slots[i]];
  });
  const result = sandbox.solve(members, null);
  const warnings = sandbox.validateShift(members, result.puras, null);
  console.log('  ' + JSON.stringify(summarize(members, result)));
  console.log('  警告: ' + JSON.stringify(sandbox.countBySeverity(warnings)));

  check(result.puras.length === 0, '下限未達: プラを1つも立てられない');
  check(
    warnings.some((w) => w.code === 'NO_ELIGIBLE_SLOT'),
    '下限未達: NO_ELIGIBLE_SLOT で原因が報告される'
  );
  check(
    !warnings.some((w) => w.code === 'UNASSIGNED'),
    '下限未達: 個別の未配置警告で埋め尽くさない'
  );
}

// ---------------------------------------------------------------- 同一コマの掛け持ち防止

section('同一コマの掛け持ち防止（全員が月2限のみ参加可能）');
{
  const members = makeMembers(10, { seed: 5005 });
  members.forEach((m) => {
    m.availableSlots = ['0-2'];
  });
  const result = sandbox.solve(members, null);
  console.log('  ' + JSON.stringify(summarize(members, result)));

  assertHardConstraints(members, result.puras, '単一コマ');
  const stats = summarize(members, result);
  check(stats.twoActivities === 0, '単一コマ: 誰も2活動には入れない（H2 が効いている）');
}

// ---------------------------------------------------------------- 公平化

section('担当回数の公平化');
{
  // 全員が同じ2コマしか空いていない状況を作り、席数を足りなくする。
  // 全員が2活動に入れる状況では公平化の効果が観測できないため。
  const members = makeMembers(24, { seed: 6006 });
  members.forEach((m, i) => {
    m.availableSlots = ['0-2', '0-3'];
    m.pastAssignmentCount = i % 2 === 0 ? 0 : 8;
  });
  const result = sandbox.solve(members, null);
  const assigned = {};
  result.puras.forEach((p) => p.memberIds.forEach((id) => {
    assigned[id] = (assigned[id] || 0) + 1;
  }));

  const lowGroup = members.filter((m) => m.pastAssignmentCount === 0);
  const highGroup = members.filter((m) => m.pastAssignmentCount === 8);
  const lowAvg = lowGroup.reduce((s, m) => s + (assigned[m.memberId] || 0), 0) / lowGroup.length;
  const highAvg = highGroup.reduce((s, m) => s + (assigned[m.memberId] || 0), 0) / highGroup.length;
  console.log('  担当回数0の層の平均配置数: ' + lowAvg.toFixed(2));
  console.log('  担当回数8の層の平均配置数: ' + highAvg.toFixed(2));

  assertHardConstraints(members, result.puras, '公平化');
  check(lowAvg > highAvg, '公平化: 席が足りないとき担当回数の少ない層が優先される');
}

// ---------------------------------------------------------------- 再現性

section('再現性（同じ入力・同じシードなら同じ編成）');
{
  const members = makeMembers(28, { seed: 7007 });
  const a = sandbox.solve(members, null);
  const b = sandbox.solve(members, null);
  const keyOf = (r) => r.puras.map((p) => p.type + '@' + p.slotId + ':' + p.memberIds.slice().sort().join('|')).join(' / ');
  check(keyOf(a) === keyOf(b), '再現性: 2回実行して同じ結果になる');

  const c = sandbox.solve(members, { seed: 999 });
  check(typeof c.score === 'number', '再現性: シードを変えても実行できる');
}

// ---------------------------------------------------------------- 境界値

section('境界値');
{
  const empty = sandbox.solve([], null);
  check(empty.puras.length === 0, '空の名簿: プラを作らない');
  check(sandbox.validateShift([], empty.puras, null).length === 0, '空の名簿: 警告も出ない');

  const three = makeMembers(3, { seed: 8008, availabilityRate: 1 });
  const small = sandbox.solve(three, null);
  const smallWarnings = sandbox.validateShift(three, small.puras, null);
  assertHardConstraints(three, small.puras, '3人');
  check(
    smallWarnings.some((w) => w.code === 'NO_ELIGIBLE_SLOT'),
    '3人: 部員数が下限4人に届かず開催不可として報告される'
  );

  const four = makeMembers(4, { seed: 8108, availabilityRate: 1 });
  const fourResult = sandbox.solve(four, null);
  const fourWarnings = sandbox.validateShift(four, fourResult.puras, null);
  assertHardConstraints(four, fourResult.puras, '4人');
  check(fourResult.puras.length === 2, '4人: ディベートとサマリーが1つずつ成立する');
  check(
    !fourWarnings.some((w) => w.code === 'SHORTAGE'),
    '4人: ちょうど下限を満たし人数不足の警告が出ない'
  );
}

// ---------------------------------------------------------------- 設定の上書き

section('設定の上書き');
{
  const members = makeMembers(40, { seed: 9009, availabilityRate: 0.5 });
  const result = sandbox.solve(members, { minSize: 6, maxSize: 8, targetSize: 7 });
  const sizes = result.puras.map((p) => p.memberIds.length);
  console.log('  人数: ' + sizes.join(','));
  assertHardConstraints(members, result.puras, '設定変更');
  check(
    sizes.every((n) => n >= 6 && n <= 8),
    '設定変更: 人数の上下限が設定どおりに効く'
  );

  const merged = sandbox.mergeConfig({ minSize: '5', weights: { veteran: '9' } });
  check(merged.minSize === 5, '設定: 文字列の数値が数値へ変換される');
  check(merged.weights.veteran === 9, '設定: 重みを部分的に上書きできる');
  check(merged.weights.size === 3, '設定: 未指定の重みは既定値が残る');
  check(merged.maxSize === 6, '設定: 未指定の項目は既定値が残る');
}

// ---------------------------------------------------------------- コマ表記

section('コマ表記の相互変換');
{
  check(sandbox.formatSlotList(['0-3', '2-1', '0-2']) === '月2,月3,水1', 'コマ表記: 曜日・時限順に並べて書き出す');
  check(JSON.stringify(sandbox.parseSlotList('月2,月3,水1')) === JSON.stringify(['0-2', '0-3', '2-1']), 'コマ表記: 読み戻せる');
  check(JSON.stringify(sandbox.parseSlotList('月2、水1 金5')) === JSON.stringify(['0-2', '2-1', '4-5']), 'コマ表記: 読点と空白区切りも読める');
  check(JSON.stringify(sandbox.parseSlotList('月2限,水1限')) === JSON.stringify(['0-2', '2-1']), 'コマ表記: 「限」付きも読める');
  check(sandbox.parseSlotList('').length === 0, 'コマ表記: 空文字は0件');
  check(sandbox.parseSlotList('日3,月9').length === 0, 'コマ表記: 存在しない曜日・時限は捨てる');
  check(JSON.stringify(sandbox.parseSlotList('月2,月2')) === JSON.stringify(['0-2']), 'コマ表記: 重複は畳む');

  const allSlots = sandbox.allSlotIds();
  check(allSlots.length === 30, 'コマ表記: 月〜土 × 1〜5限で30コマ');
  const roundTripOk = allSlots.every(
    (id) => JSON.stringify(sandbox.parseSlotList(sandbox.formatSlotList([id]))) === JSON.stringify([id])
  );
  check(roundTripOk, 'コマ表記: 30コマすべてが往復して一致する');
  check(sandbox.slotLabel('0-2') === '月曜2限', 'コマ表記: 表示用ラベル');
}

// ---------------------------------------------------------------- フォーム回答の解析

section('フォーム回答の解析');
{
  const namedValues = {
    氏名: ['山田　太郎'],
    性別: ['女性'],
    ' 経験者・役職者ですか': ['はい'], // 前後の空白が付いたキーは別物として扱われる
    経験者・役職者ですか: ['はい'],
    月曜に参加できる時限: ['2限, 3限'],
    火曜に参加できる時限: [''],
    水曜に参加できる時限: ['1限'],
    木曜に参加できる時限: ['4限'],
    金曜に参加できる時限: [''],
    土曜に参加できる時限: [''],
    '参加できない日・備考': ['第2金曜は不可']
  };
  const record = sandbox.parseFormResponse(namedValues, new Date('2026-04-01T10:00:00Z'));

  check(record !== null, 'フォーム解析: 回答を取り込める');
  check(record.name === '山田 太郎', 'フォーム解析: 全角スペースを半角へそろえる');
  check(record.gender === 'female', 'フォーム解析: 性別を内部表現へ変換する');
  check(record.isVeteran === true, 'フォーム解析: 経験者フラグ');
  check(record.note === '第2金曜は不可', 'フォーム解析: 備考を保持する');
  check(
    JSON.stringify(record.availableSlots) === JSON.stringify(['0-2', '0-3', '2-1', '3-4']),
    'フォーム解析: 月2・月3・水1・木4 を参加可能コマとして取り出す'
  );

  check(sandbox.parseFormResponse({ 氏名: [''] }, new Date()) === null, 'フォーム解析: 氏名が空なら取り込まない');
  check(sandbox.parseFormResponse({}, new Date()) === null, 'フォーム解析: 設問が無い回答は取り込まない');

  const noSlots = sandbox.parseFormResponse({ 氏名: ['佐藤花子'], 性別: ['男性'] }, new Date());
  check(noSlots.availableSlots.length === 0, 'フォーム解析: コマ未選択でも回答自体は受け付ける');
  check(noSlots.isVeteran === false, 'フォーム解析: 未回答の経験者フラグは false');

  check(sandbox.normalizeName('  田中  一郎 ') === '田中 一郎', '氏名正規化: 前後と連続空白を畳む');
  check(sandbox.normalizeName('田中　一郎') === '田中 一郎', '氏名正規化: 全角スペース');
  check(
    sandbox.normalizeName('田中 一郎') === sandbox.normalizeName('田中　一郎'),
    '氏名正規化: 全角と半角の表記ゆれが同じ人物として一致する'
  );
}

// ---------------------------------------------------------------- 結果

console.log('\n' + '='.repeat(56));
if (failures === 0) {
  console.log('すべて成功: ' + checks + '件の検査に合格しました');
  process.exit(0);
} else {
  console.error('失敗: ' + failures + '件 / 全' + checks + '件');
  process.exit(1);
}
