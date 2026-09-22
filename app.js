/* のとのおと美術館デジタルマップ
   構成:
     1. 設定          2. 自治体データ    3. 多言語
     4. 状態          5. 起動と結線      6. 表示
     7. 地図          8. 編集フォーム    9. 位置情報
    10. GitHub 連携  11. 共通処理
*/

/* ============================ 1. 設定 ============================ */

const REPO = "tmgddjtt57-collab/notomap";
const BRANCH = "main";
const DATA = "data/spots.json";
const MEDIA = "media/spots";
const PASS = "noto2026";

/* 保存キーは従来のまま。更新後も token と言語設定を引き継ぐ。 */
const LS = "noto-no-oto-spots-v5";
const LANG = "noto-no-oto-lang";
const EDIT = "noto-no-oto-editor";
const GHCFG = "noto-no-oto-gh-cfg";
const GHTOKEN = "noto-no-oto-gh-token";
const THEME = "noto-no-oto-theme";
const TEXTSIZE = "noto-no-oto-textsize";
const VIEW = "noto-no-oto-view";
const FORMDRAFT = "noto-no-oto-form-draft";

const MAX_SIDE = 1280;
const JPEG_Q = 0.78;
const NEAR_KM = 30; /* 座標から自治体を推定するときの上限距離 */

/* ======================== 2. 自治体データ ======================== */

/* 能登地方12市町（河北郡の津幡町・内灘町を含む）+ 氷見市。
   lat/lng は役所の位置で、本文に地名が無いときの推定に使う。
   aliases は本文・ハッシュタグの表記ゆれと、判別できる地名。 */
const MUNICIPAL = [
  { ja: "七尾市", en: "Nanao", ko: "나나오시", zh: "七尾市", lat: 37.0433, lng: 136.9676,
    aliases: ["七尾", "nanao", "和倉", "wakura", "中島町"] },
  { ja: "輪島市", en: "Wajima", ko: "와지마시", zh: "轮岛市", lat: 37.3906, lng: 136.8991,
    aliases: ["輪島", "wajima", "outerwajima", "門前", "monzen", "白米千枚田", "曽々木",
              "のと里山空港", "noto satoyama airport", "notosatoyamaairport"] },
  { ja: "珠洲市", en: "Suzu", ko: "스즈시", zh: "珠洲市", lat: 37.4360, lng: 137.2611,
    aliases: ["珠洲", "suzu", "禄剛崎", "見附島"] },
  { ja: "羽咋市", en: "Hakui", ko: "하쿠이시", zh: "羽咋市", lat: 36.8931, lng: 136.7792,
    aliases: ["羽咋", "hakui", "千里浜", "chirihama"] },
  { ja: "かほく市", en: "Kahoku", ko: "가호쿠시", zh: "河北市", lat: 36.7166, lng: 136.7085,
    aliases: ["かほく", "kahoku", "高松町", "宇ノ気"] },
  { ja: "津幡町", en: "Tsubata", ko: "쓰바타마치", zh: "津幡町", lat: 36.6683, lng: 136.7292,
    aliases: ["津幡", "tsubata", "倶利伽羅", "河北潟"] },
  { ja: "内灘町", en: "Uchinada", ko: "우치나다마치", zh: "内滩町", lat: 36.6486, lng: 136.6503,
    aliases: ["内灘", "uchinada"] },
  { ja: "志賀町", en: "Shika", ko: "시카마치", zh: "志贺町", lat: 37.0061, lng: 136.7791,
    aliases: ["志賀", "shika", "富来", "巌門", "増穂浦"] },
  { ja: "宝達志水町", en: "Hodatsushimizu", ko: "호다쓰시미즈마치", zh: "宝达志水町", lat: 36.8089, lng: 136.7981,
    aliases: ["宝達志水", "宝達", "志水", "hodatsushimizu", "hodatsu"] },
  { ja: "中能登町", en: "Nakanoto", ko: "나카노토마치", zh: "中能登町", lat: 36.9391, lng: 136.8770,
    aliases: ["中能登", "nakanoto", "鹿島", "鳥屋", "鹿西"] },
  { ja: "穴水町", en: "Anamizu", ko: "아나미즈마치", zh: "穴水町", lat: 37.2288, lng: 136.9062,
    aliases: ["穴水", "anamizu"] },
  { ja: "能登町", en: "Noto Town", ko: "노토초", zh: "能登町", lat: 37.3062, lng: 137.1520,
    aliases: ["能登町", "noto town", "nototown", "宇出津", "小木", "九十九湾", "恋路"] },
  { ja: "氷見市", en: "Himi", ko: "히미시", zh: "冰见市", lat: 36.8570, lng: 136.9876,
    aliases: ["氷見", "himi", "himi city", "himicity", "히미", "冰见"] },
];

/* どの自治体にも当てはまらないときの既定 */
const REGION = { ja: "能登半島", en: "Noto Peninsula", ko: "노토반도", zh: "能登半岛" };

/* 地図の初期表示範囲（能登半島と氷見市が収まる矩形） */
const HOME_BOUNDS = [[36.62, 136.48], [37.58, 137.40]];


/* ========================== 3. 多言語 ========================== */

