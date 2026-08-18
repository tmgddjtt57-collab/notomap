/**
 * ESSプラシフト - 編成アルゴリズム
 *
 * ハード制約（絶対に破らない）
 *   H1 メンバーは自分の参加可能コマにしか配置されない
 *   H2 同一コマに同一メンバーを重複配置しない
 *   H3 1人あたりディベート最大1回・サマリー最大1回
 *
 * ソフト制約はスコア（ペナルティの重み付き和）で表現し、局所探索で最小化する。
 *
 * このファイルは Google のサービスに依存しない。Node からも読み込んでテストできる。
 */

/** mulberry32。シードを固定すれば再計算しても同じ編成が得られる。 */
function createRng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle_(array, rng) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

function variance_(values) {
  if (!values.length) return 0;
  var sum = 0;
  for (var i = 0; i < values.length; i++) sum += values[i];
  var mean = sum / values.length;
  var acc = 0;
  for (var j = 0; j < values.length; j++) acc += Math.pow(values[j] - mean, 2);
  return acc / values.length;
}

function buildContext_(members) {
  var byId = {};
  var normalized = [];
  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    var slots = m.availableSlots || [];
    var set = {};
    for (var s = 0; s < slots.length; s++) set[slots[s]] = true;
    var entry = {
      memberId: m.memberId,
      name: m.name,
      gender: m.gender,
      isVeteran: !!m.isVeteran,
      availableSlots: slots,
      availableSet: set,
      pastAssignmentCount: Number(m.pastAssignmentCount) || 0
    };
    normalized.push(entry);
    byId[entry.memberId] = entry;
  }
  return { members: normalized, byId: byId };
}

/** コマごとの参加可能人数 */
function slotAvailability(ctx) {
  var counts = {};
  var ids = allSlotIds();
  for (var i = 0; i < ids.length; i++) counts[ids[i]] = 0;
  for (var m = 0; m < ctx.members.length; m++) {
    var slots = ctx.members[m].availableSlots;
    for (var s = 0; s < slots.length; s++) {
      if (counts[slots[s]] !== undefined) counts[slots[s]]++;
    }
  }
  return counts;
}

/**
 * 手順1: 開催コマの決定。
 * 参加可能者が minSize 未満のコマは候補から除外し、多い順に必要数だけ選ぶ。
 * ディベートとサマリーは可能な限り別コマへ振る。
 */
function selectSlots(ctx, config) {
  var counts = slotAvailability(ctx);
  var eligible = allSlotIds().filter(function (id) {
    return counts[id] >= config.minSize;
  });
  eligible.sort(function (a, b) {
    if (counts[b] !== counts[a]) return counts[b] - counts[a];
    return a < b ? -1 : a > b ? 1 : 0;
  });

  var needed = ctx.members.length ? Math.max(1, Math.ceil(ctx.members.length / config.targetSize)) : 0;
  var debate = [];
  var summary = [];

  for (var i = 0; i < eligible.length; i++) {
    if (debate.length >= needed && summary.length >= needed) break;
    if (i % 2 === 0) {
      if (debate.length < needed) debate.push(eligible[i]);
      else summary.push(eligible[i]);
    } else {
      if (summary.length < needed) summary.push(eligible[i]);
      else debate.push(eligible[i]);
    }
  }

  // 別コマで賄いきれない場合のみ、他タイプが使ったコマを再利用する。
  // 同一コマにディベートとサマリーが並んでも H2 が掛け持ちを防ぐ。
  topUpSlots_(debate, eligible, needed);
  topUpSlots_(summary, eligible, needed);

  return { debate: debate, summary: summary, eligible: eligible, counts: counts, needed: needed };
}

function topUpSlots_(list, eligible, needed) {
  for (var i = 0; i < eligible.length && list.length < needed; i++) {
    if (list.indexOf(eligible[i]) < 0) list.push(eligible[i]);
  }
}

function createPuras_(slots) {
  var puras = [];
  for (var d = 0; d < slots.debate.length; d++) {
    puras.push({ puraId: 'D' + (d + 1), type: 'debate', slotId: slots.debate[d], memberIds: [] });
  }
  for (var s = 0; s < slots.summary.length; s++) {
    puras.push({ puraId: 'S' + (s + 1), type: 'summary', slotId: slots.summary[s], memberIds: [] });
  }
  return puras;
}

