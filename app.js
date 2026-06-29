const REPO = "tmgddjtt57-collab/notomap";
const BRANCH = "main";
const DATA = "data/spots.json";
const MEDIA = "media/spots";
const PASS = "noto2026";
const LS = "noto-no-oto-spots-v5";
const LANG = "noto-no-oto-lang";
const EDIT = "noto-no-oto-editor";
const GHCFG = "noto-no-oto-gh-cfg";
const GHTOKEN = "noto-no-oto-gh-token";
const MAX_SIDE = 1280;
const JPEG_Q = 0.78;

const I = {
  ja: {
    siteTitle: "のとのおと美術館デジタルマップ",
    eyebrow: "Noto Peninsula Digital Museum",
    language: "言語",
    details: "詳細",
    role: "権限",
    viewerMode: "閲覧者",
    openEditor: "編集者",
    regionEyebrow: "Noto Peninsula",
    regionTitle: "能登の風景をめぐるデジタル美術館",
    regionCopy: "能登半島の海、里山、集落、季節の色を写真と位置情報で記録し、世界の来訪者に紹介する地図です。",
    groups: "グループ",
    all: "すべて",
    photos: "写真",
    newPost: "投稿",
    editorPanel: "Editor panel",
    formTitle: "写真を地図に表示",
    uploadPhoto: "写真",
    choosePhoto: "写真を複数選択",
    pasteImport: "ペーストから自動入力",
    pastePlaceholder: "タイトル・説明・位置情報をまとめて貼り付け",
    applyPaste: "反映",
    title: "タイトル",
    description: "説明",
    locationInfo: "位置情報",
    currentLocation: "現在地",
    pickOnMap: "地図で指定",
    group: "グループ",
    latitude: "緯度",
    longitude: "経度",
    delete: "削除",
    reset: "リセット",
    save: "地図に表示",
    editorAccess: "Editor access",
    passkeyTitle: "編集者パスワードを入力",
    passkeyCopy: "編集者画面は閲覧者用とは別にしています。",
    password: "パスワード",
    passkeyError: "パスワードが違います。",
    cancel: "キャンセル",
    unlock: "開く",
    syncTitle: "全デバイスに反映",
    syncCopy: "GitHub token を入れると、投稿・削除が公開サイトに保存されます。",
    repo: "Repository",
    branch: "Branch",
    token: "GitHub token",
    tokenCopy: "token はこのブラウザ内だけに保存されます。",
    connect: "接続",
    postComplete: "投稿が完了しました。地図に反映しました。",
    noPhotos: "まだ投稿がありません。",
    noPreview: "写真を選択してください。",
    photoTitle: "写真{index}のタイトル",
    photoDescription: "写真{index}の説明",
    photoLocation: "写真{index}の位置情報",
    edit: "編集",
    invalidLocation: "位置情報を確認してください。",
  },
  en: {
    siteTitle: "Noto no Oto Museum Digital Map",
    eyebrow: "Noto Peninsula Digital Museum",
    language: "Language",
    details: "Details",
    role: "Role",
    viewerMode: "Viewer",
    openEditor: "Editor",
    regionEyebrow: "Noto Peninsula",
    regionTitle: "A digital museum for Noto landscapes",
    regionCopy: "A map sharing Noto's sea, villages, seasons and cultural memory through photos and location data.",
    groups: "Groups",
    all: "All",
    photos: "Photos",
    newPost: "Post",
    formTitle: "Show a photo on the map",
    choosePhoto: "Choose photos",
    pasteImport: "Auto-fill from pasted text",
    applyPaste: "Apply",
    title: "Title",
    description: "Description",
    locationInfo: "Location",
    currentLocation: "Current location",
    pickOnMap: "Pick on map",
    group: "Group",
    delete: "Delete",
    reset: "Reset",
    save: "Show on map",
    passkeyTitle: "Enter editor password",
    password: "Password",
    cancel: "Cancel",
    unlock: "Open",
    syncTitle: "Reflect on every device",
    connect: "Connect",
    postComplete: "Post complete. The map has been updated.",
    noPhotos: "No posts yet.",
    noPreview: "Choose photos first.",
    photoTitle: "Photo {index} title",
    photoDescription: "Photo {index} details",
    photoLocation: "Photo {index} location",
    edit: "Edit",
    invalidLocation: "Please check the location.",
  },
  ko: {
    siteTitle: "노토노오토 미술관 디지털 맵",
    language: "언어",
    details: "상세",
    viewerMode: "열람자",
    openEditor: "편집자",
    regionTitle: "노토 풍경을 기록하는 디지털 미술관",
    regionCopy: "노토반도의 풍경을 사진과 위치 정보로 소개하는 지도입니다.",
    groups: "그룹",
    all: "전체",
    photos: "사진",
    newPost: "게시",
    title: "제목",
    description: "설명",
    locationInfo: "위치 정보",
    save: "지도에 표시",
    delete: "삭제",
    reset: "초기화",
    postComplete: "게시가 완료되었습니다.",
  },
  zh: {
    siteTitle: "Noto no Oto 美术馆数字地图",
    language: "语言",
    details: "详细",
    viewerMode: "浏览者",
    openEditor: "编辑者",
    regionTitle: "记录能登风景的数字美术馆",
    regionCopy: "用照片和位置信息介绍能登半岛风景的地图。",
    groups: "分组",
    all: "全部",
    photos: "照片",
    newPost: "发布",
    title: "标题",
    description: "说明",
    locationInfo: "位置信息",
    save: "显示在地图上",
    delete: "删除",
    reset: "重置",
    postComplete: "发布完成。",
  },
};