const I = {
  ja: {
    siteTitle: "のとのおと美術館デジタルマップ",
    eyebrow: "Noto Peninsula Digital Museum",
    skipToMap: "本文へ移動",
    museum: "のとのおと美術館",
    museumAria: "のとのおと美術館のサイトを新しいタブで開く",
    language: "言語",
    settings: "表示と設定",
    settingsOpen: "表示と設定を開く",
    display: "表示",
    theme: "配色",
    themeSystem: "端末に合わせる",
    themeLight: "明るい",
    themeDark: "暗い",
    textSize: "文字の大きさ",
    textNormal: "標準",
    textLarge: "大きい",
    role: "権限",
    viewerMode: "閲覧者",
    editorMode: "編集者",
    editorTools: "編集者の道具",
    syncButton: "GitHub に接続",
    exportButton: "JSON を書き出す",
    importButton: "JSON を読み込む",
    regionEyebrow: "能登半島・氷見市",
    regionTitle: "能登・氷見の風景をめぐるデジタル美術館",
    regionCopy: "能登半島と氷見市の海、里山、集落、季節の色を写真と位置情報で記録し、世界の来訪者に紹介する地図です。",
    groups: "市区町村",
    groupsHint: "市区町村を選ぶと、地図と一覧が絞り込まれます。",
    all: "すべて",
    photos: "写真",
    photoCount: "{count}件",
    newPost: "新しく投稿",
    editorPanel: "編集パネル",
    formTitle: "写真を地図に表示",
    formTitleEdit: "投稿を修正",
    editingNotice: "「{title}」を修正しています。",
    uploadPhoto: "写真",
    choosePhoto: "写真を選ぶ（複数可）",
    addPhoto: "写真を追加",
    currentPhotos: "登録済みの写真",
    newPhotos: "追加する写真",
    removePhoto: "{name}を削除",
    photoRemoved: "写真を1枚外しました。保存すると反映されます。",
    pasteImport: "貼り付けて自動入力",
    pastePlaceholder: "タイトル・説明・位置情報をまとめて貼り付け",
    applyPaste: "反映する",
    title: "タイトル",
    description: "説明",
    locationInfo: "位置情報",
    locationHint: "「37°22'14.5\"N 137°14'25.7\"E」や「37.370694, 137.240472」の形式で入力できます。",
    currentLocation: "現在地を使う",
    pickOnMap: "地図で指定",
    pickOnMapActive: "地図を押して位置を決めてください。",
    group: "市区町村",
    groupAuto: "自動で判定",
    latitude: "緯度",
    longitude: "経度",
    coordDetail: "緯度・経度を直接入力",
    delete: "削除",
    deleteConfirm: "「{title}」を削除します。よろしいですか。",
    deleted: "投稿を削除しました。",
    reset: "入力を消す",
    cancelEdit: "修正をやめる",
    save: "地図に表示",
    saveEdit: "修正を保存",
    detail: "写真の詳細",
    close: "閉じる",
    edit: "この投稿を修正",
    editShort: "修正",
    editorAccess: "Editor access",
    passkeyTitle: "編集者パスワードを入力",
    passkeyCopy: "編集者画面は閲覧者用とは別にしています。",
    password: "パスワード",
    passkeyError: "パスワードが違います。",
    cancel: "キャンセル",
    unlock: "開く",
    syncTitle: "全デバイスに反映",
    syncCopy: "GitHub token を入れると、投稿・修正・削除が公開サイトの data/spots.json と media/spots に保存されます。",
    repo: "リポジトリ",
    branch: "ブランチ",
    token: "GitHub token",
    tokenCopy: "token はこのブラウザ内だけに保存されます。",
    tokenStored: "このブラウザに保存済みの token があります。新しい token を入れると置き換わります。",
    connect: "接続",
    postComplete: "投稿が完了しました。地図に反映しました。",
    updateComplete: "修正を保存しました。",
    postCompleteMany: "{count}件の投稿が完了しました。",
    noPhotos: "まだ投稿がありません。",
    noPreview: "写真を選ぶと、ここに表示されます。",
    photoTitle: "写真{index}のタイトル",
    photoDescription: "写真{index}の説明",
    photoLocation: "写真{index}の位置情報",
    invalidLocation: "位置情報を確認してください。タイトルと位置情報は必須です。",
    saving: "GitHub に保存しています。",
    syncRequired: "全デバイスに保存するため、先に GitHub に接続してください。",
    syncConnected: "GitHub に接続しました。投稿を全デバイスに保存できます。",
    syncSaved: "GitHub に保存しました。すべてのデバイスに反映されます。",
    syncFailed: "GitHub への保存に失敗しました。",
    tokenInvalid: "GitHub token が無効か期限切れです。新しい token を発行して入れ直してください。",
    mapLibraryMissing: "地図ライブラリを読み込めませんでした。通信状況を確認してください。",
    selected: "選択中",
    showMore: "続きを読む",
    showLess: "閉じる",
    find: "さがす",
    search: "検索",
    searchPlaceholder: "題名・説明・地名・タグ",
    searchClear: "検索語を消す",
    topics: "様式・主題",
    artists: "作家",
    clearFilters: "絞り込みを解除",
    sortBy: "並べ替え",
    sortNew: "新しい順",
    sortOld: "古い順",
    sortArchive: "Archive番号順",
    sortTitle: "題名順",
    viewList: "一覧",
    viewGrid: "写真",
    viewMode: "表示の形",
    share: "共有",
    linkCopied: "リンクをコピーしました。",
    route: "ここへ行く",
    cardImage: "カード画像",
    cardMaking: "カード画像を作っています。",
    cardDone: "カード画像を保存しました。",
    cardFailed: "カード画像を作れませんでした。",
    takenAt: "撮影日",
    postedAt: "投稿日",
    prevWork: "前の作品",
    nextWork: "次の作品",
    nearby: "近くの作品",
    draft: "下書き",
    isDraft: "下書きにする（公開しない）",
    draftRestored: "書きかけの入力を戻しました。",
    undo: "元に戻す",
    restored: "投稿を元に戻しました。",
    exifLocation: "写真の撮影位置を読み取りました。",
    layerStandard: "標準地図",
    layerPhoto: "航空写真",
    layerPale: "淡色地図",
    bulk: "市区町村を一括で変える",
    bulkTitle: "市区町村の一括付け替え",
    bulkFrom: "対象",
    bulkTo: "変更先",
    bulkAll: "いま絞り込んでいる分",
    bulkCount: "{count}件が対象です。",
    bulkDone: "{count}件の市区町村を変えました。",
    bulkApply: "まとめて変える",
  },
  en: {
    siteTitle: "Noto no Oto Museum Digital Map",
    eyebrow: "Noto Peninsula Digital Museum",
    skipToMap: "Skip to main content",
    museum: "Noto no Oto Museum",
    museumAria: "Open the Noto no Oto Museum site in a new tab",
    language: "Language",
    settings: "Display and settings",
    settingsOpen: "Open display and settings",
    display: "Display",
    theme: "Colour theme",
    themeSystem: "Match device",
    themeLight: "Light",
    themeDark: "Dark",
    textSize: "Text size",
    textNormal: "Standard",
    textLarge: "Large",
    role: "Role",
    viewerMode: "Viewer",
    editorMode: "Editor",
    editorTools: "Editor tools",
    syncButton: "Connect to GitHub",
    exportButton: "Export JSON",
    importButton: "Import JSON",
    regionEyebrow: "Noto Peninsula and Himi City",
    regionTitle: "A digital museum for Noto and Himi landscapes",
    regionCopy: "A map sharing the sea, villages, seasons and cultural memory of the Noto Peninsula and Himi City through photos and location data.",
    groups: "Municipality",
    groupsHint: "Choose a municipality to filter the map and the list.",
    all: "All",
    photos: "Photos",
    photoCount: "{count}",
    newPost: "New post",
    editorPanel: "Editor panel",
    formTitle: "Put a photo on the map",
    formTitleEdit: "Edit this post",
    editingNotice: "Editing “{title}”.",
    uploadPhoto: "Photo",
    choosePhoto: "Choose photos",
    addPhoto: "Add photos",
    currentPhotos: "Photos already saved",
    newPhotos: "Photos to add",
    removePhoto: "Remove {name}",
    photoRemoved: "One photo removed. Save to apply.",
    pasteImport: "Paste to fill in",
    pastePlaceholder: "Paste a title, description and location together",
    applyPaste: "Apply",
    title: "Title",
    description: "Description",
    locationInfo: "Location",
    locationHint: "Accepts 37°22'14.5\"N 137°14'25.7\"E or 37.370694, 137.240472.",
    currentLocation: "Use current location",
    pickOnMap: "Pick on map",
    pickOnMapActive: "Tap the map to set the location.",
    group: "Municipality",
    groupAuto: "Detected automatically",
    latitude: "Latitude",
    longitude: "Longitude",
    coordDetail: "Enter latitude and longitude directly",
    delete: "Delete",
    deleteConfirm: "Delete “{title}”?",
    deleted: "The post was deleted.",
    reset: "Clear the form",
    cancelEdit: "Stop editing",
    save: "Add to map",
    saveEdit: "Save changes",
    detail: "Photo details",
    close: "Close",
    edit: "Edit this post",
    editShort: "Edit",
    editorAccess: "Editor access",
    passkeyTitle: "Enter the editor password",
    passkeyCopy: "The editor view is separate from the viewer one.",
    password: "Password",
    passkeyError: "That password is not correct.",
    cancel: "Cancel",
    unlock: "Open",
    syncTitle: "Publish to every device",
    syncCopy: "With a GitHub token, posts, edits and deletions are saved to data/spots.json and media/spots on the published site.",
    repo: "Repository",
    branch: "Branch",
    token: "GitHub token",
    tokenCopy: "The token is stored only in this browser.",
    tokenStored: "A token is already saved in this browser. Entering a new one replaces it.",
    connect: "Connect",
    postComplete: "Posted. It is now on the map.",
    updateComplete: "Your changes were saved.",
    postCompleteMany: "{count} posts published.",
    noPhotos: "No posts yet.",
    noPreview: "Chosen photos appear here.",
    photoTitle: "Title for photo {index}",
    photoDescription: "Description for photo {index}",
    photoLocation: "Location for photo {index}",
    invalidLocation: "Check the location. A title and a location are required.",
    saving: "Saving to GitHub.",
    syncRequired: "Connect to GitHub first to save this for every device.",
    syncConnected: "Connected to GitHub. Posts can now be saved for every device.",
    syncSaved: "Saved to GitHub. It will appear on every device.",
    syncFailed: "Saving to GitHub failed.",
    tokenInvalid: "The GitHub token is invalid or has expired. Issue a new token and enter it again.",
    mapLibraryMissing: "The map library could not be loaded. Please check your connection.",
    selected: "Selected",
    showMore: "Read more",
    showLess: "Show less",
    find: "Find",
    search: "Search",
    searchPlaceholder: "Title, text, place or tag",
    searchClear: "Clear the search",
    topics: "Style and theme",
    artists: "Artists",
    clearFilters: "Clear filters",
    sortBy: "Sort",
    sortNew: "Newest first",
    sortOld: "Oldest first",
    sortArchive: "By archive number",
    sortTitle: "By title",
    viewList: "List",
    viewGrid: "Photos",
    viewMode: "View",
    share: "Share",
    linkCopied: "Link copied.",
    route: "Directions",
    cardImage: "Card image",
    cardMaking: "Making the card image.",
    cardDone: "Card image saved.",
    cardFailed: "The card image could not be made.",
    takenAt: "Taken",
    postedAt: "Posted",
    prevWork: "Previous",
    nextWork: "Next",
    nearby: "Nearby works",
    draft: "Draft",
    isDraft: "Keep as a draft (not published)",
    draftRestored: "Your unsaved entry was restored.",
    undo: "Undo",
    restored: "The post was restored.",
    exifLocation: "Location read from the photo.",
    layerStandard: "Standard",
    layerPhoto: "Aerial",
    layerPale: "Pale",
    bulk: "Reassign municipalities",
    bulkTitle: "Reassign municipalities",
    bulkFrom: "From",
    bulkTo: "To",
    bulkAll: "Everything currently filtered",
    bulkCount: "{count} works selected.",
    bulkDone: "{count} works reassigned.",
    bulkApply: "Reassign",
  },
  ko: {
    siteTitle: "노토노오토 미술관 디지털 지도",
    eyebrow: "Noto Peninsula Digital Museum",
    skipToMap: "본문으로 이동",
    museum: "노토노오토 미술관",
    museumAria: "노토노오토 미술관 사이트를 새 탭에서 열기",
    language: "언어",
    settings: "표시 및 설정",
    settingsOpen: "표시 및 설정 열기",
    display: "표시",
    theme: "색상",
    themeSystem: "기기 설정 따르기",
    themeLight: "밝게",
    themeDark: "어둡게",
    textSize: "글자 크기",
    textNormal: "보통",
    textLarge: "크게",
    role: "권한",
    viewerMode: "열람자",
    editorMode: "편집자",
    editorTools: "편집 도구",
    syncButton: "GitHub 연결",
    exportButton: "JSON 내보내기",
    importButton: "JSON 가져오기",
    regionEyebrow: "노토반도・히미시",
    regionTitle: "노토와 히미의 풍경을 기록하는 디지털 미술관",
    regionCopy: "노토반도와 히미시의 바다, 마을, 계절과 문화의 기억을 사진과 위치 정보로 소개하는 지도입니다.",
    groups: "시정촌",
    groupsHint: "시정촌을 선택하면 지도와 목록이 좁혀집니다.",
    all: "전체",
    photos: "사진",
    photoCount: "{count}건",
    newPost: "새 게시",
    editorPanel: "편집 패널",
    formTitle: "사진을 지도에 표시",
    formTitleEdit: "게시물 수정",
    editingNotice: "“{title}”을(를) 수정하고 있습니다.",
    uploadPhoto: "사진",
    choosePhoto: "사진 선택(여러 장 가능)",
    addPhoto: "사진 추가",
    currentPhotos: "저장된 사진",
    newPhotos: "추가할 사진",
    removePhoto: "{name} 삭제",
    photoRemoved: "사진 한 장을 뺐습니다. 저장하면 반영됩니다.",
    pasteImport: "붙여넣어 자동 입력",
    pastePlaceholder: "제목・설명・위치 정보를 한꺼번에 붙여넣기",
    applyPaste: "반영",
    title: "제목",
    description: "설명",
    locationInfo: "위치 정보",
    locationHint: "37°22'14.5\"N 137°14'25.7\"E 또는 37.370694, 137.240472 형식을 지원합니다.",
    currentLocation: "현재 위치 사용",
    pickOnMap: "지도에서 지정",
    pickOnMapActive: "지도를 눌러 위치를 정하세요.",
    group: "시정촌",
    groupAuto: "자동 판정",
    latitude: "위도",
    longitude: "경도",
    coordDetail: "위도・경도 직접 입력",
    delete: "삭제",
    deleteConfirm: "“{title}”을(를) 삭제할까요?",
    deleted: "게시물을 삭제했습니다.",
    reset: "입력 지우기",
    cancelEdit: "수정 취소",
    save: "지도에 표시",
    saveEdit: "수정 저장",
    detail: "사진 상세",
    close: "닫기",
    edit: "이 게시물 수정",
    editShort: "수정",
    editorAccess: "Editor access",
    passkeyTitle: "편집자 비밀번호 입력",
    passkeyCopy: "편집자 화면은 열람자용과 분리되어 있습니다.",
    password: "비밀번호",
    passkeyError: "비밀번호가 올바르지 않습니다.",
    cancel: "취소",
    unlock: "열기",
    syncTitle: "모든 기기에 반영",
    syncCopy: "GitHub token을 입력하면 게시・수정・삭제가 공개 사이트에 저장됩니다.",
    repo: "저장소",
    branch: "브랜치",
    token: "GitHub token",
    tokenCopy: "token은 이 브라우저에만 저장됩니다.",
    tokenStored: "이 브라우저에 저장된 token이 있습니다. 새 token을 입력하면 교체됩니다.",
    connect: "연결",
    postComplete: "게시했습니다. 지도에 반영했습니다.",
    updateComplete: "수정을 저장했습니다.",
    postCompleteMany: "{count}건을 게시했습니다.",
    noPhotos: "아직 게시물이 없습니다.",
    noPreview: "선택한 사진이 여기에 표시됩니다.",
    photoTitle: "사진 {index}의 제목",
    photoDescription: "사진 {index}의 설명",
    photoLocation: "사진 {index}의 위치 정보",
    invalidLocation: "위치 정보를 확인해 주세요. 제목과 위치는 필수입니다.",
    saving: "GitHub에 저장하고 있습니다.",
    syncRequired: "모든 기기에 저장하려면 먼저 GitHub에 연결하세요.",
    syncConnected: "GitHub에 연결되었습니다.",
    syncSaved: "GitHub에 저장했습니다.",
    syncFailed: "GitHub 저장에 실패했습니다.",
    tokenInvalid: "GitHub token이 유효하지 않거나 만료되었습니다. 새 token을 발급해 다시 입력해 주세요.",
    mapLibraryMissing: "지도 라이브러리를 불러오지 못했습니다.",
    selected: "선택됨",
    showMore: "더 보기",
    showLess: "접기",
    find: "찾기",
    search: "검색",
    searchPlaceholder: "제목・설명・지명・태그",
    searchClear: "검색어 지우기",
    topics: "양식・주제",
    artists: "작가",
    clearFilters: "필터 해제",
    sortBy: "정렬",
    sortNew: "최신순",
    sortOld: "오래된순",
    sortArchive: "Archive 번호순",
    sortTitle: "제목순",
    viewList: "목록",
    viewGrid: "사진",
    viewMode: "보기 형식",
    share: "공유",
    linkCopied: "링크를 복사했습니다.",
    route: "길찾기",
    cardImage: "카드 이미지",
    cardMaking: "카드 이미지를 만들고 있습니다.",
    cardDone: "카드 이미지를 저장했습니다.",
    cardFailed: "카드 이미지를 만들지 못했습니다.",
    takenAt: "촬영일",
    postedAt: "게시일",
    prevWork: "이전 작품",
    nextWork: "다음 작품",
    nearby: "가까운 작품",
    draft: "초안",
    isDraft: "초안으로 저장(비공개)",
    draftRestored: "작성 중이던 입력을 복원했습니다.",
    undo: "되돌리기",
    restored: "게시물을 복원했습니다.",
    exifLocation: "사진에서 촬영 위치를 읽었습니다.",
    layerStandard: "표준 지도",
    layerPhoto: "항공사진",
    layerPale: "담색 지도",
    bulk: "시정촌 일괄 변경",
    bulkTitle: "시정촌 일괄 변경",
    bulkFrom: "대상",
    bulkTo: "변경 후",
    bulkAll: "현재 필터된 전체",
    bulkCount: "{count}건이 대상입니다.",
    bulkDone: "{count}건의 시정촌을 변경했습니다.",
    bulkApply: "일괄 변경",
  },
  zh: {
    siteTitle: "能登之音美术馆数字地图",
    eyebrow: "Noto Peninsula Digital Museum",
    skipToMap: "跳到正文",
    museum: "能登之音美术馆",
    museumAria: "在新标签页打开能登之音美术馆网站",
    language: "语言",
    settings: "显示与设置",
    settingsOpen: "打开显示与设置",
    display: "显示",
    theme: "配色",
    themeSystem: "跟随设备",
    themeLight: "浅色",
    themeDark: "深色",
    textSize: "文字大小",
    textNormal: "标准",
    textLarge: "较大",
    role: "权限",
    viewerMode: "浏览者",
    editorMode: "编辑者",
    editorTools: "编辑工具",
    syncButton: "连接 GitHub",
    exportButton: "导出 JSON",
    importButton: "导入 JSON",
    regionEyebrow: "能登半岛・冰见市",
    regionTitle: "记录能登与冰见风景的数字美术馆",
    regionCopy: "用照片和位置信息介绍能登半岛与冰见市的海、村落、季节和文化记忆的地图。",
    groups: "市区町村",
    groupsHint: "选择市区町村后，地图和列表会随之筛选。",
    all: "全部",
    photos: "照片",
    photoCount: "{count}条",
    newPost: "新建投稿",
    editorPanel: "编辑面板",
    formTitle: "把照片放到地图上",
    formTitleEdit: "修改投稿",
    editingNotice: "正在修改“{title}”。",
    uploadPhoto: "照片",
    choosePhoto: "选择照片（可多选）",
    addPhoto: "添加照片",
    currentPhotos: "已保存的照片",
    newPhotos: "要添加的照片",
    removePhoto: "删除{name}",
    photoRemoved: "已移除一张照片。保存后生效。",
    pasteImport: "粘贴自动填写",
    pastePlaceholder: "把标题、说明、位置信息一起粘贴",
    applyPaste: "应用",
    title: "标题",
    description: "说明",
    locationInfo: "位置信息",
    locationHint: "支持 37°22'14.5\"N 137°14'25.7\"E 或 37.370694, 137.240472。",
    currentLocation: "使用当前位置",
    pickOnMap: "在地图上指定",
    pickOnMapActive: "请点按地图确定位置。",
    group: "市区町村",
    groupAuto: "自动判定",
    latitude: "纬度",
    longitude: "经度",
    coordDetail: "直接输入纬度和经度",
    delete: "删除",
    deleteConfirm: "要删除“{title}”吗？",
    deleted: "已删除该投稿。",
    reset: "清空输入",
    cancelEdit: "取消修改",
    save: "显示到地图",
    saveEdit: "保存修改",
    detail: "照片详情",
    close: "关闭",
    edit: "修改这条投稿",
    editShort: "修改",
    editorAccess: "Editor access",
    passkeyTitle: "请输入编辑者密码",
    passkeyCopy: "编辑者界面与浏览者界面是分开的。",
    password: "密码",
    passkeyError: "密码不正确。",
    cancel: "取消",
    unlock: "打开",
    syncTitle: "同步到所有设备",
    syncCopy: "输入 GitHub token 后，投稿、修改和删除会保存到公开站点。",
    repo: "仓库",
    branch: "分支",
    token: "GitHub token",
    tokenCopy: "token 只保存在此浏览器中。",
    tokenStored: "此浏览器已保存 token。输入新的 token 会替换它。",
    connect: "连接",
    postComplete: "投稿完成，已显示在地图上。",
    updateComplete: "修改已保存。",
    postCompleteMany: "已发布{count}条投稿。",
    noPhotos: "还没有投稿。",
    noPreview: "所选照片会显示在这里。",
    photoTitle: "照片{index}的标题",
    photoDescription: "照片{index}的说明",
    photoLocation: "照片{index}的位置信息",
    invalidLocation: "请确认位置信息。标题和位置为必填。",
    saving: "正在保存到 GitHub。",
    syncRequired: "要保存到所有设备，请先连接 GitHub。",
    syncConnected: "已连接 GitHub。",
    syncSaved: "已保存到 GitHub。",
    syncFailed: "保存到 GitHub 失败。",
    tokenInvalid: "GitHub token 无效或已过期。请重新签发并输入新的 token。",
    mapLibraryMissing: "无法加载地图库。",
    selected: "已选择",
    showMore: "展开",
    showLess: "收起",
    find: "查找",
    search: "搜索",
    searchPlaceholder: "标题・说明・地名・标签",
    searchClear: "清除搜索词",
    topics: "样式与主题",
    artists: "艺术家",
    clearFilters: "清除筛选",
    sortBy: "排序",
    sortNew: "最新优先",
    sortOld: "最早优先",
    sortArchive: "按 Archive 编号",
    sortTitle: "按标题",
    viewList: "列表",
    viewGrid: "照片",
    viewMode: "显示方式",
    share: "分享",
    linkCopied: "已复制链接。",
    route: "前往这里",
    cardImage: "卡片图片",
    cardMaking: "正在生成卡片图片。",
    cardDone: "已保存卡片图片。",
    cardFailed: "无法生成卡片图片。",
    takenAt: "拍摄日期",
    postedAt: "发布日期",
    prevWork: "上一件",
    nextWork: "下一件",
    nearby: "附近的作品",
    draft: "草稿",
    isDraft: "保存为草稿（不公开）",
    draftRestored: "已恢复未保存的输入。",
    undo: "撤销",
    restored: "已恢复该投稿。",
    exifLocation: "已从照片读取拍摄位置。",
    layerStandard: "标准地图",
    layerPhoto: "航空影像",
    layerPale: "淡色地图",
    bulk: "批量更改市区町村",
    bulkTitle: "批量更改市区町村",
    bulkFrom: "对象",
    bulkTo: "更改为",
    bulkAll: "当前筛选的全部",
    bulkCount: "共 {count} 条。",
    bulkDone: "已更改 {count} 条的市区町村。",
    bulkApply: "批量更改",
  },
};