function cloneState_(state) {
  var puras = [];
  for (var i = 0; i < state.puras.length; i++) {
    var p = state.puras[i];
    puras.push({ puraId: p.puraId, type: p.type, slotId: p.slotId, memberIds: p.memberIds.slice() });
  }
  return { puras: puras };
}

/** H1〜H3 の違反数。0 でなければその編成は採用しない。 */
function hardViolations(state, ctx) {
  var violations = 0;
  var seenSlot = {};
  var seenType = {};
  for (var i = 0; i < state.puras.length; i++) {
    var pura = state.puras[i];
    for (var j = 0; j < pura.memberIds.length; j++) {
      var id = pura.memberIds[j];
      var member = ctx.byId[id];
      if (!member || !member.availableSet[pura.slotId]) violations++; // H1
      var slotKey = id + '@' + pura.slotId;
      if (seenSlot[slotKey]) violations++; // H2
      seenSlot[slotKey] = true;
      var typeKey = id + '#' + pura.type;
      if (seenType[typeKey]) violations++; // H3
      seenType[typeKey] = true;
    }
  }
  return violations;
}

/** メンバーを puraIndex へ追加できるか（H1〜H3） */
function canPlace_(state, ctx, memberId, puraIndex) {
  var pura = state.puras[puraIndex];
  var member = ctx.byId[memberId];
  if (!member || !member.availableSet[pura.slotId]) return false;
  if (pura.memberIds.indexOf(memberId) >= 0) return false;
  for (var i = 0; i < state.puras.length; i++) {
    if (i === puraIndex) continue;
    var other = state.puras[i];
    if (other.memberIds.indexOf(memberId) < 0) continue;
    if (other.type === pura.type) return false; // H3
    if (other.slotId === pura.slotId) return false; // H2
  }
  return true;
}

function scoreState(state, ctx, config) {
  var w = config.weights;
  var sizePenalty = 0;
  var veteranPenalty = 0;
  var genderPenalty = 0;
  var assignedCount = {};

  for (var i = 0; i < state.puras.length; i++) {
    var pura = state.puras[i];
    var n = pura.memberIds.length;
    if (n < config.minSize) sizePenalty += Math.pow(config.minSize - n, 2);
    else if (n > config.maxSize) sizePenalty += Math.pow(n - config.maxSize, 2);

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
    if (n > 0 && veterans === 0) veteranPenalty += 1;
    genderPenalty += Math.abs(male - female);
  }

  var activityPenalty = 0;
  var totals = [];
  for (var k = 0; k < ctx.members.length; k++) {
    var m = ctx.members[k];
    var c = assignedCount[m.memberId] || 0;
    activityPenalty += PURA_TYPES.length - c; // 0活動は1活動の倍の重みになる
    totals.push(m.pastAssignmentCount + c);
  }

  return (
    w.size * sizePenalty +
    w.veteran * veteranPenalty +
    w.gender * genderPenalty +
    w.activity * activityPenalty +
    w.fairness * variance_(totals)
  );
}

/**
 * 手順2: 初期割当。
 * 選択肢の少ない人を先に決める（most-constrained-first）。後回しにすると詰む。
 * 同点は過去の担当回数が少ない順。
 */
function greedyAssign_(state, ctx, config, rng) {
  var order = shuffle_(ctx.members.slice(), rng);
  order.sort(function (a, b) {
    var fa = feasiblePuraCount_(state, a);
    var fb = feasiblePuraCount_(state, b);
    if (fa !== fb) return fa - fb;
    return a.pastAssignmentCount - b.pastAssignmentCount;
  });

  for (var i = 0; i < order.length; i++) {
    for (var t = 0; t < PURA_TYPES.length; t++) {
      placeBest_(state, ctx, config, order[i].memberId, PURA_TYPES[t]);
    }
  }
}

function feasiblePuraCount_(state, member) {
  var count = 0;
  for (var i = 0; i < state.puras.length; i++) {
    if (member.availableSet[state.puras[i].slotId]) count++;
  }
  return count;
}