const MUNICIPAL = [
  ["輪島市", "Wajima", "와지마시", "轮岛市", "輪島,wajima,outerwajima"],
  ["珠洲市", "Suzu", "스즈시", "珠洲市", "珠洲,suzu"],
  ["七尾市", "Nanao", "나나오시", "七尾市", "七尾,nanao"],
  ["羽咋市", "Hakui", "하쿠이시", "羽咋市", "羽咋,hakui"],
  ["志賀町", "Shika", "시카마치", "志贺町", "志賀,shika"],
  ["穴水町", "Anamizu", "아나미즈마치", "穴水町", "穴水,anamizu"],
  ["能登町", "Noto Town", "노토마치", "能登町", "能登町,noto town"],
  ["中能登町", "Nakanoto", "나카노토마치", "中能登町", "中能登,nakanoto"],
].map(([ja, en, ko, zh, aliases]) => ({ ja, en, ko, zh, aliases: aliases.split(",") }));

const WORDS = {
  能登半島: { en: "Noto Peninsula", ko: "노토반도", zh: "能登半岛" },
  水芭蕉: { en: "Asian skunk cabbage", ko: "물파초", zh: "水芭蕉" },
  春: { en: "spring", ko: "봄", zh: "春天" },
  海: { en: "sea", ko: "바다", zh: "海" },
  里山: { en: "satoyama", ko: "사토야마", zh: "里山" },
};

const $ = (id) => document.getElementById(id);
const E = {};
const S = { lang: localStorage.getItem(LANG) || "ja", spots: [], drafts: [], group: "all", selected: "", role: "viewer", markers: new Map(), pick: false };

document.addEventListener("DOMContentLoaded", start);

async function start() {
  [
    "languageSelect", "detailsMenu", "viewerModeButton", "editorModeButton", "githubSyncButton", "exportButton", "importInput", "groupList", "spotList", "newSpotButton", "closeDrawerButton", "spotForm", "spotId", "photoFile", "photoPreview", "pasteInput", "applyPasteButton", "titleJa", "descriptionJa", "locationInfo", "currentLocationButton", "pickOnMapButton", "spotGroup", "latitude", "longitude", "deleteButton", "resetButton", "passkeyModal", "passkeyForm", "editorPasskeyInput", "passkeyError", "passkeyCancelButton", "githubSyncModal", "githubSyncForm", "githubRepoInput", "githubBranchInput", "githubTokenInput", "githubSyncError", "githubSyncCancelButton", "completionToast", "mapStatus", "imageLightbox", "imageLightboxImage", "imageLightboxCaption", "imageLightboxClose"
  ].forEach((id) => (E[id] = $(id)));
  E.languageSelect.value = S.lang;
  E.deleteButton.disabled = true;
  bind();
  i18n();
  initMap();
  S.spots = localSpots();
  render();
  await loadRemote();
  render();
  icons();
}