/* ========================== 4. 状態 ========================== */

const $ = (id) => document.getElementById(id);
const E = {};

const S = {
  lang: store(LANG) || "ja",
  spots: [],
  drafts: [],        /* これから追加する写真 */
  keptPhotos: [],    /* 修正中、残す既存写真 */
  group: "all",
  q: "",             /* 検索語 */
  tags: new Set(),   /* 絞り込み中のタグ */
  sort: "new",
  view: "list",
  selected: "",      /* 地図と一覧で選択中の投稿 */
  editingId: "",     /* フォームで修正中の投稿。selected とは別に持つ */
  role: "viewer",
  markers: new Map(),
  expanded: new Set(),
  pick: false,
  map: null,
  layer: null,
  fitKey: "",
};

/* ======================= 5. 起動と結線 ======================= */

document.addEventListener("DOMContentLoaded", start);

async function start() {
  [
    "skipLink", "languageSelect", "settingsMenu", "settingsPanel", "themeGroup", "textSizeGroup",
    "viewerModeButton", "editorModeButton", "githubSyncButton", "exportButton", "importInput",
    "groupList", "spotList", "spotCount", "newSpotButton", "sidePanel",
    "searchInput", "searchClear", "topicList", "artistList", "tagBox", "artistBox",
    "clearFiltersButton", "sortSelect", "viewToggle",
    "bulkButton", "bulkModal", "bulkForm", "bulkFrom", "bulkTo", "bulkCount", "bulkCancelButton",
    "map", "mapStatus", "detailPanel",
    "editorPanel", "closeEditorButton", "editorTitle", "editingNotice", "spotForm",
    "photoFile", "photoPicker", "currentPhotos", "photoPreview", "pasteInput", "applyPasteButton",
    "titleJa", "descriptionJa", "locationInfo", "currentLocationButton", "pickOnMapButton",
    "spotGroup", "latitude", "longitude", "deleteButton", "resetButton", "submitButton", "submitLabel",
    "passkeyModal", "passkeyForm", "editorPasskeyInput", "passkeyError", "passkeyCancelButton",
    "githubSyncModal", "githubSyncForm", "githubRepoInput", "githubBranchInput", "githubTokenInput",
    "githubSyncStatus", "githubSyncError", "githubSyncCancelButton",
    "toast", "toastText", "lightbox", "lightboxImage", "lightboxCaption", "lightboxClose",
    "lightboxPrev", "lightboxNext", "lightboxPos", "takenAt", "draftToggle", "undoButton",
  ].forEach((id) => (E[id] = $(id)));

  trackHeaderHeight();
  applyTheme(store(THEME) || "system");
  applyTextSize(store(TEXTSIZE) || "normal");
  E.languageSelect.value = S.lang;
  readUrl();          /* ?lang= を i18n() より先に反映する */
  bind();
  i18n();
  initMap();
  S.spots = localSpots();
  render();
  await loadRemote();
  applyUrlSelection();
  render();
  icons();
}

/* ---- 共有できる URL ----
   ?id= で1作品、?group= ?tag= ?q= で絞り込みの状態を持ち回る。 */

function readUrl() {
  const q = new URLSearchParams(location.search);
  if (q.get("lang") && I[q.get("lang")]) {
    S.lang = q.get("lang");
    store(LANG, S.lang);
    E.languageSelect.value = S.lang;
  }
  S.group = q.get("group") || "all";
  S.q = q.get("q") || "";
  E.searchInput.value = S.q;
  (q.get("tag") || "").split(",").filter(Boolean).forEach((t) => S.tags.add(t));
  if (q.get("sort")) S.sort = q.get("sort");
  S.pendingId = q.get("id") || "";
}

function applyUrlSelection() {
  if (!S.pendingId) return;
  const p = S.spots.find((x) => x.id === S.pendingId);
  S.pendingId = "";
  if (p) selectSpot(p.id, false);
}

function syncUrl() {
  const q = new URLSearchParams();
  if (S.selected) q.set("id", S.selected);
  if (S.group !== "all") q.set("group", S.group);
  if (S.tags.size) q.set("tag", [...S.tags].join(","));
  if (S.q.trim()) q.set("q", S.q.trim());
  if (S.sort !== "new") q.set("sort", S.sort);
  if (S.lang !== "ja") q.set("lang", S.lang);
  const url = q.toString() ? `${location.pathname}?${q}` : location.pathname;
  history.replaceState(null, "", url);
}

function shareUrl(id) {
  const q = new URLSearchParams();
  if (id) q.set("id", id);
  if (S.lang !== "ja") q.set("lang", S.lang);
  return `${location.origin}${location.pathname}${q.toString() ? `?${q}` : ""}`;
}

async function share(id) {
  const p = S.spots.find((x) => x.id === id);
  const url = shareUrl(id);
  const title = p ? `${txt(p, "title")}｜${tr("siteTitle")}` : tr("siteTitle");
  try {
    if (navigator.share) { await navigator.share({ title, url }); return; }
    await navigator.clipboard.writeText(url);
    toast(tr("linkCopied"));
  } catch (e) {
    if (e?.name !== "AbortError") status(url);
  }
}

function bind() {
  E.languageSelect.onchange = () => {
    S.lang = E.languageSelect.value;
    store(LANG, S.lang);
    i18n();
    relabelLayers();
    render();
    syncUrl();
  };

  E.themeGroup.onclick = (ev) => {
    const b = ev.target.closest("[data-theme-value]");
    if (b) { applyTheme(b.dataset.themeValue); store(THEME, b.dataset.themeValue); }
  };
  E.textSizeGroup.onclick = (ev) => {
    const b = ev.target.closest("[data-size-value]");
    if (b) { applyTextSize(b.dataset.sizeValue); store(TEXTSIZE, b.dataset.sizeValue); }
  };

  E.editorModeButton.onclick = () =>
    sessionStorage.getItem(EDIT) === "1" ? editor() : openModal(E.passkeyModal, E.editorPasskeyInput);
  E.viewerModeButton.onclick = viewer;
  E.passkeyForm.onsubmit = (ev) => {
    ev.preventDefault();
    if (E.editorPasskeyInput.value !== PASS) {
      E.passkeyError.hidden = false;
      E.editorPasskeyInput.focus();
      return;
    }
    sessionStorage.setItem(EDIT, "1");
    E.editorPasskeyInput.value = "";
    E.passkeyError.hidden = true;
    closeModal(E.passkeyModal);
    editor();
  };
  E.passkeyCancelButton.onclick = () => closeModal(E.passkeyModal);

  E.newSpotButton.onclick = () => {
    resetForm();
    if (restoreFormDraft()) status(tr("draftRestored"));
    openEditor();
    E.titleJa.focus();
  };
  E.closeEditorButton.onclick = closeEditor;
  E.photoFile.onchange = filesChanged;
  E.photoPicker.onclick = () => E.photoFile.click();
  E.photoPicker.onkeydown = (ev) => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); E.photoFile.click(); }
  };
  E.applyPasteButton.onclick = applyPaste;
  E.spotForm.onsubmit = saveForm;
  E.resetButton.onclick = () => { resetForm(); clearFormDraft(); E.titleJa.focus(); };
  E.deleteButton.onclick = () => S.editingId && removeSpot(S.editingId);
  E.currentLocationButton.onclick = useCurrentPosition;
  E.pickOnMapButton.onclick = startPick;
  E.undoButton.onclick = undoDelete;
  ["titleJa", "descriptionJa", "locationInfo", "spotGroup", "latitude", "longitude", "takenAt", "pasteInput"]
    .forEach((id) => { E[id].oninput = saveFormDraft; });
  E.bulkButton.onclick = openBulk;
  E.bulkForm.onsubmit = applyBulk;
  E.bulkCancelButton.onclick = () => closeModal(E.bulkModal);

  E.currentPhotos.onclick = (ev) => {
    const b = ev.target.closest("[data-remove-kept]");
    if (!b) return;
    S.keptPhotos.splice(Number(b.dataset.removeKept), 1);
    renderPhotoFields();
    status(tr("photoRemoved"));
  };
  E.photoPreview.onclick = (ev) => {
    const b = ev.target.closest("[data-remove-draft]");
    if (!b) return;
    const i = Number(b.dataset.removeDraft);
    URL.revokeObjectURL(S.drafts[i]?.preview);
    S.drafts.splice(i, 1);
    renderPhotoFields();
    status(tr("photoRemoved"));
  };
  E.photoPreview.oninput = (ev) => {
    const f = ev.target.closest("[data-draft-field]");
    if (f && S.drafts[f.dataset.index]) S.drafts[f.dataset.index][f.dataset.draftField] = ev.target.value;
  };

  E.githubSyncButton.onclick = () => { fillGh(); openModal(E.githubSyncModal, E.githubTokenInput); };
  E.githubSyncCancelButton.onclick = () => closeModal(E.githubSyncModal);
  E.githubSyncForm.onsubmit = connectGh;
  E.exportButton.onclick = exportJson;
  E.importInput.onchange = importJson;

  E.groupList.onclick = (ev) => {
    const b = ev.target.closest("[data-group]");
    if (b) setGroup(b.dataset.group);
  };

  let searchTimer;
  E.searchInput.oninput = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      S.q = E.searchInput.value;
      S.fitKey = "";
      render();
      syncUrl();
    }, 200);
  };
  E.searchInput.onsearch = () => { S.q = E.searchInput.value; render(); syncUrl(); };
  E.searchClear.onclick = () => { E.searchInput.value = ""; S.q = ""; S.fitKey = ""; render(); syncUrl(); E.searchInput.focus(); };
  E.clearFiltersButton.onclick = clearFilters;

  const tagClick = (ev) => {
    const b = ev.target.closest("[data-tag]");
    if (!b) return;
    const t = b.dataset.tag;
    S.tags.has(t) ? S.tags.delete(t) : S.tags.add(t);
    S.fitKey = "";
    render();
    syncUrl();
  };
  E.topicList.onclick = tagClick;
  E.artistList.onclick = tagClick;

  E.sortSelect.onchange = () => { S.sort = E.sortSelect.value; render(); syncUrl(); };
  E.viewToggle.onclick = (ev) => {
    const b = ev.target.closest("[data-view]");
    if (!b) return;
    S.view = b.dataset.view;
    store(VIEW, S.view);
    render();
  };
  E.spotList.onclick = listClick;
  E.detailPanel.onclick = detailClick;

  E.lightboxClose.onclick = closeLightbox;
  E.lightbox.onclick = (ev) => ev.target === E.lightbox && closeLightbox();
  E.lightboxPrev.onclick = () => stepLightbox(-1);
  E.lightboxNext.onclick = () => stepLightbox(1);

  document.addEventListener("keydown", (ev) => {
    if (E.lightbox.getAttribute("aria-hidden") === "false") {
      if (ev.key === "ArrowLeft") { ev.preventDefault(); return stepLightbox(-1); }
      if (ev.key === "ArrowRight") { ev.preventDefault(); return stepLightbox(1); }
    }
    if (ev.key !== "Escape") return;
    if (E.lightbox.getAttribute("aria-hidden") === "false") return closeLightbox();
    if (E.passkeyModal.getAttribute("aria-hidden") === "false") return closeModal(E.passkeyModal);
    if (E.githubSyncModal.getAttribute("aria-hidden") === "false") return closeModal(E.githubSyncModal);
    if (S.pick) return stopPick();
    if (E.settingsMenu.open) { E.settingsMenu.open = false; return; }
    if (document.body.classList.contains("editor-open")) closeEditor();
  });

  document.addEventListener("click", (ev) => {
    if (E.settingsMenu.open && !E.settingsMenu.contains(ev.target)) E.settingsMenu.open = false;
  });
}