/** 指定タイプのプラのうち、スコアが最も良くなるところへ入れる。入れられなければ何もしない。 */
function placeBest_(state, ctx, config, memberId, type) {
  var bestIndex = -1;
  var bestScore = Infinity;
  for (var i = 0; i < state.puras.length; i++) {
    if (state.puras[i].type !== type) continue;
    if (!canPlace_(state, ctx, memberId, i)) continue;
    state.puras[i].memberIds.push(memberId);
    var s = scoreState(state, ctx, config);
    state.puras[i].memberIds.pop();
    if (s < bestScore) {
      bestScore = s;
      bestIndex = i;
    }
  }
  if (bestIndex >= 0) {
    state.puras[bestIndex].memberIds.push(memberId);
    return true;
  }
  return false;
}

/**
 * 手順3: 経験者の充足。
 * 経験者0人のプラへ、経験者を2人以上抱えるプラから移す。移せなければ交換を試す。
 */
function repairVeterans_(state, ctx, config) {
  for (var i = 0; i < state.puras.length; i++) {
    var target = state.puras[i];
    if (target.memberIds.length === 0) continue;
    if (countVeterans_(target, ctx) > 0) continue;

    if (moveVeteranInto_(state, ctx, i)) continue;
    swapVeteranInto_(state, ctx, config, i);
  }
}

function countVeterans_(pura, ctx) {
  var count = 0;
  for (var i = 0; i < pura.memberIds.length; i++) {
    var m = ctx.byId[pura.memberIds[i]];
    if (m && m.isVeteran) count++;
  }
  return count;
}

/** 経験者に余裕のあるプラから1人引き抜いて target へ移す */
function moveVeteranInto_(state, ctx, targetIndex) {
  for (var i = 0; i < state.puras.length; i++) {
    if (i === targetIndex) continue;
    var source = state.puras[i];
    if (countVeterans_(source, ctx) < 2) continue;
    for (var j = 0; j < source.memberIds.length; j++) {
      var id = source.memberIds[j];
      var member = ctx.byId[id];
      if (!member || !member.isVeteran) continue;
      source.memberIds.splice(j, 1);
      if (canPlace_(state, ctx, id, targetIndex)) {
        state.puras[targetIndex].memberIds.push(id);
        return true;
      }
      source.memberIds.splice(j, 0, id);
    }
  }
  return false;
}