function bind() {
  E.languageSelect.onchange = () => { S.lang = E.languageSelect.value; localStorage.setItem(LANG, S.lang); i18n(); render(); };
  E.editorModeButton.onclick = () => (sessionStorage.getItem(EDIT) === "1" ? editor() : modal(E.passkeyModal, true));
  E.viewerModeButton.onclick = () => { S.role = "viewer"; document.body.className = "viewer"; reset(); render(); };
  E.passkeyForm.onsubmit = (ev) => { ev.preventDefault(); if (E.editorPasskeyInput.value !== PASS) return (E.passkeyError.hidden = false); sessionStorage.setItem(EDIT, "1"); E.editorPasskeyInput.value = ""; E.passkeyError.hidden = true; modal(E.passkeyModal, false); editor(); };
  E.passkeyCancelButton.onclick = () => modal(E.passkeyModal, false);
  E.newSpotButton.onclick = () => { reset(); openDrawer(); };
  E.closeDrawerButton.onclick = () => document.body.classList.remove("drawer-open");
  E.photoFile.onchange = filesChanged;
  E.applyPasteButton.onclick = pasteIn;
  E.spotForm.onsubmit = saveForm;
  E.resetButton.onclick = reset;
  E.deleteButton.onclick = () => S.selected && removeSpot(S.selected);
  E.currentLocationButton.onclick = currentPos;
  E.pickOnMapButton.onclick = () => { S.pick = true; status("地図上を押して位置を指定してください。"); };
  E.githubSyncButton.onclick = () => { fillGh(); modal(E.githubSyncModal, true); };
  E.githubSyncCancelButton.onclick = () => modal(E.githubSyncModal, false);
  E.githubSyncForm.onsubmit = connectGh;
  E.exportButton.onclick = exportJson;
  E.importInput.onchange = importJson;
  E.groupList.onclick = (ev) => { const b = ev.target.closest("[data-group]"); if (b) { S.group = b.dataset.group; render(); } };
  E.spotList.onclick = (ev) => { const act = ev.target.closest("[data-action]"); if (act?.dataset.action === "edit") return editSpot(act.dataset.id); if (act?.dataset.action === "delete") return removeSpot(act.dataset.id); const card = ev.target.closest(".spot-card"); if (card) selectSpot(card.dataset.id, true); };
  E.photoPreview.oninput = (ev) => { const f = ev.target.closest("[data-draft-field]"); if (f && S.drafts[f.dataset.index]) S.drafts[f.dataset.index][f.dataset.draftField] = ev.target.value; };
  E.imageLightboxClose.onclick = closeLightbox;
  E.imageLightbox.onclick = (ev) => ev.target === E.imageLightbox && closeLightbox();
  document.onclick = (ev) => { const a = ev.target.closest("[data-action]"); if (a?.dataset.action === "lightbox") openLightbox(a.dataset.src, a.dataset.caption || ""); if (a?.dataset.action === "popup-edit") editSpot(a.dataset.id); };
}