function icons() { if (window.lucide) window.lucide.createIcons(); }

/* ========================== 6. 表示 ========================== */

function i18n() {
  document.documentElement.lang = S.lang;
  document.title = tr("siteTitle");
  document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = tr(n.dataset.i18n)));
  document.querySelectorAll("[data-i18n-placeholder]").forEach((n) =>
    n.setAttribute("placeholder", tr(n.dataset.i18nPlaceholder)));
  document.querySelectorAll("[data-i18n-label]").forEach((n) =>
    n.setAttribute("aria-label", tr(n.dataset.i18nLabel)));
  document.querySelectorAll("[data-i18n-title]").forEach((n) =>
    n.setAttribute("title", tr(n.dataset.i18nTitle)));
}

function render() {
  document.body.classList.toggle("view-grid", S.view === "grid");
  E.sortSelect.value = S.sort;
  E.viewToggle.querySelectorAll("[data-view]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.view === S.view)));
  E.searchClear.hidden = !E.searchInput.value;
  E.clearFiltersButton.hidden = !filtersActive();
  groups();
  tagFilters();
  list();
  markers();
  renderDetail();
  renderPhotoFields();
  icons();
}

/* タグの絞り込み。件数の多い順に出し、選択中のものは必ず見えるようにする。 */
function tagFilters() {
  const paint = (el, box, entries, prefix, label) => {
    if (!entries.length) { box.hidden = true; return; }
    box.hidden = false;
    el.innerHTML = entries.map(([key, v]) => {
      const on = S.tags.has(key);
      return `<button type="button" class="chip chip-sm${on ? " is-on" : ""}" data-tag="${attr(key)}" aria-pressed="${on}">
        <span class="chip-label">${esc(v.label)}</span><span class="chip-count">${v.n}</span></button>`;
    }).join("");
    box.querySelector("summary span.tag-sum").textContent = `${label}（${entries.length}）`;
  };

  const base = S.spots.filter((p) => S.role === "editor" || !p.draft);
  const topics = new Map();
  const artists = new Map();
  base.forEach((p) => {
    (p.topics || []).forEach((t) => {
      const e = topics.get(t) || { label: spaceCamel(t), n: 0 };
      e.n += 1; topics.set(t, e);
    });
    (p.artists || []).forEach((a) => {
      const key = `@${a}`;
      const e = artists.get(key) || { label: spaceCamel(a), n: 0 };
      e.n += 1; artists.set(key, e);
    });
  });
  const rank = (m) => [...m.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label))
    .filter(([k], i) => i < 24 || S.tags.has(k));
  paint(E.topicList, E.tagBox, rank(topics), "", tr("topics"));
  paint(E.artistList, E.artistBox, rank(artists), "@", tr("artists"));
}

function viewer() {
  S.role = "viewer";
  document.body.classList.remove("is-editor", "editor-open");
  document.body.classList.add("is-viewer");
  resetForm();
  E.settingsMenu.open = false;
  render();
}

function editor() {
  S.role = "editor";
  document.body.classList.remove("is-viewer");
  document.body.classList.add("is-editor");
  E.settingsMenu.open = false;
  render();
  E.newSpotButton.focus();
}

function openEditor() {
  if (S.role !== "editor") return;
  document.body.classList.add("editor-open");
}

function closeEditor() {
  document.body.classList.remove("editor-open");
  stopPick();
  E.newSpotButton.focus();
}

function setGroup(id) {
  S.group = id || "all";
  S.fitKey = "";
  render();
  syncUrl();
}

function groups() {
  const counts = new Map();
  S.spots.forEach((p) => {
    const key = gid(p.group || p.municipality?.ja);
    const entry = counts.get(key) || { n: 0, label: p.municipality?.[S.lang] || p.group || REGION[S.lang] };
    entry.n += 1;
    counts.set(key, entry);
  });
  const chip = (id, label, n) => {
    const on = S.group === id;
    return `<button type="button" class="chip${on ? " is-on" : ""}" data-group="${attr(id)}" aria-pressed="${on}">
      <span class="chip-label">${esc(label)}</span><span class="chip-count">${n}</span></button>`;
  };
  const html = [chip("all", tr("all"), S.spots.length)];
  [...counts.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]))
    .forEach(([id, v]) => html.push(chip(id, v.label, v.n)));
  E.groupList.innerHTML = html.join("");
}

function list() {
  const rows = filtered();
  E.spotCount.textContent = tr("photoCount", { count: rows.length });
  if (!rows.length) {
    E.spotList.innerHTML = `<p class="empty">${esc(tr("noPhotos"))}</p>`;
    return;
  }
  E.spotList.innerHTML = rows.map((p) => {
    const img = photo(p);
    const full = readableBody(p);
    const open = S.expanded.has(p.id);
    const long = full.length > 110;
    const body = long && !open ? short(full, 110) : full;
    const more = long
      ? `<button type="button" class="link-button" data-action="toggle" data-id="${attr(p.id)}" aria-expanded="${open}">${esc(tr(open ? "showLess" : "showMore"))}</button>`
      : "";
    const tools = S.role === "editor"
      ? `<div class="card-tools"><button type="button" class="button button-quiet" data-action="edit" data-id="${attr(p.id)}">
           <i data-lucide="pencil" aria-hidden="true"></i><span>${esc(tr("editShort"))}</span></button></div>`
      : "";
    const badge = p.draft ? `<span class="badge badge-draft">${esc(tr("draft"))}</span>` : "";
    const no = p.archive ? `<span class="badge badge-no">No.${p.archive}</span>` : "";
    return `<article class="card${p.id === S.selected ? " is-active" : ""}${open ? " is-expanded" : ""}">
      <button type="button" class="card-main" data-action="select" data-id="${attr(p.id)}" aria-current="${p.id === S.selected}">
        <span class="card-thumb">${img ? `<img src="${attr(img)}" alt="${attr(txt(p, "title"))}" loading="lazy" onerror="this.remove()">` : ""}</span>
        <span class="card-text">
          <span class="card-title">${esc(txt(p, "title"))}${badge}${no}</span>
          <span class="card-place"><i data-lucide="map-pin" aria-hidden="true"></i>${esc(txt(p, "municipality"))}</span>
          <span class="card-body">${esc(body)}</span>
        </span>
      </button>${more}${tools}</article>`;
  }).join("");
}

function listClick(ev) {
  const act = ev.target.closest("[data-action]");
  if (!act) return;
  const id = act.dataset.id;
  if (act.dataset.action === "toggle") {
    S.expanded.has(id) ? S.expanded.delete(id) : S.expanded.add(id);
    return list();
  }
  if (act.dataset.action === "edit") return editSpot(id);
  if (act.dataset.action === "select") return selectSpot(id, true);
}

function selectSpot(id, focusDetail) {
  S.selected = id;
  const p = S.spots.find((x) => x.id === id);
  if (p && S.map && valid(p.lat, p.lng)) {
    S.map.setView([p.lat, p.lng], Math.max(S.map.getZoom(), 13), { animate: !reducedMotion() });
  }
  list();
  renderDetail();
  /* 縦積みの画面では詳細が地図の下に出るので、見える位置まで送る */
  if (window.matchMedia("(max-width: 860px)").matches) {
    E.detailPanel.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  }
  if (focusDetail) E.detailPanel.querySelector(".detail-close")?.focus();
  syncUrl();
}