/** 非経験者と経験者を入れ替えて target に経験者を送り込む */
function swapVeteranInto_(state, ctx, config, targetIndex) {
  var target = state.puras[targetIndex];
  for (var i = 0; i < state.puras.length; i++) {
    if (i === targetIndex) continue;
    var source = state.puras[i];
    if (countVeterans_(source, ctx) < 2) continue;
    for (var v = 0; v < source.memberIds.length; v++) {
      var vetId = source.memberIds[v];
      var vet = ctx.byId[vetId];
      if (!vet || !vet.isVeteran) continue;
      for (var n = 0; n < target.memberIds.length; n++) {
        var noviceId = target.memberIds[n];
        if (ctx.byId[noviceId] && ctx.byId[noviceId].isVeteran) continue;
        var candidate = cloneState_(state);
        candidate.puras[i].memberIds.splice(v, 1);
        candidate.puras[targetIndex].memberIds.splice(n, 1);
        candidate.puras[targetIndex].memberIds.push(vetId);
        candidate.puras[i].memberIds.push(noviceId);
        if (hardViolations(candidate, ctx) === 0) {
          state.puras = candidate.puras;
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * 手順4: 局所改善。move / swap / insert をランダムに試し、
 * ハード制約を守ったままスコアが下がる操作だけ採用する（山登り法）。
 */
function localSearch_(state, ctx, config, rng) {
  var best = scoreState(state, ctx, config);
  var typeIndexes = { debate: [], summary: [] };
  for (var i = 0; i < state.puras.length; i++) typeIndexes[state.puras[i].type].push(i);

  for (var iter = 0; iter < config.iterations; iter++) {
    var type = PURA_TYPES[Math.floor(rng() * PURA_TYPES.length)];
    var indexes = typeIndexes[type];
    if (indexes.length === 0) continue;

    var candidate = proposeMove_(state, ctx, indexes, rng);
    if (!candidate) continue;
    if (hardViolations(candidate, ctx) !== 0) continue;

    var score = scoreState(candidate, ctx, config);
    if (score < best - 1e-9) {
      state.puras = candidate.puras;
      best = score;
    }
  }
  return best;
}

function proposeMove_(state, ctx, indexes, rng) {
  var candidate = cloneState_(state);
  var pIndex = indexes[Math.floor(rng() * indexes.length)];
  var pura = candidate.puras[pIndex];
  var roll = rng();

  if (roll < 0.4) {
    // insert: そのタイプに未配置のメンバーを入れる
    var pool = [];
    for (var i = 0; i < ctx.members.length; i++) {
      var id = ctx.members[i].memberId;
      if (!hasTypeAssignment_(candidate, id, pura.type)) pool.push(id);
    }
    if (!pool.length) return null;
    pura.memberIds.push(pool[Math.floor(rng() * pool.length)]);
    return candidate;
  }

  if (!pura.memberIds.length) return null;
  var mPos = Math.floor(rng() * pura.memberIds.length);
  var memberId = pura.memberIds[mPos];

  if (roll < 0.55) {
    // remove: 超過しているプラから抜く
    pura.memberIds.splice(mPos, 1);
    return candidate;
  }

  if (indexes.length < 2) return null;
  var qIndex = pIndex;
  while (qIndex === pIndex) qIndex = indexes[Math.floor(rng() * indexes.length)];
  var other = candidate.puras[qIndex];

  if (roll < 0.8) {
    // move: 同じタイプの別のプラへ移す
    pura.memberIds.splice(mPos, 1);
    other.memberIds.push(memberId);
    return candidate;
  }

  // swap: 2つのプラのメンバーを入れ替える
  if (!other.memberIds.length) return null;
  var oPos = Math.floor(rng() * other.memberIds.length);
  var otherId = other.memberIds[oPos];
  pura.memberIds[mPos] = otherId;
  other.memberIds[oPos] = memberId;
  return candidate;
}

function hasTypeAssignment_(state, memberId, type) {
  for (var i = 0; i < state.puras.length; i++) {
    if (state.puras[i].type !== type) continue;
    if (state.puras[i].memberIds.indexOf(memberId) >= 0) return true;
  }
  return false;
}

/**
 * 編成の実行。
 * @param {Array} members 名簿
 * @param {Object} config 設定（省略時は既定値）
 * @return {{puras: Array, score: number, slots: Object}}
 */
function solve(members, config) {
  var cfg = mergeConfig(config);
  var ctx = buildContext_(members || []);
  var slots = selectSlots(ctx, cfg);

  var best = null;
  var bestScore = Infinity;

  for (var r = 0; r < Math.max(1, cfg.restarts); r++) {
    var rng = createRng(cfg.seed + r * 7919);
    var state = { puras: createPuras_(slots) };
    greedyAssign_(state, ctx, cfg, rng);
    repairVeterans_(state, ctx, cfg);
    localSearch_(state, ctx, cfg, rng);

    if (hardViolations(state, ctx) !== 0) continue;
    var score = scoreState(state, ctx, cfg);
    if (score < bestScore) {
      bestScore = score;
      best = cloneState_(state);
    }
  }

  if (!best) best = { puras: createPuras_(slots) };

  var finalScore = bestScore === Infinity ? scoreState(best, ctx, cfg) : bestScore;

  // 誰も入らなかったプラは開催しない。探索中は空きプラにも人数不足の
  // ペナルティを課して充填を促すが、結果として空のままなら出力に含めない。
  best.puras = best.puras.filter(function (p) {
    return p.memberIds.length > 0;
  });

  // プラの並びを曜日・時限順にそろえてから返す
  best.puras.sort(function (a, b) {
    if (a.type !== b.type) return a.type === 'debate' ? -1 : 1;
    var sa = parseSlotId(a.slotId);
    var sb = parseSlotId(b.slotId);
    if (sa.dayIndex !== sb.dayIndex) return sa.dayIndex - sb.dayIndex;
    return sa.period - sb.period;
  });

  return { puras: best.puras, score: finalScore, slots: slots };
}
