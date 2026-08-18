/**
 * ESSプラシフト - メニュー
 *
 * 管理者が触るのはこのメニューだけで済むようにする。
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('ESSプラシフト')
    .addItem('① フォームを作成', 'createForm')
    .addItem('既存フォームを紐づけ', 'linkExistingForm')
    .addSeparator()
    .addItem('② 学期を作成', 'createSemester')
    .addItem('③ 仮シフトを再計算', 'recalculateDraftFromMenu')
    .addItem('④ シフトを確定', 'confirmShift')
    .addSeparator()
    .addItem('確定を解除', 'unconfirmShift')
    .addItem('回答を再取り込み', 'importAllResponses')
    .addItem('回答状況を表示', 'showRosterStatus')
    .addSeparator()
    .addItem('初期設定', 'initialize')
    .addToUi();
}

/** メニューからの再計算は結果をダイアログで知らせる */
function recalculateDraftFromMenu() {
  recalculateDraft(false);
}

/** 必要なシートを作り、設定へ既定値を入れる */
function initialize() {
  ensureConfigSheet_();
  getOrCreateSheet_(SHEET.ROSTER, ROSTER_HEADER);
  getOrCreateSheet_(SHEET.DETAIL, DETAIL_HEADER);
  getOrCreateSheet_(SHEET.WARNING, WARNING_HEADER);
  getOrCreateSheet_(SHEET.HISTORY, HISTORY_HEADER);
  getOrCreateSheet_(SHEET.SHIFT, null);

  SpreadsheetApp.getUi().alert(
    '初期設定が完了しました',
    'シートを作成しました。次の順で進めてください。\n\n'
      + '① フォームを作成 → URLをメンバーへ配布\n'
      + '② 学期を作成\n'
      + '③ 回答が集まったら仮シフトを確認\n'
      + '④ シフトを確定\n\n'
      + '人数の上下限や優先度は「設定」シートで変更できます。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