function renderDetail() {
  const p = S.spots.find((x) => x.id === S.selected);
  if (!p) {
    document.body.classList.remove("detail-open");
    E.detailPanel.hidden = true;
    E.detailPanel.innerHTML = "";
    return;
  }
  const title = txt(p, "title");
  const shots = p.photos || [];
  const place = p.locationText || (valid(p.lat, p.lng) ? `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}` : "");
  const gallery = shots.map((x, i) => {
    const label = shots.length > 1 ? `${title}（${i + 1}/${shots.length}）` : title;
    return `
    <button type="button" class="thumb" data-action="lightbox" data-src="${attr(x.src)}" data-caption="${attr(title)}"
      data-index="${i}" aria-label="${attr(label)}">
      <img src="${attr(x.src)}" alt="${attr(label)}" loading="lazy">
    </button>`;
  }).join("");
  const editBtn = S.role === "editor"
    ? `<button type="button" class="button button-primary" data-action="edit" data-id="${attr(p.id)}">
         <i data-lucide="pencil" aria-hidden="true"></i><span>${esc(tr("edit"))}</span></button>`
    : "";
  const rows = filtered();
  const at = rows.findIndex((x) => x.id === p.id);
  const prev = at > 0 ? rows[at - 1] : null;
  const next = at >= 0 && at < rows.length - 1 ? rows[at + 1] : null;

  const tagChips = [
    ...(p.topics || []).map((t) => ({ key: t, label: spaceCamel(t) })),
    ...(p.artists || []).map((a) => ({ key: `@${a}`, label: spaceCamel(a) })),
  ].map((t) => `<button type="button" class="chip chip-sm" data-action="tag" data-tag="${attr(t.key)}">${esc(t.label)}</button>`).join("");

  const near = nearbySpots(p, 3).map((n) => `
    <button type="button" class="near" data-action="select" data-id="${attr(n.p.id)}">
      <span class="near-thumb">${photo(n.p) ? `<img src="${attr(photo(n.p))}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span>
      <span class="near-text"><span class="near-title">${esc(txt(n.p, "title"))}</span>
      <span class="near-dist">${esc(txt(n.p, "municipality"))}・${n.km < 1 ? `${Math.round(n.km * 1000)}m` : `${n.km.toFixed(1)}km`}</span></span>
    </button>`).join("");

  document.body.classList.add("detail-open");
  E.detailPanel.hidden = false;
  E.detailPanel.innerHTML = `
    <div class="detail-head">
      <p class="eyebrow">${esc(tr("detail"))}${p.archive ? ` · No.${p.archive}` : ""}</p>
      <button type="button" class="icon-button detail-close" data-action="close" aria-label="${attr(tr("close"))}">
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
    </div>
    <h2 class="detail-title">${p.draft ? `<span class="badge badge-draft">${esc(tr("draft"))}</span>` : ""}${esc(title)}</h2>
    <p class="detail-place"><i data-lucide="map-pin" aria-hidden="true"></i>${esc(txt(p, "municipality"))}</p>
    ${shots.length ? `<div class="detail-gallery">${gallery}</div>` : ""}
    <p class="detail-body">${esc(readableBody(p))}</p>
    ${tagChips ? `<div class="chips detail-tags">${tagChips}</div>` : ""}
    <dl class="detail-meta">
      ${place ? `<div><dt>${esc(tr("locationInfo"))}</dt><dd class="value">${esc(place)}</dd></div>` : ""}
      ${p.takenAt ? `<div><dt>${esc(tr("takenAt"))}</dt><dd>${esc(showDate(p.takenAt))}</dd></div>` : ""}
      <div><dt>${esc(tr("postedAt"))}</dt><dd>${esc(showDate(p.createdAt))}</dd></div>
    </dl>
    <div class="detail-actions">
      <button type="button" class="button button-ghost" data-action="share" data-id="${attr(p.id)}">
        <i data-lucide="share-2" aria-hidden="true"></i><span>${esc(tr("share"))}</span></button>
      ${valid(p.lat, p.lng) ? `<a class="button button-ghost" target="_blank" rel="noopener noreferrer"
        href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">
        <i data-lucide="navigation" aria-hidden="true"></i><span>${esc(tr("route"))}</span></a>` : ""}
      <button type="button" class="button button-ghost" data-action="card" data-id="${attr(p.id)}">
        <i data-lucide="image-down" aria-hidden="true"></i><span>${esc(tr("cardImage"))}</span></button>
      ${editBtn}
    </div>
    <nav class="detail-nav" aria-label="${attr(tr("detail"))}">
      <button type="button" class="button button-quiet" data-action="select" data-id="${attr(prev?.id || "")}" ${prev ? "" : "disabled"}>
        <i data-lucide="chevron-left" aria-hidden="true"></i><span>${esc(tr("prevWork"))}</span></button>
      <span class="detail-pos">${at + 1} / ${rows.length}</span>
      <button type="button" class="button button-quiet" data-action="select" data-id="${attr(next?.id || "")}" ${next ? "" : "disabled"}>
        <span>${esc(tr("nextWork"))}</span><i data-lucide="chevron-right" aria-hidden="true"></i></button>
    </nav>
    ${near ? `<section class="detail-near"><h3 class="block-title">${esc(tr("nearby"))}</h3><div class="near-list">${near}</div></section>` : ""}`;
  icons();
}

/* 選んだ作品に近い順に n 件返す */
function nearbySpots(p, n) {
  if (!valid(p.lat, p.lng)) return [];
  return S.spots
    .filter((x) => x.id !== p.id && valid(x.lat, x.lng) && (S.role === "editor" || !x.draft))
    .map((x) => ({ p: x, km: distanceKm(p.lat, p.lng, x.lat, x.lng) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}

function showDate(iso) {
  const d = new Date(iso || "");
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(S.lang === "zh" ? "zh-CN" : S.lang, { dateStyle: "long" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function detailClick(ev) {
  const act = ev.target.closest("[data-action]");
  if (!act) return;
  const a = act.dataset.action;
  if (a === "close") { S.selected = ""; list(); renderDetail(); syncUrl(); return; }
  if (a === "lightbox") return openLightbox(act.dataset.src, act.dataset.caption, Number(act.dataset.index || 0));
  if (a === "edit") return editSpot(act.dataset.id);
  if (a === "share") return share(act.dataset.id);
  if (a === "card") return exportCard(act.dataset.id);
  if (a === "select" && act.dataset.id) return selectSpot(act.dataset.id, false);
  if (a === "tag") {
    const t = act.dataset.tag;
    S.tags.has(t) ? S.tags.delete(t) : S.tags.add(t);
    S.fitKey = "";
    render();
    syncUrl();
  }
}

/* ========================== 7. 地図 ========================== */

function initMap() {
  if (!window.L) { status(tr("mapLibraryMissing")); return; }
  S.map = L.map("map", { zoomControl: true, attributionControl: true });
  S.map.fitBounds(L.latLngBounds(HOME_BOUNDS), { padding: [20, 20] });
  /* 標準地図に加えて、国土地理院の航空写真と淡色地図を選べるようにする */
  const layers = {
    [tr("layerStandard")]: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "&copy; OpenStreetMap",
    }),
    [tr("layerPhoto")]: L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
      maxZoom: 18, attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank' rel='noopener'>国土地理院</a>",
    }),
    [tr("layerPale")]: L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank' rel='noopener'>国土地理院</a>",
    }),
  };
  Object.values(layers)[0].addTo(S.map);
  S.layers = layers;
  S.layerControl = L.control.layers(layers, null, { position: "topright" }).addTo(S.map);
  S.layer = L.markerClusterGroup
    ? L.markerClusterGroup({ showCoverageOnHover: false, disableClusteringAtZoom: 13, maxClusterRadius: 54, chunkedLoading: true })
    : L.layerGroup();
  S.layer.addTo(S.map);
  S.map.on("click", (ev) => {
    if (!S.pick) return;
    setCoord(ev.latlng.lat, ev.latlng.lng);
    stopPick();
  });
}

function markers() {
  if (!S.layer) return;
  S.layer.clearLayers();
  S.markers.clear();
  const bounds = [];
  filtered().forEach((p) => {
    if (!valid(p.lat, p.lng)) return;
    const mk = L.marker([p.lat, p.lng], {
      icon: markerIcon(photo(p), p.id === S.selected),
      alt: txt(p, "title"),
      keyboard: true,
      title: txt(p, "title"),
    });
    mk.on("click", () => selectSpot(p.id, false));
    mk.on("keypress", () => selectSpot(p.id, true));
    S.layer.addLayer(mk);
    S.markers.set(p.id, mk);
    bounds.push([p.lat, p.lng]);
  });
  fitMarkers(bounds);
}

function markerIcon(src, active) {
  const inner = src
    ? `<img src="${attr(src)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('is-empty');this.remove()">`
    : `<i data-lucide="image" aria-hidden="true"></i>`;
  return L.divIcon({
    className: "",
    html: `<span class="marker${active ? " is-active" : ""}"><span class="marker-frame${src ? "" : " is-empty"}">${inner}</span></span>`,
    iconSize: [50, 60],
    iconAnchor: [25, 60],
  });
}

function fitMarkers(bounds) {
  if (!S.map || !window.L) return;
  const all = S.group === "all";
  const target = all ? HOME_BOUNDS : bounds;
  if (!target.length) return;
  const key = `${S.group}:${target.length}`;
  if (S.fitKey === key) return;
  S.fitKey = key;
  if (!all && bounds.length === 1) {
    S.map.setView(bounds[0], Math.max(S.map.getZoom(), 13), { animate: false });
    return;
  }
  S.map.fitBounds(L.latLngBounds(target), { padding: [28, 28], maxZoom: all ? 10 : 13, animate: false });
}

/* 地図の切替ラベルも選んだ言語に合わせる */
function relabelLayers() {
  if (!S.layerControl || !S.map) return;
  const keys = ["layerStandard", "layerPhoto", "layerPale"];
  const list = Object.values(S.layers || {});
  S.map.removeControl(S.layerControl);
  const next = {};
  list.forEach((layer, i) => { next[tr(keys[i])] = layer; });
  S.layers = next;
  S.layerControl = L.control.layers(next, null, { position: "topright" }).addTo(S.map);
}

function startPick() {
  S.pick = true;
  document.body.classList.add("picking");
  E.pickOnMapButton.setAttribute("aria-pressed", "true");
  status(tr("pickOnMapActive"));
}

function stopPick() {
  S.pick = false;
  document.body.classList.remove("picking");
  E.pickOnMapButton.setAttribute("aria-pressed", "false");
}

/* ======================= 8. 編集フォーム ======================= */

/* 通信に失敗しても書いたものが消えないよう、入力を控えておく */
function saveFormDraft() {
  if (S.editingId) return;
  const body = {
    title: E.titleJa.value, description: E.descriptionJa.value,
    location: E.locationInfo.value, group: E.spotGroup.value,
    lat: E.latitude.value, lng: E.longitude.value,
    takenAt: E.takenAt.value, paste: E.pasteInput.value,
  };
  const empty = Object.values(body).every((v) => !String(v).trim());
  try { empty ? localStorage.removeItem(FORMDRAFT) : localStorage.setItem(FORMDRAFT, JSON.stringify(body)); } catch {}
}

function restoreFormDraft() {
  let body = null;
  try { body = JSON.parse(localStorage.getItem(FORMDRAFT) || "null"); } catch {}
  if (!body) return false;
  E.titleJa.value = body.title || "";
  E.descriptionJa.value = body.description || "";
  E.locationInfo.value = body.location || "";
  E.spotGroup.value = body.group || "";
  E.latitude.value = body.lat || "";
  E.longitude.value = body.lng || "";
  E.takenAt.value = body.takenAt || "";
  E.pasteInput.value = body.paste || "";
  return true;
}

function clearFormDraft() {
  try { localStorage.removeItem(FORMDRAFT); } catch {}
}

function resetForm() {
  S.drafts.forEach((d) => URL.revokeObjectURL(d.preview));
  S.drafts = [];
  S.keptPhotos = [];
  S.editingId = "";
  E.spotForm.reset();
  E.photoFile.value = "";
  E.deleteButton.hidden = true;
  E.takenAt.value = "";
  E.draftToggle.checked = false;
  E.editorTitle.textContent = tr("formTitle");
  E.submitLabel.textContent = tr("save");
  E.editingNotice.hidden = true;
  E.spotForm.classList.remove("is-batch");
  stopPick();
  renderPhotoFields();
}

function editSpot(id) {
  const p = S.spots.find((x) => x.id === id);
  if (!p) return;
  resetForm();
  S.editingId = id;
  S.selected = id;
  S.keptPhotos = (p.photos || []).map((x) => ({ ...x }));
  E.titleJa.value = p.title?.ja || "";
  E.descriptionJa.value = p.description?.ja || "";
  E.locationInfo.value = p.locationText || (valid(p.lat, p.lng) ? `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}` : "");
  E.spotGroup.value = p.group || p.municipality?.ja || "";
  E.latitude.value = valid(p.lat, p.lng) ? p.lat.toFixed(6) : "";
  E.longitude.value = valid(p.lat, p.lng) ? p.lng.toFixed(6) : "";
  E.takenAt.value = p.takenAt || "";
  E.draftToggle.checked = !!p.draft;
  E.deleteButton.hidden = false;
  E.editorTitle.textContent = tr("formTitleEdit");
  E.submitLabel.textContent = tr("saveEdit");
  E.editingNotice.textContent = tr("editingNotice", { title: txt(p, "title") });
  E.editingNotice.hidden = false;
  openEditor();
  render();
  E.titleJa.focus();
}

async function filesChanged(ev) {
  const files = [...(ev.target.files || [])];
  for (const file of files) {
    const d = {
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      description: "",
      location: "",
    };
    /* 写真に埋め込まれた撮影位置・日時を取り出して、空欄なら自動で入れる */
    const ex = await readExif(file).catch(() => null);
    if (ex?.lat != null && valid(ex.lat, ex.lng)) {
      d.location = `${ex.lat.toFixed(6)}, ${ex.lng.toFixed(6)}`;
      d.exif = ex;
    }
    if (ex?.taken) d.taken = ex.taken;
    S.drafts.push(d);
  }
  E.photoFile.value = "";
  openEditor();

  const first = S.drafts.find((d) => d.exif || d.taken);
  if (first && !S.editingId && !isBatch()) {
    if (first.exif && !E.locationInfo.value.trim()) {
      setCoord(first.exif.lat, first.exif.lng);
      status(tr("exifLocation"));
    }
    if (first.taken && !E.takenAt.value) E.takenAt.value = first.taken;
  }
  renderPhotoFields();
  saveFormDraft();
}

/* ---- 写真の EXIF ----
   canvas で作り直すと EXIF は消えるので、変換する前に読む。 */
async function readExif(file) {
  if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return null;
  const buf = await file.slice(0, 256 * 1024).arrayBuffer();
  const v = new DataView(buf);
  if (v.byteLength < 8 || v.getUint16(0) !== 0xffd8) return null;
  let off = 2;
  while (off + 4 < v.byteLength) {
    if (v.getUint8(off) !== 0xff) break;
    const marker = v.getUint8(off + 1);
    if (marker === 0xda) break;
    const size = v.getUint16(off + 2);
    if (marker === 0xe1 && off + 10 < v.byteLength && v.getUint32(off + 4) === 0x45786966) {
      return readTiff(v, off + 10);
    }
    off += 2 + size;
  }
  return null;
}

function readTiff(v, base) {
  const le = v.getUint16(base) === 0x4949;
  const u16 = (o) => v.getUint16(o, le);
  const u32 = (o) => v.getUint32(o, le);
  if (u16(base + 2) !== 0x002a) return null;
  const SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const each = (start, fn) => {
    if (start + 2 > v.byteLength) return;
    const n = u16(start);
    for (let i = 0; i < n; i++) {
      const e = start + 2 + i * 12;
      if (e + 12 > v.byteLength) return;
      fn(e);
    }
  };
  const where = (e) => {
    const type = u16(e + 2);
    const count = u32(e + 4);
    const len = (SIZE[type] || 1) * count;
    return { count, off: len > 4 ? base + u32(e + 8) : e + 8 };
  };
  const ascii = (e) => {
    const { off, count } = where(e);
    let out = "";
    for (let i = 0; i < count && off + i < v.byteLength; i++) {
      const c = v.getUint8(off + i);
      if (!c) break;
      out += String.fromCharCode(c);
    }
    return out;
  };
  const rationals = (e) => {
    const { off, count } = where(e);
    const out = [];
    for (let i = 0; i < count; i++) {
      if (off + i * 8 + 8 > v.byteLength) return out;
      out.push(u32(off + i * 8) / (u32(off + i * 8 + 4) || 1));
    }
    return out;
  };

  const res = {};
  let gpsIfd = 0;
  let exifIfd = 0;
  each(base + u32(base + 4), (e) => {
    const tag = u16(e);
    if (tag === 0x8825) gpsIfd = base + u32(e + 8);
    if (tag === 0x8769) exifIfd = base + u32(e + 8);
  });
  if (exifIfd) each(exifIfd, (e) => {
    if (u16(e) === 0x9003) {
      const raw = ascii(e).trim();
      const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})/);
      if (m) res.taken = `${m[1]}-${m[2]}-${m[3]}`;
    }
  });
  if (gpsIfd) {
    let latRef = "N";
    let lngRef = "E";
    let lat = null;
    let lng = null;
    each(gpsIfd, (e) => {
      const tag = u16(e);
      if (tag === 1) latRef = ascii(e);
      if (tag === 2) lat = rationals(e);
      if (tag === 3) lngRef = ascii(e);
      if (tag === 4) lng = rationals(e);
    });
    if (lat?.length === 3 && lng?.length === 3) {
      res.lat = dms(lat[0], lat[1], lat[2], latRef);
      res.lng = dms(lng[0], lng[1], lng[2], lngRef);
    }
  }
  return res;
}

/* 一括投稿モード: 修正中ではなく、新しい写真が2枚以上あるとき */
function isBatch() { return !S.editingId && S.drafts.length > 1; }

function renderPhotoFields() {
  E.spotForm.classList.toggle("is-batch", isBatch());
  E.photoPicker.querySelector("span").textContent = tr(S.editingId || S.drafts.length ? "addPhoto" : "choosePhoto");
  const photoLabel = (i, n) => {
    const t = (E.titleJa.value || "").trim() || tr("photos");
    return n > 1 ? `${t}（${i + 1}/${n}）` : t;
  };

  /* 登録済みの写真（修正中のみ） */
  if (!S.keptPhotos.length) {
    E.currentPhotos.hidden = true;
    E.currentPhotos.innerHTML = "";
  } else {
    E.currentPhotos.hidden = false;
    E.currentPhotos.innerHTML = `<p class="field-label">${esc(tr("currentPhotos"))}</p>
      <ul class="photo-grid">${S.keptPhotos.map((x, i) => `
        <li class="photo-item">
          <img src="${attr(x.src)}" alt="${attr(photoLabel(i, S.keptPhotos.length))}" loading="lazy">
          <button type="button" class="photo-remove" data-remove-kept="${i}"
            aria-label="${attr(tr("removePhoto", { name: photoLabel(i, S.keptPhotos.length) }))}">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </li>`).join("")}</ul>`;
  }

  /* これから追加する写真 */
  if (!S.drafts.length) {
    E.photoPreview.innerHTML = S.keptPhotos.length ? "" : `<p class="hint">${esc(tr("noPreview"))}</p>`;
    icons();
    return;
  }
  if (!isBatch()) {
    if (!S.editingId && !E.titleJa.value) E.titleJa.value = S.drafts[0].title;
    E.photoPreview.innerHTML = `<p class="field-label">${esc(tr("newPhotos"))}</p>
      <ul class="photo-grid">${S.drafts.map((d, i) => `
        <li class="photo-item">
          <img src="${attr(d.preview)}" alt="${attr(d.title)}">
          <button type="button" class="photo-remove" data-remove-draft="${i}"
            aria-label="${attr(tr("removePhoto", { name: d.title }))}">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </li>`).join("")}</ul>`;
    icons();
    return;
  }
  E.photoPreview.innerHTML = `<p class="field-label">${esc(tr("newPhotos"))}</p>
    <ul class="batch-list">${S.drafts.map((d, i) => `
      <li class="batch-item">
        <div class="batch-thumb">
          <img src="${attr(d.preview)}" alt="${attr(d.title)}">
          <button type="button" class="photo-remove" data-remove-draft="${i}"
            aria-label="${attr(tr("removePhoto", { name: d.title }))}">
            <i data-lucide="x" aria-hidden="true"></i>
          </button>
        </div>
        <div class="batch-fields">
          <label class="field"><span class="field-label">${esc(tr("photoTitle", { index: i + 1 }))}</span>
            <input type="text" data-draft-field="title" data-index="${i}" value="${attr(d.title)}"></label>
          <label class="field"><span class="field-label">${esc(tr("photoDescription", { index: i + 1 }))}</span>
            <textarea rows="2" data-draft-field="description" data-index="${i}">${esc(d.description)}</textarea></label>
          <label class="field"><span class="field-label">${esc(tr("photoLocation", { index: i + 1 }))}</span>
            <input type="text" data-draft-field="location" data-index="${i}" value="${attr(d.location)}"
              placeholder="37°22'14.5&quot;N 137°14'25.7&quot;E"></label>
        </div>
      </li>`).join("")}</ul>`;
  icons();
}

function applyPaste() {
  const records = parsePaste(E.pasteInput.value);
  if (!records.length) return;
  if (isBatch()) {
    records.forEach((r, i) => S.drafts[i] && Object.assign(S.drafts[i], {
      title: r.title || S.drafts[i].title,
      description: r.description || S.drafts[i].description,
      location: r.location || S.drafts[i].location,
    }));
  } else {
    const r = records[0];
    if (r.title) E.titleJa.value = r.title;
    if (r.description) E.descriptionJa.value = r.description;
    if (r.location) E.locationInfo.value = r.location;
    if (r.group) E.spotGroup.value = r.group;
    const c = coords(r.location);
    if (c) setCoord(c.lat, c.lng, false);
  }
  renderPhotoFields();
  status(`${records.length}`);
}

async function saveForm(ev) {
  ev.preventDefault();
  if (!ghReady()) return requestSync();

  const editing = S.editingId ? S.spots.find((x) => x.id === S.editingId) : null;
  const entries = buildEntries(editing);
  if (!entries.length || entries.some((e) => !e.title || !e.c)) return status(tr("invalidLocation"));

  const before = S.spots;
  const next = [...S.spots];
  status(tr("saving"));
  E.submitButton.disabled = true;
  try {
    for (let i = 0; i < entries.length; i++) {
      const { drafts, title, description, locationText, c } = entries[i];
      const id = editing ? editing.id : idNew();
      const photos = editing ? [...S.keptPhotos] : [];
      for (let k = 0; k < drafts.length; k++) {
        if (drafts[k]?.file) photos.push(await makePhoto(drafts[k].file, id, photos.length));
      }
      const muni = inferMunicipality([E.spotGroup.value, title, description, locationText].join("\n"), c.lat, c.lng);
      const manualGroup = E.spotGroup.value.trim();
      const spot = {
        id,
        createdAt: editing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: titleObj(title, description),
        description: bodyObj(description),
        municipality: muni,
        group: manualGroup || muni.ja,
        locationText,
        lat: c.lat,
        lng: c.lng,
        photos,
      };
      const taken = E.takenAt.value.trim() || drafts.find((d) => d?.taken)?.taken || editing?.takenAt || "";
      if (taken) spot.takenAt = taken;
      if (E.draftToggle.checked) spot.draft = true;
      if (editing) {
        const at = next.findIndex((x) => x.id === id);
        at >= 0 ? (next[at] = spot) : next.unshift(spot);
      } else {
        next.unshift(spot);
      }
    }
    S.spots = next;
    await syncGh(editing ? "Edit Noto museum map post" : "Update Noto museum map posts");
    clearFormDraft();
    render();
    const count = entries.length;
    resetForm();
    closeEditor();
    toast(editing ? tr("updateComplete") : count > 1 ? tr("postCompleteMany", { count }) : tr("postComplete"));
  } catch (e) {
    S.spots = before;
    saveLocal();
    render();
    status(`${tr("syncFailed")} ${e.message || ""}`);
    if (!ghReady()) reconnect(e);
  } finally {
    E.submitButton.disabled = false;
  }
}

/* 入力欄と下書きから、保存する投稿の一覧を組み立てる */
function buildEntries(editing) {
  const pasted = parsePaste([E.pasteInput.value, E.descriptionJa.value].filter(Boolean).join("\n\n"));
  const common = () => {
    const title = E.titleJa.value.trim();
    const description = E.descriptionJa.value.trim();
    const rawLocation = E.locationInfo.value.trim();
    const parsed = pasted[0];
    const locationText = parsed?.location && (!rawLocation || !coords(rawLocation)) ? parsed.location : rawLocation;
    return { title, description, locationText, c: coords(locationText) || manualCoords() };
  };

  /* 修正中、または新しい写真が1枚以下: 1件の投稿としてまとめる */
  if (editing || !isBatch()) {
    const base = common();
    return [{ ...base, drafts: S.drafts }];
  }

  /* 一括投稿: 写真1枚につき1件 */
  return S.drafts.map((d, i) => {
    const parsed = pasted[i] || null;
    const title = (d.title || "").trim() || (parsed?.title || "").trim();
    const description = (d.description || "").trim() || (parsed?.description || "").trim();
    const rawLocation = (d.location || "").trim();
    const locationText = rawLocation && coords(rawLocation) ? rawLocation : (parsed?.location || rawLocation || E.locationInfo.value.trim());
    return { drafts: [d], title, description, locationText, c: coords(locationText) || manualCoords() };
  });
}

async function removeSpot(id) {
  if (!ghReady()) return requestSync();
  const p = S.spots.find((x) => x.id === id);
  if (!p) return;
  if (!window.confirm(tr("deleteConfirm", { title: txt(p, "title") }))) return;
  const before = S.spots;
  S.spots = S.spots.filter((x) => x.id !== id);
  S.selected = "";
  status(tr("saving"));
  try {
    await syncGh("Delete Noto map post");
    resetForm();
    closeEditor();
    render();
    offerUndo(p);
  } catch (e) {
    S.spots = before;
    saveLocal();
    render();
    status(`${tr("syncFailed")} ${e.message || ""}`);
    if (!ghReady()) reconnect(e);
  }
}

/* ========================= 9. 位置情報 ========================= */

/* iPhone や Google マップが出す ’ ” 、全角英数、読点をここで吸収する。
   これを通さないと DMS 表記の大半が解析できない。 */
function normalizeCoordText(value) {
  return String(value || "")
    .replace(/[‘’ʼʹ′＇]/g, "'")
    .replace(/[“”″＂]/g, '"')
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[，、]/g, ",")
    .replace(/[．。]/g, ".")
    .replace(/[ºﾟ゜。]/g, "°")
    .replace(/　/g, " ");
}

const DMS_RE = /(\d{1,3})\s*°\s*(\d{1,2})\s*'\s*(\d{1,2}(?:\.\d+)?)\s*"?\s*([NSns])[\s,]+(\d{1,3})\s*°\s*(\d{1,2})\s*'\s*(\d{1,2}(?:\.\d+)?)\s*"?\s*([EWew])/;
const DEC_RE = /([-+]?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*([-+]?\d{1,3}(?:\.\d+)?)/;

function coords(value) {
  const s = normalizeCoordText(value);
  const m = s.match(DMS_RE);
  if (m) {
    const lat = dms(+m[1], +m[2], +m[3], m[4]);
    const lng = dms(+m[5], +m[6], +m[7], m[8]);
    return valid(lat, lng) ? { lat, lng } : null;
  }
  const n = s.match(DEC_RE);
  if (!n) return null;
  const lat = Number(n[1]);
  const lng = Number(n[2]);
  return valid(lat, lng) ? { lat, lng } : null;
}

function coordMatches(text) {
  const s = normalizeCoordText(text);
  const out = [];
  [new RegExp(DMS_RE.source, "g"), new RegExp(DEC_RE.source, "g")].forEach((re) => {
    let m;
    while ((m = re.exec(s))) out.push({ index: m.index, text: m[0] });
  });
  return out.sort((a, b) => a.index - b.index);
}

function dms(d, m, s, hemi) {
  const v = d + m / 60 + s / 3600;
  return /[SWsw]/.test(hemi) ? -v : v;
}

/* 空欄は 0 ではなく「未入力」として扱う。ここが 0,0 保存の原因だった。 */
function manualCoords() {
  const latRaw = E.latitude.value.trim();
  const lngRaw = E.longitude.value.trim();
  if (!latRaw || !lngRaw) return null;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  return valid(lat, lng) ? { lat, lng } : null;
}

function setCoord(lat, lng, writeText = true) {
  E.latitude.value = lat.toFixed(6);
  E.longitude.value = lng.toFixed(6);
  if (writeText) E.locationInfo.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function useCurrentPosition() {
  if (!navigator.geolocation) return status(tr("invalidLocation"));
  navigator.geolocation.getCurrentPosition(
    (p) => { setCoord(p.coords.latitude, p.coords.longitude); status(tr("locationInfo")); },
    () => status(tr("invalidLocation")),
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function parsePaste(text) {
  const src = String(text || "").trim();
  if (!src) return [];
  const ms = coordMatches(src);
  if (!ms.length) return [record(src, "")];
  return ms.map((m, i) => record(
    src.slice(i ? ms[i - 1].index + ms[i - 1].text.length : 0, ms[i + 1]?.index ?? src.length).trim(),
    m.text,
  ));
}

function record(block, ctext) {
  const lines = block.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
    .filter((x) => !/^(タイトル|位置情報|詳細|説明|title|location|description)$/i.test(x));
  const ci = lines.findIndex((x) => x.includes(ctext));
  const before = ci >= 0 ? lines.slice(0, ci) : lines;
  const after = ci >= 0 ? lines.slice(ci + 1) : [];
  const group = [...before, ...after].find(isPlaceLine) || "";
  const title = [...before].reverse().find((x) => x !== group && /【|｜|[぀-ヿ㐀-鿿]/.test(x) && x.length <= 120)
    || before.filter((x) => x !== group).pop() || "";
  const description = [...before, ...after]
    .filter((x) => x !== group && x !== title && !x.startsWith("#") && !/^Archive\s+\d+/i.test(x))
    .join("\n");
  return { title, description, location: ctext, group };
}

function isPlaceLine(line) {
  const s = line.toLowerCase();
  return MUNICIPAL.some((m) => s.includes(m.ja.toLowerCase()) || m.aliases.some((a) => s.includes(a.toLowerCase())));
}

/* ---- 自治体の判定 ---- */

/* ローマ字の地名は語頭でしか認めない。単純な部分一致だと
   Ishikawa の shika が志賀町に、Hodatsushimizu の himi が氷見市に
   誤って当たる。日本語には語の切れ目が無いので部分一致のままでよい。 */
function hasTerm(text, key) {
  if (!/^[\x20-\x7e]+$/.test(key)) return text.includes(key);
  let from = 0;
  for (;;) {
    const at = text.indexOf(key, from);
    if (at < 0) return false;
    const before = at === 0 ? "" : text[at - 1];
    if (!/[a-z0-9]/.test(before)) return true;
    from = at + 1;
  }
}

/* 本文に出てくる自治体を全部拾う。「中能登町」のように、
   他の地名を内側に含むものは長いほうだけ残す。 */
function textMatches(text) {
  const s = String(text || "").toLowerCase();
  const hits = [];
  MUNICIPAL.forEach((m) => {
    let key = "";
    [m.ja, m.en, m.ko, m.zh, ...m.aliases].forEach((raw) => {
      const k = String(raw).toLowerCase();
      if (k.length > key.length && hasTerm(s, k)) key = k;
    });
    if (key) hits.push({ m, key });
  });
  return hits.filter((h) => !hits.some((o) => o !== h && o.key.length > h.key.length && o.key.includes(h.key)));
}

function inferByText(text) {
  const hits = textMatches(text);
  return hits.length === 1 ? hits[0].m : null;
}

/* 候補のうち、写真の位置にいちばん近いものを返す */
function nearestOf(list, lat, lng) {
  if (!list.length) return null;
  if (!valid(lat, lng)) return list[0];
  let best = list[0];
  let bestKm = Infinity;
  list.forEach((m) => {
    const km = distanceKm(lat, lng, m.lat, m.lng);
    if (km < bestKm) { bestKm = km; best = m; }
  });
  return best;
}

/* 本文に地名が無いときは、座標から最寄りの自治体を採る。 */
function inferByCoords(lat, lng) {
  if (!valid(lat, lng)) return null;
  let best = null;
  let bestKm = Infinity;
  MUNICIPAL.forEach((m) => {
    const km = distanceKm(lat, lng, m.lat, m.lng);
    if (km < bestKm) { bestKm = km; best = m; }
  });
  return bestKm <= NEAR_KM ? best : null;
}

function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/* 判定の順番
   1. 本文に地名が1つ      → それを採る
   2. 本文に地名が複数      → 複数の市町にまたがる作品。そのうち写真の位置に
                             最も近いものを採る（役所からの距離で判断しない）
   3. 本文に地名が無い      → 最寄りの自治体。30kmより遠ければ「能登半島」 */
function inferMunicipality(text, lat, lng) {
  const hits = textMatches(text).map((h) => h.m);
  const m = hits.length === 1 ? hits[0]
    : hits.length > 1 ? nearestOf(hits, lat, lng)
    : inferByCoords(lat, lng);
  return m ? { ja: m.ja, en: m.en, ko: m.ko, zh: m.zh } : { ...REGION };
}

/* ---- 市区町村の一括付け替え ---- */

function openBulk() {
  const opts = (sel) => MUNICIPAL.map((m) => `<option value="${attr(m.ja)}"${m.ja === sel ? " selected" : ""}>${esc(m[S.lang] || m.ja)}</option>`).join("");
  E.bulkFrom.innerHTML = `<option value="">${esc(tr("bulkAll"))}</option>` +
    `<option value="${attr(REGION.ja)}">${esc(REGION[S.lang])}</option>` + opts("");
  E.bulkTo.innerHTML = opts(MUNICIPAL[0].ja);
  E.bulkFrom.onchange = showBulkCount;
  showBulkCount();
  openModal(E.bulkModal, E.bulkFrom);
}

function bulkTargets() {
  const from = E.bulkFrom.value;
  return from ? S.spots.filter((p) => (p.municipality?.ja || "") === from) : filtered();
}

function showBulkCount() {
  E.bulkCount.textContent = tr("bulkCount", { count: bulkTargets().length });
}

async function applyBulk(ev) {
  ev.preventDefault();
  const rows = bulkTargets();
  const to = MUNICIPAL.find((m) => m.ja === E.bulkTo.value);
  if (!rows.length || !to) return closeModal(E.bulkModal);
  const before = S.spots;
  const ids = new Set(rows.map((p) => p.id));
  S.spots = S.spots.map((p) => (ids.has(p.id)
    ? { ...p, municipality: { ja: to.ja, en: to.en, ko: to.ko, zh: to.zh }, group: to.ja, updatedAt: new Date().toISOString() }
    : p));
  status(tr("saving"));
  try {
    await syncGh("Reassign Noto map municipalities");
    closeModal(E.bulkModal);
    render();
    toast(tr("bulkDone", { count: rows.length }));
  } catch (e) {
    S.spots = before;
    saveLocal();
    render();
    status(`${tr("syncFailed")} ${e.message || ""}`);
  }
}

/* ======================= 10. GitHub 連携 ======================= */

function ghCfg() {
  let c = {};
  try { c = JSON.parse(localStorage.getItem(GHCFG) || "{}"); } catch { c = {}; }
  return {
    repo: c.repo || REPO,
    branch: c.branch || BRANCH,
    token: store(GHTOKEN) || sessionStorage.getItem(GHTOKEN) || "",
  };
}

function ghReady() {
  const c = ghCfg();
  return !!(c.repo && c.branch && c.token);
}

/* token 欄には保存済みの値を書き戻さない。伏せ字なので中身が読めず、
   貼り付けが置換ではなく連結になって壊れた token が保存されてしまう。 */
function fillGh() {
  const c = ghCfg();
  E.githubRepoInput.value = c.repo;
  E.githubBranchInput.value = c.branch;
  E.githubTokenInput.value = "";
  E.githubSyncStatus.textContent = c.token ? tr("tokenStored") : tr("tokenCopy");
  E.githubSyncError.hidden = true;
}

function requestSync() {
  fillGh();
  openModal(E.githubSyncModal, E.githubTokenInput);
  status(tr("syncRequired"));
}

function reconnect(err) {
  requestSync();
  E.githubSyncError.hidden = false;
  E.githubSyncError.textContent = err?.message || tr("syncRequired");
}

async function connectGh(ev) {
  ev.preventDefault();
  E.githubSyncError.hidden = true;
  store(GHCFG, JSON.stringify({
    repo: E.githubRepoInput.value.trim() || REPO,
    branch: E.githubBranchInput.value.trim() || BRANCH,
  }));
  const typed = E.githubTokenInput.value.trim();
  if (typed) store(GHTOKEN, typed);
  try {
    if (!ghReady()) throw new Error(tr("token"));
    await loadRemote();
    await syncGh("Sync Noto museum map posts");
    closeModal(E.githubSyncModal);
    status(tr("syncConnected"));
    render();
  } catch (e) {
    E.githubSyncError.hidden = false;
    E.githubSyncError.textContent = `${tr("syncFailed")} ${e.message || ""}`;
  }
}

async function loadRemote() {
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA}?v=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return;
    const j = await r.json();
    if (!Array.isArray(j)) return;
    const remote = j.map(norm).filter(Boolean);
    S.spots = mergeSpots(remote, S.spots);
    saveLocal();
  } catch (e) {
    console.warn("Remote data could not be loaded.", e);
  }
}

function mergeSpots(remote, local) {
  const byId = new Map();
  const at = (s) => Date.parse(s?.updatedAt || s?.createdAt || "") || 0;
  const put = (s) => {
    if (!s?.id) return;
    const cur = byId.get(s.id);
    if (!cur || at(s) >= at(cur)) byId.set(s.id, s);
  };
  remote.forEach(put);
  local.filter(isLocalOnly).forEach(put);
  return [...byId.values()].sort((a, b) => at(b) - at(a));
}

function isLocalOnly(spot) {
  return !!spot?.localOnly || (spot?.photos || []).some((p) => String(p?.src || "").startsWith("data:"));
}

async function syncGh(message) {
  const clean = [];
  for (const spot of S.spots) {
    const item = { ...spot };
    delete item.localOnly;
    delete item.artists;
    delete item.topics;
    delete item.archive;
    item.photos = await persistPhotos(spot);
    clean.push(item);
  }
  const cur = await getGh(DATA);
  await putGh(DATA, b64(`${JSON.stringify(clean, null, 2)}\n`), message, cur?.sha || null, true);
  S.spots = clean.map(norm).filter(Boolean);
  saveLocal();
  await publishFeeds(clean).catch((e) => console.warn("feed", e));
}

/* 投稿を保存するたびに sitemap.xml と feed.xml も更新する。
   静的サイトなので、ここで書かないと新着が検索・購読に載らない。 */
async function publishFeeds(rows) {
  const live = rows.filter((p) => !p.draft);
  const site = `${location.origin}${location.pathname}`.replace(/index\.html$/, "");
  const esc2 = (t) => String(t ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const when = (p) => (p.updatedAt || p.createdAt || new Date().toISOString());

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc2(site)}</loc><changefreq>weekly</changefreq></url>
${live.map((p) => `  <url><loc>${esc2(`${site}?id=${p.id}`)}</loc><lastmod>${when(p).slice(0, 10)}</lastmod></url>`).join("\n")}
</urlset>
`;

  const items = live.slice(0, 40).map((p) => `    <item>
      <title>${esc2(p.title?.ja || "")}</title>
      <link>${esc2(`${site}?id=${p.id}`)}</link>
      <guid isPermaLink="true">${esc2(`${site}?id=${p.id}`)}</guid>
      <pubDate>${new Date(when(p)).toUTCString()}</pubDate>
      <category>${esc2(p.municipality?.ja || "")}</category>
      <description>${esc2((p.description?.ja || "").slice(0, 400))}</description>
    </item>`).join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
    <title>のとのおと美術館デジタルマップ</title>
    <link>${esc2(site)}</link>
    <description>能登半島と氷見市の風景を写真と位置情報で記録するデジタル美術館</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel></rss>
`;

  for (const [path, text] of [["sitemap.xml", sitemap], ["feed.xml", feed]]) {
    const cur = await getGh(path).catch(() => null);
    await putGh(path, b64(text), "Update Noto map feeds", cur?.sha || null, true);
  }
}

async function persistPhotos(spot) {
  const out = [];
  const shots = spot.photos || [];
  for (let i = 0; i < shots.length; i++) {
    const p = shots[i];
    if (!p?.src) continue;
    if (String(p.src).startsWith("data:")) out.push(await uploadDataPhoto(p.src, spot.id, i, p.alt || `photo-${i + 1}`));
    else out.push(p);
  }
  return out;
}

async function uploadDataPhoto(dataUrl, spotId, index, alt) {
  const parts = String(dataUrl).split(",");
  if (parts.length < 2) return { src: dataUrl, alt };
  const ext = parts[0].includes("png") ? "png" : parts[0].includes("webp") ? "webp" : "jpg";
  const path = `${MEDIA}/${Date.now()}-${spotId}-${index + 1}-${slug(alt)}.${ext}`;
  await putGh(path, parts.slice(1).join(","), `Add Noto map photo ${spotId}`, null, true);
  return { src: raw(path), alt, path };
}

async function makePhoto(file, spotId, index) {
  if (!ghReady()) throw new Error(tr("syncRequired"));
  const p = await prepImage(file);
  const path = `${MEDIA}/${Date.now()}-${spotId}-${index + 1}-${slug(file.name)}.${p.ext}`;
  await putGh(path, p.base64, `Add Noto map photo ${spotId}`, null, true);
  return { src: raw(path), alt: file.name, path };
}

function prepImage(file) {
  return new Promise((resolve, reject) => {
    const fallback = () => readDataUrl(file).then(
      (dataUrl) => resolve({ dataUrl, base64: dataUrl.split(",")[1] || "", ext: ext(file) }),
      reject,
    );
    if (!file.type.startsWith("image/") || /hei[cf]/i.test(file.name)) return fallback();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_Q);
      resolve({ dataUrl, base64: dataUrl.split(",")[1], ext: "jpg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); fallback(); };
    img.src = url;
  });
}

function readDataUrl(file) {
  return new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result || ""));
    r.onerror = () => no(r.error || new Error("read failed"));
    r.readAsDataURL(file);
  });
}

async function getGh(path) {
  const c = ghCfg();
  const r = await fetch(`https://api.github.com/repos/${c.repo}/contents/${path}?ref=${encodeURIComponent(c.branch)}`,
    { headers: ghHeaders(c.token) });
  if (r.status === 404) return null;
  if (!r.ok) throw await ghFail(r);
  return r.json();
}

