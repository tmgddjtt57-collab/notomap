/**
 * ESSプラシフト - Googleフォームの生成とトリガー登録
 *
 * 管理者の作業をここで終わらせる。以降はメンバーがフォームへ回答するだけで
 * 名簿と仮シフトが更新される。
 */

/**
 * フォームを作成し、回答先を本スプレッドシートへ設定して
 * 回答送信トリガーを登録する。URLは設定シートへ保存する。
 */
function createForm() {
  var ui = SpreadsheetApp.getUi();
  var ss = getSs_();

  var existing = String(getSetting_(CONFIG_KEYS.FORM_URL) || '').trim();
  if (existing) {
    var answer = ui.alert(
      'フォームは作成済みです',
      '既存のフォームを置き換えて新しく作りますか。\n'
        + '既存の回答は新しいフォームには引き継がれません。\n\n'
        + existing,
      ui.ButtonSet.YES_NO
    );
    if (answer !== ui.Button.YES) return;
  }

  var form = FormApp.create(FORM.TITLE);
  form.setDescription(
    '参加可能なコマを教えてください。\n'
      + '回答内容をもとに、ディベートプラとサマリープラを自動編成します。\n'
      + '同じ人が複数回答した場合は最後の回答を使います。'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);

  form.addTextItem().setTitle(FORM.Q_NAME).setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(FORM.Q_GENDER)
    .setChoiceValues(FORM.GENDER_CHOICES)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(FORM.Q_VETERAN)
    .setHelpText('経験者または役職者の方は「はい」を選んでください。各プラに最低1人配置します。')
    .setChoiceValues(FORM.VETERAN_CHOICES)
    .setRequired(true);

  // 30個のチェックボックスを1問に詰め込むと回答負荷が高いので曜日ごとに分ける
  for (var d = 0; d < DAYS.length; d++) {
    form.addCheckboxItem()
      .setTitle(dayQuestionTitle(DAYS[d]))
      .setChoiceValues(periodChoices());
  }

  form.addParagraphTextItem()
    .setTitle(FORM.Q_NOTE)
    .setHelpText('参加できない日や、配慮してほしいことがあれば書いてください。');

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  setSetting_(CONFIG_KEYS.FORM_URL, form.getEditUrl());
  installFormSubmitTrigger_();

  ui.alert(
    'フォームを作成しました',
    'メンバーへ配布するURL:\n' + form.getPublishedUrl()
      + '\n\n編集用URL:\n' + form.getEditUrl()
      + '\n\n回答が届くたびに名簿と仮シフトが更新されます。',
    ui.ButtonSet.OK
  );
}

/** 二重登録を避けつつ回答送信トリガーを設置する */
function installFormSubmitTrigger_() {
  var ss = getSs_();
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmitHandler') return;
  }
  ScriptApp.newTrigger('onFormSubmitHandler')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
}

/** 既存のフォームを後から紐づける場合の入口 */
function linkExistingForm() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    '既存フォームを紐づけ',
    'フォームの編集用URLを貼り付けてください。',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var url = response.getResponseText().trim();
  if (!url) return;

  try {
    var form = FormApp.openByUrl(url);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, getSs_().getId());
    setSetting_(CONFIG_KEYS.FORM_URL, form.getEditUrl());
    installFormSubmitTrigger_();
    ui.alert('紐づけました。「回答を再取り込み」で既存の回答を名簿へ反映できます。');
  } catch (err) {
    ui.alert('フォームを開けませんでした: ' + err.message);
  }
}