function initMap() { if (!window.L) return status("地図ライブラリを読み込めませんでした。"); S.map = L.map("map", { zoomControl: true }).setView([37.28, 136.96], 9); L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(S.map); S.layer = L.markerClusterGroup ? L.markerClusterGroup({ showCoverageOnHover: false }) : L.layerGroup(); S.layer.addTo(S.map); S.map.on("click", (ev) => { if (!S.pick) return; setCoord(ev.latlng.lat, ev.latlng.lng); S.pick = false; status("位置情報を反映しました。"); }); }
function i18n() { document.documentElement.lang = S.lang; document.title = tr("siteTitle"); document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = tr(n.dataset.i18n))); document.querySelectorAll("[data-i18n-placeholder]").forEach((n) => n.setAttribute("placeholder", tr(n.dataset.i18nPlaceholder))); }
function tr(k, v = {}) { let s = I[S.lang]?.[k] || I.ja[k] || k; Object.keys(v).forEach((key) => (s = s.replaceAll(`{${key}}`, v[key]))); return s; }
function editor() { S.role = "editor"; document.body.className = "editor drawer-open"; E.detailsMenu.open = false; render(); }
function openDrawer() { if (S.role === "editor") document.body.classList.add("drawer-open"); }
function modal(el, show) { el.setAttribute("aria-hidden", show ? "false" : "true"); }
function render() { groups(); list(); markers(); preview(); icons(); }
function groups() { const m = new Map(); S.spots.forEach((p) => m.set(gid(p.group || p.municipality?.ja), p.municipality?.[S.lang] || p.group || "能登半島")); const chips = [`<button class="group-chip${S.group === "all" ? " active" : ""}" data-group="all">${esc(tr("all"))} (${S.spots.length})</button>`]; [...m].sort().forEach(([id, name]) => chips.push(`<button class="group-chip${S.group === id ? " active" : ""}" data-group="${attr(id)}">${esc(name)} (${filtered(id).length})</button>`)); E.groupList.innerHTML = chips.join(""); }
function list() { const rows = filtered(); if (!rows.length) return (E.spotList.innerHTML = `<p class="passkey-copy">${esc(tr("noPhotos"))}</p>`); E.spotList.innerHTML = rows.map((p) => { const img = photo(p); const actions = S.role === "editor" ? `<div class="spot-actions"><button class="secondary-button" data-action="edit" data-id="${attr(p.id)}">${esc(tr("edit"))}</button><button class="danger-button" data-action="delete" data-id="${attr(p.id)}">${esc(tr("delete"))}</button></div>` : ""; return `<article class="spot-card${p.id === S.selected ? " active" : ""}" data-id="${attr(p.id)}"><div class="spot-thumb">${img ? `<img src="${attr(img)}" alt="">` : ""}</div><div class="spot-meta"><h3>${esc(txt(p, "title"))}</h3><p>${esc(txt(p, "municipality"))}</p><p>${esc(short(txt(p, "description"), 90))}</p>${actions}</div></article>`; }).join(""); }
function markers() { if (!S.layer) return; S.layer.clearLayers(); S.markers.clear(); filtered().forEach((p) => { if (!valid(p.lat, p.lng)) return; const mk = L.marker([p.lat, p.lng], { icon: icon(photo(p)) }).bindPopup(popup(p), { maxWidth: 320 }); mk.on("click", () => selectSpot(p.id, false)); S.layer.addLayer(mk); S.markers.set(p.id, mk); }); }
function icon(src) { const inner = src ? `<img src="${attr(src)}" alt="">` : `<span>${esc(tr("photos").slice(0, 1))}</span>`; return L.divIcon({ className: "", html: `<div class="photo-marker"><div class="marker-photo-frame${src ? "" : " empty"}">${inner}</div></div>`, iconSize: [54, 64], iconAnchor: [27, 64], popupAnchor: [0, -62] }); }
function popup(p) { const title = txt(p, "title"); const main = photo(p); const gallery = (p.photos || []).map((x) => `<button data-action="lightbox" data-src="${attr(x.src)}" data-caption="${attr(title)}"><img src="${attr(x.src)}" alt=""></button>`).join(""); const edit = S.role === "editor" ? `<button class="secondary-button" data-action="popup-edit" data-id="${attr(p.id)}">${esc(tr("edit"))}</button>` : ""; return `<div class="popup-card">${main ? `<button class="popup-thumb" data-action="lightbox" data-src="${attr(main)}" data-caption="${attr(title)}"><img src="${attr(main)}" alt=""></button>` : ""}<h3>${esc(title)}</h3><p>${esc(txt(p, "municipality"))}</p><p>${esc(txt(p, "description"))}</p>${p.photos?.length > 1 ? `<div class="popup-gallery">${gallery}</div>` : ""}${edit}</div>`; }
function selectSpot(id, open) { S.selected = id; const p = S.spots.find((x) => x.id === id); const mk = S.markers.get(id); if (p && S.map) S.map.setView([p.lat, p.lng], Math.max(S.map.getZoom(), 12), { animate: true }); if (open && mk) mk.openPopup(); list(); }
function editSpot(id) { const p = S.spots.find((x) => x.id === id); if (!p) return; S.selected = id; S.drafts = []; E.spotId.value = id; E.titleJa.value = p.title?.ja || ""; E.descriptionJa.value = p.description?.ja || ""; E.locationInfo.value = p.locationText || `${p.lat}, ${p.lng}`; E.spotGroup.value = p.group || p.municipality?.ja || ""; E.latitude.value = p.lat || ""; E.longitude.value = p.lng || ""; E.deleteButton.disabled = false; openDrawer(); render(); }
async function removeSpot(id) { S.spots = S.spots.filter((x) => x.id !== id); S.selected = ""; saveLocal(); if (ghReady()) await syncGh("Delete Noto map post"); reset(); toast(tr("delete")); }
function reset() { S.drafts.forEach((d) => URL.revokeObjectURL(d.preview)); S.drafts = []; S.selected = ""; E.spotForm.reset(); E.photoFile.value = ""; E.spotId.value = ""; E.deleteButton.disabled = true; E.spotForm.classList.remove("batch-entry-mode"); render(); }
function filesChanged(ev) { S.drafts.forEach((d) => URL.revokeObjectURL(d.preview)); S.drafts = [...(ev.target.files || [])].map((file) => ({ file, preview: URL.createObjectURL(file), title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), description: "", location: "" })); openDrawer(); preview(); }
function preview() { E.spotForm.classList.toggle("batch-entry-mode", S.drafts.length > 1); if (!S.drafts.length) { const p = S.spots.find((x) => x.id === S.selected); E.photoPreview.innerHTML = p?.photos?.length ? `<div class="photo-preview-gallery">${p.photos.map((x) => `<button data-action="lightbox" data-src="${attr(x.src)}" data-caption="${attr(txt(p, "title"))}"><img src="${attr(x.src)}" alt=""></button>`).join("")}</div>` : `<p class="passkey-copy">${esc(tr("noPreview"))}</p>`; return; } if (S.drafts.length === 1) { const d = S.drafts[0]; if (!E.titleJa.value) E.titleJa.value = d.title; E.photoPreview.innerHTML = `<div class="photo-preview-gallery"><button data-action="lightbox" data-src="${attr(d.preview)}" data-caption="${attr(d.title)}"><img src="${attr(d.preview)}" alt=""></button></div>`; return; } E.photoPreview.innerHTML = `<div class="batch-photo-list">${S.drafts.map((d, i) => `<article class="batch-photo-item"><div class="batch-photo-thumb"><img src="${attr(d.preview)}" alt=""></div><div class="batch-photo-fields"><label class="batch-photo-field">${esc(tr("photoTitle", { index: i + 1 }))}<input data-draft-field="title" data-index="${i}" value="${attr(d.title)}"></label><label class="batch-photo-field">${esc(tr("photoDescription", { index: i + 1 }))}<textarea data-draft-field="description" data-index="${i}">${esc(d.description)}</textarea></label><label class="batch-photo-field">${esc(tr("photoLocation", { index: i + 1 }))}<input data-draft-field="location" data-index="${i}" value="${attr(d.location)}" placeholder="37°22'14.5&quot;N 137°14'25.7&quot;E"></label></div></article>`).join("")}</div>`; }
function pasteIn() { const recs = parsePaste(E.pasteInput.value); if (!recs.length) return; if (S.drafts.length > 1) recs.forEach((r, i) => S.drafts[i] && Object.assign(S.drafts[i], { title: r.title || S.drafts[i].title, description: r.description || S.drafts[i].description, location: r.location || S.drafts[i].location })); else { const r = recs[0]; if (r.title) E.titleJa.value = r.title; if (r.description) E.descriptionJa.value = r.description; if (r.location) E.locationInfo.value = r.location; if (r.group) E.spotGroup.value = r.group; const c = coords(r.location); if (c) setCoord(c.lat, c.lng, false); } preview(); status(`${recs.length}件の情報を読み取りました。`); }
async function saveForm(ev) { ev.preventDefault(); const editing = S.selected ? S.spots.find((x) => x.id === S.selected) : null; const drafts = S.drafts.length ? S.drafts : [null]; const made = []; if (ghReady()) status("GitHub に保存しています。"); for (let i = 0; i < drafts.length; i++) { const d = drafts[i]; const title = (d?.title || E.titleJa.value || "").trim(); const description = (d?.description || E.descriptionJa.value || "").trim(); const locationText = (d?.location || E.locationInfo.value || "").trim(); const c = coords(locationText) || manualCoords(); if (!title || !c) return status(tr("invalidLocation")); const id = editing && drafts.length === 1 ? editing.id : idNew(); let photos = editing && drafts.length === 1 ? editing.photos || [] : []; if (d?.file) photos = [await makePhoto(d.file, id, i)]; const muni = infer(`${E.spotGroup.value}\n${title}\n${description}\n${locationText}`); const spot = { id, createdAt: editing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), title: titleObj(title), description: bodyObj(description), municipality: muni, group: E.spotGroup.value || muni.ja, locationText, lat: c.lat, lng: c.lng, photos }; if (editing && drafts.length === 1) S.spots = S.spots.map((x) => (x.id === id ? spot : x)); else S.spots.unshift(spot); made.push(spot); } saveLocal(); if (ghReady()) await syncGh("Update Noto museum map posts"); render(); reset(); toast(made.length > 1 ? `${made.length}件の投稿が完了しました。` : tr("postComplete")); }
async function makePhoto(file, spotId, index) { const p = await prepImage(file); if (!ghReady()) return { src: p.dataUrl, alt: file.name }; const path = `${MEDIA}/${Date.now()}-${spotId}-${index + 1}-${slug(file.name)}.${p.ext}`; await putGh(path, p.base64, `Add Noto map photo ${spotId}`, null, true); return { src: raw(path), alt: file.name, path }; }
function prepImage(file) { return new Promise((resolve) => { const fallback = async () => { const dataUrl = await readDataUrl(file); resolve({ dataUrl, base64: dataUrl.split(",")[1] || "", ext: ext(file) }); }; if (!file.type.startsWith("image/") || /hei[cf]/i.test(file.name)) return fallback(); const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => { const s = Math.min(1, MAX_SIDE / Math.max(img.width, img.height)); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(img.width * s)); canvas.height = Math.max(1, Math.round(img.height * s)); canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); const dataUrl = canvas.toDataURL("image/jpeg", JPEG_Q); resolve({ dataUrl, base64: dataUrl.split(",")[1], ext: "jpg" }); }; img.onerror = () => { URL.revokeObjectURL(url); fallback(); }; img.src = url; }); }
function readDataUrl(file) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result || "")); r.onerror = () => no(r.error); r.readAsDataURL(file); }); }
function parsePaste(text) { const src = String(text || "").trim(); if (!src) return []; const ms = coordMatches(src); if (!ms.length) return [record(src, "")]; return ms.map((m, i) => record(src.slice(i ? ms[i - 1].index + ms[i - 1].text.length : 0, ms[i + 1]?.index || src.length).trim(), m.text)); }
function record(block, ctext) { const lines = block.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).filter((x) => !/^(タイトル|位置情報|詳細|説明|title|location|description)$/i.test(x)); const ci = lines.findIndex((x) => x.includes(ctext)); const before = ci >= 0 ? lines.slice(0, ci) : lines; const after = ci >= 0 ? lines.slice(ci + 1) : []; const group = [...before, ...after].find(isLocLine) || ""; const title = [...before].reverse().find((x) => x !== group && /【|｜|[\u3040-\u30ff\u3400-\u9fff]/.test(x) && x.length <= 120) || before.filter((x) => x !== group).pop() || ""; const description = [...before, ...after].filter((x) => x !== group && x !== title && !x.startsWith("#") && !/^Archive\s+\d+/i.test(x)).join("\n"); return { title, description, location: ctext, group }; }
function coordMatches(text) { const a = []; const dmsRe = /(\d{1,2})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*(?:"|″)?\s*([NS])\s+(\d{1,3})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*(?:"|″)?\s*([EW])/gi; const dec = /([-+]?\d{1,2}\.\d{3,})\s*,?\s+([-+]?\d{1,3}\.\d{3,})/g; [dmsRe, dec].forEach((re) => { let m; while ((m = re.exec(text))) a.push({ index: m.index, text: m[0] }); }); return a.sort((x, y) => x.index - y.index); }
function coords(value) { const s = String(value || ""); const m = s.match(/(\d{1,2})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*(?:"|″)?\s*([NS])\s+(\d{1,3})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*(?:"|″)?\s*([EW])/i); if (m) { const lat = dms(Number(m[1]), Number(m[2]), Number(m[3]), m[4]); const lng = dms(Number(m[5]), Number(m[6]), Number(m[7]), m[8]); return valid(lat, lng) ? { lat, lng } : null; } const n = s.match(/([-+]?\d{1,2}(?:\.\d+)?)\s*,?\s+([-+]?\d{1,3}(?:\.\d+)?)/); if (!n) return null; const lat = Number(n[1]); const lng = Number(n[2]); return valid(lat, lng) ? { lat, lng } : null; }
function dms(d, m, s, h) { const v = d + m / 60 + s / 3600; return /S|W/i.test(h) ? -v : v; }
function manualCoords() { const lat = Number(E.latitude.value); const lng = Number(E.longitude.value); return valid(lat, lng) ? { lat, lng } : null; }
function setCoord(lat, lng, write = true) { E.latitude.value = lat.toFixed(6); E.longitude.value = lng.toFixed(6); if (write) E.locationInfo.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`; }
function currentPos() { navigator.geolocation?.getCurrentPosition((p) => setCoord(p.coords.latitude, p.coords.longitude), () => status(tr("invalidLocation")), { enableHighAccuracy: true, timeout: 10000 }); }
async function loadRemote() { try { const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA}?v=${Date.now()}`, { cache: "no-store" }); if (!r.ok) return; const j = await r.json(); if (Array.isArray(j)) { S.spots = j.map(norm).filter(Boolean); saveLocal(); } } catch {} }
function localSpots() { try { const j = JSON.parse(localStorage.getItem(LS) || "[]"); return Array.isArray(j) ? j.map(norm).filter(Boolean) : []; } catch { return []; } }
function saveLocal() { localStorage.setItem(LS, JSON.stringify(S.spots)); }
function norm(p) { if (!p || !valid(Number(p.lat), Number(p.lng))) return null; const title = typeof p.title === "string" ? titleObj(p.title) : p.title || titleObj("Untitled"); const description = typeof p.description === "string" ? bodyObj(p.description) : p.description || bodyObj(""); return { ...p, id: p.id || idNew(), title, description, municipality: p.municipality || infer(`${title.ja}\n${description.ja}`), group: p.group || p.municipality?.ja || "能登半島", lat: Number(p.lat), lng: Number(p.lng), photos: Array.isArray(p.photos) ? p.photos.filter((x) => x?.src) : [] }; }
function ghCfg() { const c = JSON.parse(localStorage.getItem(GHCFG) || "{}"); return { repo: c.repo || REPO, branch: c.branch || BRANCH, token: sessionStorage.getItem(GHTOKEN) || "" }; }
function ghReady() { const c = ghCfg(); return !!(c.repo && c.branch && c.token); }
function fillGh() { const c = ghCfg(); E.githubRepoInput.value = c.repo; E.githubBranchInput.value = c.branch; E.githubTokenInput.value = c.token; }
async function connectGh(ev) { ev.preventDefault(); localStorage.setItem(GHCFG, JSON.stringify({ repo: E.githubRepoInput.value.trim() || REPO, branch: E.githubBranchInput.value.trim() || BRANCH })); if (E.githubTokenInput.value.trim()) sessionStorage.setItem(GHTOKEN, E.githubTokenInput.value.trim()); try { if (!(await getGh(DATA))) await putGh(DATA, b64("[]\n"), "Create Noto map data", null, true); modal(E.githubSyncModal, false); status("GitHub sync に接続しました。"); await loadRemote(); render(); } catch (e) { E.githubSyncError.hidden = false; E.githubSyncError.textContent = `GitHub 同期に失敗しました。${e.message || ""}`; } }
async function syncGh(msg) { const clean = S.spots.map((p) => ({ ...p, photos: (p.photos || []).filter((x) => x.src && !x.src.startsWith("data:")) })); const cur = await getGh(DATA); await putGh(DATA, b64(`${JSON.stringify(clean, null, 2)}\n`), msg, cur?.sha || null, true); }
async function getGh(path) { const c = ghCfg(); const r = await fetch(`https://api.github.com/repos/${c.repo}/contents/${path}?ref=${encodeURIComponent(c.branch)}`, { headers: ghHeaders(c.token) }); if (r.status === 404) return null; if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json(); }
async function putGh(path, content, message, sha, is64) { const c = ghCfg(); const body = { message, branch: c.branch, content: is64 ? content : b64(content) }; if (sha) body.sha = sha; const r = await fetch(`https://api.github.com/repos/${c.repo}/contents/${path}`, { method: "PUT", headers: ghHeaders(c.token), body: JSON.stringify(body) }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
function ghHeaders(token) { return { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" }; }
function raw(path) { const c = ghCfg(); return `https://raw.githubusercontent.com/${c.repo}/${c.branch}/${path}?v=${Date.now()}`; }
function exportJson() { const url = URL.createObjectURL(new Blob([`${JSON.stringify(S.spots, null, 2)}\n`], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = "spots.json"; a.click(); URL.revokeObjectURL(url); }
function importJson(ev) { const file = ev.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = async () => { const j = JSON.parse(String(r.result || "[]")); if (Array.isArray(j)) { S.spots = j.map(norm).filter(Boolean); saveLocal(); if (ghReady()) await syncGh("Import Noto map posts"); render(); } }; r.readAsText(file); }
function titleObj(s) { const m = String(s).trim().match(/^(.*?)【(.+?)】/); const ja = m ? m[1].trim() || s : String(s).trim(); const inside = m ? m[2].replace(/[｜|]/g, " / ").trim() : ""; return { ja, en: inside || trans(ja, "en"), ko: trans(ja, "ko"), zh: trans(ja, "zh") }; }
function bodyObj(s) { const clean = String(s || "").trim(); return { ja: clean, en: mostlyLatin(clean) ? clean : trans(clean, "en"), ko: trans(clean, "ko"), zh: trans(clean, "zh") }; }
function trans(text, lang) { let s = String(text || ""); if (lang === "ja") return s; MUNICIPAL.forEach((m) => { s = s.replaceAll(m.ja, m[lang]); m.aliases.forEach((a) => (s = s.replace(new RegExp(rx(a), "gi"), m[lang]))); }); Object.entries(WORDS).forEach(([ja, vals]) => (s = s.replaceAll(ja, vals[lang]))); return s; }
function infer(text) { const s = String(text || "").toLowerCase(); const m = MUNICIPAL.find((x) => s.includes(x.ja.toLowerCase()) || x.aliases.some((a) => s.includes(a.toLowerCase()))); return m ? { ja: m.ja, en: m.en, ko: m.ko, zh: m.zh } : { ja: "能登半島", en: "Noto Peninsula", ko: "노토반도", zh: "能登半岛" }; }
function txt(p, k) { const v = p[k]; return typeof v === "string" ? v : v?.[S.lang] || v?.ja || v?.en || ""; }
function filtered(id = S.group) { return id === "all" ? S.spots : S.spots.filter((p) => gid(p.group || p.municipality?.ja) === id); }
function isLocLine(line) { const s = line.toLowerCase(); return line.includes(",") || MUNICIPAL.some((m) => s.includes(m.ja.toLowerCase()) || m.aliases.some((a) => s.includes(a.toLowerCase()))); }
function photo(p) { return p.photos?.[0]?.src || ""; }
function valid(lat, lng) { return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180; }
function idNew() { return `spot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function gid(s) { return String(s || "all").toLowerCase().replace(/\s+/g, "-"); }
function ext(file) { const m = file.name.match(/\.([a-z0-9]+)$/i); return m ? m[1].toLowerCase().replace("jpeg", "jpg") : file.type.includes("png") ? "png" : "jpg"; }
function slug(s) { return String(s || "photo").toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42) || "photo"; }
function mostlyLatin(s) { return (String(s).match(/[A-Za-z]/g) || []).length > (String(s).match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length; }
function short(s, n) { s = String(s || ""); return s.length > n ? `${s.slice(0, n - 1)}…` : s; }
function esc(s) { return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function attr(s) { return esc(s); }
function rx(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function b64(text) { const bytes = new TextEncoder().encode(text); let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.slice(i, i + 0x8000)); return btoa(bin); }
function openLightbox(src, cap) { E.imageLightboxImage.src = src; E.imageLightboxCaption.textContent = cap || ""; E.imageLightbox.setAttribute("aria-hidden", "false"); }
function closeLightbox() { E.imageLightbox.setAttribute("aria-hidden", "true"); E.imageLightboxImage.src = ""; }
function status(msg) { E.mapStatus.textContent = msg; E.mapStatus.classList.add("visible"); clearTimeout(status.t); status.t = setTimeout(() => E.mapStatus.classList.remove("visible"), 3200); }
function toast(msg) { E.completionToast.querySelector("span").textContent = msg; E.completionToast.classList.add("visible"); clearTimeout(toast.t); toast.t = setTimeout(() => E.completionToast.classList.remove("visible"), 3600); }
function icons() { if (window.lucide) window.lucide.createIcons(); }