async function putGh(path, content, message, sha, is64) {
  const c = ghCfg();
  const body = { message, branch: c.branch, content: is64 ? content : b64(content) };
  if (sha) body.sha = sha;
  const r = await fetch(`https://api.github.com/repos/${c.repo}/contents/${path}`,
    { method: "PUT", headers: ghHeaders(c.token), body: JSON.stringify(body) });
  if (!r.ok) throw await ghFail(r);
  return r.json();
}

/* 401 は token が死んでいる。保持し続けると入れ直す導線が消えるので破棄する。
   403 は権限や回数制限なので token はそのまま残す。 */
async function ghFail(r) {
  const body = await r.text().catch(() => "");
  if (r.status === 401) {
    localStorage.removeItem(GHTOKEN);
    sessionStorage.removeItem(GHTOKEN);
    return new Error(tr("tokenInvalid"));
  }
  return new Error(`${r.status} ${r.statusText} ${body}`.trim());
}

function ghHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function raw(path) {
  const c = ghCfg();
  return `https://raw.githubusercontent.com/${c.repo}/${c.branch}/${path}?v=${Date.now()}`;
}

/* 写真・題名・地名を1枚の画像にして保存する（SNS投稿用） */
async function exportCard(id) {
  const p = S.spots.find((x) => x.id === id);
  if (!p) return;
  const src = photo(p);
  if (!src) return status(tr("noPreview"));
  status(tr("cardMaking"));
  try {
    const img = await loadImage(src);
    const W = 1200;
    const H = 630;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#0f2a3d";
    g.fillRect(0, 0, W, H);
    /* 写真は左 62% を覆う形で配置 */
    const bw = Math.round(W * 0.62);
    const scale = Math.max(bw / img.width, H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    g.save();
    g.beginPath();
    g.rect(0, 0, bw, H);
    g.clip();
    g.drawImage(img, (bw - dw) / 2, (H - dh) / 2, dw, dh);
    g.restore();

    const x = bw + 44;
    const w = W - x - 44;
    g.fillStyle = "#cfe0ea";
    g.font = "600 22px 'BIZ UDPGothic', sans-serif";
    g.fillText(txt(p, "municipality"), x, 132);
    if (p.archive) g.fillText(`Archive ${p.archive}`, x, 100);
    g.fillStyle = "#ffffff";
    g.font = "700 40px 'BIZ UDPGothic', sans-serif";
    wrapText(g, txt(p, "title"), x, 200, w, 54, 5);
    g.fillStyle = "#9fc3d8";
    g.font = "400 22px 'BIZ UDPGothic', sans-serif";
    g.fillText(tr("siteTitle"), x, H - 48);

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(txt(p, "title")) || "noto"}-card.png`;
    a.click();
    toast(tr("cardDone"));
  } catch (e) {
    status(`${tr("cardFailed")} ${e.message || ""}`);
  }
}

function loadImage(src) {
  return new Promise((ok, no) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ok(img);
    img.onerror = () => no(new Error("image"));
    img.src = src;
  });
}

function wrapText(g, text, x, y, maxW, lineH, maxLines) {
  const chars = [...String(text || "")];
  let line = "";
  let n = 0;
  for (const ch of chars) {
    if (g.measureText(line + ch).width > maxW && line) {
      g.fillText(line, x, y + n * lineH);
      line = ch;
      if (++n >= maxLines - 1) break;
    } else {
      line += ch;
    }
  }
  if (line && n < maxLines) g.fillText(line, x, y + n * lineH);
}

function exportJson() {
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(S.spots, null, 2)}\n`], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "spots.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJson(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const j = JSON.parse(String(r.result || "[]"));
      if (!Array.isArray(j)) return;
      S.spots = j.map(norm).filter(Boolean);
      saveLocal();
      if (ghReady()) await syncGh("Import Noto map posts");
      render();
    } catch (e) {
      status(`${tr("syncFailed")} ${e.message || ""}`);
    }
  };
  r.readAsText(file);
  E.importInput.value = "";
}

/* ======================== 11. 共通処理 ======================== */

function localSpots() {
  try {
    const j = JSON.parse(localStorage.getItem(LS) || "[]");
    return Array.isArray(j) ? j.map(norm).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveLocal() {
  try { localStorage.setItem(LS, JSON.stringify(S.spots)); } catch (e) { console.warn("local save failed", e); }
}

function norm(p) {
  if (!p) return null;
  /* 0,0 で保存された投稿は locationText から座標を取り戻す */
  let lat = Number(p.lat);
  let lng = Number(p.lng);
  if (!valid(lat, lng)) {
    const c = coords(p.locationText);
    if (!c) return null;
    lat = c.lat;
    lng = c.lng;
  }
  /* 保存済みの en/ko/zh は語中一致で壊れているものがあるので、ja から作り直す */
  const rawTitle = typeof p.title === "string" ? p.title : p.title?.ja || "Untitled";
  const rawBody = typeof p.description === "string" ? p.description : p.description?.ja || "";
  const title = titleObj(rawTitle, rawBody);
  const description = bodyObj(rawBody);
  let municipality = p.municipality;
  let group = p.group;
  /* 未分類のまま残っている投稿は、地名か座標から入れ直す */
  if (!municipality || municipality.ja === REGION.ja) {
    municipality = inferMunicipality([group, title.ja, description.ja, p.locationText].join("\n"), lat, lng);
    if (!group || group === REGION.ja) group = municipality.ja;
  }
  return {
    ...p,
    id: p.id || idNew(),
    title,
    description,
    municipality,
    group: group || municipality.ja,
    lat,
    lng,
    photos: Array.isArray(p.photos) ? p.photos.filter((x) => x?.src) : [],
    /* 本文から読み取るだけの項目。保存はしない（syncGh で外す）。 */
    artists: parseArtists(rawBody),
    topics: parseTopics(rawBody),
    archive: parseArchive(rawBody),
  };
}

/* ---- 本文のハッシュタグを読み解く ----
   作者は #InspiredByPaulKlee のように作家を、#ModernismNoto のように
   様式・主題を書いている。市区町村タグと美術館名は絞り込みに使わない。 */

const TAG_SKIP = /^(NotoNoOtoMuseum|CentralNotoPeninsula)$/i;

function hashtags(body) {
  return [...String(body || "").matchAll(/#([A-Za-z][A-Za-z0-9]*)/g)].map((m) => m[1]);
}

function isPlaceTag(tag) {
  if (/(City|Town|Village)$/.test(tag)) return true;
  const low = tag.toLowerCase();
  return MUNICIPAL.some((m) => [m.en, ...m.aliases].some((a) => low === String(a).toLowerCase().replace(/\s+/g, "")));
}

function parseArtists(body) {
  return [...new Set(hashtags(body).filter((t) => /^InspiredBy./.test(t)).map((t) => t.slice(10)))];
}

function parseTopics(body) {
  return [...new Set(hashtags(body).filter((t) => !/^InspiredBy/.test(t) && !TAG_SKIP.test(t) && !isPlaceTag(t)))];
}

function parseArchive(body) {
  const m = String(body || "").match(/Archive\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

/* 人名タグを読みやすく割る: PaulKlee → Paul Klee */
function spaceCamel(s) {
  return String(s).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim();
}

/* ---- 多言語 ----
   作者は本文に「日本語の行 → その英訳の行」の順で書いている（102件中92件）。
   機械置換ではなく、その英訳をそのまま使う。
   韓国語・中国語の訳は存在しないので日本語を出す。以前は語中一致で
   Ishikawa が I시카마치wa のように壊れていた。訳せないものは訳さない。 */

function isLatinLine(line) {
  const jp = (line.match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length;
  const la = (line.match(/[A-Za-z]/g) || []).length;
  return la > 0 && jp === 0;
}

function isPlaceLine(line) {
  return /,\s*(Japan|Ishikawa|Toyama|Noto Peninsula)\b/i.test(line);
}

function isMetaLine(line) {
  return !line || line.startsWith("#") || /^Archive\s+\d+/i.test(line) || !!coords(line);
}

/* 本文から作者自身の英訳を取り出す */
function englishParts(body) {
  const lines = String(body || "").split(/\r?\n/).map((l) => l.trim());
  const kept = lines.filter((l) => l && !isMetaLine(l) && isLatinLine(l));
  const lead = [];
  for (const l of kept) {
    if (isPlaceLine(l)) break;
    lead.push(l);
    if (lead.length >= 3) break;
  }
  return { title: lead.join(" ").trim(), body: kept.join("\n").trim() };
}

function titleObj(s, body) {
  const m = String(s).trim().match(/^(.*?)【(.+?)】/);
  const ja = m ? m[1].trim() || String(s).trim() : String(s).trim();
  const inside = m ? m[2].replace(/[｜|]/g, " / ").trim() : "";
  const en = inside || englishParts(body).title || ja;
  return { ja, en, ko: ja, zh: ja };
}

function bodyObj(s) {
  const clean = String(s || "").trim();
  /* ハッシュタグのローマ字が多いので「英字が多いか」では判定できない。
     ローマ字だけの行が取れればそれが作者の英訳。 */
  const en = englishParts(clean).body || clean;
  return { ja: clean, en, ko: clean, zh: clean };
}

function tr(key, vars = {}) {
  let s = I[S.lang]?.[key] ?? I.ja[key] ?? key;
  Object.keys(vars).forEach((k) => { s = s.replaceAll(`{${k}}`, vars[k]); });
  return s;
}

/* 画面に出す本文。ハッシュタグ・Archive 番号・座標は別に表示しているので省く。
   保存してある文章そのものは変えない。 */
function readableBody(p) {
  return txt(p, "description")
    .split(/\r?\n/)
    .filter((l) => {
      const t = l.trim();
      if (!t) return true;
      if (t.startsWith("#")) return false;
      if (/^Archive\s+\d+/i.test(t)) return false;
      if (coords(t) && t.replace(/[\d\s°'"NSEW.,+-]/gi, "") === "") return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function txt(p, key) {
  const v = p[key];
  return typeof v === "string" ? v : v?.[S.lang] || v?.ja || v?.en || "";
}

/* 市区町村・タグ・検索語の3つで絞り、選ばれた順に並べる */
function filtered(id = S.group) {
  let rows = S.spots;
  if (S.role !== "editor") rows = rows.filter((p) => !p.draft);
  if (id !== "all") rows = rows.filter((p) => gid(p.group || p.municipality?.ja) === id);
  if (S.tags.size) rows = rows.filter((p) => [...S.tags].every((t) => spotTags(p).includes(t)));
  const q = S.q.trim().toLowerCase();
  if (q) rows = rows.filter((p) => searchText(p).includes(q));
  return sortRows(rows);
}

function spotTags(p) {
  return [...(p.topics || []), ...(p.artists || []).map((a) => `@${a}`)];
}

function searchText(p) {
  return [
    p.title?.ja, p.title?.en, p.description?.ja, p.description?.en,
    p.municipality?.ja, p.municipality?.en, p.group, p.locationText,
    ...(p.topics || []), ...(p.artists || []).map(spaceCamel),
    p.archive ? `archive ${p.archive}` : "",
  ].join("\n").toLowerCase();
}

function sortRows(rows) {
  const at = (s) => Date.parse(s?.updatedAt || s?.createdAt || "") || 0;
  const copy = [...rows];
  if (S.sort === "old") return copy.sort((a, b) => at(a) - at(b));
  if (S.sort === "archive") return copy.sort((a, b) => (a.archive ?? 1e9) - (b.archive ?? 1e9) || at(b) - at(a));
  if (S.sort === "title") return copy.sort((a, b) => txt(a, "title").localeCompare(txt(b, "title"), S.lang));
  return copy.sort((a, b) => at(b) - at(a));
}

function filtersActive() {
  return S.group !== "all" || S.tags.size > 0 || !!S.q.trim();
}

function clearFilters() {
  S.group = "all";
  S.tags.clear();
  S.q = "";
  E.searchInput.value = "";
  S.fitKey = "";
  render();
  syncUrl();
}

function photo(p) { return p.photos?.[0]?.src || ""; }

/* 0,0 は「未入力」の結果であって能登の座標ではない。地図に出さない。 */
function valid(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    && !(lat === 0 && lng === 0);
}

function idNew() { return `spot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function gid(s) { return String(s || "all").toLowerCase().replace(/\s+/g, "-"); }
function ext(file) {
  const m = file.name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : file.type.includes("png") ? "png" : "jpg";
}
function slug(s) {
  return String(s || "photo").toLowerCase().replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42) || "photo";
}
function short(s, n) { s = String(s || ""); return s.length > n ? `${s.slice(0, n - 1)}…` : s; }
function esc(s) {
  return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function attr(s) { return esc(s); }
function rx(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function b64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.slice(i, i + 0x8000));
  return btoa(bin);
}

function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
    return value;
  } catch {
    return null;
  }
}

/* 下から出す編集パネルがヘッダーを覆わないよう、実測した高さを CSS に渡す */
function trackHeaderHeight() {
  const bar = document.querySelector(".topbar");
  if (!bar) return;
  const set = () => document.documentElement.style.setProperty("--header-h", `${Math.ceil(bar.getBoundingClientRect().height)}px`);
  set();
  if (window.ResizeObserver) new ResizeObserver(set).observe(bar);
  window.addEventListener("resize", set);
}

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function applyTheme(value) {
  const v = ["light", "dark", "system"].includes(value) ? value : "system";
  if (v === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", v);
  E.themeGroup?.querySelectorAll("[data-theme-value]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.themeValue === v)));
}

function applyTextSize(value) {
  const v = value === "large" ? "large" : "normal";
  document.documentElement.setAttribute("data-text", v);
  E.textSizeGroup?.querySelectorAll("[data-size-value]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.sizeValue === v)));
}

/* ---- モーダル・通知 ---- */

let lastFocus = null;

function openModal(el, focusTarget) {
  lastFocus = document.activeElement;
  el.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  (focusTarget || el.querySelector("input, button"))?.focus();
  /* 必ずブロックで書く。式のまま書くと Tab 以外のキーで false が返り、
     onkeydown に直接代入したハンドラの戻り値 false は入力の取り消しになる。
     つまり文字が1つも打てなくなる。 */
  el.onkeydown = (ev) => { if (ev.key === "Tab") trapFocus(ev, el); };
}

function closeModal(el) {
  el.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  el.onkeydown = null;
  lastFocus?.focus();
}

function trapFocus(ev, el) {
  const nodes = [...el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea')]
    .filter((n) => n.offsetParent !== null);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
  else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
}

function openLightbox(src, caption, index = 0) {
  lastFocus = document.activeElement;
  S.lightRows = filtered();
  S.lightAt = S.lightRows.findIndex((x) => x.id === S.selected);
  S.lightShot = index;
  E.lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  paintLightbox(src, caption);
  E.lightboxClose.focus();
}

function paintLightbox(src, caption) {
  E.lightboxImage.src = src;
  E.lightboxImage.alt = caption || "";
  E.lightboxCaption.textContent = caption || "";
  const rows = S.lightRows || [];
  E.lightboxPrev.disabled = !(S.lightAt > 0);
  E.lightboxNext.disabled = !(S.lightAt >= 0 && S.lightAt < rows.length - 1);
  E.lightboxPos.textContent = rows.length ? `${S.lightAt + 1} / ${rows.length}` : "";
}

/* 拡大したまま隣の作品へ送る */
function stepLightbox(dir) {
  const rows = S.lightRows || [];
  const at = S.lightAt + dir;
  if (at < 0 || at >= rows.length) return;
  S.lightAt = at;
  const p = rows[at];
  S.selected = p.id;
  S.lightShot = 0;
  list();
  renderDetail();
  syncUrl();
  paintLightbox(photo(p), txt(p, "title"));
}

function closeLightbox() {
  E.lightbox.setAttribute("aria-hidden", "true");
  E.lightboxImage.src = "";
  document.body.classList.remove("modal-open");
  lastFocus?.focus();
}

/* 消した直後だけ、戻せるようにしておく */
function offerUndo(spot) {
  S.undo = spot;
  toast(tr("deleted"), true);
  clearTimeout(offerUndo.timer);
  offerUndo.timer = setTimeout(() => { S.undo = null; E.undoButton.hidden = true; }, 12000);
}

async function undoDelete() {
  const spot = S.undo;
  if (!spot) return;
  S.undo = null;
  E.undoButton.hidden = true;
  const before = S.spots;
  S.spots = [spot, ...S.spots];
  status(tr("saving"));
  try {
    await syncGh("Restore Noto map post");
    render();
    toast(tr("restored"));
  } catch (e) {
    S.spots = before;
    saveLocal();
    render();
    status(`${tr("syncFailed")} ${e.message || ""}`);
  }
}

function status(message) {
  E.mapStatus.textContent = message;
  E.mapStatus.classList.add("is-on");
  clearTimeout(status.timer);
  status.timer = setTimeout(() => E.mapStatus.classList.remove("is-on"), 4000);
}

function toast(message, withUndo = false) {
  E.toastText.textContent = message;
  E.undoButton.hidden = !withUndo;
  E.toast.classList.add("is-on");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    E.toast.classList.remove("is-on");
    E.undoButton.hidden = true;
  }, withUndo ? 12000 : 4200);
}
